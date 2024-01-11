import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isToday from "dayjs/plugin/isToday";
import utc from "dayjs/plugin/utc";

dayjs.extend(isSameOrAfter);
dayjs.extend(isToday);
dayjs.extend(utc);

const currentDate = dayjs().utc().add(7, "hour");
export const startUtc = currentDate.startOf("day").format();
export const nowUtc = currentDate.format();

export default dayjs;
