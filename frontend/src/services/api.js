import axios from 'axios';

// ==========================================
// 1. SMART ENVIRONMENT CONFIGURATION
// ==========================================

// 🟢 FIX 1: Smart Fallback prevents the "Loopback CORS" crash in production 
// if the Vercel Environment Variable is accidentally missing.
const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
const fallbackUrl = isProd 
  ? 'https://homeratesyard.onrender.com/api' // Failsafe to your live backend
  : 'http://localhost:5000/api';             // Local development

// Strip trailing slashes to prevent malformed URLs (e.g., /api//users)
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || fallbackUrl;
const API_URL = rawApiUrl.replace(/\/$/, '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // 🟢 CRITICAL: Allow sending cookies/sessions across domains securely
  withCredentials: true, 
  // 🟢 FIX 2: Increased timeout to 30s to survive Render's "Cold Starts"
  timeout: 30000, 
});

// ==========================================
// 2. REQUEST INTERCEPTOR (Token Injection)
// ==========================================
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

// ==========================================
// 3. RESPONSE INTERCEPTOR (Error Handling)
// ==========================================
api.interceptors.response.use(
  (response) => {
    // Return the FULL response so .data works normally in our service files
    return response;
  },
  (error) => {
    // A. Handle Timeouts (Render waking up)
    if (error.code === 'ECONNABORTED') {
      error.message = 'The server is waking up. Please wait a moment and try again.';
      return Promise.reject(error);
    }

    // B. Handle Network Errors (Server offline / CORS blocks)
    if (!error.response) {
      error.message = 'Unable to connect to the server. Please check your connection.';
      return Promise.reject(error);
    }

    // C. Handle Session Expiry (401 Unauthorized)
    if (error.response.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login') && !isRedirecting) {
        isRedirecting = true;
        
        // Clear ALL auth-related storage, including impersonation backups
        localStorage.removeItem('token');
        localStorage.removeItem('admin_token_backup');
        localStorage.removeItem('user');
        
        // Use replace to prevent users from hitting the "back" button into a broken state
        window.location.replace('/auth/login?reason=expired');

        // 🟢 FIX 3: Reset the lock after a short delay just in case the browser blocks the redirect
        setTimeout(() => { isRedirecting = false; }, 2000);
      }
    }

    // D. Return the original Axios Error 
    // By returning the raw error, our `admin.service.js` can successfully 
    // extract `error.response.data.message` and show accurate UI toasts!
    return Promise.reject(error);
  }
);

export default api;