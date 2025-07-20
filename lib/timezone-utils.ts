import dayjs from "@/lib/dayjs";

// Utility functions cho timezone Vietnam (GMT+7)
// Sử dụng utcOffset(7) thay vì tz("Asia/Ho_Chi_Minh") để đảm bảo consistency

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

// ===== HELPER FUNCTIONS =====

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
