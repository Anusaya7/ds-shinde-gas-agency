import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null' && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (typeof FormData !== 'undefined' && config.data instanceof FormData && config.headers) {
      config.headers.delete('Content-Type');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthenticated 401 responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const authUrl = error.config?.url || '';
      const isAuthUrl =
        authUrl.includes('/auth/login') ||
        authUrl.includes('/auth/register') ||
        authUrl.includes('/auth/send-otp') ||
        authUrl.includes('/auth/verify-otp');
      if (!isAuthUrl) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (
          !window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register') &&
          window.location.pathname !== '/'
        ) {
          window.location.href = '/login?session_expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
