import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isToday from "dayjs/plugin/isToday";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import weekOfYear from "dayjs/plugin/weekOfYear";
import weekday from "dayjs/plugin/weekday";

dayjs.extend(isSameOrAfter);
dayjs.extend(isToday);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekOfYear);
dayjs.extend(weekday);

// Cấu hình để Thứ 2 là đầu tuần (1 = Monday, 0 = Sunday)
dayjs.Ls.en.weekStart = 1;

export function isNextDay(inputTime: string) {
  const vietnamTime = dayjs.utc(inputTime).tz("Asia/Ho_Chi_Minh");
  const currentDayVN = dayjs().tz("Asia/Ho_Chi_Minh");
  return vietnamTime.isAfter(currentDayVN.startOf("day").add(1, "day"));
}

export default dayjs;
