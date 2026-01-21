export interface ScheduleEmailRequest {
  subject: string;
  body: string;
  recipients: string[]; // Array of email addresses
  startTime: Date;
  delayBetweenEmails: number; // milliseconds
  hourlyLimit?: number; // Optional, falls back to env config
}

export interface EmailJobData {
  emailId: string;
  recipientEmail: string;
  subject: string;
  body: string;
  userId: string;
  batchId: string;
  attempt: number;
}

export interface RateLimitConfig {
  hourlyLimit: number;
  minDelayMs: number;
}

export interface EmailStats {
  total: number;
  scheduled: number;
  sent: number;
  failed: number;
  pending: number;
}
