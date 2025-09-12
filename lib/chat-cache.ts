import { redisService } from './redis-service';

export class ChatCache {
  private static instance: ChatCache;
  private readonly TTL = {
    MESSAGES: 300, // 5 minutes
    STATS: 60, // 1 minute
    USER_INFO: 1800, // 30 minutes
    MACHINE_STATUS: 60, // 1 minute
  };

  private constructor() {}

  public static getInstance(): ChatCache {
    if (!ChatCache.instance) {
      ChatCache.instance = new ChatCache();
    }
    return ChatCache.instance;
  }

  /**
   * Cache recent messages for a machine
   */
  async cacheMessages(machineName: string, branch: string, messages: any[]): Promise<void> {
    const key = `chat:messages:${branch}:${machineName}`;
    try {
      await redisService.setex(key, this.TTL.MESSAGES, JSON.stringify(messages));
    } catch (error) {
      console.error('Error caching messages:', error);
    }
  }

  /**
   * Get cached messages for a machine
   */
  async getCachedMessages(machineName: string, branch: string): Promise<any[] | null> {
    const key = `chat:messages:${branch}:${machineName}`;
    try {
      const cached = await redisService.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached messages:', error);
      return null;
    }
  }

  /**
   * Cache chat statistics
   */
  async cacheStats(branch: string, stats: any): Promise<void> {
    const key = `chat:stats:${branch}`;
    try {
      await redisService.setex(key, this.TTL.STATS, JSON.stringify(stats));
    } catch (error) {
      console.error('Error caching stats:', error);
    }
  }

  /**
   * Get cached chat statistics
   */
  async getCachedStats(branch: string): Promise<any | null> {
    const key = `chat:stats:${branch}`;
    try {
      const cached = await redisService.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached stats:', error);
      return null;
    }
  }

  /**
   * Cache user information
   */
  async cacheUserInfo(userId: number, branch: string, userInfo: any): Promise<void> {
    const key = `chat:user:${branch}:${userId}`;
    try {
      await redisService.setex(key, this.TTL.USER_INFO, JSON.stringify(userInfo));
    } catch (error) {
      console.error('Error caching user info:', error);
    }
  }

  /**
   * Get cached user information
   */
  async getCachedUserInfo(userId: number, branch: string): Promise<any | null> {
    const key = `chat:user:${branch}:${userId}`;
    try {
      const cached = await redisService.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached user info:', error);
      return null;
    }
  }

  /**
   * Cache machine status
   */
  async cacheMachineStatus(machineName: string, branch: string, status: any): Promise<void> {
    const key = `chat:machine:${branch}:${machineName}`;
    try {
      await redisService.setex(key, this.TTL.MACHINE_STATUS, JSON.stringify(status));
    } catch (error) {
      console.error('Error caching machine status:', error);
    }
  }

  /**
   * Get cached machine status
   */
  async getCachedMachineStatus(machineName: string, branch: string): Promise<any | null> {
    const key = `chat:machine:${branch}:${machineName}`;
    try {
      const cached = await redisService.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached machine status:', error);
      return null;
    }
  }

  /**
   * Invalidate cache for a machine
   */
  async invalidateMachineCache(machineName: string, branch: string): Promise<void> {
    const keys = [
      `chat:messages:${branch}:${machineName}`,
      `chat:machine:${branch}:${machineName}`,
    ];

    try {
      await Promise.all(keys.map(key => redisService.del(key)));
    } catch (error) {
      console.error('Error invalidating machine cache:', error);
    }
  }

  /**
   * Invalidate cache for a branch
   */
  async invalidateBranchCache(branch: string): Promise<void> {
    try {
      const pattern = `chat:*:${branch}:*`;
      const keys = await redisService.keys(pattern);
      if (keys.length > 0) {
        await Promise.all(keys.map(key => redisService.del(key)));
      }
    } catch (error) {
      console.error('Error invalidating branch cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
  }> {
    try {
      const keys = await redisService.keys('chat:*');
      return {
        totalKeys: keys.length,
        memoryUsage: 'N/A', // Would need Redis INFO command for memory usage
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalKeys: 0,
        memoryUsage: 'Error',
      };
    }
  }

  /**
   * Clear all chat cache
   */
  async clearAllCache(): Promise<void> {
    try {
      const keys = await redisService.keys('chat:*');
      if (keys.length > 0) {
        await Promise.all(keys.map(key => redisService.del(key)));
      }
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  }
}

// Export singleton instance
export const chatCache = ChatCache.getInstance();
