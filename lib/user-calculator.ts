import { db, getFnetDB } from "@/lib/db";
import { calculateDailyUsageMinutes } from "@/lib/battle-pass-utils";
import {
  getStartOfDayVNISO,
  getCurrentTimeVNISO,
  getStartOfWeekVNISO,
  getEndOfWeekVNISO,
  getCurrentDayOfWeekVN,
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

interface UserStarHistory {
  id: string;
  userId: number;
  oldStars: number;
  newStars: number;
  type: string;
  createdAt: Date;
  targetId: string | null;
  branch: string;
  gameResultId: string | null;
}

interface User {
  id: string;
  userId: number;
  userName: string | null;
  stars: number;
  magicStone: number;
  isUseApp: boolean;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  branch: string;
}

interface GiftRound {
  id: string;
  userId: number;
  amount: number;
  usedAmount: number;
  expiredAt: Date;
  isUsed: boolean;
}

interface CheckInItem {
  id: string;
  dayName: string;
  stars: number;
}

/**
 * Tính toán thông tin chi tiết cho danh sách active users
 */
export async function calculateActiveUsersInfo(
  listUsers: number[],
  branch: string,
  isDebug: boolean = false,
  debugUsers: number[] = [],
): Promise<UserInfo[]> {
  try {
    // Nếu debug mode, thêm debugUsers vào listUsers
    const finalListUsers = isDebug
      ? [...new Set([...listUsers, ...debugUsers])] // Loại bỏ duplicates
      : listUsers;

    if (finalListUsers.length === 0) {
      return [];
    }

    const fnetDB = await getFnetDB();

    // Sử dụng các hàm từ timezone-utils để đảm bảo tính nhất quán
    const startOfDayVN = getStartOfDayVNISO();
    const curDate = getCurrentTimeVNISO().split("T")[0];

    // Tạo các thời gian khác từ timezone-utils
    const startOfWeekVN = getStartOfWeekVNISO();
    const endOfWeekVN = getEndOfWeekVNISO();
    const todayDayOfWeek = getCurrentDayOfWeekVN();

    if (isDebug) {
      console.log("=== DEBUG TIMEZONE CONVERSION ===");
      console.log("startOfWeekVN:", startOfWeekVN);
      console.log("endOfWeekVN:", endOfWeekVN);
    }

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
        const userIdsStr = finalListUsers.join(",");
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
        WHERE FIND_IN_SET(s.UserId, '${userIdsStr}')
          AND s.status = 3
          AND s.EnterDate = DATE_SUB('${curDate}', INTERVAL 1 DAY)
          AND s.EndDate IS NULL
        `;

        const result = await fnetDB.$queryRawUnsafe(queryString);
        return result;
      })(),

      // 2. Tất cả user claims trong 1 query - convert sang raw query
      (async () => {
        const userIdsStr = finalListUsers.join(",");
        const queryString = `
          SELECT 
            id,
            userId,
            oldStars,
            newStars,
            type,
            createdAt,
            targetId,
            branch,
            gameResultId
          FROM UserStarHistory
          WHERE userId IN (${userIdsStr})
            AND branch = '${branch}'
            AND type = 'CHECK_IN'
            AND createdAt >= '${startOfDayVN}'
        `;

        const result = await db.$queryRawUnsafe(queryString);
        return result;
      })(),

      // 3. Tất cả user data trong 1 query - convert sang raw query
      (async () => {
        const userIdsStr = finalListUsers.join(",");
        const queryString = `
          SELECT 
            id,
            userId,
            userName,
            stars,
            magicStone,
            isUseApp,
            note,
            createdAt,
            updatedAt,
            branch
          FROM User
          WHERE userId IN (${userIdsStr})
            AND branch = '${branch}'
        `;

        const result = await db.$queryRawUnsafe(queryString);
        return result;
      })(),

      // 4. Tất cả user top ups trong 1 query
      (async () => {
        const userIdsStr = finalListUsers.join(",");
        const queryString = `
          SELECT 
            UserId,
            COALESCE(CAST(SUM(AutoAmount) AS DECIMAL(18,2)), 0) AS total
          FROM fnet.paymenttb
          WHERE PaymentType = 4
            AND UserId IN (${userIdsStr})
            AND Note = N'Thời gian phí'
            AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) >= '${startOfWeekVN}'
            AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) <= NOW()
          GROUP BY UserId
        `;

        if (isDebug) {
          console.log("=== DEBUG TOP UP QUERY ===");
          console.log("startOfWeekVN:", startOfWeekVN);
          console.log("curDate:", curDate);
          console.log("Query string:", queryString);
        }

        const result = await fnetDB.$queryRawUnsafe(queryString);
        return result;
      })(),

      // 5. Tất cả gift rounds chưa hết hạn - convert sang raw query
      (async () => {
        const userIdsStr = finalListUsers.join(",");
        const queryString = `
          SELECT 
            id,
            userId,
            amount,
            usedAmount,
            expiredAt,
            isUsed
          FROM GiftRound
          WHERE userId IN (${userIdsStr})
            AND expiredAt >= NOW()
            AND isUsed = false
        `;

        const result = await db.$queryRawUnsafe(queryString);
        return result;
      })(),

      // 6. Tất cả game rounds từ UserStarHistory - sử dụng raw query
      (async () => {
        if (isDebug) {
          console.log("=== DEBUG GAME ROUNDS QUERY ===");
          console.log("startOfWeekVN:", startOfWeekVN);
          console.log("endOfWeekVN:", endOfWeekVN);
          console.log("Using raw query for timezone control");
        }

        const userIdsStr = finalListUsers.join(",");
        const queryString = `
          SELECT 
            id,
            userId,
            oldStars,
            newStars,
            type,
            createdAt,
            targetId,
            branch,
            gameResultId
          FROM UserStarHistory
          WHERE userId IN (${userIdsStr})
            AND branch = '${branch}'
            AND type = 'GAME'
            AND createdAt >= '${startOfWeekVN}'
            AND createdAt <= '${endOfWeekVN}'
          ORDER BY createdAt DESC
        `;

        const result = await db.$queryRawUnsafe(queryString);
        return result;
      })(),
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
    (userClaims as UserStarHistory[]).forEach((claim) => {
      if (!userClaimsMap.has(claim.userId)) {
        userClaimsMap.set(claim.userId, []);
      }
      userClaimsMap.get(claim.userId).push(claim);
    });

    const userDataMap = new Map();
    (userData as User[]).forEach((user) => {
      userDataMap.set(user.userId, user);
    });

    const userTopUpsMap = new Map();
    (userTopUps as any[]).forEach((topUp: any) => {
      const amount = parseFloat(topUp.total.toString());
      userTopUpsMap.set(topUp.UserId, amount);
    });

    const userGiftRoundsMap = new Map();
    (userGiftRounds as GiftRound[]).forEach((gr) => {
      if (!userGiftRoundsMap.has(gr.userId)) {
        userGiftRoundsMap.set(gr.userId, []);
      }
      userGiftRoundsMap.get(gr.userId).push(gr);
    });

    const userGameRoundsMap = new Map();
    (userGameRounds as UserStarHistory[]).forEach((round) => {
      if (!userGameRoundsMap.has(round.userId)) {
        userGameRoundsMap.set(round.userId, 0);
      }
      userGameRoundsMap.set(
        round.userId,
        userGameRoundsMap.get(round.userId) + 1,
      );
    });

    // Query real-time check in items - convert sang raw query
    const todayCheckInResult = await db.$queryRawUnsafe<CheckInItem[]>(`
      SELECT 
        id,
        dayName,
        stars
      FROM CheckInItem
      WHERE dayName = '${todayDayOfWeek}'
      LIMIT 1
    `);

    const todayCheckIn = todayCheckInResult[0];
    const starsPerHour = todayCheckIn ? todayCheckIn.stars : 1000;

    // Tính toán thông tin cho từng user
    const results: UserInfo[] = [];

    for (const activeUser of activeUsers) {
      const { userType, userId } = activeUser;

      // Bỏ qua nếu userId không phải là số (trường hợp admin)
      if (typeof userId !== "number" || isNaN(userId)) {
        continue;
      }

      // Debug cho các user được chỉ định
      if (isDebug && debugUsers.includes(userId)) {
        console.log(`=== DEBUG USER ${userId} ===`);
        console.log("Active user data:", activeUser);
        console.log("User sessions:", userSessionsMap.get(userId));
        console.log("User claims:", userClaimsMap.get(userId));
        console.log("User data:", userDataMap.get(userId));
        console.log("User top ups:", userTopUpsMap.get(userId));
        console.log("User gift rounds:", userGiftRoundsMap.get(userId));
        console.log("User game rounds:", userGameRoundsMap.get(userId));
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

        if (isDebug && debugUsers.includes(userId)) {
          console.log(`User ${userId} sessions:`, sessions);
        }

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

        if (isDebug && debugUsers.includes(userId)) {
          console.log(
            `User ${userId} totalPlayTimeMinutes:`,
            totalPlayTimeMinutes,
          );
          console.log(`User ${userId} totalPlayTimeHours:`, totalPlayTimeHours);
          console.log(`User ${userId} starsPerHour:`, starsPerHour);
          console.log(`User ${userId} totalCheckIn:`, totalCheckIn);
        }

        const claims = userClaimsMap.get(userId) || [];
        const totalClaimed = claims.reduce((acc: number, item: any) => {
          const difference = (item.newStars ?? 0) - (item.oldStars ?? 0);
          return acc + difference;
        }, 0);

        if (isDebug && debugUsers.includes(userId)) {
          console.log(`User ${userId} claims:`, claims);
          console.log(`User ${userId} totalClaimed:`, totalClaimed);
        }

        // Lấy user data từ cache
        userData = userDataMap.get(userId);

        // Tính toán 3 field check-in
        claimedCheckIn = totalClaimed;
        availableCheckIn = Math.max(0, totalCheckIn - totalClaimed);

        if (isDebug && debugUsers.includes(userId)) {
          console.log(`User ${userId} claimedCheckIn:`, claimedCheckIn);
          console.log(`User ${userId} availableCheckIn:`, availableCheckIn);
        }

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

      if (isDebug && debugUsers.includes(userId)) {
        console.log(`User ${userId} userTopUp:`, userTopUp);
        console.log(`User ${userId} spendPerRound:`, spendPerRound);
        console.log(`User ${userId} round:`, round);
      }

      // Tính gift rounds
      const giftRounds = userGiftRoundsMap.get(userId) || [];
      totalGiftRounds = giftRounds.reduce(
        (sum: number, gr: any) => sum + (gr.amount - gr.usedAmount),
        0,
      );

      if (isDebug && debugUsers.includes(userId)) {
        console.log(`User ${userId} giftRounds:`, giftRounds);
        console.log(`User ${userId} totalGiftRounds:`, totalGiftRounds);
      }

      if (userData?.id) {
        const usedRounds = userGameRoundsMap.get(userId) || 0;
        totalRound = round - usedRounds;

        if (isDebug && debugUsers.includes(userId)) {
          console.log(`User ${userId} usedRounds:`, usedRounds);
          console.log(`User ${userId} totalRound:`, totalRound);
        }

        // Cập nhật magicStone trong table User = totalRound và lưu xuống DB - convert sang raw query
        if (userData) {
          await db.$executeRawUnsafe(`
            UPDATE User 
            SET magicStone = ${totalRound}, updatedAt = NOW()
            WHERE id = '${userData.id}'
          `);
        }
      } else {
        // User chưa đăng nhập, chưa sử dụng lượt quay
        totalRound = round;

        if (isDebug && debugUsers.includes(userId)) {
          console.log(`User ${userId} not logged in, totalRound:`, totalRound);
        }
      }

      if (userId === 244) {
        console.log(">>>> DEBUG USER 244 >>>>", userData);
      }

      if (isDebug && debugUsers.includes(userId)) {
        console.log(`User ${userId} final result:`, {
          userId,
          userName: userData?.userName,
          userType: userType?.toString(),
          totalCheckIn: totalCheckIn || 0,
          claimedCheckIn: claimedCheckIn || 0,
          availableCheckIn: availableCheckIn || 0,
          round: totalRound,
          stars: userData?.stars || 0,
          magicStone: userData?.magicStone || 0,
          isUseApp:
            userData?.isUseApp !== undefined
              ? Boolean(userData.isUseApp)
              : true,
          note: userData?.note || "",
          totalPayment: userTopUp,
          giftRound: totalGiftRounds,
          machineName: machineName,
        });
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
        isUseApp:
          userData?.isUseApp !== undefined ? Boolean(userData.isUseApp) : true,
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
