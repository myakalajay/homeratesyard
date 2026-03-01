import axios from 'axios';
import { getCookie, deleteCookie } from 'cookies-next';

const api = axios.create({
  // ✅ Prioritizes environment variable for production/Docker
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================
// 🛡️ REQUEST INTERCEPTOR
// ==========================
api.interceptors.request.use(
  (config) => {
    // 1. Check for token in Cookies (Server-side compatible)
    let token = getCookie('hry_token');

    // 2. Fallback to LocalStorage if Cookie is missing (Client-side sync)
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================
// 🛑 RESPONSE INTERCEPTOR
// ==========================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    // Handle 401 (Unauthorized) - Session Expired or Invalid Credentials
    if (status === 401) {
      // 1. Clear both Cookies and LocalStorage to prevent stale state
      deleteCookie('hry_token');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // 2. Redirect only if NOT already on a login/register page
        // This prevents the "Infinite Redirect" loop during failed login attempts
        const isAuthPage = window.location.pathname.startsWith('/auth');
        
        if (!isAuthPage) {
          console.warn('⚠️ Session expired or invalid token. Redirecting to login.');
          window.location.href = '/auth/login?expired=true';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;