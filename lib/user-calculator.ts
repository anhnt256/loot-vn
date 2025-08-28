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
  device?: any; // Thêm field device
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

// Helper function để convert BigInt to number
function convertBigIntToNumber(value: any): number {
  if (typeof value === "bigint") {
    return Number(value);
  }
  if (value === null || value === undefined) {
    return 0;
  }
  return Number(value);
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

    // Tối ưu: Gộp tất cả queries thành 3 query chính thay vì 6
    const [
      userSessionsAndTopUps, // Gộp sessions + top ups
      userDataAndClaims, // Gộp user data + claims + gift rounds
      userGameRounds, // Game rounds riêng vì cần time range khác
    ] = await Promise.all([
      // 1. Gộp user sessions và top ups trong 1 query FnetDB
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
          s.MachineName,
          COALESCE(CAST(SUM(p.AutoAmount) AS DECIMAL(18,2)), 0) AS totalTopUp
        FROM fnet.systemlogtb s
        JOIN usertb u ON s.UserId = u.UserId
        LEFT JOIN fnet.paymenttb p ON s.UserId = p.UserId 
          AND p.PaymentType = 4 
          AND p.Note = N'Thời gian phí'
          AND (p.ServeDate + INTERVAL p.ServeTime HOUR_SECOND) >= '${startOfWeekVN}'
          AND (p.ServeDate + INTERVAL p.ServeTime HOUR_SECOND) <= NOW()
        WHERE FIND_IN_SET(s.UserId, '${userIdsStr}')
          AND s.status = 3
          AND (
            s.EnterDate = '${curDate}'
            OR (s.EnterDate = DATE_SUB('${curDate}', INTERVAL 1 DAY) AND s.EndDate IS NULL)
          )
        GROUP BY s.UserId, s.EnterDate, s.EnterTime, s.EndDate, s.EndTime, s.status, u.UserType, s.MachineName
        ORDER BY s.UserId, s.EnterDate DESC, s.EnterTime DESC
        `;

        const result = await fnetDB.$queryRawUnsafe(queryString);
        return result;
      })(),

      // 2. Gộp user data, claims, và gift rounds trong 1 query
      (async () => {
        const userIdsStr = finalListUsers.join(",");
        const queryString = `
        SELECT 
          u.id,
          u.userId,
          u.userName,
          u.stars,
          u.magicStone,
          u.isUseApp,
          u.note,
          u.createdAt,
          u.updatedAt,
          u.branch,
          -- Claims data
          COALESCE(SUM(CASE WHEN ush.type = 'CHECK_IN' THEN ush.newStars - ush.oldStars ELSE 0 END), 0) AS totalClaimed,
          -- Gift rounds data
          COALESCE(SUM(CASE WHEN gr.expiredAt >= NOW() AND gr.isUsed = false THEN gr.amount - gr.usedAmount ELSE 0 END), 0) AS totalGiftRounds
        FROM User u
        LEFT JOIN UserStarHistory ush ON u.userId = ush.userId 
          AND u.branch = ush.branch 
          AND ush.type = 'CHECK_IN' 
          AND ush.createdAt >= '${startOfDayVN}'
        LEFT JOIN GiftRound gr ON u.userId = gr.userId 
          AND gr.expiredAt >= NOW() 
          AND gr.isUsed = false
        WHERE u.userId IN (${userIdsStr})
          AND u.branch = '${branch}'
        GROUP BY u.id, u.userId, u.userName, u.stars, u.magicStone, u.isUseApp, u.note, u.createdAt, u.updatedAt, u.branch
        `;

        const result = await db.$queryRawUnsafe(queryString);
        return result;
      })(),

      // 3. Game rounds riêng vì cần time range khác
      (async () => {
        if (isDebug) {
          console.log("=== DEBUG GAME ROUNDS QUERY ===");
          console.log("startOfWeekVN:", startOfWeekVN);
          console.log("endOfWeekVN:", endOfWeekVN);
        }

        const userIdsStr = finalListUsers.join(",");
        const queryString = `
        SELECT 
          userId,
          COUNT(*) as gameRounds
        FROM UserStarHistory
        WHERE userId IN (${userIdsStr})
          AND branch = '${branch}'
          AND type = 'GAME'
          AND createdAt >= '${startOfWeekVN}'
          AND createdAt <= '${endOfWeekVN}'
        GROUP BY userId
        `;

        const result = await db.$queryRawUnsafe(queryString);
        return result;
      })(),
    ]);

    // // Tối ưu: Gộp device query vào cùng với user data
    // const machineNames = [
    //   ...new Set(
    //     (userSessionsAndTopUps as FnetSession[]).map((s) => s.MachineName),
    //   ),
    // ];

    // const deviceDataMap = new Map();
    // if (machineNames.length > 0) {
    //   const machineNamesStr = machineNames.map((name) => `'${name}'`).join(",");
    //   const deviceQueryString = `
    //     SELECT
    //       d.id,
    //       d.computerId,
    //       d.monitorStatus,
    //       d.keyboardStatus,
    //       d.mouseStatus,
    //       d.headphoneStatus,
    //       d.chairStatus,
    //       d.networkStatus,
    //       d.computerStatus,
    //       d.note,
    //       d.createdAt,
    //       d.updatedAt,
    //       c.name as machineName,
    //       c.branch
    //     FROM Device d
    //     JOIN Computer c ON d.computerId = c.id
    //     WHERE c.name IN (${machineNamesStr})
    //       AND c.branch = '${branch}'
    //   `;

    //   const deviceData = await db.$queryRawUnsafe(deviceQueryString);
    //   (deviceData as any[]).forEach((device) => {
    //     deviceDataMap.set(device.machineName, device);
    //   });

    //   if (isDebug) {
    //     console.log("=== DEBUG DEVICE DATA ===");
    //     console.log("Machine names from sessions:", machineNames);
    //     console.log("Device data found:", deviceData);
    //   }
    // }

    // Cache check-in items - chỉ query 1 lần
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

    // Tối ưu: Tạo maps từ kết quả đã gộp
    const userSessionsMap = new Map<number, FnetSession[]>();
    const userTopUpsMap = new Map<number, number>();
    const activeUsersMap = new Map();

    (userSessionsAndTopUps as any[]).forEach((session) => {
      const userId = session.UserId;

      // Sessions map
      if (!userSessionsMap.has(userId)) {
        userSessionsMap.set(userId, []);
      }
      userSessionsMap.get(userId)!.push(session);

      // Top ups map - convert BigInt to number
      if (session.totalTopUp && session.totalTopUp > 0) {
        const topUpValue = convertBigIntToNumber(session.totalTopUp);
        userTopUpsMap.set(userId, topUpValue);
      }

      // Active users map
      if (!activeUsersMap.has(userId)) {
        activeUsersMap.set(userId, {
          userId: userId,
          userType: session.UserType,
        });
      }
    });

    const userDataMap = new Map();
    const userClaimsMap = new Map();
    const userGiftRoundsMap = new Map();

    (userDataAndClaims as any[]).forEach((user) => {
      userDataMap.set(user.userId, user);

      // Convert BigInt to number for claims
      const totalClaimed = convertBigIntToNumber(user.totalClaimed);
      userClaimsMap.set(user.userId, totalClaimed);

      // Convert BigInt to number for gift rounds
      const totalGiftRounds = convertBigIntToNumber(user.totalGiftRounds);
      userGiftRoundsMap.set(user.userId, totalGiftRounds);
    });

    const userGameRoundsMap = new Map();
    (userGameRounds as any[]).forEach((round) => {
      // Convert BigInt to number for game rounds
      const gameRounds = convertBigIntToNumber(round.gameRounds);
      userGameRoundsMap.set(round.userId, gameRounds);
    });

    const activeUsers = Array.from(activeUsersMap.values());

    // Tính toán thông tin cho từng user
    const results: UserInfo[] = [];

    for (const activeUser of activeUsers) {
      const { userType, userId } = activeUser;

      if (typeof userId !== "number" || isNaN(userId)) {
        continue;
      }

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

        // Lấy từ cache đã tính sẵn
        const totalClaimed = userClaimsMap.get(userId) || 0;

        if (isDebug && debugUsers.includes(userId)) {
          console.log(`User ${userId} totalClaimed:`, totalClaimed);
        }

        userData = userDataMap.get(userId);
        claimedCheckIn = totalClaimed;
        availableCheckIn = Math.max(0, totalCheckIn - totalClaimed);

        if (isDebug && debugUsers.includes(userId)) {
          console.log(`User ${userId} claimedCheckIn:`, claimedCheckIn);
          console.log(`User ${userId} availableCheckIn:`, availableCheckIn);
        }

        if (userData?.id) {
          checkIn = availableCheckIn;
        } else {
          checkIn = totalCheckIn;
        }
      } else {
        totalCheckIn = 0;
        claimedCheckIn = 0;
        availableCheckIn = 0;
      }

      // Tính rounds từ cache đã tính sẵn
      userTopUp = userTopUpsMap.get(userId) || 0;
      const spendPerRound = Number(process.env.NEXT_PUBLIC_SPEND_PER_ROUND);
      const round = Math.floor(userTopUp ? userTopUp / spendPerRound : 0);

      if (isDebug && debugUsers.includes(userId)) {
        console.log(`User ${userId} userTopUp:`, userTopUp);
        console.log(`User ${userId} spendPerRound:`, spendPerRound);
        console.log(`User ${userId} round:`, round);
      }

      // Lấy từ cache đã tính sẵn
      totalGiftRounds = userGiftRoundsMap.get(userId) || 0;

      if (isDebug && debugUsers.includes(userId)) {
        console.log(`User ${userId} totalGiftRounds:`, totalGiftRounds);
      }

      if (userData?.id) {
        const usedRounds = userGameRoundsMap.get(userId) || 0;
        totalRound = round - usedRounds;

        if (isDebug && debugUsers.includes(userId)) {
          console.log(`User ${userId} usedRounds:`, usedRounds);
          console.log(`User ${userId} totalRound:`, totalRound);
        }

        // Cập nhật magicStone - chỉ update khi cần thiết
        if (userData.magicStone !== totalRound) {
          await db.$executeRawUnsafe(`
            UPDATE User 
            SET magicStone = ${totalRound}, updatedAt = NOW()
            WHERE id = '${userData.id}'
          `);
        }
      } else {
        totalRound = round;

        if (isDebug && debugUsers.includes(userId)) {
          console.log(`User ${userId} not logged in, totalRound:`, totalRound);
        }
      }

      if (userId === 244) {
        console.log(">>>> DEBUG USER 244 >>>>", userData);
      }

      // const device = machineName ? deviceDataMap.get(machineName) : null;

      if (isDebug && debugUsers.includes(userId)) {
        console.log(`User ${userId} machineName:`, machineName);
        console.log(`User ${userId} device lookup result:`, device);
        console.log(`User ${userId} final result:`, {
          userId,
          userName: userData?.userName,
          userType: userType?.toString(),
          totalCheckIn: totalCheckIn || 0,
          claimedCheckIn: claimedCheckIn || 0,
          availableCheckIn: availableCheckIn || 0,
          round: totalRound,
          stars: convertBigIntToNumber(userData?.stars),
          magicStone: convertBigIntToNumber(userData?.magicStone),
          isUseApp:
            userData?.isUseApp !== undefined
              ? Boolean(userData.isUseApp)
              : true,
          note: userData?.note || "",
          totalPayment: userTopUp,
          giftRound: totalGiftRounds,
          machineName: machineName,
          // device: device || null,
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
        stars: convertBigIntToNumber(userData?.stars),
        magicStone: convertBigIntToNumber(userData?.magicStone),
        isUseApp:
          userData?.isUseApp !== undefined ? Boolean(userData.isUseApp) : true,
        note: userData?.note || "",
        totalPayment: userTopUp,
        giftRound: totalGiftRounds,
        machineName: machineName,
        // device: device || null,
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
