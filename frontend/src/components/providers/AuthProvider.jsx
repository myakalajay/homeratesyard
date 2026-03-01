'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router'; 
import { setCookie, deleteCookie, getCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';
import api from '@/services/api'; 
import { authService } from '@/services/auth.service'; 

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. HARD CLEANUP PROTOCOL
  const handleLogoutCleanup = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('admin_token_backup'); 
      deleteCookie('token'); 
    }
    setUser(null);
  }, []);

  // 2. SECURE SESSION HYDRATION
  // Runs on initial app load to verify token validity before rendering pages
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getCookie('token') || localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Pre-flight check: is the JWT mathematically expired?
        const decoded = jwtDecode(token);
        if (decoded.exp < Date.now() / 1000) {
          console.warn('Session expired cryptographically. Cleaning up...');
          handleLogoutCleanup();
          setLoading(false);
          return;
        }

        // Fetch fresh user data from the server
        const response = await api.get('/auth/me');
        if (response.data?.user) {
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      } catch (e) {
        console.warn('Silent hydration fail (Network/401):', e.message);
        handleLogoutCleanup(); // Nuke local state if the server rejects the token
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [handleLogoutCleanup]);

  // 3. CENTRALIZED ROUTING ENGINE (RBAC)
  const redirectUser = useCallback((role) => {
    const normalizedRole = String(role || '').toLowerCase().trim();
    
    const routes = {
      'superadmin': '/superadmin', 
      'super_admin': '/superadmin', 
      'admin': '/admin',
      'lender': '/lender',   
      'borrower': '/borrower'
    };
    
    router.push(routes[normalizedRole] || '/borrower');
  }, [router]);

  // 4. AUTH ACTIONS
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response?.success && response?.token) {
        const userData = response.user;
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setCookie('token', response.token, { maxAge: 60 * 60 * 24 * 7 }); 
        
        setUser(userData);
        redirectUser(userData.role);
        return userData;
      } 
      throw new Error("Invalid response from server.");
    } catch (error) {
      throw error; 
    }
  };

  const register = async (payload) => {
    try {
      const response = await authService.register(payload);
      if (response?.success && response?.token) {
        const userData = response.user;
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setCookie('token', response.token, { maxAge: 60 * 60 * 24 * 7 });

        setUser(userData);
        redirectUser(userData.role);
        return userData;
      }
      throw new Error("Registration failed due to invalid server response.");
    } catch (error) {
      throw error;
    }
  };

  // 🟢 GLOBAL USER UPDATE ENGINE
  // Call this after a successful profile/avatar update to instantly sync the UI globally
  const updateUser = useCallback((newData) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      
      const updatedUser = { ...prevUser, ...newData };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return updatedUser;
    });
  }, []);

  // 🚪 LOGOUT & IMPERSONATION RESTORE
  const logout = useCallback(async () => {
    try {
      // Feature: Safe Impersonation Return
      // If a Super Admin is shadowing a user, "Logout" restores their Admin session instead.
      const backupToken = localStorage.getItem('admin_token_backup');
      if (backupToken) {
        localStorage.setItem('token', backupToken);
        localStorage.removeItem('admin_token_backup');
        setCookie('token', backupToken, { maxAge: 60 * 60 * 24 * 7 });
        
        window.location.href = '/superadmin/users'; 
        return;
      }

      // Tell backend to destroy the HttpOnly cookie
      await api.post('/auth/logout');
    } catch (e) {
      console.debug("Backend logout failed or network drop. Proceeding with local wipe.");
    } finally {
      // Always purge local state regardless of server response
      handleLogoutCleanup();
      router.replace('/auth/login'); 
    }
  }, [handleLogoutCleanup, router]);

  // Utility to check roles inside components
  const hasRole = useCallback((allowedRoles) => {
    if (!user) return false;
    const normalizedRole = String(user.role).toLowerCase().trim();
    return allowedRoles.includes(normalizedRole) || allowedRoles.includes(user.role);
  }, [user]);

  const contextValue = useMemo(() => ({
    user,
    loading,
    login,
    register, 
    logout,
    updateUser,
    isAuthenticated: !!user,
    hasRole
  }), [user, loading, login, register, logout, updateUser, hasRole]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within an AuthProvider");
  return context;
};

export const useAuth = useAuthContext;