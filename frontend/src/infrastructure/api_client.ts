import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  timeout: 60000, // 60 seconds (useful for AI generations)
});

// Request interceptor to add authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to format errors and handle 401s
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const originalRequest = error.config;
    const status = error.response ? error.response.status : null;

    // Handle session expiry
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If we are not on the login page already, redirect
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth?expired=true';
      }
    }

    // Standardize error payload
    const errorData: any = error.response?.data || {};
    const formattedError = {
      message: errorData.message || errorData.detail || error.message || 'An unexpected error occurred.',
      code: errorData.error || error.code || 'UNKNOWN_ERROR',
      status: status,
      retryRecommended: errorData.retry_recommended ?? (status === 500 || error.code === 'ECONNABORTED'),
      originalError: error,
    };

    return Promise.reject(formattedError);
  }
);

export default api;
