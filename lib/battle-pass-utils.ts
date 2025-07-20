import dayjs from "@/lib/dayjs";

// Helper function để tính toán level dựa trên experience
export function calculateLevel(experience: number, maxLevel: number): number {
  const xpPerLevel = 1000; // 1000 XP per level
  if (experience <= 0) return 0; // user mới exp = 0 thì lv = 0
  return Math.min(Math.floor(experience / xpPerLevel) + 1, maxLevel);
}

// Helper function để tính toán experience cần thiết cho level
export function calculateExperienceForLevel(level: number): number {
  const xpPerLevel = 1000; // 1000 XP per level
  return (level - 1) * xpPerLevel;
}

// Helper function để tính toán experience còn lại để lên level tiếp theo
export function calculateRemainingExperience(
  currentExperience: number,
  currentLevel: number,
): number {
  const experienceForNextLevel = calculateExperienceForLevel(currentLevel + 1);
  return Math.max(0, experienceForNextLevel - currentExperience);
}

/**
 * Parse session date time từ database format
 * @param enterDate - Date object hoặc string từ DB
 * @param enterTime - Date object hoặc string từ DB (chỉ chứa giờ/phút/giây)
 * @returns dayjs object với timezone Vietnam
 */
function parseSessionDateTime(enterDate: any, enterTime: any) {
  try {
    const date = dayjs(enterDate).tz("Asia/Ho_Chi_Minh");
    const time = dayjs(enterTime).tz("Asia/Ho_Chi_Minh");
    if (!date.isValid() || !time.isValid()) return null;
    return date
      .hour(time.hour())
      .minute(time.minute())
      .second(time.second())
      .millisecond(0);
  } catch (error) {
    return null;
  }
}

function parseSessionEndDateTime(endDate: any, endTime: any) {
  if (!endDate || !endTime) return dayjs().tz("Asia/Ho_Chi_Minh");
  const date = dayjs(endDate).tz("Asia/Ho_Chi_Minh");
  const time = dayjs(endTime).tz("Asia/Ho_Chi_Minh");
  if (!date.isValid() || !time.isValid()) return dayjs().tz("Asia/Ho_Chi_Minh");
  return date
    .hour(time.hour())
    .minute(time.minute())
    .second(time.second())
    .millisecond(0);
}

/**
 * Kết hợp ngày (YYYY-MM-DD) và giờ (HH:mm:ss) thành dayjs object (không động đến timezone)
 */
function combineDateTime(dateVal: string | Date, timeVal: string | Date) {
  // Convert về string ISO nếu là Date object
  const dateStr = typeof dateVal === "string" ? dateVal : dateVal.toISOString();
  const timeStr = typeof timeVal === "string" ? timeVal : timeVal.toISOString();

  const a = dateStr.split("T")[0];
  let b;

  if (timeStr.includes("T")) {
    b = timeStr.split("T")[1].replace("Z", ""); // loại bỏ Z nếu có
  } else {
    b = timeStr;
  }

  const fullDate = `${a}T${b}`;
  return dayjs(fullDate);
}

/**
 * Tính tổng thời gian sử dụng trong ngày targetDate (format: YYYY-MM-DD, timezone VN)
 * @param sessions - Danh sách session từ database
 * @param targetDate - Chuỗi ngày cần tính (YYYY-MM-DD)
 * @returns Tổng thời gian sử dụng tính bằng phút
 */
export const calculateDailyUsageMinutes = (
  sessions: any[],
  targetDate?: string,
): number => {
  const day = targetDate
    ? dayjs.tz(targetDate, "Asia/Ho_Chi_Minh")
    : dayjs().tz("Asia/Ho_Chi_Minh").startOf("day");
  const dayStart = day.startOf("day");
  const dayEnd = day.endOf("day");
  const now = getCurrentTimeVN();

  let totalMinutes = 0;

  for (const session of sessions) {
    if (!session.EnterDate || !session.EnterTime) continue;

    const enter = combineDateTime(session.EnterDate, session.EnterTime);
    let end;

    // Trường hợp 1: start-date là ngày hôm trước và end-date null (chưa nghỉ)
    if (enter.isBefore(dayStart) && (!session.EndDate || !session.EndTime)) {
      // Tính từ 0h ngày hôm nay đến giờ hiện tại
      end = now;
      const sessionStart = dayStart;
      const sessionEnd = end.isAfter(dayEnd) ? dayEnd : end;

      if (sessionEnd.isAfter(sessionStart)) {
        totalMinutes += sessionEnd.diff(sessionStart, "minute");
      }
    }
    // Trường hợp 2: start-date là ngày hôm trước và end-date là ngày hiện tại
    else if (enter.isBefore(dayStart) && session.EndDate && session.EndTime) {
      end = combineDateTime(session.EndDate, session.EndTime);
      // Tính từ 0h ngày hôm nay đến end time
      const sessionStart = dayStart;
      const sessionEnd = end.isAfter(dayEnd) ? dayEnd : end;

      if (sessionEnd.isAfter(sessionStart)) {
        totalMinutes += sessionEnd.diff(sessionStart, "minute");
      }
    }
    // Trường hợp 3: Các session khác (logic như hiện tại)
    else {
      if (session.EndDate && session.EndTime) {
        end = combineDateTime(session.EndDate, session.EndTime);
      } else {
        end = now;
      }

      const sessionStart = enter.isBefore(dayStart) ? dayStart : enter;
      const sessionEnd = end.isAfter(dayEnd) ? dayEnd : end;

      // Chỉ tính nếu session kết thúc sau session bắt đầu và session bắt đầu không phải trong tương lai
      if (sessionEnd.isAfter(sessionStart) && !sessionStart.isAfter(now)) {
        totalMinutes += sessionEnd.diff(sessionStart, "minute");
      }
    }
  }

  return totalMinutes;
};

export const calculateDailyUsageHours = (
  sessions: any[],
  targetDate?: string,
): number => {
  return Math.floor(calculateDailyUsageMinutes(sessions, targetDate) / 60);
};

/**
 * @deprecated Use calculateDailyUsageMinutes or calculateDailyUsageHours instead
 */
export const calculateDailyUsageTime = (sessions: any[]): number => {
  return calculateDailyUsageHours(sessions);
};

/**
 * Kiểm tra xem một thời điểm có phải là hôm nay không (theo timezone Vietnam)
 * @param dateTime - Thời điểm cần kiểm tra
 * @returns true nếu là hôm nay
 */
export const isTodayVN = (dateTime: string | Date): boolean => {
  return dayjs(dateTime).tz("Asia/Ho_Chi_Minh").isToday();
};

/**
 * Lấy thời gian hiện tại theo timezone Vietnam
 * @returns dayjs object với timezone Vietnam
 */
export const getCurrentTimeVN = () => {
  return dayjs().tz("Asia/Ho_Chi_Minh");
};

/**
 * Lấy ngày hiện tại theo timezone Vietnam
 * @returns Chuỗi ngày theo format YYYY-MM-DD
 */
export const getCurrentDateVN = (): string => {
  return dayjs().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");
};

/**
 * Lấy ngày trong tuần hiện tại theo timezone Vietnam
 * @returns Chuỗi ngày trong tuần (Mon, Tue, etc.)
 */
export const getCurrentDayOfWeekVN = (): string => {
  return dayjs().tz("Asia/Ho_Chi_Minh").format("ddd");
};
