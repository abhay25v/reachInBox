#!/usr/bin/env node
import 'reflect-metadata';
import dotenv from 'dotenv';
import { AppDataSource } from '../config/database';
import emailWorker from '../workers/emailWorker';
import logger from '../config/logger';

dotenv.config();

const startWorker = async () => {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('✅ Database connected (Worker)');
    
    logger.info('🔄 Email worker started and waiting for jobs...');
    logger.info(`Worker concurrency: ${process.env.WORKER_CONCURRENCY || 5}`);
    logger.info(`Email hourly limit: ${process.env.EMAIL_HOURLY_LIMIT || 100}`);
    logger.info(`Min delay between emails: ${process.env.EMAIL_MIN_DELAY_MS || 1000}ms`);
  } catch (error) {
    logger.error('Failed to start worker:', error);
    process.exit(1);
  }
};

startWorker();
