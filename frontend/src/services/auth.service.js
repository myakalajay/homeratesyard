import api from './api'; 
import { deleteCookie } from 'cookies-next';

/**
 * @service AuthService
 * @description Handles all identity and access management requests.
 * All methods return the raw data object from the backend response.
 */

// 1. LOGIN
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data; 
  } catch (error) {
    throw error; 
  }
};

// 2. REGISTER
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 3. GET CURRENT USER (Session Restoration)
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data.user; 
  } catch (error) {
    // We return null instead of throwing so the frontend knows to show the guest state
    return null; 
  }
};

// 4. FORGOT PASSWORD
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 5. RESET PASSWORD
export const resetPassword = async (token, password) => {
  try {
    const response = await api.put(`/auth/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 6. LOGOUT
export const logout = async () => {
  // 🟢 CLEANUP ORDER: Frontend first, then Backend.
  // This guarantees the user is logged out locally even if the network drops.
  deleteCookie('token'); 
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  try {
    await api.get('/auth/logout'); 
  } catch (e) {
    console.debug('Server-side logout skipped or failed.');
  }
};

// 🟢 CRITICAL VERCEL FIX: Bundle everything into the exact object name Vercel is looking for
export const authService = {
  login,
  register,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  logout
};

export default authService;