import { db, getFnetDB } from "@/lib/db";
import { calculateDailyUsageMinutes } from "@/lib/battle-pass-utils";
import {
  getStartOfDayVNISO,
  getCurrentTimeVNISO,
  getStartOfWeekVNISO,
  getEndOfWeekVNISO,
  getCurrentDayOfWeekVN,
} from "@/lib/timezone-utils";
import dayjs from "@/lib/dayjs";

export interface BattlePassData {
  level: number;
  exp: number;
}

export interface BattlePass {
  isUsed: boolean;
  isPremium: boolean;
  data: BattlePassData | null;
}

export interface UserInfo {
  userId: number;
  userName?: string;
  userType?: number;
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
  machineName: string; // Thêm field machineName
  device?: any; // Thêm field device
  battlePass: BattlePass; // Thêm field battlePass
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

interface ComboDetail {
  Ownerid: number;
  FromDate: string | Date;
  FromTime: string | Date;
  ToDate: string | Date;
  ToTime: string | Date;
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
 * Kết hợp ngày (YYYY-MM-DD) và giờ (HH:mm:ss) thành dayjs object
 */
function combineDateTime(dateVal: string | Date, timeVal: string | Date) {
  const dateStr = typeof dateVal === "string" ? dateVal : dateVal.toISOString();
  const timeStr = typeof timeVal === "string" ? timeVal : timeVal.toISOString();

  const a = dateStr.split("T")[0];
  let b;

  if (timeStr.includes("T")) {
    b = timeStr.split("T")[1].replace("Z", "");
  } else {
    b = timeStr;
  }

  const fullDate = `${a}T${b}`;
  return dayjs(fullDate).tz("Asia/Ho_Chi_Minh");
}

/**
 * Kiểm tra xem user có đang mua combo (combo đang active) không
 */
function isUserUsingCombo(combos: ComboDetail[], userId?: number, isDebug?: boolean): boolean {
  if (!combos || combos.length === 0) {
    return false;
  }

  const now = dayjs().tz("Asia/Ho_Chi_Minh");

  for (const combo of combos) {
    const comboStart = combineDateTime(combo.FromDate, combo.FromTime);
    const comboEnd = combineDateTime(combo.ToDate, combo.ToTime);


    // Check xem thời gian hiện tại có nằm trong khoảng combo không (bao gồm cả điểm đầu và cuối)
    // isSameOrBefore tương đương với !isAfter
    if (now.isSameOrAfter(comboStart) && (now.isBefore(comboEnd) || now.isSame(comboEnd))) {
      return true;
    }
  }

  return false;
}

/**
 * Tính thời gian CheckIn trong ngày hiện tại, loại bỏ các khoảng thời gian trùng với combo
 * Chỉ tính từ 0h hôm nay đến hiện tại, nếu qua ngày thì reset về 0
 */
function calculateCheckInMinutes(
  sessions: FnetSession[],
  combos: ComboDetail[],
  userId?: number,
  isDebug?: boolean,
): number {
  const now = dayjs().tz("Asia/Ho_Chi_Minh");
  const todayStart = now.startOf("day");
  const todayDate = now.format("YYYY-MM-DD");


  // Check xem có session nào đang chạy trong ngày hôm nay không
  // (bao gồm cả session bắt đầu từ hôm nay và session từ hôm qua vẫn đang chạy)
  const hasActiveSessionToday = sessions.some((s) => {
    if (!s.EnterDate || !s.EnterTime) return false;
    
    const enter = combineDateTime(s.EnterDate, s.EnterTime);
    let end: dayjs.Dayjs;
    
    if (s.EndDate && s.EndTime) {
      end = combineDateTime(s.EndDate, s.EndTime);
    } else {
      end = now; // Session đang chạy
    }
    
    // Session đang chạy trong ngày hôm nay nếu:
    // - Bắt đầu từ hôm nay, hoặc
    // - Bắt đầu từ hôm qua nhưng vẫn đang chạy (chưa kết thúc) và overlap với ngày hôm nay
    const enterDate = typeof s.EnterDate === "string" 
      ? s.EnterDate 
      : dayjs(s.EnterDate).format("YYYY-MM-DD");
    
    if (enterDate === todayDate) {
      return true; // Session bắt đầu từ hôm nay
    }
    
    // Session từ hôm qua nhưng vẫn đang chạy và overlap với ngày hôm nay
    if (!s.EndDate || !s.EndTime) {
      // Session chưa kết thúc, check xem có overlap với ngày hôm nay không
      return enter.isBefore(todayStart) && end.isAfter(todayStart);
    }
    
    return false;
  });


  // Nếu không có session nào đang chạy trong ngày hôm nay, reset về 0 (qua ngày reset điểm check-in)
  if (!hasActiveSessionToday) {
    return 0;
  }

  // Tạo danh sách các khoảng thời gian combo trong ngày hôm nay
  const comboRanges: Array<{ start: dayjs.Dayjs; end: dayjs.Dayjs }> = [];
  for (const combo of combos) {
    const comboStart = combineDateTime(combo.FromDate, combo.FromTime);
    const comboEnd = combineDateTime(combo.ToDate, combo.ToTime);

    // Chỉ lấy phần combo trong ngày hôm nay
    const comboStartInToday = comboStart.isBefore(todayStart)
      ? todayStart
      : comboStart;
    const comboEndInToday = comboEnd.isAfter(now) ? now : comboEnd;

    // Chỉ thêm nếu combo overlap với ngày hôm nay
    if (comboEndInToday.isAfter(comboStartInToday) && comboStartInToday.isBefore(now)) {
      comboRanges.push({
        start: comboStartInToday,
        end: comboEndInToday,
      });
    }
  }

  // Sắp xếp combo ranges theo thời gian bắt đầu
  comboRanges.sort((a, b) => a.start.diff(b.start));

  // Tính tổng thời gian session trong ngày hôm nay
  let totalMinutes = 0;

  for (const session of sessions) {
    if (!session.EnterDate || !session.EnterTime) continue;

    const enter = combineDateTime(session.EnterDate, session.EnterTime);
    let end: dayjs.Dayjs;

    if (session.EndDate && session.EndTime) {
      end = combineDateTime(session.EndDate, session.EndTime);
    } else {
      end = now;
    }

    // Chỉ tính phần trong ngày hôm nay
    let sessionStart = enter.isBefore(todayStart) ? todayStart : enter;
    let sessionEnd = end.isAfter(now) ? now : end;

    // Nếu session bắt đầu sau hôm nay, bỏ qua
    if (sessionStart.isAfter(now)) {
      continue;
    }

    // Nếu session kết thúc trước hôm nay, bỏ qua
    if (sessionEnd.isBefore(todayStart)) {
      continue;
    }

    // Tính thời gian session ban đầu
    const sessionDuration = sessionEnd.diff(sessionStart, "minute");
    if (sessionDuration <= 0) {
      continue;
    }

    // Loại bỏ các khoảng thời gian trùng với combo
    let remainingMinutes = sessionDuration;
    for (const comboRange of comboRanges) {
      // Check overlap
      const overlapStart = sessionStart.isAfter(comboRange.start)
        ? sessionStart
        : comboRange.start;
      const overlapEnd = sessionEnd.isBefore(comboRange.end)
        ? sessionEnd
        : comboRange.end;

      if (overlapEnd.isAfter(overlapStart)) {
        const overlapMinutes = overlapEnd.diff(overlapStart, "minute");
        remainingMinutes -= overlapMinutes;
      }
    }

    if (remainingMinutes > 0) {
      totalMinutes += remainingMinutes;
    }
  }

  return Math.max(0, totalMinutes);
}

/**
 * Tính toán thông tin chi tiết cho danh sách active users
 */
export async function calculateActiveUsersInfo(
  listUsers: number[],
  branch: string,
  isDebug: boolean = true,
  debugUsers: number[] = [14852],
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

    // Tối ưu: Gộp tất cả queries thành 4 query chính thay vì 6
    const [
      userSessionsAndTopUps, // Gộp sessions + top ups
      userDataAndClaims, // Gộp user data + claims + gift rounds
      userGameRounds, // Game rounds riêng vì cần time range khác
      userBattlePassData, // UserBattlePass data
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
          COALESCE(SUM(CASE WHEN gr.expiredAt >= NOW() THEN gr.amount - gr.usedAmount ELSE 0 END), 0) AS totalGiftRounds
        FROM User u
        LEFT JOIN UserStarHistory ush ON u.userId = ush.userId 
          AND u.branch = ush.branch 
          AND ush.type = 'CHECK_IN' 
          AND ush.createdAt >= '${startOfDayVN}'
        LEFT JOIN GiftRound gr ON u.userId = gr.userId 
          AND u.branch = gr.branch
          AND gr.expiredAt >= NOW()
        WHERE u.userId IN (${userIdsStr})
          AND u.branch = '${branch}'
        GROUP BY u.id, u.userId, u.userName, u.stars, u.magicStone, u.isUseApp, u.note, u.createdAt, u.updatedAt, u.branch
        `;

        const result = await db.$queryRawUnsafe(queryString);
        return result;
      })(),

      // 3. Game rounds riêng vì cần time range khác
      (async () => {
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

      // 4. UserBattlePass data - chỉ lấy data của season đang active
      (async () => {
        const userIdsStr = finalListUsers.join(",");

        // Lấy current active season trước
        const currentSeasonQuery = `
          SELECT id FROM BattlePassSeason 
          WHERE isActive = true
            AND startDate <= DATE(NOW())
            AND endDate >= DATE(NOW())
          LIMIT 1
        `;
        const currentSeasonResult =
          await db.$queryRawUnsafe(currentSeasonQuery);

        // Nếu không có season active, return empty array
        if (
          !currentSeasonResult ||
          (currentSeasonResult as any[]).length === 0
        ) {
          return [];
        }

        const currentSeasonId = (currentSeasonResult as any[])[0].id;

        // Lấy UserBattlePass của season hiện tại
        const queryString = `
        SELECT 
          userId,
          level,
          experience,
          isPremium
        FROM UserBattlePass
        WHERE userId IN (${userIdsStr})
          AND branch = '${branch}'
          AND seasonId = ${currentSeasonId}
        `;

        const result = await db.$queryRawUnsafe(queryString);
        return result;
      })(),
    ]);

    // Tối ưu: Gộp device query vào cùng với user data
    const machineNames = [
      ...new Set(
        (userSessionsAndTopUps as FnetSession[]).map((s) => s.MachineName),
      ),
    ];

    const deviceDataMap = new Map();
    if (machineNames.length > 0) {
      const machineNamesStr = machineNames.map((name) => `'${name}'`).join(",");
      const deviceQueryString = `
        SELECT
          d.id,
          d.computerId,
          d.monitorStatus,
          d.keyboardStatus,
          d.mouseStatus,
          d.headphoneStatus,
          d.chairStatus,
          d.networkStatus,
          d.computerStatus,
          d.note,
          d.createdAt,
          d.updatedAt,
          c.name as machineName,
          c.branch
        FROM Device d
        JOIN Computer c ON d.computerId = c.id
        WHERE c.name IN (${machineNamesStr})
          AND c.branch = '${branch}'
      `;

      const deviceData = await db.$queryRawUnsafe(deviceQueryString);
      (deviceData as any[]).forEach((device) => {
        deviceDataMap.set(device.machineName, device);
      });
    }

    // Query combo data cho các users
    const userIdsStr = finalListUsers.join(",");
    const comboQueryString = `
      SELECT 
        Ownerid,
        FromDate,
        FromTime,
        ToDate,
        ToTime
      FROM fnet.combodetailtb
      WHERE FIND_IN_SET(Ownerid, '${userIdsStr}')
        AND (
          (FromDate + INTERVAL FromTime HOUR_SECOND) <= NOW()
          AND (ToDate + INTERVAL ToTime HOUR_SECOND) >= DATE_SUB(NOW(), INTERVAL 1 DAY)
        )
    `;
    
    const comboData = await fnetDB.$queryRawUnsafe<ComboDetail[]>(comboQueryString);

    // Tạo map combo data theo userId
    const userComboMap = new Map<number, ComboDetail[]>();
    (comboData as any[]).forEach((combo) => {
      const userId = convertBigIntToNumber(combo.Ownerid);
      if (!userComboMap.has(userId)) {
        userComboMap.set(userId, []);
      }
      userComboMap.get(userId)!.push(combo);
    });

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
        // Check xem user có đang mua combo không
        const userCombos = userComboMap.get(userId) || [];
        const isUsingCombo = isUserUsingCombo(userCombos, userId, isDebug && debugUsers.includes(userId));
        
        activeUsersMap.set(userId, {
          userId: userId,
          userType: isUsingCombo ? 5 : session.UserType,
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

    const userBattlePassMap = new Map();
    (userBattlePassData as any[]).forEach((battlePass) => {
      userBattlePassMap.set(battlePass.userId, {
        level: convertBigIntToNumber(battlePass.level),
        experience: convertBigIntToNumber(battlePass.experience),
        isPremium: Boolean(battlePass.isPremium),
      });
    });

    const activeUsers = Array.from(activeUsersMap.values());

    // Tính toán thông tin cho từng user
    const results: UserInfo[] = [];

    for (const activeUser of activeUsers) {
      const { userType, userId } = activeUser;

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

        // Tính CheckIn loại bỏ thời gian combo
        const userCombos = userComboMap.get(userId) || [];
        const totalPlayTimeMinutes = calculateCheckInMinutes(
          sessions, 
          userCombos,
          userId,
          isDebug && debugUsers.includes(userId)
        );
        const totalPlayTimeHours = Math.floor(totalPlayTimeMinutes / 60);
        totalCheckIn = Math.floor(totalPlayTimeHours * starsPerHour);

        // Lấy từ cache đã tính sẵn
        const totalClaimed = userClaimsMap.get(userId) || 0;

        userData = userDataMap.get(userId);
        claimedCheckIn = totalClaimed;
        availableCheckIn = Math.max(0, totalCheckIn - totalClaimed);

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

      // Lấy từ cache đã tính sẵn
      totalGiftRounds = userGiftRoundsMap.get(userId) || 0;

      if (userData?.id) {
        const usedRounds = userGameRoundsMap.get(userId) || 0;
        totalRound = round - usedRounds;

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
      }

      const device = machineName ? deviceDataMap.get(machineName) : null;

      // Xử lý battlePass data
      const battlePassData = userBattlePassMap.get(userId);
      const battlePass: BattlePass = battlePassData
        ? {
            isUsed: true,
            isPremium: battlePassData.isPremium,
            data: {
              level: battlePassData.level,
              exp: battlePassData.experience,
            },
          }
        : {
            isUsed: false,
            isPremium: false,
            data: null,
          };

      const result: UserInfo = {
        userId,
        userName: userData?.userName,
        userType: userType,
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
        machineName: machineName || "",
        device: device || null,
        battlePass: battlePass,
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
