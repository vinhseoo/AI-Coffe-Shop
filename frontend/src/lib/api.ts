import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import { ApiError } from '../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request Interceptor: Attach bearer token dynamically from zustand store
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Dynamic import avoidance: read store state directly via non-hook API
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format responses and handle central errors
api.interceptors.response.use(
  (response) => {
    // Directly return the ApiResponse payload (response.data contains success, message, data, etc.)
    return response.data;
  },
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const errorData = error.response?.data;

    // Handle session expiration or unauthorized requests
    if (status === 401) {
      // Clear token and user details on unauthorized
      const { logout } = useAuthStore.getState();
      logout();

      // Only redirect on client side and if not already on the login page
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = `/login?expired=true&redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    }

    // Standardize error propagation
    const formattedError: ApiError = errorData || {
      success: false,
      message: error.message || 'Có lỗi kết nối xảy ra. Vui lòng thử lại sau.',
      errorCode: 'CONNECTION_ERROR',
      timestamp: new Date().toISOString(),
    };

    return Promise.reject(formattedError);
  }
);
