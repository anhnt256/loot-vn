import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isToday from "dayjs/plugin/isToday";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(isSameOrAfter);
dayjs.extend(isToday);
dayjs.extend(utc);
dayjs.extend(timezone);

export function isNextDay(inputTime: string) {
  const vietnamTime = dayjs.utc(inputTime).tz("Asia/Ho_Chi_Minh");
  const currentDayVN = dayjs().tz("Asia/Ho_Chi_Minh");
  return vietnamTime.isAfter(currentDayVN.startOf("day").add(1, "day"));
}

export default dayjs;
