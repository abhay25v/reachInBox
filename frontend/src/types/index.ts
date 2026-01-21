export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
}

export interface Email {
  id: string;
  subject: string;
  body: string;
  recipientEmail: string;
  status: 'PENDING' | 'SCHEDULED' | 'SENT' | 'FAILED' | 'RESCHEDULED';
  scheduledAt: string;
  sentAt?: string;
  errorMessage?: string;
  batchId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailStats {
  total: number;
  scheduled: number;
  sent: number;
  failed: number;
  pending: number;
  remainingThisHour: number;
  hourlyLimit: number;
}

export interface ScheduleEmailRequest {
  subject: string;
  body: string;
  recipients: string[];
  startTime: string;
  delayBetweenEmails: number;
  hourlyLimit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
