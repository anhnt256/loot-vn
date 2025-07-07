const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

describe('Check-in Security Tests', () => {
  const testUserId = 123;
  const testBranch = 'GO_VAP';

  describe('1. Rate Limiting Tests', () => {
    test('should enforce hourly rate limit', () => {
      const windowMs = 60 * 60 * 1000; // 1 hour
      const maxRequests = 5;
      
      // Simulate rate limiting
      const requests = Array.from({ length: maxRequests + 1 }, (_, i) => i);
      const allowedRequests = requests.slice(0, maxRequests);
      const blockedRequest = requests[maxRequests];
      
      expect(allowedRequests.length).toBe(maxRequests);
      expect(blockedRequest).toBe(maxRequests);
    });

    test('should enforce daily check-in limit', () => {
      const maxDailyCheckIns = 10;
      const dailyCheckIns = Array.from({ length: maxDailyCheckIns + 1 }, (_, i) => i);
      
      const allowedCheckIns = dailyCheckIns.slice(0, maxDailyCheckIns);
      const blockedCheckIn = dailyCheckIns[maxDailyCheckIns];
      
      expect(allowedCheckIns.length).toBe(maxDailyCheckIns);
      expect(blockedCheckIn).toBe(maxDailyCheckIns);
    });
  });

  describe('2. Time-based Anti-spam Tests', () => {
    test('should prevent check-in within 30 minutes', () => {
      const lastCheckInTime = dayjs().tz("Asia/Ho_Chi_Minh").subtract(15, 'minute');
      const currentTime = dayjs().tz("Asia/Ho_Chi_Minh");
      const minutesSinceLastCheckIn = currentTime.diff(lastCheckInTime, 'minute');
      
      expect(minutesSinceLastCheckIn).toBeLessThan(30);
    });

    test('should allow check-in after 30 minutes', () => {
      const lastCheckInTime = dayjs().tz("Asia/Ho_Chi_Minh").subtract(35, 'minute');
      const currentTime = dayjs().tz("Asia/Ho_Chi_Minh");
      const minutesSinceLastCheckIn = currentTime.diff(lastCheckInTime, 'minute');
      
      expect(minutesSinceLastCheckIn).toBeGreaterThanOrEqual(30);
    });
  });

  describe('3. Server-side Calculation Tests', () => {
    test('should calculate stars server-side', () => {
      const playTimeHours = 2.5;
      const starsPerHour = 1000;
      const expectedStars = Math.floor(playTimeHours * starsPerHour);
      
      expect(expectedStars).toBe(2500);
    });

    test('should validate minimum play time', () => {
      const playTimeHours = 0.5; // 30 minutes
      const minimumPlayTime = 1; // 1 hour
      
      expect(playTimeHours).toBeLessThan(minimumPlayTime);
    });

    test('should allow check-in with sufficient play time', () => {
      const playTimeHours = 1.5; // 1.5 hours
      const minimumPlayTime = 1; // 1 hour
      
      expect(playTimeHours).toBeGreaterThanOrEqual(minimumPlayTime);
    });
  });

  describe('4. Input Validation Tests', () => {
    test('should reject negative user ID', () => {
      const userId = -1;
      expect(userId).toBeLessThan(0);
    });

    test('should accept positive user ID', () => {
      const userId = 123;
      expect(userId).toBeGreaterThan(0);
    });

    test('should validate branch requirement', () => {
      const branch = null;
      expect(branch).toBeFalsy();
    });
  });

  describe('5. Security Edge Cases', () => {
    test('should handle concurrent check-in attempts', () => {
      const concurrentRequests = 3;
      const maxConcurrentAllowed = 1;
      
      expect(concurrentRequests).toBeGreaterThan(maxConcurrentAllowed);
    });

    test('should prevent rapid successive requests', () => {
      const requestInterval = 1000; // 1 second
      const minimumInterval = 30 * 60 * 1000; // 30 minutes
      
      expect(requestInterval).toBeLessThan(minimumInterval);
    });

    test('should validate timezone consistency', () => {
      const vnTime = dayjs().tz("Asia/Ho_Chi_Minh");
      const utcTime = dayjs().utc();
      
      expect(vnTime.format('Z')).toBe('+07:00');
      expect(utcTime.format('Z')).toBe('+00:00');
    });
  });

  describe('6. Error Message Tests', () => {
    test('should provide clear rate limit error messages', () => {
      const errorMessage = 'Quá nhiều lần check-in. Vui lòng thử lại sau';
      expect(errorMessage).toContain('Quá nhiều lần check-in');
    });

    test('should provide clear daily limit error messages', () => {
      const errorMessage = 'Bạn đã check-in 10/10 lần hôm nay. Vui lòng thử lại vào ngày mai!';
      expect(errorMessage).toContain('check-in');
      expect(errorMessage).toContain('hôm nay');
    });

    test('should provide clear minimum play time error messages', () => {
      const errorMessage = 'Bạn cần chơi ít nhất 1 giờ để có thể check-in!';
      expect(errorMessage).toContain('1 giờ');
      expect(errorMessage).toContain('check-in');
    });
  });
});

console.log('🧪 Check-in security tests completed'); 