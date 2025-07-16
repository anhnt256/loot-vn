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
  const b = timeStr.split("T")[1].replace("Z", ""); // loại bỏ Z nếu có

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

  let totalMinutes = 0;

  for (const session of sessions) {
    if (!session.EnterDate || !session.EnterTime) continue;

    const enter = combineDateTime(session.EnterDate, session.EnterTime);
    let end;
    if (session.EndDate && session.EndTime) {
      end = combineDateTime(session.EndDate, session.EndTime);
    } else {
      end = dayjs(); // now
    }

    const sessionStart = enter.isBefore(dayStart) ? dayStart : enter;
    const sessionEnd = end.isAfter(dayEnd) ? dayEnd : end;

    if (sessionEnd.isAfter(sessionStart)) {
      totalMinutes += sessionEnd.diff(sessionStart, "minute");
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
 * Tính tổng thời gian sử dụng trong khoảng thời gian cụ thể của mission
 * @param sessions - Danh sách session từ database
 * @param targetDate - Chuỗi ngày cần tính (YYYY-MM-DD)
 * @param startHours - Giờ bắt đầu của mission (0-23)
 * @param endHours - Giờ kết thúc của mission (0-23)
 * @returns Tổng thời gian sử dụng tính bằng giờ
 */
export const calculateMissionUsageHours = (
  sessions: any[],
  targetDate: string,
  startHours: number,
  endHours: number,
): number => {
  const day = dayjs.tz(targetDate, "Asia/Ho_Chi_Minh");
  const dayStart = day.startOf("day");
  
  // Tính thời gian bắt đầu và kết thúc của mission trong ngày
  let missionStart = dayStart.add(startHours, "hour");
  let missionEnd = dayStart.add(endHours, "hour");
  
  // Xử lý trường hợp mission qua đêm (ví dụ: 22h-6h)
  if (startHours > endHours) {
    missionEnd = missionEnd.add(1, "day");
  }

  let totalMinutes = 0;

  for (const session of sessions) {
    if (!session.EnterDate || !session.EnterTime) continue;

    const enter = combineDateTime(session.EnterDate, session.EnterTime);
    let end;
    if (session.EndDate && session.EndTime) {
      end = combineDateTime(session.EndDate, session.EndTime);
    } else {
      end = dayjs(); // now
    }

    // Xử lý session qua đêm: nếu session bắt đầu từ ngày trước và kết thúc trong ngày hiện tại
    // Chỉ tính phần từ 00:00:00 của ngày hiện tại
    if (enter.isBefore(dayStart) && end.isAfter(dayStart)) {
      const sessionStart = dayStart; // Bắt đầu từ 00:00:00 của ngày hiện tại
      const sessionEnd = end.isAfter(missionEnd) ? missionEnd : end;
      
      // Chỉ tính nếu session thực sự overlap với khoảng thời gian mission
      if (sessionEnd.isAfter(sessionStart) && sessionStart.isBefore(missionEnd) && sessionEnd.isAfter(missionStart)) {
        const minutes = sessionEnd.diff(sessionStart, "minute");
        totalMinutes += minutes;
      }
    } else {
      // Session bình thường trong cùng ngày
      const sessionStart = enter.isBefore(missionStart) ? missionStart : enter;
      const sessionEnd = end.isAfter(missionEnd) ? missionEnd : end;
      
      // Chỉ tính nếu session thực sự overlap với khoảng thời gian mission
      if (sessionEnd.isAfter(sessionStart) && sessionStart.isBefore(missionEnd) && sessionEnd.isAfter(missionStart)) {
        const minutes = sessionEnd.diff(sessionStart, "minute");
        totalMinutes += minutes;
      }
    }
  }
  return Math.floor(totalMinutes / 60);
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
