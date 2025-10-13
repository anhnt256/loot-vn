import dayjs from "@/lib/dayjs";

// Utility functions cho timezone Vietnam (GMT+7)
// Sử dụng utcOffset(7) thay vì tz("Asia/Ho_Chi_Minh") để đảm bảo consistency

// ===== ISO STRING FUNCTIONS =====
// Cho API responses với timezone offset

export const getCurrentTimeVNISO = () => {
  const nowVN = dayjs().utcOffset(7);
  return nowVN.format();
};

// ===== DATABASE DATETIME FUNCTIONS =====
// Cho database với timezone VN (+7) nhưng format MySQL compatible

export const getCurrentTimeVNDB = () => {
  const nowVN = dayjs().utcOffset(7);
  return nowVN.format("YYYY-MM-DD HH:mm:ss");
};

export const getCurrentTimeVNDBWithMs = () => {
  const nowVN = dayjs().utcOffset(7);
  return nowVN.format("YYYY-MM-DD HH:mm:ss.SSS");
};

export const getStartOfDayVNDB = () => {
  const nowVN = dayjs().utcOffset(7);
  return nowVN.startOf("day").format("YYYY-MM-DD HH:mm:ss");
};

export const getEndOfDayVNDB = () => {
  const nowVN = dayjs().utcOffset(7);
  return nowVN.endOf("day").format("YYYY-MM-DD HH:mm:ss");
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

// ===== USER VALIDATION FUNCTIONS =====

// Kiểm tra user có phải là user mới không (tài khoản được tạo chưa quá 14 ngày)
export const isNewUser = (createdAt: string | Date): boolean => {
  // Original logic (commented out for debugging)
  const nowVN = dayjs().utcOffset(7);
  const userCreatedAtVN = dayjs(createdAt).utcOffset(7);

  // Tính số ngày từ khi tạo tài khoản đến hiện tại
  const daysSinceCreation = nowVN.diff(userCreatedAtVN, "day");

  // User được coi là mới nếu chưa đủ 14 ngày
  return daysSinceCreation < 14;
};

// Lấy số ngày từ khi user được tạo
export const getDaysSinceUserCreation = (createdAt: string | Date): number => {
  const nowVN = dayjs().utcOffset(7);
  const userCreatedAtVN = dayjs(createdAt).utcOffset(7);

  return nowVN.diff(userCreatedAtVN, "day");
};

// Kiểm tra user có phải là user mới với custom số ngày
export const isNewUserWithCustomDays = (
  createdAt: string | Date,
  daysThreshold: number,
): boolean => {
  const nowVN = dayjs().utcOffset(7);
  const userCreatedAtVN = dayjs(createdAt).utcOffset(7);

  const daysSinceCreation = nowVN.diff(userCreatedAtVN, "day");

  return daysSinceCreation < daysThreshold;
};
