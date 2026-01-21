import api from './client';
import { User, ApiResponse } from '../types';

export const authApi = {
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const { data } = await api.get<ApiResponse<User>>('/auth/me');
      return data.data || null;
    } catch (error) {
      return null;
    }
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getGoogleAuthUrl: (): string => {
    return `${api.defaults.baseURL}/auth/google`;
  },
};
