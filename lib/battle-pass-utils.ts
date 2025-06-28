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
export function calculateRemainingExperience(currentExperience: number, currentLevel: number): number {
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
    const date = dayjs(enterDate).tz('Asia/Ho_Chi_Minh');
    const time = dayjs(enterTime).tz('Asia/Ho_Chi_Minh');
    if (!date.isValid() || !time.isValid()) return null;
    return date.hour(time.hour()).minute(time.minute()).second(time.second()).millisecond(0);
  } catch (error) {
    return null;
  }
}

function parseSessionEndDateTime(endDate: any, endTime: any) {
  if (!endDate || !endTime) return dayjs().tz('Asia/Ho_Chi_Minh');
  const date = dayjs(endDate).tz('Asia/Ho_Chi_Minh');
  const time = dayjs(endTime).tz('Asia/Ho_Chi_Minh');
  if (!date.isValid() || !time.isValid()) return dayjs().tz('Asia/Ho_Chi_Minh');
  return date.hour(time.hour()).minute(time.minute()).second(time.second()).millisecond(0);
}

/**
 * Tính tổng thời gian sử dụng trong ngày hiện tại với timezone Vietnam
 * @param sessions - Danh sách session từ database
 * @returns Tổng thời gian sử dụng tính bằng phút
 */
export const calculateDailyUsageMinutes = (sessions: any[]): number => {
  const today = dayjs().tz('Asia/Ho_Chi_Minh').startOf('day');
  const tomorrow = today.add(1, 'day');
  let totalMinutes = 0;
  for (const session of sessions) {
    try {
      if (!session.EnterDate || !session.EnterTime) continue;
      const enterDateTime = parseSessionDateTime(session.EnterDate, session.EnterTime);
      if (!enterDateTime || !enterDateTime.isValid()) continue;
      let endDateTime = parseSessionEndDateTime(session.EndDate, session.EndTime);
      if (endDateTime.isBefore(enterDateTime)) endDateTime = dayjs().tz('Asia/Ho_Chi_Minh');
      // Nếu session bắt đầu trước hôm nay và kết thúc hôm nay, set start = 0h hôm nay
      let sessionStart = enterDateTime;
      if (enterDateTime.isBefore(today) && endDateTime.isAfter(today) && endDateTime.isBefore(tomorrow)) {
        sessionStart = today;
      }
      const sessionEnd = endDateTime.isAfter(tomorrow) ? tomorrow : endDateTime;
      if (sessionEnd.isAfter(sessionStart)) {
        totalMinutes += sessionEnd.diff(sessionStart, 'minute');
      }
    } catch (error) {
      continue;
    }
  }
  return totalMinutes;
};

/**
 * Tính tổng thời gian sử dụng trong ngày hiện tại với timezone Vietnam
 * @param sessions - Danh sách session từ database
 * @returns Tổng thời gian sử dụng tính bằng giờ (số nguyên)
 */
export const calculateDailyUsageHours = (sessions: any[]): number => {
  return Math.round(calculateDailyUsageMinutes(sessions) / 60);
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