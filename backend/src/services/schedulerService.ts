import { AppDataSource } from '../config/database';
import { Email, EmailStatus } from '../models/Email';
import emailQueue from '../queues/emailQueue';
import { ScheduleEmailRequest, EmailJobData } from '../types';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';
import rateLimiter from './rateLimiter';
import { ObjectId } from 'mongodb';

class SchedulerService {
  /**
   * Schedule emails based on the request parameters
   */
  async scheduleEmails(
    request: ScheduleEmailRequest,
    userId: string
  ): Promise<{ batchId: string; scheduledCount: number }> {
    const {
      subject,
      body,
      recipients,
      startTime,
      delayBetweenEmails,
      hourlyLimit,
    } = request;

    const batchId = uuidv4();
    const emailRepository = AppDataSource.getMongoRepository(Email);
    const minDelay = rateLimiter.getMinDelay();
    const effectiveDelay = Math.max(delayBetweenEmails, minDelay);

    logger.info(`Scheduling ${recipients.length} emails`, {
      batchId,
      userId,
      startTime,
      delayBetweenEmails: effectiveDelay,
    });

    const scheduledEmails: Email[] = [];
    const scheduledAt = new Date(startTime);

    for (let i = 0; i < recipients.length; i++) {
      const recipientEmail = recipients[i].trim();
      
      // Calculate scheduled time for this email
      const emailScheduledAt = new Date(scheduledAt.getTime() + i * effectiveDelay);

      // Create email record in database
      const email = emailRepository.create({
        subject,
        body,
        recipientEmail,
        status: EmailStatus.SCHEDULED,
        scheduledAt: emailScheduledAt,
        userId,
        batchId,
        retryCount: 0,
      });

      const savedEmail = await emailRepository.save(email);
      scheduledEmails.push(savedEmail);

      // Create job data
      const jobData: EmailJobData = {
        emailId: savedEmail.id,
        recipientEmail,
        subject,
        body,
        userId,
        batchId,
        attempt: 0,
      };

      // Add job to queue with delay
      const delay = emailScheduledAt.getTime() - Date.now();
      const job = await emailQueue.add('email-job', jobData, {
        delay: Math.max(delay, 0),
        jobId: savedEmail.id, // Use email ID as job ID for idempotency
      });

      // Update email with job ID
      await emailRepository.findOneAndUpdate(
        { _id: new ObjectId(savedEmail.id) },
        { $set: { jobId: job.id } }
      );

      logger.debug(`Scheduled email ${savedEmail.id} for ${recipientEmail}`, {
        jobId: job.id,
        scheduledAt: emailScheduledAt,
      });
    }

    return {
      batchId,
      scheduledCount: scheduledEmails.length,
    };
  }

  /**
   * Get all emails for a user
   */
  async getEmailsByUser(
    userId: string,
    filters?: {
      status?: EmailStatus;
      batchId?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ emails: Email[]; total: number }> {
    const emailRepository = AppDataSource.getMongoRepository(Email);
    
    // Build MongoDB query
    const where: any = { userId };
    
    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.batchId) {
      where.batchId = filters.batchId;
    }

    // Get total count
    const total = await emailRepository.count({ where });

    // Get emails with pagination and sorting
    const emails = await emailRepository.find({
      where,
      order: { scheduledAt: 'DESC' } as any,
      take: filters?.limit || 100,
      skip: filters?.offset || 0,
    });

    return { emails, total };
  }

  /**
   * Get email statistics for a user
   */
  async getEmailStats(userId: string): Promise<{
    total: number;
    scheduled: number;
    sent: number;
    failed: number;
    pending: number;
  }> {
    const emailRepository = AppDataSource.getMongoRepository(Email);

    const [total, scheduled, sent, failed, pending] = await Promise.all([
      emailRepository.countBy({ userId }),
      emailRepository.countBy({ userId, status: EmailStatus.SCHEDULED }),
      emailRepository.countBy({ userId, status: EmailStatus.SENT }),
      emailRepository.countBy({ userId, status: EmailStatus.FAILED }),
      emailRepository.countBy({ userId, status: EmailStatus.PENDING }),
    ]);

    return { total, scheduled, sent, failed, pending };
  }

  /**
   * Cancel scheduled emails by batch ID
   */
  async cancelBatch(batchId: string, userId: string): Promise<number> {
    const emailRepository = AppDataSource.getMongoRepository(Email);

    // Get all scheduled emails in this batch
    const emails = await emailRepository.find({
      where: {
        batchId,
        userId,
        status: EmailStatus.SCHEDULED,
      },
    });

    let canceledCount = 0;

    for (const email of emails) {
      if (email.jobId) {
        try {
          const job = await emailQueue.getJob(email.jobId);
          if (job) {
            await job.remove();
            canceledCount++;
          }
        } catch (error) {
          logger.error(`Failed to cancel job ${email.jobId}`, error);
        }
      }

      // Update email status
      await emailRepository.findOneAndUpdate(
        { _id: email._id },
        { $set: { status: EmailStatus.FAILED, errorMessage: 'Canceled by user' } }
      );
    }

    logger.info(`Canceled ${canceledCount} emails in batch ${batchId}`);
    return canceledCount;
  }
}

export const schedulerService = new SchedulerService();
export default schedulerService;
