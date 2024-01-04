import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isToday from "dayjs/plugin/isToday";
dayjs.extend(isSameOrAfter);
dayjs.extend(isToday);

export default dayjs;
