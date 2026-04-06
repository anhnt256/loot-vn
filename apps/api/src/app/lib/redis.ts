import { Redis } from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  keepAlive: 30000,
  retryStrategy(times) {
    const delay = Math.min(times * 500, 5000);
    console.log(`Redis reconnecting... attempt ${times}, delay ${delay}ms`);
    return delay;
  },
});

// Handle Redis connection events
redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('close', () => {
  console.log('Redis connection closed');
});

export { redis };
