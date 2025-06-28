import { NextResponse } from "next/server";

import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { cookies } from "next/headers";
import dayjs from "@/lib/dayjs";
import { Prisma } from "@/prisma/generated/prisma-client";
import { calculateDailyUsageHours, getCurrentDayOfWeekVN } from "@/lib/battle-pass-utils";

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

  const startOfDayVN = dayjs().startOf("day").toISOString();
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const curDate = `${yyyy}-${mm}-${dd}`;

  try {
    const fnetDB = await getFnetDB();
    const fnetPrisma = await getFnetPrisma();

    // Batch tất cả queries cần thiết
    const [
      computerStatus,
      deviceHistoriesRaw,
      computers,
      checkInItems
    ] = await Promise.all([
      // 1. Computer status query (simplified)
      fnetDB.$queryRaw<any[]>(fnetPrisma.sql`
        SELECT 
          s.MachineName,
          s.EnterDate,
          s.EnterTime,
          CASE 
            WHEN s.EnterDate = CURDATE() THEN s.Status
            WHEN s.EnterDate = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 2
            ELSE s.Status
          END as Status,
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

      // 2. Device histories
      db.$queryRaw`
        SELECT h.*, h.createdAt
        FROM (
          SELECT *,
                 ROW_NUMBER() OVER (PARTITION BY deviceId, type ORDER BY createdAt DESC) as rn
          FROM DeviceHistory
          WHERE type IN ('REPORT', 'REPAIR')
        ) h
        WHERE h.rn = 1
      `,

      // 3. Computers với devices
      db.computer.findMany({
        where: {
          branch: branchFromCookie,
          name: {
            not: "ADMIN",
          },
        },
        include: {
          devices: true,
        },
      }),

      // 4. Check in items (cache lại)
      db.checkInItem.findMany()
    ]);

    // Map histories vào từng device
    const deviceIdToHistories: { [key: number]: { REPORT: any; REPAIR: any } } = {};
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
      .map((status: any) => status.UserId);

    // Batch queries cho tất cả users
    const [
      userSessions,
      userClaims,
      userData,
      userTopUps,
      userGiftRounds,
      userGameRounds
    ] = await Promise.all([
      // 1. Tất cả user sessions trong 1 query
      activeUserIds.length > 0 ? fnetDB.$queryRaw<any[]>(fnetPrisma.sql`
        SELECT UserId, EnterDate, EndDate, EnterTime, EndTime
        FROM fnet.systemlogtb
        WHERE UserId IN (${Prisma.join(activeUserIds)})
          AND status = 3
          AND (
            EnterDate = ${curDate} 
            OR EndDate = ${curDate}
            OR (EndDate IS NULL AND EnterDate = DATE_SUB(${curDate}, INTERVAL 1 DAY))
          )
      `) : [],

      // 2. Tất cả user claims trong 1 query
      activeUserIds.length > 0 ? db.userStarHistory.findMany({
        where: {
          userId: { in: activeUserIds },
          branch: branchFromCookie,
          type: "CHECK_IN",
          createdAt: { gte: startOfDayVN },
        },
      }) : [],

      // 3. Tất cả user data trong 1 query
      activeUserIds.length > 0 ? db.user.findMany({
        where: {
          userId: { in: activeUserIds },
          branch: branchFromCookie,
        },
      }) : [],

      // 4. Tất cả user top ups trong 1 query
      activeUserIds.length > 0 ? fnetDB.$queryRaw<any[]>(fnetPrisma.sql`
        SELECT 
          UserId,
          COALESCE(CAST(SUM(AutoAmount) AS DECIMAL(18,2)), 0) AS total
        FROM fnet.paymenttb
        WHERE PaymentType = 4
          AND UserId IN (${Prisma.join(activeUserIds)})
          AND Note = N'Thời gian phí'
          AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) >= DATE(DATE_SUB(NOW(), INTERVAL WEEKDAY(NOW()) DAY))
          AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) <= NOW()
        GROUP BY UserId
      `) : [],

      // 5. Tất cả gift rounds trong 1 query
      activeUserIds.length > 0 ? db.giftRound.findMany({
        where: {
          userId: { in: activeUserIds.map(id => parseInt(id, 10)) },
          isUsed: false,
          OR: [{ expiredAt: null }, { expiredAt: { gt: new Date() } }],
        },
      }) : [],

      // 6. Tất cả game rounds trong 1 query
      activeUserIds.length > 0 ? db.$queryRaw<any[]>(Prisma.sql`
        SELECT 
          userId,
          COUNT(*) as count
        FROM GameResult gr
        WHERE gr.userId IN (${Prisma.join(activeUserIds.map(id => parseInt(id, 10)))})
        AND CreatedAt >= DATE(DATE_SUB(NOW(), INTERVAL WEEKDAY(NOW()) DAY))
        AND CreatedAt <= NOW()
        GROUP BY userId
      `) : []
    ]);

    // Tạo maps để lookup nhanh
    const userSessionsMap = new Map();
    userSessions.forEach(session => {
      if (!userSessionsMap.has(session.UserId)) {
        userSessionsMap.set(session.UserId, []);
      }
      userSessionsMap.get(session.UserId).push(session);
    });

    const userClaimsMap = new Map();
    userClaims.forEach(claim => {
      if (!userClaimsMap.has(claim.userId)) {
        userClaimsMap.set(claim.userId, []);
      }
      userClaimsMap.get(claim.userId).push(claim);
    });

    const userDataMap = new Map();
    userData.forEach(user => {
      userDataMap.set(user.userId, user);
    });

    const userTopUpsMap = new Map();
    userTopUps.forEach(topUp => {
      userTopUpsMap.set(topUp.UserId, parseFloat(topUp.total.toString()));
    });

    const userGiftRoundsMap = new Map();
    userGiftRounds.forEach(gr => {
      if (!userGiftRoundsMap.has(gr.userId)) {
        userGiftRoundsMap.set(gr.userId, []);
      }
      userGiftRoundsMap.get(gr.userId).push(gr);
    });

    const userGameRoundsMap = new Map();
    userGameRounds.forEach(round => {
      userGameRoundsMap.set(round.userId, Number(round.count));
    });

    // Cache check in items
    const todayDayOfWeek = getCurrentDayOfWeekVN();
    const todayCheckIn = checkInItems.find(item => item.dayName === todayDayOfWeek);
    const starsPerHour = todayCheckIn ? todayCheckIn.stars : 1000;

    const results = [];

    for (const computer of computers) {
      const { name } = computer || {};
      const computerStatusData = computerStatus.find(
        (status: { MachineName: string }) => status.MachineName === name,
      );
      const { UserId, Status, UserType } = computerStatusData || {};

      let checkIn = 0;
      let totalRound = 0;
      let userData = null;

      if (UserId) {
        // Tính check in từ cached data
        const sessions = userSessionsMap.get(UserId) || [];
        const totalPlayTime = calculateDailyUsageHours(sessions);
        const canClaim = totalPlayTime * starsPerHour;

        const claims = userClaimsMap.get(UserId) || [];
        const totalClaimed = claims.reduce((acc: number, item: any) => {
          const difference = (item.newStars ?? 0) - (item.oldStars ?? 0);
          return acc + difference;
        }, 0);

        checkIn = Math.max(0, canClaim - totalClaimed);

        // Lấy user data từ cache
        userData = userDataMap.get(UserId);

        // Tính rounds từ cached data
        const userTopUp = userTopUpsMap.get(UserId) || 0;
        const round = Math.floor(
          userTopUp ? userTopUp / Number(process.env.NEXT_PUBLIC_SPEND_PER_ROUND) : 0
        );

        if (userData?.id) {
          const giftRounds = userGiftRoundsMap.get(userData.id) || [];
          const totalGiftRounds = giftRounds.reduce((sum: number, gr: any) => sum + gr.amount, 0);
          const usedRounds = userGameRoundsMap.get(parseInt(UserId, 10)) || 0;
          totalRound = round + totalGiftRounds - usedRounds;
        }
      }

      results.push({
        id: computer.id,
        name: computer.name,
        status: Status,
        userId: UserId,
        userName: userData?.userName,
        userType: UserType,
        canClaim: checkIn,
        round: totalRound,
        stars: userData?.stars || 0,
        magicStone: userData?.magicStone || 0,
        devices: computer.devices.map((device) => ({
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
                  createdAt: deviceIdToHistories[device.id].REPORT.createdAt
                    ? new Date(deviceIdToHistories[device.id].REPORT.createdAt).toISOString()
                    : null,
                  updatedAt: deviceIdToHistories[device.id].REPORT.updatedAt
                    ? new Date(deviceIdToHistories[device.id].REPORT.updatedAt).toISOString()
                    : null,
                }
              : null,
            deviceIdToHistories[device.id]?.REPAIR
              ? {
                  ...deviceIdToHistories[device.id].REPAIR,
                  createdAt: deviceIdToHistories[device.id].REPAIR.createdAt
                    ? new Date(deviceIdToHistories[device.id].REPAIR.createdAt).toISOString()
                    : null,
                  updatedAt: deviceIdToHistories[device.id].REPAIR.updatedAt
                    ? new Date(deviceIdToHistories[device.id].REPAIR.updatedAt).toISOString()
                    : null,
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
