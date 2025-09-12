import { Redis } from 'ioredis';
import { redis } from './redis';

export class RedisService {
  private static instance: RedisService;
  private publisher: Redis;
  private subscriber: Redis;

  private constructor() {
    // Create separate connections for pub/sub
    this.publisher = redis.duplicate();
    this.subscriber = redis.duplicate();
    
    this.setupEventHandlers();
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  private setupEventHandlers() {
    this.publisher.on('error', (err) => {
      console.error('Redis publisher error:', err);
    });

    this.subscriber.on('error', (err) => {
      console.error('Redis subscriber error:', err);
    });

    this.subscriber.on('connect', () => {
      console.log('Redis subscriber connected');
    });

    this.publisher.on('connect', () => {
      console.log('Redis publisher connected');
    });
  }

  /**
   * Publish a message to a Redis channel
   */
  async publish(channel: string, message: any): Promise<number> {
    try {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      return await this.publisher.publish(channel, messageStr);
    } catch (error) {
      console.error('Error publishing message:', error);
      throw error;
    }
  }

  /**
   * Subscribe to a Redis channel
   */
  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    try {
      await this.subscriber.subscribe(channel);
      
      this.subscriber.on('message', (receivedChannel, message) => {
        if (receivedChannel === channel) {
          try {
            const parsedMessage = JSON.parse(message);
            callback(parsedMessage);
          } catch {
            // If parsing fails, pass the raw message
            callback(message);
          }
        }
      });
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      throw error;
    }
  }

  /**
   * Subscribe to multiple channels with pattern matching
   */
  async psubscribe(pattern: string, callback: (channel: string, message: any) => void): Promise<void> {
    try {
      await this.subscriber.psubscribe(pattern);
      
      this.subscriber.on('pmessage', (receivedPattern, receivedChannel, message) => {
        if (receivedPattern === pattern) {
          try {
            const parsedMessage = JSON.parse(message);
            callback(receivedChannel, parsedMessage);
          } catch {
            // If parsing fails, pass the raw message
            callback(receivedChannel, message);
          }
        }
      });
    } catch (error) {
      console.error('Error subscribing to pattern:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.subscriber.unsubscribe(channel);
    } catch (error) {
      console.error('Error unsubscribing from channel:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from a pattern
   */
  async punsubscribe(pattern: string): Promise<void> {
    try {
      await this.subscriber.punsubscribe(pattern);
    } catch (error) {
      console.error('Error unsubscribing from pattern:', error);
      throw error;
    }
  }

  /**
   * Set a key-value pair with TTL
   */
  async setex(key: string, seconds: number, value: any): Promise<void> {
    try {
      const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
      await this.publisher.setex(key, seconds, valueStr);
    } catch (error) {
      console.error('Error setting key with TTL:', error);
      throw error;
    }
  }

  /**
   * Get a value by key
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.publisher.get(key);
    } catch (error) {
      console.error('Error getting key:', error);
      throw error;
    }
  }

  /**
   * Delete a key
   */
  async del(key: string): Promise<number> {
    try {
      return await this.publisher.del(key);
    } catch (error) {
      console.error('Error deleting key:', error);
      throw error;
    }
  }

  /**
   * Get all keys matching a pattern
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.publisher.keys(pattern);
    } catch (error) {
      console.error('Error getting keys:', error);
      throw error;
    }
  }

  /**
   * Add member to set
   */
  async sadd(key: string, member: string): Promise<number> {
    try {
      return await this.publisher.sadd(key, member);
    } catch (error) {
      console.error('Error adding to set:', error);
      throw error;
    }
  }

  /**
   * Remove member from set
   */
  async srem(key: string, member: string): Promise<number> {
    try {
      return await this.publisher.srem(key, member);
    } catch (error) {
      console.error('Error removing from set:', error);
      throw error;
    }
  }

  /**
   * Get all members of a set
   */
  async smembers(key: string): Promise<string[]> {
    try {
      return await this.publisher.smembers(key);
    } catch (error) {
      console.error('Error getting set members:', error);
      throw error;
    }
  }

  /**
   * Get set members count
   */
  async scard(key: string): Promise<number> {
    try {
      return await this.publisher.scard(key);
    } catch (error) {
      console.error('Error getting set count:', error);
      throw error;
    }
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    try {
      await Promise.all([
        this.publisher.quit(),
        this.subscriber.quit(),
      ]);
    } catch (error) {
      console.error('Error closing Redis connections:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getStatus(): { publisher: string; subscriber: string } {
    return {
      publisher: this.publisher.status,
      subscriber: this.subscriber.status,
    };
  }
}

// Export singleton instance
export const redisService = RedisService.getInstance();
