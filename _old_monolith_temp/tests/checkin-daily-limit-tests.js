const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Hàm tính thời gian check-in (mô phỏng logic trong user-calculator.ts)
 * Logic mới: Sử dụng TimeUsed từ DB
 * - Session bắt đầu hôm nay: dùng TimeUsed trực tiếp
 * - Session bắt đầu hôm trước, kết thúc hôm nay: tính từ 00:00 đến EndTime
 */
function calculateCheckInMinutes(sessions, todayDate, now) {
  const todayStart = now.startOf('day');
  let totalMinutes = 0;

  for (const session of sessions) {
    if (!session.EnterDate || !session.EnterTime) continue;

    const enterDate = session.EnterDate;
    const endDate = session.EndDate || todayDate;

    // Bỏ qua session không liên quan đến ngày hôm nay
    if (enterDate !== todayDate && endDate !== todayDate) {
      continue;
    }

    let sessionMinutes = 0;

    if (enterDate === todayDate) {
      // Session bắt đầu trong ngày hôm nay: dùng TimeUsed trực tiếp
      sessionMinutes = session.TimeUsed ?? 0;
    } else if (enterDate !== todayDate && endDate === todayDate) {
      // Session bắt đầu từ hôm trước, kết thúc hôm nay
      // Chỉ tính từ 00:00 đến EndTime (hoặc now nếu chưa kết thúc)
      let endTime;
      
      if (session.EndTime) {
        endTime = dayjs.tz(`${todayDate} ${session.EndTime}`, "Asia/Ho_Chi_Minh");
      } else {
        endTime = now;
      }

      // Tính số phút từ 00:00 đến endTime
      sessionMinutes = endTime.diff(todayStart, 'minute');
    }

    if (sessionMinutes > 0) {
      totalMinutes += sessionMinutes;
    }
  }

  // Giới hạn tối đa 24 giờ (1440 phút)
  const maxMinutesPerDay = 24 * 60;
  return Math.min(Math.max(0, totalMinutes), maxMinutesPerDay);
}

