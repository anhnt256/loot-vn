import dayjs from "@/lib/dayjs";

// Utility functions cho timezone Vietnam (GMT+7)
// Sử dụng utcOffset(7) thay vì tz("Asia/Ho_Chi_Minh") để đảm bảo consistency

// ===== PRISMA FIELD FUNCTIONS =====
// Các function này được thiết kế đặc biệt cho Prisma DateTime fields

// Convert datetime string sang Date object cho Prisma DateTime field
export function toVNDate(datetimeString: string): Date {
  return dayjs(datetimeString).utcOffset(7).toDate();
}

// Lấy ngày hiện tại cho Prisma DateTime field
export function getCurrentDateForPrisma(): Date {
  return dayjs().utcOffset(7).toDate();
}

// Lấy start of day cho Prisma DateTime field
export function getStartOfDayForPrisma(): Date {
  return dayjs().utcOffset(7).startOf("day").toDate();
}

// Lấy end of day cho Prisma DateTime field
export function getEndOfDayForPrisma(): Date {
  return dayjs().utcOffset(7).endOf("day").toDate();
}

// Lấy start of month cho Prisma DateTime field
export function getStartOfMonthForPrisma(): Date {
  return dayjs().utcOffset(7).startOf("month").toDate();
}

// Lấy end of month cho Prisma DateTime field
export function getEndOfMonthForPrisma(): Date {
  return dayjs().utcOffset(7).endOf("month").toDate();
}

// Lấy start of week cho Prisma DateTime field
export function getStartOfWeekForPrisma(): Date {
  return dayjs().utcOffset(7).startOf("week").toDate();
}

// Lấy end of week cho Prisma DateTime field
export function getEndOfWeekForPrisma(): Date {
  return dayjs().utcOffset(7).endOf("week").toDate();
}

// ===== LEGACY FUNCTIONS (DEPRECATED) =====
// Các function cũ sử dụng tz() - giữ lại để backward compatibility

// Cho Prisma queries (trả về Date object từ ISO string với timezone)
export const getCurrentDateVN = () => {
  const nowVN = dayjs().utcOffset(7);
  return nowVN.toDate();
};

// Cho Prisma queries (so sánh với DateTime fields)
export const getCurrentDateVNForQuery = () => {
  const nowVN = dayjs().utcOffset(7);
  return new Date(nowVN.format());
};

export const getStartOfDayDateVN = () => {
  const nowVN = dayjs().utcOffset(7);
  return new Date(nowVN.startOf("day").format());
};

export const getEndOfDayDateVN = () => {
  const nowVN = dayjs().utcOffset(7);
  return new Date(nowVN.endOf("day").format());
};

export const getStartOfMonthDateVN = () => {
  const nowVN = dayjs().utcOffset(7);
  return new Date(nowVN.startOf("month").format());
};

export const getEndOfMonthDateVN = () => {
  const nowVN = dayjs().utcOffset(7);
  return new Date(nowVN.endOf("month").format());
};

export const getStartOfWeekDateVN = () => {
  const nowVN = dayjs().utcOffset(7);
  return new Date(nowVN.startOf("week").format());
};

export const getEndOfWeekDateVN = () => {
  const nowVN = dayjs().utcOffset(7);
  return new Date(nowVN.endOf("week").format());
};

// ===== ISO STRING FUNCTIONS =====
// Cho API responses với timezone offset

export const getCurrentTimeVNISO = () => {
  const nowVN = dayjs().utcOffset(7);
  return nowVN.format();
};

export const getStartOfDayVNISO = () => {
  const nowVN = dayjs().utcOffset(7);
  return nowVN.startOf("day").format();
};

export const getEndOfDayVNISO = () => {
  const nowVN = dayjs().utcOffset(7);
  return nowVN.endOf("day").format();
};

export const getStartOfMonthVNISO = () => {
  const nowVN = dayjs().utcOffset(7);
  return nowVN.startOf("month").format();
};

export const getEndOfMonthVNISO = () => {
  const nowVN = dayjs().utcOffset(7);
  return nowVN.endOf("month").format();
};

export const getStartOfWeekVNISO = () => {
  const nowVN = dayjs().utcOffset(7);
  return nowVN.startOf("week").format();
};

export const getEndOfWeekVNISO = () => {
  const nowVN = dayjs().utcOffset(7);
  return nowVN.endOf("week").format();
};

// ===== DAYJS OBJECT FUNCTIONS =====
// Cho tính toán và manipulation

export const getCurrentTimeVN = () => dayjs().utcOffset(7);
export const getStartOfDayVN = () => dayjs().utcOffset(7).startOf("day");
export const getEndOfDayVN = () => dayjs().utcOffset(7).endOf("day");
export const getStartOfMonthVN = () => dayjs().utcOffset(7).startOf("month");
export const getEndOfMonthVN = () => dayjs().utcOffset(7).endOf("month");
export const getStartOfWeekVN = () => dayjs().utcOffset(7).startOf("week");
export const getEndOfWeekVN = () => dayjs().utcOffset(7).endOf("week");

// ===== HELPER FUNCTIONS =====

// Helper function để convert date string sang Vietnam timezone
export const convertToVNTime = (dateString: string | Date) => {
  return dayjs(dateString).utcOffset(7);
};

// Helper function để convert date string sang Vietnam timezone ISO với timezone offset
export const convertToVNTimeISO = (dateString: string | Date) => {
  return dayjs(dateString).utcOffset(7).format();
};

// Helper function để format date cho display
export const formatVNTime = (
  dateString: string | Date,
  format: string = "YYYY-MM-DD HH:mm:ss",
) => {
  return dayjs(dateString).utcOffset(7).format(format);
};

// Helper function để lấy ngày hiện tại theo format YYYY-MM-DD
export const getCurrentDateVNString = () => {
  const nowVN = dayjs().utcOffset(7);
  return nowVN.format("YYYY-MM-DD");
};

// Helper function để lấy tên ngày trong tuần (Monday, Tuesday, etc.)
export const getCurrentDayOfWeekVN = () => {
  const nowVN = dayjs().utcOffset(7);
  return nowVN.format("dddd");
};

// ===== PRISMA HELPER FUNCTIONS =====
// Các function đơn giản để lấy thời gian Vietnam cho Prisma

// Lấy thời gian hiện tại Vietnam cho Prisma
export const getVNTimeForPrisma = () => {
  const nowVN = dayjs().utcOffset(7);
  return new Date(nowVN.format());
};

// Lấy start of day Vietnam cho Prisma
export const getVNStartOfDayForPrisma = () => {
  return dayjs().utcOffset(7).startOf("day").toDate();
};
