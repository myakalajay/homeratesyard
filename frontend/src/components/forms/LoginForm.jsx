'use client'; 

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuthContext } from '@/components/providers/AuthProvider'; 
import { useToast } from '@/context/ToastContext';
import { Input } from '@/components/ui/primitives/Input';
import { Button } from '@/components/ui/primitives/Button';
import { Checkbox } from '@/components/ui/primitives/Checkbox';
import { cn } from '@/utils/utils';

export default function LoginForm() {
  const auth = useAuthContext() || {};
  const { login } = auth;
  const { addToast } = useToast() || {}; 
  
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState(''); 
  const [fieldErrors, setFieldErrors] = useState({}); 
  
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '',
    rememberMe: false 
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (globalError) setGlobalError(''); 
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email format.";
    }
    
    if (!formData.password) {
      errors.password = "Password is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!login) {
      setGlobalError("Authentication service is currently unavailable.");
      return; 
    }

    if (!validateForm()) return;

    setIsLoading(true);
    setGlobalError('');

    try {
      // 🟢 FIX: Await the response and check if the provider returned a success flag
      const response = await login(formData.email, formData.password);
      
      // If your AuthProvider returns success: false instead of throwing an error
      if (response && response.success === false) {
        throw new Error(response.message || "Invalid credentials.");
      }
      
      if (addToast) addToast('Welcome back to HomeRatesYard!', 'success');
      
    } catch (err) {
      // 🟢 Gracefully catch server rejections or thrown errors
      const msg = err.response?.data?.message || err.message || "Invalid credentials. Please try again.";
      setGlobalError(msg);
      if (addToast) addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="w-full max-w-lg mx-auto space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4"
      noValidate 
    >
      {/* GLOBAL ERROR BANNER */}
      {globalError && (
        <div className="flex items-center gap-3 p-4 text-sm font-medium text-red-800 duration-300 border border-red-100 rounded-2xl bg-red-50 animate-in shake">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      <div className="space-y-4">
        <Input 
          label="Email Address"
          name="email"
          type="email"
          icon={Mail}
          placeholder="e.g. john@example.com"
          value={formData.email}
          onChange={handleChange}
          error={fieldErrors.email} 
          disabled={isLoading}
          required
          className="font-medium"
          autoComplete="email"
        />

        <Input 
          label="Secure Password"
          name="password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={fieldErrors.password} 
          disabled={isLoading}
          required
          className="font-medium"
          autoComplete="current-password"
        />
      </div>

      <div className="flex items-center justify-between px-1">
        <Checkbox 
          name="rememberMe"
          label="Keep me signed in"
          checked={formData.rememberMe}
          onChange={handleChange}
          disabled={isLoading}
        />

        <Link href="/auth/forgot-password">
          <span className="text-sm font-semibold text-red-600 transition-colors hover:text-red-700">
            Forgot Password?
          </span>
        </Link>
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className={cn(
          "w-full h-14 text-base font-semibold text-white shadow-xl shadow-red-600/10 transition-all group",
          "bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 active:scale-[0.98]"
        )}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Authenticating...</span>
          </div>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Sign In Securely 
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </span>
        )}
      </Button>

      <div className="pt-2 text-center">
        <p className="text-sm font-medium text-slate-500">
          New to the platform?{' '}
          <Link href="/auth/register">
            <span className="font-semibold text-red-600 transition-colors hover:text-red-600 decoration-slate-200 hover:underline">
              Create Free Account
            </span>
          </Link>
        </p>
      </div>
    </form>
  );
}