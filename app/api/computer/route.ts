import { NextResponse } from "next/server";

import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { cookies } from "next/headers";
import dayjs from "@/lib/dayjs";
import { Prisma } from "@/prisma/generated/prisma-client";
import { calculateDailyUsageMinutes } from "@/lib/battle-pass-utils";
import {
  getStartOfDayVNISO,
  getCurrentDateVNString,
  getStartOfWeekVNISO,
  getEndOfWeekVNISO,
} from "@/lib/timezone-utils";
import { calculateActiveUsersInfo } from "@/lib/user-calculator";

// Hàm chuyển BigInt về string để tránh lỗi serialize
function convertBigIntToString(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  } else if (obj && typeof obj === "object") {
    const newObj: any = {};
    for (const key in obj) {
      if (typeof obj[key] === "bigint") {
        newObj[key] = obj[key].toString();
      } else if (typeof obj[key] === "object") {
        newObj[key] = convertBigIntToString(obj[key]);
      } else {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  }
  return obj;
}

export async function GET() {
  const cookieStore = await cookies();
  const branchFromCookie = cookieStore.get("branch")?.value;

  const startOfDayVN = getStartOfDayVNISO();
  const today = getCurrentDateVNString();
  const [yyyy, mm, dd] = today.split('-');
  const curDate = `${yyyy}-${mm}-${dd}`;

  try {
    const fnetDB = await getFnetDB();
    const fnetPrisma = await getFnetPrisma();

    // Batch tất cả queries cần thiết
    const [computerStatus, deviceHistoriesRaw, computers, checkInItems] =
      await Promise.all([
        // 1. Computer status query (simplified)
        fnetDB.$queryRaw<any[]>(fnetPrisma.sql`
        SELECT 
          s.MachineName,
          s.EnterDate,
          s.EnterTime,
          s.Status,
          s.UserId,
          u.UserType
        FROM systemlogtb s
        LEFT JOIN usertb u ON s.UserId = u.UserId
        INNER JOIN (
          SELECT MachineName, MAX(SystemLogId) AS MaxSystemLogId
          FROM systemlogtb
          WHERE MachineName NOT LIKE 'MAY-%'
          AND EnterDate >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
          GROUP BY MachineName
        ) latest_log
        ON s.MachineName = latest_log.MachineName
        AND s.SystemLogId = latest_log.MaxSystemLogId
        WHERE s.MachineName NOT LIKE 'MAY-%'
        AND s.EnterDate >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        ORDER BY s.MachineName ASC;
      `),

        // 2. Device histories với timezone conversion
        db.$queryRaw`
        SELECT 
          h.*,
          CONVERT_TZ(h.createdAt, '+00:00', '+07:00') as createdAt,
          CONVERT_TZ(h.updatedAt, '+00:00', '+07:00') as updatedAt
        FROM (
          SELECT *,
                 ROW_NUMBER() OVER (PARTITION BY deviceId, type ORDER BY createdAt DESC) as rn
          FROM DeviceHistory
          WHERE type IN ('REPORT', 'REPAIR')
        ) h
        WHERE h.rn = 1
      `,

        // 3. Computers với devices
        db.$queryRaw`
        SELECT 
          c.*,
          COALESCE(
            JSON_ARRAYAGG(
              CASE WHEN d.id IS NOT NULL THEN
                JSON_OBJECT(
                  'id', d.id,
                  'monitorStatus', d.monitorStatus,
                  'keyboardStatus', d.keyboardStatus,
                  'mouseStatus', d.mouseStatus,
                  'headphoneStatus', d.headphoneStatus,
                  'chairStatus', d.chairStatus,
                  'networkStatus', d.networkStatus,
                  'computerStatus', d.computerStatus,
                  'note', d.note
                )
              END
            ), '[]'
          ) as devices
        FROM Computer c
        LEFT JOIN Device d ON c.id = d.computerId
        WHERE c.branch = ${branchFromCookie}
        AND c.name != 'ADMIN'
        GROUP BY c.id
      `,

        // 4. Check in items (cache lại)
        db.$queryRaw`
        SELECT * FROM CheckInItem
      `,
      ]);

    // Map histories vào từng device
    const deviceIdToHistories: { [key: number]: { REPORT: any; REPAIR: any } } =
      {};
    for (const h of deviceHistoriesRaw as any[]) {
      if (!deviceIdToHistories[h.deviceId]) {
        deviceIdToHistories[h.deviceId] = { REPORT: null, REPAIR: null };
      }
      if (h.type === "REPORT" && !deviceIdToHistories[h.deviceId].REPORT) {
        deviceIdToHistories[h.deviceId].REPORT = h;
      }
      if (h.type === "REPAIR" && !deviceIdToHistories[h.deviceId].REPAIR) {
        deviceIdToHistories[h.deviceId].REPAIR = h;
      }
    }

    // Lấy tất cả UserIds có sử dụng máy
    const activeUserIds = computerStatus
      .filter((status: any) => status.UserId)
      .map((status: any) => parseInt(status.UserId, 10));

    // Sử dụng hàm calculateActiveUsersInfo để tính toán thông tin users
    const usersInfo =
      activeUserIds.length > 0 && branchFromCookie
        ? await calculateActiveUsersInfo(activeUserIds, branchFromCookie)
        : [];

    console.log("usersInfo", usersInfo);

    // Tạo map để lookup nhanh user info
    const userInfoMap = new Map();
    usersInfo.forEach((userInfo) => {
      userInfoMap.set(userInfo.userId, userInfo);
    });

    const results = [];

    for (const computer of computers as any[]) {
      const { name } = computer || {};
      const computerStatusData = computerStatus.find(
        (status: { MachineName: string }) => status.MachineName === name,
      );
      const { UserId, Status, UserType } = computerStatusData || {};

      // Lấy user info từ map
      const userInfo = UserId ? userInfoMap.get(parseInt(UserId, 10)) : null;

      // Parse devices JSON
      const devices = computer.devices ? JSON.parse(computer.devices) : [];

      results.push({
        id: computer.id,
        name: computer.name,
        status: Status,
        userId: UserId,
        userName: userInfo?.userName,
        userType: UserType,
        totalCheckIn: userInfo?.totalCheckIn || 0,
        claimedCheckIn: userInfo?.claimedCheckIn || 0,
        availableCheckIn: userInfo?.availableCheckIn || 0,
        round: userInfo?.round || 0,
        stars: userInfo?.stars || 0,
        magicStone: userInfo?.magicStone || 0,
        isUseApp: userInfo?.isUseApp !== undefined ? userInfo.isUseApp : true,
        note: userInfo?.note || "",
        totalPayment: userInfo?.totalPayment || 0,
        giftRound: userInfo?.giftRound || 0,
        devices: devices.filter((device: any) => device && device.id).map((device: any) => ({
          id: device.id,
          monitorStatus: device.monitorStatus,
          keyboardStatus: device.keyboardStatus,
          mouseStatus: device.mouseStatus,
          headphoneStatus: device.headphoneStatus,
          chairStatus: device.chairStatus,
          networkStatus: device.networkStatus,
          computerStatus: device.computerStatus,
          note: device.note,
          histories: [
            deviceIdToHistories[device.id]?.REPORT
              ? {
                  ...deviceIdToHistories[device.id].REPORT,
                  createdAt: deviceIdToHistories[device.id].REPORT.createdAt,
                  updatedAt: deviceIdToHistories[device.id].REPORT.updatedAt,
                }
              : null,
            deviceIdToHistories[device.id]?.REPAIR
              ? {
                  ...deviceIdToHistories[device.id].REPAIR,
                  createdAt: deviceIdToHistories[device.id].REPAIR.createdAt,
                  updatedAt: deviceIdToHistories[device.id].REPAIR.updatedAt,
                }
              : null,
          ],
        })),
      });
    }

    return NextResponse.json(convertBigIntToString(results));
  } catch (error) {
    console.error("Computer API error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