describe('Check-in Daily Limit Tests', () => {
  const testUserId = 123;
  const testBranch = 'GO_VAP';
  const maxDailyCheckInPoints = 24000;

  describe('1. Daily Point Limit Tests', () => {
    test('should enforce 24k daily point limit', () => {
      const totalClaimedToday = 24000;
      const remainingLimit = maxDailyCheckInPoints - totalClaimedToday;
      
      expect(remainingLimit).toBe(0);
      expect(remainingLimit).toBeLessThanOrEqual(0);
    });

    test('should allow check-in when under daily limit', () => {
      const totalClaimedToday = 15000;
      const remainingLimit = maxDailyCheckInPoints - totalClaimedToday;
      
      expect(remainingLimit).toBe(9000);
      expect(remainingLimit).toBeGreaterThan(0);
    });

    test('should prevent check-in when at daily limit', () => {
      const totalClaimedToday = 24000;
      const availableCheckIn = 5000;
      const remainingLimit = maxDailyCheckInPoints - totalClaimedToday;
      const actualPointsToClaim = Math.min(availableCheckIn, remainingLimit);
      
      expect(actualPointsToClaim).toBe(0);
    });

    test('should limit claim to remaining daily limit', () => {
      const totalClaimedToday = 20000;
      const availableCheckIn = 10000; // User has 10k available
      const remainingLimit = maxDailyCheckInPoints - totalClaimedToday;
      const actualPointsToClaim = Math.min(availableCheckIn, remainingLimit);
      
      expect(remainingLimit).toBe(4000);
      expect(actualPointsToClaim).toBe(4000); // Should be limited to 4k
    });
  });

  describe('2. TimeUsed Logic Tests (NEW)', () => {
    test('should use TimeUsed directly for session starting today', () => {
      const now = dayjs().tz("Asia/Ho_Chi_Minh");
      const todayDate = now.format("YYYY-MM-DD");
      
      const sessions = [
        {
          EnterDate: todayDate,
          EnterTime: '10:00:00',
          EndDate: todayDate,
          EndTime: '12:30:00',
          TimeUsed: 150 // 2.5 hours = 150 minutes
        }
      ];
      
      const minutes = calculateCheckInMinutes(sessions, todayDate, now);
      
      expect(minutes).toBe(150); // Should use TimeUsed directly
    });

    test('should calculate from 00:00 to EndTime for cross-day session', () => {
      const now = dayjs.tz("2026-01-25 10:00:00", "Asia/Ho_Chi_Minh");
      const todayDate = "2026-01-25";
      const yesterday = "2026-01-24";
      
      // Session: 22:01:08 ngày 24 → 06:49:28 ngày 25
      // TimeUsed = 528 phút (toàn bộ session)
      // Nhưng chỉ nên tính 00:00 → 06:49:28 = ~409 phút cho ngày 25
      const sessions = [
        {
          EnterDate: yesterday,
          EnterTime: '22:01:08',
          EndDate: todayDate,
          EndTime: '06:49:28',
          TimeUsed: 528
        }
      ];
      
      const minutes = calculateCheckInMinutes(sessions, todayDate, now);
      
      // 00:00 to 06:49:28 = 6*60 + 49 = 409 minutes
      expect(minutes).toBe(409);
    });

    test('should handle cross-day session still running (EndTime = null)', () => {
      const now = dayjs.tz("2026-02-01 11:30:00", "Asia/Ho_Chi_Minh");
      const todayDate = "2026-02-01";
      const yesterday = "2026-01-31";
      
      // Session bắt đầu từ hôm qua, vẫn đang chạy
      const sessions = [
        {
          EnterDate: yesterday,
          EnterTime: '23:00:00',
          EndDate: null,
          EndTime: null,
          TimeUsed: 750 // 12.5 hours total
        }
      ];
      
      const minutes = calculateCheckInMinutes(sessions, todayDate, now);
      
      // Should calculate from 00:00 to now (11:30) = 11*60 + 30 = 690 minutes
      expect(minutes).toBe(690);
    });

    test('should combine TimeUsed for multiple sessions today', () => {
      const now = dayjs.tz("2026-02-01 15:00:00", "Asia/Ho_Chi_Minh");
      const todayDate = "2026-02-01";
      
      const sessions = [
        {
          EnterDate: todayDate,
          EnterTime: '06:59:48',
          EndDate: null,
          EndTime: null,
          TimeUsed: 10
        },
        {
          EnterDate: todayDate,
          EnterTime: '10:52:24',
          EndDate: null,
          EndTime: null,
          TimeUsed: 59
        },
        {
          EnterDate: todayDate,
          EnterTime: '10:51:04',
          EndDate: todayDate,
          EndTime: '10:51:17',
          TimeUsed: 0 // 13 seconds = 0 minutes
        }
      ];
      
      const minutes = calculateCheckInMinutes(sessions, todayDate, now);
      
      // 10 + 59 + 0 = 69 minutes
      expect(minutes).toBe(69);
    });

    test('should handle real data example: 528 min session from Jan 24 to Jan 25', () => {
      // Ví dụ thực tế từ DB
      const now = dayjs.tz("2026-01-25 10:00:00", "Asia/Ho_Chi_Minh");
      const todayDate = "2026-01-25";
      
      const sessions = [
        {
          EnterDate: "2026-01-24",
          EnterTime: '22:01:08',
          EndDate: "2026-01-25",
          EndTime: '06:49:28',
          TimeUsed: 528 // Total session time
        }
      ];
      
      const minutes = calculateCheckInMinutes(sessions, todayDate, now);
      
      // Chỉ tính từ 00:00 đến 06:49:28 = 409 phút
      // KHÔNG dùng TimeUsed (528) vì session bắt đầu từ hôm trước
      expect(minutes).toBe(409);
      expect(minutes).toBeLessThan(528); // Phải nhỏ hơn TimeUsed
    });
  });

  describe('3. Session Date Filtering Tests', () => {
    test('should only count sessions starting today using TimeUsed', () => {
      const now = dayjs().tz("Asia/Ho_Chi_Minh");
      const todayDate = now.format("YYYY-MM-DD");
      const yesterday = now.subtract(1, 'day').format("YYYY-MM-DD");
      
      const sessions = [
        {
          EnterDate: todayDate,
          EnterTime: '10:00:00',
          EndDate: todayDate,
          EndTime: '12:00:00',
          TimeUsed: 120
        },
        {
          EnterDate: yesterday,
          EnterTime: '22:00:00',
          EndDate: yesterday,
          EndTime: '23:00:00',
          TimeUsed: 60 // Should NOT be counted
        }
      ];
      
      const minutes = calculateCheckInMinutes(sessions, todayDate, now);
      
      expect(minutes).toBe(120); // Only count today's session
    });

    test('should count session ending today (cross-day)', () => {
      const now = dayjs.tz("2026-02-01 10:00:00", "Asia/Ho_Chi_Minh");
      const todayDate = "2026-02-01";
      const yesterday = "2026-01-31";
      
      const sessions = [
        {
          EnterDate: yesterday,
          EnterTime: '22:00:00',
          EndDate: todayDate,
          EndTime: '02:00:00',
          TimeUsed: 240 // 4 hours total
        }
      ];
      
      const minutes = calculateCheckInMinutes(sessions, todayDate, now);
      
      // Only count 00:00 to 02:00 = 120 minutes
      expect(minutes).toBe(120);
    });

    test('should not count sessions from previous day not ending today', () => {
      const now = dayjs().tz("Asia/Ho_Chi_Minh");
      const todayDate = now.format("YYYY-MM-DD");
      const yesterday = now.subtract(1, 'day').format("YYYY-MM-DD");
      const twoDaysAgo = now.subtract(2, 'day').format("YYYY-MM-DD");
      
      const sessions = [
        {
          EnterDate: twoDaysAgo,
          EnterTime: '22:00:00',
          EndDate: yesterday,
          EndTime: '02:00:00',
          TimeUsed: 240
        }
      ];
      
      const minutes = calculateCheckInMinutes(sessions, todayDate, now);
      
      expect(minutes).toBe(0); // Should not count - doesn't overlap today
    });
  });

  describe('4. Available Check-in Calculation Tests', () => {
    test('should limit availableCheckIn to 24k per day', () => {
      const totalCheckIn = 30000; // User played 30 hours
      const totalClaimed = 0;
      const maxDailyCheckInPoints = 24000;
      
      const availableCheckIn = Math.min(
        Math.max(0, totalCheckIn - totalClaimed),
        maxDailyCheckInPoints - totalClaimed
      );
      
      expect(availableCheckIn).toBe(24000); // Limited to 24k
      expect(availableCheckIn).toBeLessThanOrEqual(maxDailyCheckInPoints);
    });

    test('should calculate remaining available points correctly', () => {
      const totalCheckIn = 30000;
      const totalClaimed = 15000;
      const maxDailyCheckInPoints = 24000;
      const remainingDailyLimit = Math.max(0, maxDailyCheckInPoints - totalClaimed);
      
      const availableCheckIn = Math.min(
        Math.max(0, totalCheckIn - totalClaimed),
        remainingDailyLimit
      );
      
      expect(remainingDailyLimit).toBe(9000);
      expect(availableCheckIn).toBe(9000); // Limited by remaining daily limit
    });

    test('should return 0 when daily limit reached', () => {
      const totalCheckIn = 30000;
      const totalClaimed = 24000;
      const maxDailyCheckInPoints = 24000;
      const remainingDailyLimit = Math.max(0, maxDailyCheckInPoints - totalClaimed);
      
      const availableCheckIn = Math.min(
        Math.max(0, totalCheckIn - totalClaimed),
        remainingDailyLimit
      );
      
      expect(remainingDailyLimit).toBe(0);
      expect(availableCheckIn).toBe(0);
    });
  });

  describe('5. Edge Cases', () => {
    test('should handle multiple check-ins within daily limit', () => {
      let totalClaimed = 0;
      const checkIns = [5000, 8000, 6000, 5000]; // Total: 24000
      
      for (const points of checkIns) {
        const remainingLimit = maxDailyCheckInPoints - totalClaimed;
        if (remainingLimit >= points) {
          totalClaimed += points;
        }
      }
      
      expect(totalClaimed).toBe(24000);
      expect(totalClaimed).toBeLessThanOrEqual(maxDailyCheckInPoints);
    });

    test('should prevent exceeding daily limit with multiple claims', () => {
      let totalClaimed = 20000;
      const additionalClaim = 5000;
      const remainingLimit = maxDailyCheckInPoints - totalClaimed;
      const actualClaim = Math.min(additionalClaim, remainingLimit);
      
      totalClaimed += actualClaim;
      
      expect(actualClaim).toBe(4000); // Limited to remaining 4k
      expect(totalClaimed).toBe(24000);
      expect(totalClaimed).toBeLessThanOrEqual(maxDailyCheckInPoints);
    });

    test('should handle timezone correctly for daily reset', () => {
      const vnTime = dayjs().tz("Asia/Ho_Chi_Minh");
      const startOfDay = vnTime.startOf('day');
      const todayDate = vnTime.format("YYYY-MM-DD");
      
      expect(startOfDay.format('HH:mm:ss')).toBe('00:00:00');
      expect(todayDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('should cap at 1440 minutes (24 hours) per day', () => {
      const now = dayjs.tz("2026-02-01 23:00:00", "Asia/Ho_Chi_Minh");
      const todayDate = "2026-02-01";
      
      // Giả sử có nhiều session với tổng > 24 giờ
      const sessions = [
        {
          EnterDate: todayDate,
          EnterTime: '00:00:00',
          EndDate: todayDate,
          EndTime: '23:00:00',
          TimeUsed: 2000 // Lỗi data: > 24 hours
        }
      ];
      
      const minutes = calculateCheckInMinutes(sessions, todayDate, now);
      
      expect(minutes).toBeLessThanOrEqual(1440); // Max 24 hours
    });
  });

  describe('6. Integration Tests', () => {
    test('should correctly calculate available points with all constraints', () => {
      // Scenario: User played 30 hours, already claimed 20k today
      const totalPlayTimeHours = 30;
      const starsPerHour = 1000;
      const totalCheckIn = Math.floor(totalPlayTimeHours * starsPerHour); // 30000
      const totalClaimed = 20000;
      const maxDailyCheckInPoints = 24000;
      
      const remainingDailyLimit = Math.max(0, maxDailyCheckInPoints - totalClaimed);
      const availableCheckIn = Math.min(
        Math.max(0, totalCheckIn - totalClaimed),
        remainingDailyLimit
      );
      
      expect(totalCheckIn).toBe(30000);
      expect(totalClaimed).toBe(20000);
      expect(remainingDailyLimit).toBe(4000);
      expect(availableCheckIn).toBe(4000); // Limited by daily limit, not by play time
    });

    test('should handle case where play time is less than daily limit', () => {
      const totalPlayTimeHours = 15;
      const starsPerHour = 1000;
      const totalCheckIn = Math.floor(totalPlayTimeHours * starsPerHour); // 15000
      const totalClaimed = 0;
      const maxDailyCheckInPoints = 24000;
      
      const remainingDailyLimit = Math.max(0, maxDailyCheckInPoints - totalClaimed);
      const availableCheckIn = Math.min(
        Math.max(0, totalCheckIn - totalClaimed),
        remainingDailyLimit
      );
      
      expect(availableCheckIn).toBe(15000); // All play time can be claimed
      expect(availableCheckIn).toBeLessThanOrEqual(maxDailyCheckInPoints);
    });

    test('should use TimeUsed for stars calculation', () => {
      const now = dayjs.tz("2026-02-01 15:00:00", "Asia/Ho_Chi_Minh");
      const todayDate = "2026-02-01";
      const starsPerHour = 1000;
      
      const sessions = [
        {
          EnterDate: todayDate,
          EnterTime: '10:00:00',
          EndDate: todayDate,
          EndTime: '14:00:00',
          TimeUsed: 240 // 4 hours
        }
      ];
      
      const minutes = calculateCheckInMinutes(sessions, todayDate, now);
      const hours = Math.floor(minutes / 60);
      const totalCheckIn = hours * starsPerHour;
      
      expect(minutes).toBe(240);
      expect(hours).toBe(4);
      expect(totalCheckIn).toBe(4000);
    });
  });
});

console.log('🧪 Check-in daily limit tests completed');
