import { db } from "@/lib/db";
import { getStartOfDayDateVN } from "@/lib/timezone-utils";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyPrefix: string; // Prefix for the rate limit key
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const key = `${config.keyPrefix}:${identifier}`;
  const now = Date.now();

  // Clean up expired entries
  for (const [storeKey, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(storeKey);
    }
  }

  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  if (current.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    };
  }

  // Increment count
  current.count++;
  rateLimitStore.set(key, current);

  return {
    allowed: true,
    remaining: config.maxRequests - current.count,
    resetTime: current.resetTime,
  };
}

// Rate limit cho việc tạo user mới
export async function checkUserCreationRateLimit(
  machineName: string,
  branch: string,
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const identifier = `${machineName}:${branch}`;

  return checkRateLimit(identifier, {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // Tối đa 3 user mới từ cùng machine trong 1 giờ
    keyPrefix: "user_creation",
  });
}

// Rate limit cho việc đăng nhập
export async function checkLoginRateLimit(
  machineName: string,
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  return checkRateLimit(machineName, {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // Tối đa 10 lần đăng nhập từ cùng machine trong 15 phút
    keyPrefix: "login",
  });
}

// Kiểm tra spam từ database (persistent)
export async function checkDatabaseRateLimit(
  branch: string,
  windowMs: number = 60 * 60 * 1000,
): Promise<{ allowed: boolean; count: number }> {
  const oneHourAgo = new Date(Date.now() - windowMs);

  const recentUsers = await db.user.count({
    where: {
      createdAt: {
        gte: oneHourAgo,
      },
      branch: branch,
    },
  });

  // Giới hạn 10 user mới từ cùng branch trong 1 giờ
  const maxUsersPerHour = 10;

  return {
    allowed: recentUsers < maxUsersPerHour,
    count: recentUsers,
  };
}

// Rate limit cho game roll
export async function checkGameRollRateLimit(
  userId: string,
  branch: string,
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const identifier = `${userId}:${branch}`;

  return checkRateLimit(identifier, {
    windowMs: 10 * 1000, // 10 seconds
    maxRequests: 1, // Chỉ cho phép 1 roll mỗi 10 giây
    keyPrefix: "game_roll",
  });
}

// Rate limit cho check-in
export async function checkCheckInRateLimit(
  userId: string,
  branch: string,
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const identifier = `${userId}:${branch}`;

  return checkRateLimit(identifier, {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // Tối đa 5 lần check-in mỗi giờ
    keyPrefix: "checkin",
  });
}

// Rate limit cho check-in daily (per day)
export async function checkDailyCheckInLimit(
  userId: string,
  branch: string,
): Promise<{ allowed: boolean; count: number; maxAllowed: number }> {
  const today = getStartOfDayDateVN();

  const checkInCount = await db.checkInResult.count({
    where: {
      userId: parseInt(userId),
      branch: branch,
      createdAt: {
        gte: today,
      },
    },
  });

  const maxDailyCheckIns = 10; // Tối đa 10 lần check-in mỗi ngày

  return {
    allowed: checkInCount < maxDailyCheckIns,
    count: checkInCount,
    maxAllowed: maxDailyCheckIns,
  };
}
