import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const MOCK_USER = {
  id: 'usr_123456',
  name: 'Alex Sterling',
  email: 'alex.sterling@example.com',
  role: 'admin',
  image: null,
  initials: 'AS'
};

/**
 * @hook useAuth
 * @description Centralized authentication logic.
 * Currently uses MOCK data for simulation. Replace mock calls with useAxios() in production.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Simulate API verification delay
        setTimeout(() => {
          setUser(MOCK_USER);
          setIsLoading(false);
        }, 500);
      } else {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    // Simulate Network Request
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'demo@fintech.com' && password === 'password') {
          const fakeToken = 'ey_mock_jwt_token_123';
          localStorage.setItem('auth_token', fakeToken);
          setUser(MOCK_USER);
          setIsLoading(false);
          resolve(MOCK_USER);
        } else {
          setIsLoading(false);
          setError('Invalid credentials. Try demo@fintech.com / password');
          reject(new Error('Invalid credentials'));
        }
      }, 1500);
    });
  }, []);

  const register = useCallback(async (data) => {
    setIsLoading(true);
    // Simulate Registration
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = { ...MOCK_USER, name: data.name, email: data.email };
        localStorage.setItem('auth_token', 'ey_mock_register_token');
        setUser(newUser);
        setIsLoading(false);
        resolve(newUser);
      }, 1500);
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setUser(null);
    router.push('/auth/login');
  }, [router]);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
}