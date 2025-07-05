import dayjs from "@/lib/dayjs";

// Utility functions cho timezone Vietnam (GMT+7)
export const getCurrentTimeVN = () => dayjs().tz("Asia/Ho_Chi_Minh");
export const getStartOfDayVN = () =>
  dayjs().tz("Asia/Ho_Chi_Minh").startOf("day");
export const getEndOfDayVN = () => dayjs().tz("Asia/Ho_Chi_Minh").endOf("day");
export const getStartOfMonthVN = () =>
  dayjs().tz("Asia/Ho_Chi_Minh").startOf("month");
export const getEndOfMonthVN = () =>
  dayjs().tz("Asia/Ho_Chi_Minh").endOf("month");
export const getStartOfWeekVN = () =>
  dayjs().tz("Asia/Ho_Chi_Minh").startOf("week");
export const getEndOfWeekVN = () =>
  dayjs().tz("Asia/Ho_Chi_Minh").endOf("week");

// Cho Prisma queries (trả về Date object)
export const getCurrentDateVN = () => dayjs().tz("Asia/Ho_Chi_Minh").toDate();
export const getStartOfDayDateVN = () =>
  dayjs().tz("Asia/Ho_Chi_Minh").startOf("day").toDate();
export const getEndOfDayDateVN = () =>
  dayjs().tz("Asia/Ho_Chi_Minh").endOf("day").toDate();
export const getStartOfMonthDateVN = () =>
  dayjs().tz("Asia/Ho_Chi_Minh").startOf("month").toDate();
export const getEndOfMonthDateVN = () =>
  dayjs().tz("Asia/Ho_Chi_Minh").endOf("month").toDate();
export const getStartOfWeekDateVN = () =>
  dayjs().tz("Asia/Ho_Chi_Minh").startOf("week").toDate();
export const getEndOfWeekDateVN = () =>
  dayjs().tz("Asia/Ho_Chi_Minh").endOf("week").toDate();

// Cho ISO string (cho API responses)
export const getCurrentTimeVNISO = () =>
  dayjs().tz("Asia/Ho_Chi_Minh").toISOString();
export const getStartOfDayVNISO = () =>
  dayjs().tz("Asia/Ho_Chi_Minh").startOf("day").toISOString();
export const getEndOfDayVNISO = () =>
  dayjs().tz("Asia/Ho_Chi_Minh").endOf("day").toISOString();
export const getStartOfMonthVNISO = () =>
  dayjs().tz("Asia/Ho_Chi_Minh").startOf("month").toISOString();
export const getEndOfMonthVNISO = () =>
  dayjs().tz("Asia/Ho_Chi_Minh").endOf("month").toISOString();

// Helper function để convert date string sang Vietnam timezone
export const convertToVNTime = (dateString: string | Date) => {
  return dayjs(dateString).tz("Asia/Ho_Chi_Minh");
};

// Helper function để convert date string sang Vietnam timezone ISO
export const convertToVNTimeISO = (dateString: string | Date) => {
  return dayjs(dateString).tz("Asia/Ho_Chi_Minh").toISOString();
};

// Helper function để format date cho display
export const formatVNTime = (
  dateString: string | Date,
  format: string = "YYYY-MM-DD HH:mm:ss",
) => {
  return dayjs(dateString).tz("Asia/Ho_Chi_Minh").format(format);
};
