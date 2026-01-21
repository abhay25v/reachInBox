import api from './client';
import {
  Email,
  EmailStats,
  ScheduleEmailRequest,
  ApiResponse,
} from '../types';

export const emailApi = {
  scheduleEmails: async (
    request: ScheduleEmailRequest
  ): Promise<{ batchId: string; scheduledCount: number; message: string }> => {
    const { data } = await api.post<
      ApiResponse<{ batchId: string; scheduledCount: number; message: string }>
    >('/emails/schedule', request);
    return data.data!;
  },

  getEmails: async (params?: {
    status?: string;
    batchId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ emails: Email[]; total: number }> => {
    const { data } = await api.get<
      ApiResponse<{ emails: Email[]; total: number }>
    >('/emails', { params });
    return data.data!;
  },

  getStats: async (): Promise<EmailStats> => {
    const { data } = await api.get<ApiResponse<EmailStats>>('/emails/stats');
    return data.data!;
  },

  cancelBatch: async (
    batchId: string
  ): Promise<{ batchId: string; canceledCount: number; message: string }> => {
    const { data } = await api.delete<
      ApiResponse<{ batchId: string; canceledCount: number; message: string }>
    >(`/emails/batch/${batchId}`);
    return data.data!;
  },

  uploadCsv: async (file: File): Promise<{ emails: string[]; count: number }> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<
      ApiResponse<{ emails: string[]; count: number }>
    >('/upload/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data!;
  },
};
