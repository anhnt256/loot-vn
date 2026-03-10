import { redisService } from "./redis-service";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyPrefix: string; // Redis key prefix
}

class ChatRateLimit {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if request is within rate limit
   */
  async checkLimit(identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const key = `${this.config.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // Get current count
      const currentCount = await redisService.get(key);
      const count = currentCount ? parseInt(currentCount, 10) : 0;

      if (count >= this.config.maxRequests) {
        // Rate limit exceeded
        const ttl = await redisService.get(`${key}:ttl`);
        const resetTime = ttl ? parseInt(ttl, 10) : now + this.config.windowMs;

        return {
          allowed: false,
          remaining: 0,
          resetTime,
        };
      }

      // Increment counter
      const newCount = count + 1;
      const resetTime = now + this.config.windowMs;

      if (count === 0) {
        // First request in window, set TTL
        await redisService.setex(
          key,
          Math.ceil(this.config.windowMs / 1000),
          newCount.toString(),
        );
        await redisService.setex(
          `${key}:ttl`,
          Math.ceil(this.config.windowMs / 1000),
          resetTime.toString(),
        );
      } else {
        // Update count
        await redisService.setex(
          key,
          Math.ceil(this.config.windowMs / 1000),
          newCount.toString(),
        );
      }

      return {
        allowed: true,
        remaining: this.config.maxRequests - newCount,
        resetTime,
      };
    } catch (error) {
      console.error("Rate limit check error:", error);
      // On error, allow the request
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
      };
    }
  }

  /**
   * Reset rate limit for an identifier
   */
  async resetLimit(identifier: string): Promise<void> {
    const key = `${this.config.keyPrefix}:${identifier}`;
    try {
      await redisService.del(key);
      await redisService.del(`${key}:ttl`);
    } catch (error) {
      console.error("Rate limit reset error:", error);
    }
  }
}

// Create rate limiters for different chat operations
export const messageRateLimit = new ChatRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 messages per minute
  keyPrefix: "chat:message",
});

export const connectionRateLimit = new ChatRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 connections per minute
  keyPrefix: "chat:connection",
});

export const apiRateLimit = new ChatRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 API calls per minute
  keyPrefix: "chat:api",
});
