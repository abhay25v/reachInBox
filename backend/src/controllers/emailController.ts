import { Request, Response } from 'express';
import schedulerService from '../services/schedulerService';
import rateLimiter from '../services/rateLimiter';
import { ScheduleEmailRequest } from '../types';
import { EmailStatus } from '../models/Email';
import { User } from '../models/User';
import logger from '../config/logger';

export const scheduleEmails = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as User).id;
    const request: ScheduleEmailRequest = req.body;

    // Check current rate limit status
    const remaining = await rateLimiter.getRemainingCount(userId);
    logger.info(`User ${userId} scheduling emails. Remaining this hour: ${remaining}`);

    const result = await schedulerService.scheduleEmails(request, userId);

    res.json({
      success: true,
      data: {
        batchId: result.batchId,
        scheduledCount: result.scheduledCount,
        message: `Successfully scheduled ${result.scheduledCount} emails`,
      },
    });
  } catch (error: any) {
    logger.error('Error scheduling emails:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getEmails = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as User).id;
    const { status, batchId, limit, offset } = req.query;

    const result = await schedulerService.getEmailsByUser(userId, {
      status: status as EmailStatus,
      batchId: batchId as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Error fetching emails:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getEmailStats = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as User).id;
    const stats = await schedulerService.getEmailStats(userId);
    const remaining = await rateLimiter.getRemainingCount(userId);

    res.json({
      success: true,
      data: {
        ...stats,
        remainingThisHour: remaining,
        hourlyLimit: rateLimiter.getHourlyLimit(),
      },
    });
  } catch (error: any) {
    logger.error('Error fetching email stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const cancelBatch = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as User).id;
    const { batchId } = req.params;

    const canceledCount = await schedulerService.cancelBatch(batchId, userId);

    res.json({
      success: true,
      data: {
        batchId,
        canceledCount,
        message: `Canceled ${canceledCount} emails`,
      },
    });
  } catch (error: any) {
    logger.error('Error canceling batch:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
