import { NextResponse } from "next/server";

import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { cookies } from "next/headers";
import dayjs from "@/lib/dayjs";
import { Prisma } from "@/prisma/generated/prisma-client";

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

  const today = dayjs().format("ddd");

  try {
    const fnetDB = await getFnetDB();
    const fnetPrisma = await getFnetPrisma();

    const results = [];

    const query = fnetPrisma.sql`
      SELECT s.MachineName, s.EnterDate, s.EnterTime, s.Status, s.UserId
      FROM systemlogtb s
             INNER JOIN (
        SELECT MachineName, MAX(EnterDate) AS MaxEnterDate
        FROM systemlogtb
        WHERE MachineName NOT LIKE 'MAY-%'
        GROUP BY MachineName
      ) latest_date
                        ON s.MachineName = latest_date.MachineName
                          AND s.EnterDate = latest_date.MaxEnterDate
             INNER JOIN (
        SELECT MachineName, EnterDate, MAX(EnterTime) AS MaxEnterTime
        FROM systemlogtb
        WHERE MachineName NOT LIKE 'MAY-%'
        GROUP BY MachineName, EnterDate
      ) latest_time
                        ON s.MachineName = latest_time.MachineName
                          AND s.EnterDate = latest_time.EnterDate
                          AND s.EnterTime = latest_time.MaxEnterTime
      WHERE s.MachineName NOT LIKE 'MAY-%'
      ORDER BY MachineName ASC, s.EnterDate ASC, s.EnterTime ASC;
    `;

    const computerStatus = await fnetDB.$queryRaw<any[]>(query);

    // Lấy thông tin histories mới nhất cho mỗi device (REPORT và REPAIR)
    const deviceHistoriesRaw = (await db.$queryRaw`
      SELECT h.*, h.createdAt
      FROM (
        SELECT *,
               ROW_NUMBER() OVER (PARTITION BY deviceId, type ORDER BY createdAt DESC) as rn
        FROM DeviceHistory
        WHERE type IN ('REPORT', 'REPAIR')
      ) h
      WHERE h.rn = 1
    `) as any[];

    const computers = await db.computer.findMany({
      where: {
        branch: branchFromCookie,
        name: {
          not: "ADMIN",
        },
      },
      include: {
        devices: true,
      },
    });

    // Map histories vào từng device, luôn trả về 2 phần tử (REPORT, REPAIR)
    const deviceIdToHistories: { [key: number]: { REPORT: any; REPAIR: any } } =
      {};
    for (const h of deviceHistoriesRaw) {
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

    for (const computer of computers) {
      const { name } = computer || {};

      const computerStatusData = computerStatus.find(
        (status: { MachineName: string }) => status.MachineName === name,
      );

      const { UserId, Status } = computerStatusData || {};

      let checkIn = 0;
      let totalRound = 0;
      let userData = null;

      if (UserId) {
        const query = fnetPrisma.sql`
      SELECT *
      FROM fnet.systemlogtb AS t1
      WHERE t1.UserId = ${UserId.toString()}
        AND t1.status = 3
        AND DATE(STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s')) = CURDATE()

      UNION ALL

      SELECT *
      FROM (
             SELECT *
             FROM fnet.systemlogtb AS t1
             WHERE t1.UserId = ${UserId.toString()}
               AND t1.status = 3
               AND DATE(STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s')) < CURDATE()
            ORDER BY STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s') DESC
            LIMIT 1
        ) AS t2`;
        const result = await fnetDB.$queryRaw<any[]>(query);

        // Tính tổng thời gian chơi trong ngày hiện tại
        const todayStr = dayjs().format("YYYY-MM-DD");
        const yesterdayStr = dayjs().subtract(1, "day").format("YYYY-MM-DD");
        const now = dayjs();
        let totalTimeUsed = 0;

        for (const item of result) {
          const enterDateStr = dayjs(item.EnterDate).format("YYYY-MM-DD");
          if (enterDateStr === todayStr) {
            totalTimeUsed += item.TimeUsed;
          } else if (
            enterDateStr === yesterdayStr &&
            !item.EndDate // phiên kéo dài qua đêm, chưa kết thúc
          ) {
            const startOfToday = dayjs(todayStr + "T00:00:00");
            const minutesPlayedToday = now.diff(startOfToday, "minute");
            totalTimeUsed += minutesPlayedToday;
          }
        }

        const totalPlayTime = Math.floor(totalTimeUsed / 60);

        const checkInItems = await db.checkInItem.findMany();

        const todayCheckIn = checkInItems.find(
          (item) => item.dayName === today,
        );
        const starsPerHour = todayCheckIn ? todayCheckIn.stars : 1000;

        const canClaim = totalPlayTime * starsPerHour;

        const userClaim = await db.userStarHistory.findMany({
          where: {
            userId: UserId,
            branch: branchFromCookie,
            type: "CHECK_IN",
            createdAt: {
              gte: startOfDayVN,
            },
          },
        });

        const totalClaimed = userClaim.reduce((acc, item) => {
          const difference = (item.newStars ?? 0) - (item.oldStars ?? 0);
          return acc + difference;
        }, 0);

        checkIn = canClaim - totalClaimed;

        userData = await db.user.findFirst({
          where: {
            userId: UserId,
            branch: branchFromCookie,
          },
        });

        // Calc Round
        const fnetQuery = fnetPrisma.sql`
      SELECT COALESCE(CAST(SUM(AutoAmount) AS DECIMAL(18,2)), 0) AS total
      FROM fnet.paymenttb
      WHERE PaymentType = 4
        AND UserId = ${parseInt(UserId, 10)}
        AND Note = N'Thời gian phí'
        AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) >= DATE(DATE_SUB(NOW(), INTERVAL WEEKDAY(NOW()) DAY))
        AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) <= NOW();
    `;

        const resultData =
          await fnetDB.$queryRaw<[{ total: number }]>(fnetQuery);

        const userTopUp = parseFloat(resultData[0].total.toString());

        const round = Math.floor(
          userTopUp
            ? userTopUp / Number(process.env.NEXT_PUBLIC_SPEND_PER_ROUND)
            : 0,
        );

        if (userData?.id) {
          // Get active gift rounds
          const activeGiftRounds = await db.giftRound.findMany({
            where: {
              userId: userData.id,
              isUsed: false,
              OR: [{ expiredAt: null }, { expiredAt: { gt: new Date() } }],
            },
          });

          // Calculate total gift rounds
          const totalGiftRounds = activeGiftRounds.reduce(
            (sum, gr) => sum + gr.amount,
            0,
          );

          // Số lượt đã sử dụng
          const queryRound = Prisma.sql`
                      SELECT COUNT(*) as count
                      FROM GameResult gr
                      WHERE gr.userId = ${parseInt(UserId, 10)}
                      AND CreatedAt >= DATE(DATE_SUB(NOW(), INTERVAL WEEKDAY(NOW()) DAY))
                      AND CreatedAt <= NOW();
                    `;

          const userRound = await db.$queryRaw<[{ count: bigint }]>(queryRound);

          totalRound = round + totalGiftRounds - Number(userRound[0].count);
        }
      }

      results.push({
        id: computer.id,
        name: computer.name,
        status: Status,
        userId: UserId,
        userName: userData?.userName,
        canClaim: checkIn,
        round: totalRound,
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
                    ? new Date(
                        deviceIdToHistories[device.id].REPORT.createdAt,
                      ).toISOString()
                    : null,
                  updatedAt: deviceIdToHistories[device.id].REPORT.updatedAt
                    ? new Date(
                        deviceIdToHistories[device.id].REPORT.updatedAt,
                      ).toISOString()
                    : null,
                }
              : null,
            deviceIdToHistories[device.id]?.REPAIR
              ? {
                  ...deviceIdToHistories[device.id].REPAIR,
                  createdAt: deviceIdToHistories[device.id].REPAIR.createdAt
                    ? new Date(
                        deviceIdToHistories[device.id].REPAIR.createdAt,
                      ).toISOString()
                    : null,
                  updatedAt: deviceIdToHistories[device.id].REPAIR.updatedAt
                    ? new Date(
                        deviceIdToHistories[device.id].REPAIR.updatedAt,
                      ).toISOString()
                    : null,
                }
              : null,
          ],
        })),
      });
    }

    return NextResponse.json(convertBigIntToString(results));
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
