import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Support both URL format and separate config
const redisUrl = process.env.REDIS_URL;

let redisConnection: Redis;
let redisConfig: any;

if (redisUrl) {
  // Use URL connection (for Upstash)
  redisConnection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });
  redisConfig = redisUrl;
} else {
  // Use separate host/port/password
  redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  };
  redisConnection = new Redis(redisConfig);
}

export { redisConnection, redisConfig };

redisConnection.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redisConnection.on('error', (error) => {
  console.error('❌ Redis connection error:', error);
});

export default redisConnection;
