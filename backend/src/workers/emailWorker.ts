import { Worker, Job } from 'bullmq';
import { EmailJobData } from '../types';
import { sendEmail } from '../services/emailService';
import { rateLimiter } from '../services/rateLimiter';
import { AppDataSource } from '../config/database';
import { Email, EmailStatus } from '../models/Email';
import logger from '../config/logger';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';

dotenv.config();

const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '5');

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

export const emailWorker = new Worker<EmailJobData>(
  'email-queue',
  async (job: Job<EmailJobData>) => {
    const { emailId, recipientEmail, subject, body, userId, batchId, attempt } = job.data;

    logger.info(`Processing email job ${job.id} for ${recipientEmail}`, {
      jobId: job.id,
      emailId,
      attempt,
    });

    try {
      // Check rate limit
      const canSend = await rateLimiter.checkAndIncrement(userId);
      
      if (!canSend) {
        // Rate limit exceeded - reschedule for next hour
        logger.warn(`Rate limit exceeded for user ${userId}. Rescheduling email ${emailId}`);
        
        const nextHourDelay = rateLimiter.getNextHourDelay();
        await job.moveToDelayed(Date.now() + nextHourDelay, job.token!);
        
        // Update email status to rescheduled
        const emailRepository = AppDataSource.getMongoRepository(Email);
        await emailRepository.findOneAndUpdate(
          { _id: new ObjectId(emailId) },
          { $set: { status: EmailStatus.RESCHEDULED, scheduledAt: new Date(Date.now() + nextHourDelay) } }
        );
        
        return { rescheduled: true, nextAttempt: Date.now() + nextHourDelay };
      }

      // Send email
      const result = await sendEmail({
        to: recipientEmail,
        subject,
        body,
      });

      // Update email status in database
      const emailRepository = AppDataSource.getMongoRepository(Email);
      await emailRepository.findOneAndUpdate(
        { _id: new ObjectId(emailId) },
        { $set: { status: EmailStatus.SENT, sentAt: new Date() } }
      );

      logger.info(`Email sent successfully to ${recipientEmail}`, {
        jobId: job.id,
        emailId,
        messageId: result.messageId,
      });

      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      logger.error(`Failed to send email ${emailId}`, {
        jobId: job.id,
        emailId,
        error: error.message,
        attempt,
      });

      // Update email status in database
      const emailRepository = AppDataSource.getMongoRepository(Email);
      await emailRepository.findOneAndUpdate(
        { _id: new ObjectId(emailId) },
        { $set: { status: EmailStatus.FAILED, errorMessage: error.message, retryCount: attempt } }
      );

      throw error; // Let BullMQ handle retry logic
    }
  },
  {
    connection: redisConnection as any,
    concurrency: WORKER_CONCURRENCY,
    limiter: {
      max: 10,
      duration: 1000, // Max 10 jobs per second
    },
  }
);

emailWorker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed`, { error: err.message });
});

emailWorker.on('error', (error) => {
  logger.error('Worker error:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Closing worker gracefully...');
  await emailWorker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Closing worker gracefully...');
  await emailWorker.close();
  process.exit(0);
});

export default emailWorker;
