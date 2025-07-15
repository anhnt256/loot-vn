import { db, getFnetDB } from "@/lib/db";
import { calculateDailyUsageMinutes } from "@/lib/battle-pass-utils";
import {
  getStartOfDayVNISO,
  getCurrentTimeVNISO,
  getCurrentDateVNString,
  getStartOfWeekVNISO,
  getEndOfWeekVNISO,
  getCurrentDayOfWeekVN,
  getVNTimeForPrisma,
} from "@/lib/timezone-utils";

export interface UserInfo {
  userId: number;
  userName?: string;
  userType?: string;
  totalCheckIn: number;
  claimedCheckIn: number;
  availableCheckIn: number;
  round: number;
  stars: number;
  magicStone: number;
  isUseApp: boolean;
  note: string;
  totalPayment: number;
  giftRound: number;
}

export interface ActiveUser {
  userId: number;
  userType?: number;
}

interface FnetSession {
  UserId: number;
  EnterDate: string;
  EndDate: string | null;
  EnterTime: string | null;
  EndTime: string | null;
  status: number;
  UserType: number;
  MachineName: string;
}

/**
 * Tính toán thông tin chi tiết cho danh sách active users
 */
export async function calculateActiveUsersInfo(
  listUsers: number[],
  branch: string,
): Promise<UserInfo[]> {
  try {
    if (listUsers.length === 0) {
      return [];
    }

    const fnetDB = await getFnetDB();

    // Sử dụng các hàm từ timezone-utils để đảm bảo tính nhất quán
    const startOfDayVN = getStartOfDayVNISO();
    const today = getCurrentTimeVNISO();
    const curDate = getCurrentDateVNString();

    // Tạo các thời gian khác từ timezone-utils
    const startOfWeekVN = getStartOfWeekVNISO();
    const endOfWeekVN = getEndOfWeekVNISO();
    const todayDayOfWeek = getCurrentDayOfWeekVN();

    // Convert ISO strings to Date objects for Prisma
    const startOfDayVNDate = new Date(startOfDayVN);
    const todayDate = new Date(today);
    const startOfWeekVNDate = new Date(startOfWeekVN);
    const endOfWeekVNDate = new Date(endOfWeekVN);

    // Batch queries cho tất cả users
    const [
      userSessions,
      userClaims,
      userData,
      userTopUps,
      userGiftRounds,
      userGameRounds,
    ] = await Promise.all([
      // 1. Tất cả user sessions trong 1 query
      (async () => {
        const userIdsStr = listUsers.join(",");
        const queryString = `
        SELECT
          s.UserId,
          s.EnterDate,
          s.EndDate,
          s.EnterTime,
          s.EndTime,
          s.status,
          u.UserType,
          s.MachineName
        FROM fnet.systemlogtb s
        JOIN usertb u ON s.UserId = u.UserId
        WHERE FIND_IN_SET(s.UserId, '${userIdsStr}')
          AND s.status = 3
          AND s.EnterDate = '${curDate}'
        
        UNION ALL
        
        SELECT
          s.UserId,
          s.EnterDate,
          s.EndDate,
          s.EnterTime,
          s.EndTime,
          s.status,
          u.UserType,
          s.MachineName
        FROM fnet.systemlogtb s
        JOIN usertb u ON s.UserId = u.UserId
        JOIN (
            SELECT UserId, MAX(CONCAT(EnterDate, ' ', EnterTime)) AS MaxEnterDateTime
            FROM fnet.systemlogtb
            WHERE status = 3
              AND EnterDate < '${curDate}'
              AND (
                EndDate IS NULL
                OR CONCAT(EndDate, ' ', COALESCE(EndTime, '23:59:59')) >= CONCAT('${curDate}', ' 00:00:00')
              )
              AND FIND_IN_SET(UserId, '${userIdsStr}')
            GROUP BY UserId
        ) latest ON s.UserId = latest.UserId 
               AND CONCAT(s.EnterDate, ' ', s.EnterTime) = latest.MaxEnterDateTime;
        `;

        const result = await fnetDB.$queryRawUnsafe(queryString);
        return result;
      })(),

      // 2. Tất cả user claims trong 1 query
      db.userStarHistory.findMany({
        where: {
          userId: { in: listUsers },
          branch: branch,
          type: "CHECK_IN",
          createdAt: { gte: startOfDayVNDate },
        },
      }),

      // 3. Tất cả user data trong 1 query
      db.user.findMany({
        where: {
          userId: { in: listUsers },
          branch: branch,
        },
      }),

      // 4. Tất cả user top ups trong 1 query
      (async () => {
        const userIdsStr = listUsers.join(",");
        const queryString = `
          SELECT 
            UserId,
            COALESCE(CAST(SUM(AutoAmount) AS DECIMAL(18,2)), 0) AS total
          FROM fnet.paymenttb
          WHERE PaymentType = 4
            AND UserId IN (${userIdsStr})
            AND Note = N'Thời gian phí'
            AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) >= DATE(DATE_SUB(NOW(), INTERVAL WEEKDAY(NOW()) DAY))
            AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) <= NOW()
          GROUP BY UserId
        `;

        const result = await fnetDB.$queryRawUnsafe(queryString);
        return result;
      })(),

      // 5. Tất cả gift rounds chưa hết hạn
      db.giftRound.findMany({
        where: {
          userId: { in: listUsers },
          expiredAt: {
            gte: todayDate,
          },
          isUsed: false,
        },
      }),

      // 6. Tất cả game rounds từ UserStarHistory
      db.userStarHistory.findMany({
        where: {
          userId: { in: listUsers },
          branch: branch,
          type: "GAME",
          createdAt: {
            gte: startOfWeekVNDate,
            lte: endOfWeekVNDate,
          },
        },
      }),
    ]);

    // Tạo maps để lookup nhanh
    const userSessionsMap = new Map<number, FnetSession[]>();
    (userSessions as FnetSession[]).forEach((session) => {
      if (!userSessionsMap.has(session.UserId)) {
        userSessionsMap.set(session.UserId, []);
      }
      userSessionsMap.get(session.UserId)!.push(session);
    });

    // Tạo Map để đảm bảo mỗi user chỉ xuất hiện một lần
    const activeUsersMap = new Map();
    (userSessions as any[]).forEach((session) => {
      if (!activeUsersMap.has(session.UserId)) {
        activeUsersMap.set(session.UserId, {
          userId: session.UserId,
          userType: session.UserType as number,
        });
      }
    });

    const activeUsers = Array.from(activeUsersMap.values());

    const userClaimsMap = new Map();
    userClaims.forEach((claim) => {
      if (!userClaimsMap.has(claim.userId)) {
        userClaimsMap.set(claim.userId, []);
      }
      userClaimsMap.get(claim.userId).push(claim);
    });

    const userDataMap = new Map();
    userData.forEach((user) => {
      userDataMap.set(user.userId, user);
    });

    const userTopUpsMap = new Map();
    (userTopUps as any[]).forEach((topUp: any) => {
      const amount = parseFloat(topUp.total.toString());
      userTopUpsMap.set(topUp.UserId, amount);
    });

    const userGiftRoundsMap = new Map();
    userGiftRounds.forEach((gr) => {
      if (!userGiftRoundsMap.has(gr.userId)) {
        userGiftRoundsMap.set(gr.userId, []);
      }
      userGiftRoundsMap.get(gr.userId).push(gr);
    });

    const userGameRoundsMap = new Map();
    userGameRounds.forEach((round) => {
      if (!userGameRoundsMap.has(round.userId)) {
        userGameRoundsMap.set(round.userId, 0);
      }
      userGameRoundsMap.set(
        round.userId,
        userGameRoundsMap.get(round.userId) + 1,
      );
    });

    // Query real-time check in items
    const todayCheckIn = await db.checkInItem.findFirst({
      where: { dayName: todayDayOfWeek },
    });

    const starsPerHour = todayCheckIn ? todayCheckIn.stars : 1000;

    // Tính toán thông tin cho từng user
    const results: UserInfo[] = [];

    for (const activeUser of activeUsers) {
      const { userType, userId } = activeUser;

      // Bỏ qua nếu userId không phải là số (trường hợp admin)
      if (typeof userId !== "number" || isNaN(userId)) {
        continue;
      }

      let checkIn = 0;
      let totalCheckIn = 0;
      let claimedCheckIn = 0;
      let availableCheckIn = 0;
      let totalRound = 0;
      let userData = null;
      let userTopUp = 0;
      let totalGiftRounds = 0;
      let machineName: string | undefined;

      if (userId) {
        // Tính check in từ cached data
        const sessions: FnetSession[] = userSessionsMap.get(userId) || [];

        if (sessions.length > 0) {
          const latestSession = sessions.reduce((latest, current) => {
            const latestTime = new Date(
              `${latest.EnterDate}T${latest.EnterTime || "00:00:00"}`,
            ).getTime();
            const currentTime = new Date(
              `${current.EnterDate}T${current.EnterTime || "00:00:00"}`,
            ).getTime();
            return currentTime > latestTime ? current : latest;
          });
          machineName = latestSession.MachineName;
        }

        const totalPlayTimeMinutes = calculateDailyUsageMinutes(sessions);
        const totalPlayTimeHours = Math.floor(totalPlayTimeMinutes / 60);
        totalCheckIn = Math.floor(totalPlayTimeHours * starsPerHour);

        const claims = userClaimsMap.get(userId) || [];
        const totalClaimed = claims.reduce((acc: number, item: any) => {
          const difference = (item.newStars ?? 0) - (item.oldStars ?? 0);
          return acc + difference;
        }, 0);

        // Lấy user data từ cache
        userData = userDataMap.get(userId);

        // Tính toán 3 field check-in
        claimedCheckIn = totalClaimed;
        availableCheckIn = Math.max(0, totalCheckIn - totalClaimed);

        if (userData?.id) {
          // User đã đăng nhập, có thể claim phần còn lại
          checkIn = availableCheckIn;
        } else {
          // User chưa đăng nhập, chưa claim check-in
          checkIn = totalCheckIn;
        }
      } else {
        // Không có userId, set default values
        totalCheckIn = 0;
        claimedCheckIn = 0;
        availableCheckIn = 0;
      }

      // Tính rounds từ cached data
      userTopUp = userTopUpsMap.get(userId) || 0;
      const spendPerRound = Number(process.env.NEXT_PUBLIC_SPEND_PER_ROUND);
      const round = Math.floor(userTopUp ? userTopUp / spendPerRound : 0);

      // Tính gift rounds
      const giftRounds = userGiftRoundsMap.get(userId) || [];
      totalGiftRounds = giftRounds.reduce(
        (sum: number, gr: any) => sum + (gr.amount - gr.usedAmount),
        0,
      );

      if (userData?.id) {
        const usedRounds = userGameRoundsMap.get(userId) || 0;
        totalRound = round - usedRounds;

        // Cập nhật magicStone trong table User = totalRound và lưu xuống DB
        if (userData) {
          await db.user.update({
            where: { id: userData.id },
            data: {
              magicStone: totalRound,
              updatedAt: getVNTimeForPrisma(),
            },
          });
        }
      } else {
        // User chưa đăng nhập, chưa sử dụng lượt quay
        totalRound = round;
      }

      if (userId === 244) {
        console.log(">>>> DEBUG USER 244 >>>>", userData);
      }

      const result = {
        userId,
        userName: userData?.userName,
        userType: userType?.toString(),
        totalCheckIn: totalCheckIn || 0,
        claimedCheckIn: claimedCheckIn || 0,
        availableCheckIn: availableCheckIn || 0,
        round: totalRound,
        stars: userData?.stars || 0,
        magicStone: userData?.magicStone || 0,
        isUseApp: userData?.isUseApp !== undefined ? userData.isUseApp : true,
        note: userData?.note || "",
        totalPayment: userTopUp,
        giftRound: totalGiftRounds,
        machineName: machineName,
      };

      results.push(result);
    }

    return results;
  } catch (error) {
    console.error(
      `[user-calculator] Lỗi khi tính toán thông tin người dùng cho chi nhánh ${branch}:`,
      error,
    );
    return [];
  }
}
