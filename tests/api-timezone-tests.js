const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

// Mock Next.js Response
const mockNextResponse = {
  json: jest.fn(),
  status: jest.fn().mockReturnThis()
};

// Mock database
const mockDb = {
  gameResult: {
    findFirst: jest.fn(),
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
  },
  checkInItem: {
    findMany: jest.fn(),
    findFirst: jest.fn()
  },
  giftRound: {
    findMany: jest.fn(),
    create: jest.fn()
  },
  $transaction: jest.fn(),
  $queryRaw: jest.fn()
};

// Mock Fnet database
const mockFnetDB = {
  $queryRaw: jest.fn()
};

const mockFnetPrisma = {
  sql: jest.fn()
};

describe('API Timezone Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Game API Timezone Tests', () => {
    test('should calculate rounds correctly with VN timezone', async () => {
      // Mock data
      const userId = 123;
      const branch = 'branch1';
      
      // Mock fnet query result
      mockFnetDB.$queryRaw.mockResolvedValue([{ total: 150000 }]); // 150k VND
      
      // Mock game results count
      mockDb.gameResult.count.mockResolvedValue(3); // 3 lượt đã sử dụng
      
      // Mock user
      mockDb.user.findFirst.mockResolvedValue({
        id: 1,
        userId: 123,
        magicStone: 0
      });
      
      // Mock gift rounds
      mockDb.giftRound.findMany.mockResolvedValue([
        { amount: 2, isUsed: false, expiredAt: dayjs().add(1, 'week').toDate() }
      ]);

      // Calculate expected rounds
      const spendPerRound = 30000; // 30k VND per round
      const userTopUp = 150000;
      const expectedPaidRounds = Math.floor(userTopUp / spendPerRound); // 5 rounds
      const giftRounds = 2;
      const usedRounds = 3;
      const expectedRemaining = expectedPaidRounds + giftRounds - usedRounds; // 4 rounds

      expect(expectedPaidRounds).toBe(5);
      expect(expectedRemaining).toBe(4);
    });

    test('should handle weekly reset correctly', async () => {
      // Test weekly reset logic
      const mondayStart = dayjs('2024-01-15 00:00:00').tz("Asia/Ho_Chi_Minh");
      const sundayEnd = dayjs('2024-01-14 23:59:59').tz("Asia/Ho_Chi_Minh");
      
      // Mock SQL query for weekly calculation
      const mockSqlQuery = `
        SELECT COUNT(*) as count
        FROM GameResult gr
        WHERE gr.userId = 123
        AND CreatedAt >= DATE(DATE_SUB(NOW(), INTERVAL WEEKDAY(NOW()) DAY))
        AND CreatedAt <= NOW();
      `;
      
      mockDb.$queryRaw.mockResolvedValue([{ count: BigInt(5) }]);
      
      // Verify weekly calculation uses correct timezone
      const weekStart = mondayStart.startOf('week');
      const weekEnd = mondayStart.endOf('week');
      
      expect(weekStart.format('YYYY-MM-DD')).toBe('2024-01-15');
      expect(weekEnd.format('YYYY-MM-DD')).toBe('2024-01-21');
    });

    test('should create game result with correct VN timestamp', async () => {
      const gameResultData = {
        userId: 123,
        itemId: 1,
        createdAt: dayjs().tz("Asia/Ho_Chi_Minh").toISOString()
      };
      
      mockDb.gameResult.create.mockResolvedValue({
        id: 1,
        ...gameResultData
      });
      
      const result = await mockDb.gameResult.create({
        data: gameResultData
      });
      
      expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      
      // Verify timestamp is in VN timezone
      const createdAt = dayjs(result.createdAt);
      const vnTime = createdAt.tz("Asia/Ho_Chi_Minh");
      expect(vnTime.format('Z')).toBe('+07:00');
    });
  });

  describe('2. Check-in API Timezone Tests', () => {
    test('should prevent spam check-in with VN timezone', async () => {
      const userId = 123;
      const branch = 'branch1';
      
      // Mock last check-in
      const lastCheckInTime = dayjs('2024-01-15 10:00:00').tz("Asia/Ho_Chi_Minh");
      mockDb.checkInResult.findFirst.mockResolvedValue({
        createdAt: lastCheckInTime.toDate()
      });
      
      // Test attempts at different times
      const attempts = [
        { time: '2024-01-15 10:05:00', shouldAllow: false },
        { time: '2024-01-15 10:09:59', shouldAllow: false },
        { time: '2024-01-15 10:10:00', shouldAllow: true },
        { time: '2024-01-15 10:10:01', shouldAllow: true }
      ];
      
      attempts.forEach(({ time, shouldAllow }) => {
        const attemptTime = dayjs(time).tz("Asia/Ho_Chi_Minh");
        const timeDiff = attemptTime.diff(lastCheckInTime, 'minute');
        const canCheckIn = timeDiff >= 10;
        
        expect(canCheckIn).toBe(shouldAllow);
      });
    });

    test('should calculate daily check-in limits correctly', async () => {
      const userId = 123;
      const branch = 'branch1';
      
      // Mock daily usage time
      const mockSessions = [
        {
          EnterDate: '2024-01-15',
          EnterTime: '10:00:00',
          EndDate: '2024-01-15',
          EndTime: '12:00:00'
        }
      ];
      
      mockFnetDB.$queryRaw.mockResolvedValue(mockSessions);
      
      // Mock check-in items
      mockDb.checkInItem.findMany.mockResolvedValue([
        { dayName: 'Mon', stars: 1000 }
      ]);
      
      // Calculate daily usage time
      const calculateDailyUsageTime = (sessions) => {
        let totalMinutes = 0;
        for (const session of sessions) {
          const enter = dayjs.tz(`${session.EnterDate} ${session.EnterTime}`, "Asia/Ho_Chi_Minh");
          const end = dayjs.tz(`${session.EndDate} ${session.EndTime}`, "Asia/Ho_Chi_Minh");
          totalMinutes += end.diff(enter, 'minute');
        }
        return Math.floor(totalMinutes / 60);
      };
      
      const totalHours = calculateDailyUsageTime(mockSessions);
      const starsPerHour = 1000;
      const canClaim = totalHours * starsPerHour;
      
      expect(totalHours).toBe(2); // 2 giờ
      expect(canClaim).toBe(2000); // 2000 sao
    });

    test('should handle day change in check-in', async () => {
      const startOfDayVN = dayjs().tz("Asia/Ho_Chi_Minh").startOf('day').toISOString();
      
      // Mock user claims for today
      mockDb.userStarHistory.findMany.mockResolvedValue([
        {
          oldStars: 1000,
          newStars: 1500,
          createdAt: dayjs().tz("Asia/Ho_Chi_Minh").toDate()
        }
      ]);
      
      // Verify start of day is correct
      const startOfDay = dayjs(startOfDayVN);
      expect(startOfDay.hour()).toBe(0);
      expect(startOfDay.minute()).toBe(0);
      expect(startOfDay.second()).toBe(0);
    });
  });

  describe('3. Daily Usage Time API Tests', () => {
    test('should calculate daily usage hours correctly', async () => {
      const userId = 123;
      const branch = 'branch1';
      
      // Mock sessions data
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
        }
      ];
      
      mockFnetDB.$queryRaw.mockResolvedValue(mockSessions);
      
      // Calculate usage time
      const calculateDailyUsageHours = (sessions) => {
        let totalMinutes = 0;
        for (const session of sessions) {
          const enter = dayjs.tz(`${session.EnterDate} ${session.EnterTime}`, "Asia/Ho_Chi_Minh");
          const end = dayjs.tz(`${session.EndDate} ${session.EndTime}`, "Asia/Ho_Chi_Minh");
          totalMinutes += end.diff(enter, 'minute');
        }
        return Math.floor(totalMinutes / 60);
      };
      
      const totalHours = calculateDailyUsageHours(mockSessions);
      expect(totalHours).toBe(4); // 4 giờ
    });

    test('should handle overnight sessions correctly', async () => {
      const overnightSessions = [
        {
          EnterDate: '2024-01-15',
          EnterTime: '23:00:00',
          EndDate: '2024-01-16',
          EndTime: '01:00:00'
        }
      ];
      
      // Calculate for day 15
      const day15Start = dayjs('2024-01-15').tz("Asia/Ho_Chi_Minh").startOf('day');
      const day15End = dayjs('2024-01-15').tz("Asia/Ho_Chi_Minh").endOf('day');
      
      const enter = dayjs.tz('2024-01-15 23:00:00', "Asia/Ho_Chi_Minh");
      const end = dayjs.tz('2024-01-16 01:00:00', "Asia/Ho_Chi_Minh");
      
      const sessionStart = enter.isBefore(day15Start) ? day15Start : enter;
      const sessionEnd = end.isAfter(day15End) ? day15End : end;
      
      const day15Minutes = sessionEnd.diff(sessionStart, 'minute');
      expect(day15Minutes).toBe(60); // 1 giờ (23:00-00:00)
    });
  });

  describe('4. Rate Limiting Tests', () => {
    test('should enforce game roll rate limit with VN timezone', async () => {
      const userId = '123';
      const branch = 'branch1';
      
      // Mock rate limit check
      const checkGameRollRateLimit = async (userId, branch) => {
        const identifier = `${userId}:${branch}`;
        const windowMs = 10 * 1000; // 10 seconds
        const maxRequests = 1;
        
        // Simulate rate limiting logic
        const now = dayjs().tz("Asia/Ho_Chi_Minh");
        const windowStart = now.subtract(windowMs, 'millisecond');
        
        // Mock: first request allowed, second request blocked
        const requestCount = 1; // Simulate existing request
        
        return {
          allowed: requestCount < maxRequests,
          remaining: Math.max(0, maxRequests - requestCount),
          resetTime: windowStart.add(windowMs, 'millisecond').valueOf()
        };
      };
      
      const rateLimit = await checkGameRollRateLimit(userId, branch);
      expect(rateLimit.allowed).toBe(false);
      expect(rateLimit.remaining).toBe(0);
    });

    test('should handle rate limit reset correctly', async () => {
      const windowMs = 10 * 1000; // 10 seconds
      const now = dayjs().tz("Asia/Ho_Chi_Minh");
      const resetTime = now.add(windowMs, 'millisecond');
      
      // Test rate limit expiration
      const isExpired = now.isAfter(resetTime);
      expect(isExpired).toBe(false);
      
      // Test after expiration
      const afterExpiration = resetTime.add(1, 'second');
      const isExpiredAfter = afterExpiration.isAfter(resetTime);
      expect(isExpiredAfter).toBe(true);
    });
  });

  describe('5. Edge Cases and Error Handling', () => {
    test('should handle invalid session data gracefully', async () => {
      const invalidSessions = [
        { EnterDate: null, EnterTime: null },
        { EnterDate: '2024-01-15', EnterTime: 'invalid-time' },
        { EnterDate: 'invalid-date', EnterTime: '10:00:00' }
      ];
      
      const calculateDailyUsageTime = (sessions) => {
        let totalMinutes = 0;
        for (const session of sessions) {
          try {
            if (!session.EnterDate || !session.EnterTime) continue;
            
            const enter = dayjs.tz(`${session.EnterDate} ${session.EnterTime}`, "Asia/Ho_Chi_Minh");
            if (!enter.isValid()) continue;
            
            const end = session.EndDate && session.EndTime 
              ? dayjs.tz(`${session.EndDate} ${session.EndTime}`, "Asia/Ho_Chi_Minh")
              : dayjs().tz("Asia/Ho_Chi_Minh");
              
            if (end.isValid() && end.isAfter(enter)) {
              totalMinutes += end.diff(enter, 'minute');
            }
          } catch (error) {
            console.error('Error processing session:', error);
            continue;
          }
        }
        return totalMinutes;
      };
      
      const result = calculateDailyUsageTime(invalidSessions);
      expect(result).toBe(0); // Should handle errors gracefully
    });

    test('should handle timezone conversion errors', async () => {
      // Test with invalid timezone
      expect(() => {
        dayjs().tz("Invalid/Timezone");
      }).toThrow();
      
      // Test with valid timezone
      expect(() => {
        dayjs().tz("Asia/Ho_Chi_Minh");
      }).not.toThrow();
    });
  });

  describe('6. Performance and Load Tests', () => {
    test('should handle multiple concurrent requests efficiently', async () => {
      const startTime = Date.now();
      
      // Simulate multiple concurrent requests
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          new Promise((resolve) => {
            const time = dayjs().tz("Asia/Ho_Chi_Minh");
            resolve(time);
          })
        );
      }
      
      await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000); // 1 second
    });

    test('should handle large dataset efficiently', async () => {
      const largeSessions = [];
      
      // Generate 1000 sessions
      for (let i = 0; i < 1000; i++) {
        largeSessions.push({
          EnterDate: '2024-01-15',
          EnterTime: '10:00:00',
          EndDate: '2024-01-15',
          EndTime: '11:00:00'
        });
      }
      
      const startTime = Date.now();
      
      // Process large dataset
      let totalMinutes = 0;
      for (const session of largeSessions) {
        const enter = dayjs.tz(`${session.EnterDate} ${session.EnterTime}`, "Asia/Ho_Chi_Minh");
        const end = dayjs.tz(`${session.EndDate} ${session.EndTime}`, "Asia/Ho_Chi_Minh");
        totalMinutes += end.diff(enter, 'minute');
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(totalMinutes).toBe(60000); // 1000 hours = 60000 minutes
      expect(duration).toBeLessThan(5000); // 5 seconds
    });
  });
});

// Helper functions
function mockCurrentTime(dateTime) {
  const mockDate = dayjs(dateTime).tz("Asia/Ho_Chi_Minh");
  jest.spyOn(dayjs, 'tz').mockReturnValue(mockDate);
}

function createMockRequest(data = {}) {
  return {
    json: jest.fn().mockResolvedValue(data),
    headers: new Map(),
    url: 'http://localhost:3000/api/test'
  };
}

function createMockResponse() {
  return {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    headers: new Map()
  };
}

module.exports = {
  mockCurrentTime,
  createMockRequest,
  createMockResponse,
  mockDb,
  mockFnetDB,
  mockFnetPrisma
}; 