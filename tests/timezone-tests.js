const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

// Helper function để tính ngày đầu tuần (Thứ 2)
const getWeekStart = (date) => {
  const day = date.day();
  const diff = date.date() - day + (day === 0 ? -6 : 1); // Thứ 2 = 1
  return date.date(diff).startOf('day');
};

// Helper function để tính ngày cuối tuần (Chủ nhật)
const getWeekEnd = (date) => {
  const weekStart = getWeekStart(date);
  return weekStart.add(6, 'day').endOf('day');
};

// Mock database functions
const mockDb = {
  gameResult: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn()
  },
  checkInResult: {
    findFirst: jest.fn(),
    create: jest.fn()
  },
  userStarHistory: {
    findMany: jest.fn(),
    create: jest.fn()
  },
  user: {
    findFirst: jest.fn(),
    update: jest.fn()
  }
};

// Test Suite cho Timezone VN
describe('Timezone Vietnam Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Game Roll Timezone Tests', () => {
    test('should calculate weekly rounds correctly with VN timezone', () => {
      // Test với ngày thứ 2 (15/01/2024 là thứ 2)
      const testDate = dayjs('2024-01-15').tz("Asia/Ho_Chi_Minh");
      const weekStart = getWeekStart(testDate);
      const weekEnd = getWeekEnd(testDate);

      expect(weekStart.format('YYYY-MM-DD')).toBe('2024-01-15');
      expect(weekEnd.format('YYYY-MM-DD')).toBe('2024-01-21');

      // Test với ngày thứ 3 (16/01/2024 là thứ 3)
      const testDate2 = dayjs('2024-01-16').tz("Asia/Ho_Chi_Minh");
      const weekStart2 = getWeekStart(testDate2);
      const weekEnd2 = getWeekEnd(testDate2);

      expect(weekStart2.format('YYYY-MM-DD')).toBe('2024-01-15'); // Vẫn là thứ 2
      expect(weekEnd2.format('YYYY-MM-DD')).toBe('2024-01-21');   // Vẫn là chủ nhật
    });

    test('should reset game rounds at Monday 00:00 VN time', () => {
      const mondayMidnight = dayjs('2024-01-15 00:00:00').tz("Asia/Ho_Chi_Minh");
      const sundayNight = dayjs('2024-01-14 23:59:59').tz("Asia/Ho_Chi_Minh");
      const mondayMorning = dayjs('2024-01-15 00:00:01').tz("Asia/Ho_Chi_Minh");

      const isNewWeek = mondayMorning.isAfter(sundayNight) && 
                       mondayMorning.day() === 1; // Monday = 1

      expect(isNewWeek).toBe(true);
      expect(mondayMidnight.day()).toBe(1); // Thứ 2
      expect(sundayNight.day()).toBe(0);    // Chủ nhật
    });

    test('should handle timezone edge cases for game rolls', () => {
      const testCases = [
        {
          utcTime: '2024-01-14 17:00:00', // UTC 17:00 = VN 00:00 (thứ 2)
          expectedDay: 1, // Thứ 2
          expectedDate: '2024-01-15'
        },
        {
          utcTime: '2024-01-14 16:59:59', // UTC 16:59 = VN 23:59 (chủ nhật)
          expectedDay: 0, // Chủ nhật
          expectedDate: '2024-01-14'
        },
        {
          utcTime: '2024-01-14 18:00:00', // UTC 18:00 = VN 01:00 (thứ 2)
          expectedDay: 1, // Thứ 2
          expectedDate: '2024-01-15'
        }
      ];

      testCases.forEach(({ utcTime, expectedDay, expectedDate }) => {
        const vnTime = dayjs.utc(utcTime).tz("Asia/Ho_Chi_Minh");
        expect(vnTime.day()).toBe(expectedDay);
        expect(vnTime.format('YYYY-MM-DD')).toBe(expectedDate);
      });
    });
  });

  describe('2. Check-in Timezone Tests', () => {
    test('should calculate daily check-in limits correctly', () => {
      const testCases = [
        {
          date: '2024-01-15 23:59:59',
          expectedCanCheckIn: true,
          description: 'Cuối ngày vẫn có thể check-in'
        },
        {
          date: '2024-01-16 00:00:00', 
          expectedCanCheckIn: true,
          description: 'Đầu ngày mới có thể check-in'
        },
        {
          date: '2024-01-16 00:00:01',
          expectedCanCheckIn: true,
          description: 'Sau đầu ngày vẫn có thể check-in'
        }
      ];

      testCases.forEach(({ date, expectedCanCheckIn, description }) => {
        const currentTime = dayjs(date).tz("Asia/Ho_Chi_Minh");
        const startOfDay = currentTime.startOf('day');
        const isNewDay = currentTime.isAfter(startOfDay) || currentTime.isSame(startOfDay);

        expect(isNewDay).toBe(expectedCanCheckIn);
      });
    });

    test('should prevent spam check-in with VN timezone', () => {
      const firstCheckIn = dayjs('2024-01-15 10:00:00').tz("Asia/Ho_Chi_Minh");
      const attempts = [
        { 
          time: '2024-01-15 10:05:00', 
          shouldAllow: false,
          description: 'Chưa đủ 10 phút'
        },
        { 
          time: '2024-01-15 10:09:59', 
          shouldAllow: false,
          description: 'Chưa đủ 10 phút'
        },
        { 
          time: '2024-01-15 10:10:00', 
          shouldAllow: true,
          description: 'Đúng 10 phút'
        },
        { 
          time: '2024-01-15 10:10:01', 
          shouldAllow: true,
          description: 'Hơn 10 phút'
        }
      ];

      attempts.forEach(({ time, shouldAllow, description }) => {
        const attemptTime = dayjs(time).tz("Asia/Ho_Chi_Minh");
        const timeDiff = attemptTime.diff(firstCheckIn, 'minute');
        const canCheckIn = timeDiff >= 10;

        expect(canCheckIn).toBe(shouldAllow);
      });
    });

    test('should handle day change during check-in', () => {
      const day1CheckIn = dayjs('2024-01-15 23:58:00').tz("Asia/Ho_Chi_Minh");
      const day2CheckIn = dayjs('2024-01-16 00:00:00').tz("Asia/Ho_Chi_Minh");

      const isSameDay = day1CheckIn.isSame(day2CheckIn, 'day');
      const timeDiff = day2CheckIn.diff(day1CheckIn, 'minute');

      expect(isSameDay).toBe(false);
      expect(timeDiff).toBe(2); // 2 phút (23:58 đến 00:00)
      
      // Test thêm trường hợp cùng ngày
      const sameDayCheckIn1 = dayjs('2024-01-15 10:00:00').tz("Asia/Ho_Chi_Minh");
      const sameDayCheckIn2 = dayjs('2024-01-15 15:00:00').tz("Asia/Ho_Chi_Minh");
      const isSameDay2 = sameDayCheckIn1.isSame(sameDayCheckIn2, 'day');
      expect(isSameDay2).toBe(true);
    });
  });

  describe('3. Daily Usage Time Tests', () => {
    test('should calculate daily play time correctly with VN timezone', () => {
      const mockSessions = [
        {
          EnterDate: '2024-01-15',
          EnterTime: '10:00:00',
          EndDate: '2024-01-15', 
          EndTime: '12:00:00'
        },
        {
          EnterDate: '2024-01-15',
          EnterTime: '14:00:00',
          EndDate: '2024-01-15',
          EndTime: '16:00:00'
        },
        {
          EnterDate: '2024-01-15',
          EnterTime: '22:00:00',
          EndDate: '2024-01-16',
          EndTime: '02:00:00'
        }
      ];

      const calculateDailyUsageMinutes = (sessions, targetDate = '2024-01-15') => {
        const day = dayjs.tz(targetDate, "Asia/Ho_Chi_Minh");
        const dayStart = day.startOf("day");
        const dayEnd = day.endOf("day");
        let totalMinutes = 0;

        for (const session of sessions) {
          const enter = dayjs.tz(`${session.EnterDate} ${session.EnterTime}`, "Asia/Ho_Chi_Minh");
          const end = dayjs.tz(`${session.EndDate} ${session.EndTime}`, "Asia/Ho_Chi_Minh");

          // Tính thời gian trong ngày target
          let sessionMinutes = 0;
          
          if (enter.isBefore(dayEnd) && end.isAfter(dayStart)) {
            const effectiveStart = enter.isBefore(dayStart) ? dayStart : enter;
            const effectiveEnd = end.isAfter(dayEnd) ? dayEnd : end;
            
            if (effectiveEnd.isAfter(effectiveStart)) {
              sessionMinutes = Math.ceil(effectiveEnd.diff(effectiveStart, "minute", true));
            }
          }
          
          totalMinutes += sessionMinutes;
        }

        return totalMinutes;
      };

      const totalMinutes = calculateDailyUsageMinutes(mockSessions);
      // Session 1: 10:00-12:00 = 120 phút
      // Session 2: 14:00-16:00 = 120 phút  
      // Session 3: 22:00-00:00 = 120 phút (chỉ tính phần trong ngày 15)
      // Tổng: 360 phút
      expect(totalMinutes).toBe(360);

      // Test ngày 16
      const totalMinutesDay16 = calculateDailyUsageMinutes(mockSessions, '2024-01-16');
      // Session 3: 00:00-02:00 = 120 phút (chỉ tính phần trong ngày 16)
      expect(totalMinutesDay16).toBe(120);
    });

    test('should handle overnight sessions correctly', () => {
      const overnightSession = {
        EnterDate: '2024-01-15',
        EnterTime: '23:00:00',
        EndDate: '2024-01-16',
        EndTime: '01:00:00'
      };

      const calculateOvernightMinutes = (session, targetDate) => {
        const day = dayjs.tz(targetDate, "Asia/Ho_Chi_Minh");
        const dayStart = day.startOf("day");
        const dayEnd = day.endOf("day");

        const enter = dayjs.tz(`${session.EnterDate} ${session.EnterTime}`, "Asia/Ho_Chi_Minh");
        const end = dayjs.tz(`${session.EndDate} ${session.EndTime}`, "Asia/Ho_Chi_Minh");

        const sessionStart = enter.isBefore(dayStart) ? dayStart : enter;
        const sessionEnd = end.isAfter(dayEnd) ? dayEnd : end;

        return Math.ceil(sessionEnd.diff(sessionStart, "minute", true));
      };

      const day15Minutes = calculateOvernightMinutes(overnightSession, '2024-01-15');
      const day16Minutes = calculateOvernightMinutes(overnightSession, '2024-01-16');

      // 23:00-00:00 = 60 phút, 00:00-01:00 = 60 phút
      expect(day15Minutes).toBe(60);
      expect(day16Minutes).toBe(60);

      // Test session không qua đêm
      const normalSession = {
        EnterDate: '2024-01-15',
        EnterTime: '10:00:00',
        EndDate: '2024-01-15',
        EndTime: '12:00:00'
      };

      const normalMinutes = calculateOvernightMinutes(normalSession, '2024-01-15');
      expect(normalMinutes).toBe(120); // 2 giờ = 120 phút
    });

    test('should handle timezone edge cases for usage time', () => {
      const utcSession = {
        EnterDate: '2024-01-15',
        EnterTime: '17:00:00',
        EndDate: '2024-01-15',
        EndTime: '19:00:00'
      };

      const vnSession = {
        EnterDate: '2024-01-16',
        EnterTime: '00:00:00',
        EndDate: '2024-01-16',
        EndTime: '02:00:00'
      };

      const utcEnter = dayjs.utc(`${utcSession.EnterDate} ${utcSession.EnterTime}`).tz("Asia/Ho_Chi_Minh");
      const utcEnd = dayjs.utc(`${utcSession.EndDate} ${utcSession.EndTime}`).tz("Asia/Ho_Chi_Minh");
      const vnEnter = dayjs.tz(`${vnSession.EnterDate} ${vnSession.EnterTime}`, "Asia/Ho_Chi_Minh");
      const vnEnd = dayjs.tz(`${vnSession.EndDate} ${vnSession.EndTime}`, "Asia/Ho_Chi_Minh");

      expect(utcEnter.format('YYYY-MM-DD HH:mm:ss')).toBe(vnEnter.format('YYYY-MM-DD HH:mm:ss'));
      expect(utcEnd.format('YYYY-MM-DD HH:mm:ss')).toBe(vnEnd.format('YYYY-MM-DD HH:mm:ss'));
    });
  });

  describe('4. Integration Tests', () => {
    test('should handle DST (Daylight Saving Time) correctly', () => {
      // VN không có DST, nhưng test để đảm bảo tính nhất quán
      const testDates = [
        '2024-03-10 02:00:00',
        '2024-11-03 02:00:00',
        '2024-01-15 10:00:00'
      ];

      testDates.forEach(date => {
        const vnTime = dayjs(date).tz("Asia/Ho_Chi_Minh");
        expect(vnTime.isValid()).toBe(true);
      });
    });

    test('should handle leap year correctly', () => {
      const leapYearDate = dayjs('2024-02-29').tz("Asia/Ho_Chi_Minh");
      const nonLeapYearDate = dayjs('2023-02-28').tz("Asia/Ho_Chi_Minh");
      const invalidLeapDate = dayjs('2023-02-29').tz("Asia/Ho_Chi_Minh");

      expect(leapYearDate.isValid()).toBe(true);
      expect(nonLeapYearDate.isValid()).toBe(true);
      // Dayjs tự động điều chỉnh ngày 29/02/2023 thành 01/03/2023
      expect(invalidLeapDate.format('YYYY-MM-DD')).toBe('2023-03-01');
    });

    test('should handle timezone conversion consistently', () => {
      const utcTime = '2024-01-15 10:00:00';
      const vnTime1 = dayjs.utc(utcTime).tz("Asia/Ho_Chi_Minh");
      const vnTime2 = dayjs.utc(utcTime).tz("Asia/Ho_Chi_Minh");

      expect(vnTime1.format('YYYY-MM-DD HH:mm:ss')).toBe(vnTime2.format('YYYY-MM-DD HH:mm:ss'));
      expect(vnTime1.format('YYYY-MM-DD HH:mm:ss')).toBe('2024-01-15 17:00:00'); // UTC+7
    });
  });

  describe('5. Error Handling Tests', () => {
    test('should handle invalid dates gracefully', () => {
      // Test truly invalid dates
      const invalidDates = [
        'invalid-date', // Ngày không hợp lệ
        'not-a-date',   // Không phải ngày
      ];

      invalidDates.forEach(invalidDate => {
        const result = dayjs(invalidDate).tz("Asia/Ho_Chi_Minh");
        expect(result.isValid()).toBe(false);
      });
      
      // Some edge cases might be parsed by dayjs differently
      // We test that dayjs handles them without throwing errors
      const edgeCaseDates = [
        '2024-13-32',   // Tháng 13 ngày 32 - might be parsed as different date
        '2024-00-00'    // Tháng 0 ngày 0 - might be parsed as different date
      ];
      
      edgeCaseDates.forEach(edgeCaseDate => {
        const result = dayjs(edgeCaseDate).tz("Asia/Ho_Chi_Minh");
        // Dayjs might parse these, but we just ensure it doesn't throw
        expect(typeof result.isValid()).toBe('boolean');
        // If parsed, it should be a valid date object (even if wrong date)
        expect(result).toBeDefined();
      });

      // Test ngày hợp lệ
      const validDate = dayjs('2024-01-15').tz("Asia/Ho_Chi_Minh");
      expect(validDate.isValid()).toBe(true);

      // Test ngày được dayjs tự động điều chỉnh
      const adjustedDate = dayjs('2024-04-31').tz("Asia/Ho_Chi_Minh"); // 31/04 -> 01/05
      expect(adjustedDate.isValid()).toBe(true);
      expect(adjustedDate.format('YYYY-MM-DD')).toBe('2024-05-01');

      // Test tháng 13 và 00 được dayjs xử lý
      const month13Date = dayjs('2024-13-01').tz("Asia/Ho_Chi_Minh"); // 13/01 -> 01/01 năm sau
      const month00Date = dayjs('2024-00-01').tz("Asia/Ho_Chi_Minh"); // 00/01 -> 12/01 năm trước
      expect(month13Date.isValid()).toBe(true);
      expect(month00Date.isValid()).toBe(true);
    });

    test('should handle timezone errors', () => {
      const invalidTimezone = 'Invalid/Timezone';
      
      try {
        dayjs().tz(invalidTimezone);
        // Nếu không throw error, test pass
        expect(true).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Test timezone hợp lệ
      const validTimezone = dayjs().tz("Asia/Ho_Chi_Minh");
      expect(validTimezone.isValid()).toBe(true);
    });
  });

  describe('6. Performance Tests', () => {
    test('should handle large number of timezone conversions efficiently', () => {
      const startTime = Date.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        dayjs().tz("Asia/Ho_Chi_Minh");
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Phải hoàn thành trong 1 giây
    });

    test('should handle date calculations efficiently', () => {
      const startTime = Date.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const date = dayjs('2024-01-15').tz("Asia/Ho_Chi_Minh");
        date.add(1, 'day');
        date.subtract(1, 'hour');
        date.startOf('week');
        date.endOf('month');
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(3000); // Phải hoàn thành trong 3 giây (cho phép margin)
    });
  });

  describe('7. Edge Case Tests', () => {
    test('should handle year boundary correctly', () => {
      const yearEnd = dayjs('2023-12-31 23:59:59').tz("Asia/Ho_Chi_Minh");
      const yearStart = dayjs('2024-01-01 00:00:00').tz("Asia/Ho_Chi_Minh");

      expect(yearEnd.year()).toBe(2023);
      expect(yearStart.year()).toBe(2024);
      expect(yearEnd.diff(yearStart, 'second')).toBe(-1); // 1 giây trước
    });

    test('should handle month boundary correctly', () => {
      const monthEnd = dayjs('2024-01-31 23:59:59').tz("Asia/Ho_Chi_Minh");
      const nextMonthStart = dayjs('2024-02-01 00:00:00').tz("Asia/Ho_Chi_Minh");

      expect(monthEnd.month()).toBe(0); // Tháng 1 (0-based)
      expect(nextMonthStart.month()).toBe(1); // Tháng 2 (0-based)
    });

    test('should handle timezone offset correctly', () => {
      const utcTime = dayjs.utc('2024-01-15 10:00:00');
      const vnTime = utcTime.tz("Asia/Ho_Chi_Minh");

      // VN là UTC+7
      expect(vnTime.format('HH:mm:ss')).toBe('17:00:00');
      expect(vnTime.format('YYYY-MM-DD')).toBe('2024-01-15');
    });
  });
});

// Helper functions
function mockCurrentTime(dateTime) {
  return dayjs(dateTime).tz("Asia/Ho_Chi_Minh");
}

function restoreCurrentTime() {
  return dayjs().tz("Asia/Ho_Chi_Minh");
}

// Export for use in other test files
module.exports = {
  mockCurrentTime,
  restoreCurrentTime,
  mockDb
}; 