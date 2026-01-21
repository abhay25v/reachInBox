import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login on 401 if we're not already on login page
    // and it's not the /auth/me endpoint (which is expected to fail when not logged in)
    if (
      error.response?.status === 401 && 
      !window.location.pathname.includes('/login') &&
      !error.config?.url?.includes('/auth/me')
    ) {
      console.warn('Unauthorized access, redirecting to login');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
