import { Queue } from 'bullmq';
import { EmailJobData } from '../types';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Create connection - BullMQ needs an ioredis instance for TLS
const redisConnection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
    });

export const emailQueue = new Queue<EmailJobData>('email-queue', {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      age: 86400, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 604800, // Keep failed jobs for 7 days
    },
  },
});

emailQueue.on('error', (error) => {
  console.error('Email queue error:', error);
});

export default emailQueue;
