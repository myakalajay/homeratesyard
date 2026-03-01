import { useMemo } from 'react';
import axios from 'axios';
// import { useAuth } from './useAuth'; // Circular dependency risk avoided by direct token access or separate logic

/**
 * @hook useAxios
 * @description Creates an Axios instance with interceptors for Auth and Error handling.
 */
export const useAxios = () => {
  // In a real app, base URL comes from env vars
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10s timeout
    });

    // 1. Request Interceptor: Attach Token
    instance.interceptors.request.use(
      (config) => {
        // Access token from localStorage or Cookies
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 2. Response Interceptor: Handle Global Errors (401, 500)
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response ? error.response.status : null;

        if (status === 401) {
          // Auto-logout logic or Refresh Token flow
          console.warn('[useAxios] Unauthorized - Session expired');
          // Optional: window.location.href = '/auth/login';
        }
        
        return Promise.reject(error);
      }
    );

    return instance;
  }, [baseURL]);

  return axiosInstance;
};