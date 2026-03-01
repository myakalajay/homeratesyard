import axios from 'axios';

// 1. Environment-Aware Configuration

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 🟢 CRITICAL: Allow sending cookies/sessions across domains securely
  withCredentials: true, 
  timeout: 15000, 
});

// 2. Request Interceptor: Attach Token Dynamically
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Prevent redirect loops if multiple concurrent requests fail with 401
let isRedirecting = false;

// 3. Response Interceptor: The "No-Crash" Strategy
api.interceptors.response.use(
  (response) => {
    // Return the FULL response so .data works normally in our service files
    return response;
  },
  (error) => {
    // A. Handle Timeouts
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. The server is taking too long to respond.';
      return Promise.reject(error);
    }

    // B. Handle Network Errors (Server completely offline / CORS blocks)
    if (!error.response) {
      error.message = 'Unable to reach the server. Please check your connection or try again later.';
      return Promise.reject(error);
    }

    // C. Handle Session Expiry (401 Unauthorized)
    if (error.response.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login') && !isRedirecting) {
        isRedirecting = true;
        
        // 🟢 FIX: Clear ALL auth-related storage, including impersonation backups
        localStorage.removeItem('token');
        localStorage.removeItem('admin_token_backup');
        localStorage.removeItem('user');
        
        // Use replace to prevent users from hitting the "back" button into a broken state
        window.location.replace('/auth/login?reason=expired');
      }
    }

    // D. Return the original Axios Error 
    // 🟢 FIX: By returning the raw error, our `admin.service.js` can successfully 
    // extract `error.response.data.message` and show accurate UI toasts!
    return Promise.reject(error);
  }
);

export default api;