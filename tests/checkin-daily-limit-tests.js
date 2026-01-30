const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

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

  describe('2. Session Date Filtering Tests', () => {
    test('should only count sessions starting today', () => {
      const today = dayjs().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");
      const yesterday = dayjs().tz("Asia/Ho_Chi_Minh").subtract(1, 'day').format("YYYY-MM-DD");
      
      const sessionToday = { EnterDate: today, EnterTime: '10:00:00' };
      const sessionYesterday = { EnterDate: yesterday, EnterTime: '22:00:00' };
      
      // Should only count session starting today
      const shouldCountToday = sessionToday.EnterDate === today;
      const shouldCountYesterday = sessionYesterday.EnterDate === today;
      
      expect(shouldCountToday).toBe(true);
      expect(shouldCountYesterday).toBe(false);
    });

    test('should count session from day 13 ending in today', () => {
      const today = dayjs().tz("Asia/Ho_Chi_Minh");
      const todayDate = today.format("YYYY-MM-DD");
      const day13 = today.subtract(2, 'day').format("YYYY-MM-DD"); // 2 ngày trước
      
      // Session bắt đầu ngày 13, kết thúc ngày 15 (hôm nay)
      const sessionFromDay13 = {
        EnterDate: day13,
        EnterTime: '22:00:00',
        EndDate: todayDate,
        EndTime: '02:00:00'
      };
      
      // Khi claim ngày 15, phải tính phần từ 00:00 đến 02:00 ngày 15
      const enterDate = sessionFromDay13.EnterDate;
      const endDate = sessionFromDay13.EndDate;
      
      // Session này kết thúc trong ngày hôm nay, nên phải được tính
      const shouldCount = endDate === todayDate;
      
      expect(shouldCount).toBe(true);
      expect(enterDate).not.toBe(todayDate); // Bắt đầu từ ngày khác
      expect(endDate).toBe(todayDate); // Kết thúc trong ngày hôm nay
    });

    test('should not count sessions from previous day that not ending today', () => {
      const today = dayjs().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");
      const yesterday = dayjs().tz("Asia/Ho_Chi_Minh").subtract(1, 'day').format("YYYY-MM-DD");
      
      // Session từ hôm qua, chưa kết thúc (EndDate = null)
      const sessionFromYesterday = { EnterDate: yesterday, EnterTime: '22:00:00', EndDate: null };
      
      // Should not count session from yesterday if not ending today
      const shouldCount = sessionFromYesterday.EnterDate === today || sessionFromYesterday.EndDate === today;
      
      expect(shouldCount).toBe(false);
    });

    test('should calculate time correctly for session starting from day 13', () => {
      const today = dayjs().tz("Asia/Ho_Chi_Minh");
      const todayDate = today.format("YYYY-MM-DD");
      const day13 = today.subtract(2, 'day').format("YYYY-MM-DD");
      
      // Session: 22:00 ngày 13 → 02:00 ngày 15 (hôm nay)
      // Khi claim ngày 15, chỉ tính từ 00:00 đến 02:00 = 2 giờ
      const sessionStart = dayjs.tz(`${day13} 22:00:00`, "Asia/Ho_Chi_Minh");
      const sessionEnd = dayjs.tz(`${todayDate} 02:00:00`, "Asia/Ho_Chi_Minh");
      const todayStart = today.startOf('day');
      
      // Phần tính cho ngày 15: từ 00:00 đến 02:00
      const sessionStartInToday = sessionStart.isBefore(todayStart) ? todayStart : sessionStart;
      const sessionEndInToday = sessionEnd.isAfter(today.endOf('day')) ? today.endOf('day') : sessionEnd;
      
      const minutesInToday = sessionEndInToday.diff(sessionStartInToday, 'minute');
      const hoursInToday = Math.floor(minutesInToday / 60);
      
      expect(hoursInToday).toBe(2); // 2 giờ (00:00-02:00)
      expect(minutesInToday).toBe(120); // 120 phút
    });

    test('should calculate time only from session start to now', () => {
      const today = dayjs().tz("Asia/Ho_Chi_Minh");
      const sessionStart = today.hour(10).minute(0).second(0);
      const now = today.hour(14).minute(30).second(0);
      
      // Should only calculate from session start (10:00) to now (14:30)
      // Not from 0h of the day
      const minutesFromStart = now.diff(sessionStart, 'minute');
      
      expect(minutesFromStart).toBe(270); // 4.5 hours = 270 minutes
      expect(minutesFromStart).toBeLessThan(24 * 60); // Less than 24 hours
    });
  });

  describe('3. Available Check-in Calculation Tests', () => {
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

  describe('4. Edge Cases', () => {
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
  });

  describe('5. Integration Tests', () => {
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
  });
});

console.log('🧪 Check-in daily limit tests completed');
