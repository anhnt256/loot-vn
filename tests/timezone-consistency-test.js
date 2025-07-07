const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

describe('Timezone Consistency Tests', () => {
  describe('1. Timezone Utility Functions', () => {
    test('should return consistent Vietnam timezone', () => {
      const vnTime = dayjs().tz("Asia/Ho_Chi_Minh");
      expect(vnTime.format('Z')).toBe('+07:00');
    });

    test('should return start of day in Vietnam timezone', () => {
      const startOfDay = dayjs().tz("Asia/Ho_Chi_Minh").startOf("day");
      expect(startOfDay.format('Z')).toBe('+07:00');
      expect(startOfDay.format('HH:mm:ss')).toBe('00:00:00');
    });

    test('should return ISO string with timezone offset', () => {
      const vnTime = dayjs().tz("Asia/Ho_Chi_Minh");
      const isoString = vnTime.format(); // ISO with timezone offset
      const toISOString = vnTime.toISOString(); // UTC ISO string
      
      // format() includes timezone offset, toISOString() converts to UTC
      expect(isoString).not.toBe(toISOString);
      expect(isoString).toContain('+07:00');
      expect(toISOString).toContain('Z');
    });
  });

  describe('2. Check-in Timezone Logic', () => {
    test('should calculate correct start of day for Vietnam', () => {
      const now = dayjs().tz("Asia/Ho_Chi_Minh");
      const startOfDay = now.startOf("day");
      
      // Should be 00:00:00 in Vietnam timezone
      expect(startOfDay.format('HH:mm:ss')).toBe('00:00:00');
      expect(startOfDay.format('Z')).toBe('+07:00');
    });

    test('should handle timezone conversion correctly', () => {
      const vnTime = dayjs().tz("Asia/Ho_Chi_Minh");
      const utcTime = dayjs().utc();
      
      // Vietnam is UTC+7
      const timeDiff = vnTime.diff(utcTime, 'hour');
      expect(Math.abs(timeDiff)).toBe(7);
    });

    test('should maintain timezone consistency in database queries', () => {
      const startOfDayVN = dayjs().tz("Asia/Ho_Chi_Minh").startOf("day").format();
      const startOfDayUTC = dayjs().tz("Asia/Ho_Chi_Minh").startOf("day").toISOString();
      
      // format() preserves timezone, toISOString() converts to UTC
      expect(startOfDayVN).not.toBe(startOfDayUTC);
      expect(startOfDayVN).toContain('+07:00');
      expect(startOfDayUTC).toContain('Z');
    });
  });

  describe('3. Rate Limiting Timezone', () => {
    test('should use Vietnam timezone for daily limits', () => {
      const todayVN = dayjs().tz("Asia/Ho_Chi_Minh").startOf("day");
      const todayUTC = dayjs().utc().startOf("day");
      
      // These should be different due to timezone
      expect(todayVN.format()).not.toBe(todayUTC.format());
    });

    test('should calculate correct time differences', () => {
      const now = dayjs().tz("Asia/Ho_Chi_Minh");
      const thirtyMinutesAgo = now.subtract(30, 'minute');
      const diff = now.diff(thirtyMinutesAgo, 'minute');
      
      expect(diff).toBe(30);
    });
  });

  describe('4. Database Query Timezone', () => {
    test('should use correct timezone for database queries', () => {
      const startOfDayVN = dayjs().tz("Asia/Ho_Chi_Minh").startOf("day");
      
      // For database queries, we should use format() to preserve timezone
      const dbQueryTime = startOfDayVN.format();
      
      expect(dbQueryTime).toContain('+07:00');
      expect(dbQueryTime).toMatch(/^\d{4}-\d{2}-\d{2}T00:00:00\+07:00$/);
    });
  });

  describe('5. Error Message Timezone', () => {
    test('should display correct timezone in error messages', () => {
      const resetTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      const formattedTime = resetTime.toLocaleString("vi-VN");
      
      // Should display in Vietnam locale
      expect(formattedTime).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });
});

console.log('🧪 Timezone consistency tests completed'); 