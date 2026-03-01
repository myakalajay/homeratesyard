'use client'; 

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '@/services/auth.service'; 
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { cn } from '@/utils/utils';

/**
 * @component ResetPasswordForm
 * @description Secure password reset form utilized after clicking an email link.
 * UI ALIGNED: Matches LoginForm/SignupForm typography, inline validation, and button metrics.
 */
export default function ResetPasswordForm({ token }) {
  const { addToast } = useToast() || {};
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // 🟢 Added for dedicated success view
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [apiError, setApiError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear global and inline errors the moment the user types
    if (apiError) setApiError('');
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // 🟢 INLINE VALIDATION ENGINE
  const validateForm = () => {
    const errors = {};
    if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters.';
    }
    if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    // Halt submission if inline validation fails
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await authService.resetPassword(token, formData.password);
      
      setIsSuccess(true);
      if (addToast) addToast('Password reset successfully! Redirecting...', 'success');
      
      // Route to login after showing the success state
      setTimeout(() => {
          router.push('/auth/login');
      }, 2000);
      
    } catch (err) {
      console.error(err);
      // 🟢 Safely extract backend error message
      const msg = err.response?.data?.message || err.message || "Token is invalid or has expired.";
      setApiError(msg);
      if (addToast) addToast(msg, 'error');
      setIsLoading(false); 
    } 
  };

  // ==========================================
  // 🟢 SUCCESS VIEW
  // ==========================================
  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6 text-center duration-500 animate-in fade-in zoom-in">
        <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-20"></div>
          <div className="relative flex items-center justify-center w-full h-full border rounded-full text-emerald-600 border-emerald-100 bg-emerald-50">
             <CheckCircle size={40} />
          </div>
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">Password Secured!</h3>
        <p className="text-sm font-medium text-slate-500">Redirecting you to secure login...</p>
        <div className="flex justify-center mt-6">
          <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
        </div>
      </div>
    );
  }

  // ==========================================
  // 🔴 FORM VIEW
  // ==========================================
  return (
    <form 
      onSubmit={handleSubmit} 
      className="w-full max-w-md mx-auto space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4"
      noValidate 
    >
      
      {/* API ERROR BANNER */}
      {apiError && (
        <div className="flex items-center gap-3 p-4 text-sm font-medium text-red-800 duration-300 border border-red-100 rounded-2xl bg-red-50 animate-in shake">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* 🟢 FIX: Passed Icon as an instantiated component */}
        <Input 
            label="New Password"
            name="password"
            type="password"
            icon={<Lock size={18} className="text-slate-400" />}
            placeholder="Min 8 characters"
            value={formData.password}
            onChange={handleChange}
            error={fieldErrors.password} 
            disabled={isLoading}
            className="font-medium"
            required
            autoFocus
        />
        <Input 
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            icon={<Lock size={18} className="text-slate-400" />}
            placeholder="Re-type password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={fieldErrors.confirmPassword} 
            disabled={isLoading}
            className="font-medium"
            required
            rightIcon={
                formData.confirmPassword && formData.password === formData.confirmPassword && !fieldErrors.confirmPassword
                ? <CheckCircle className="w-5 h-5 text-emerald-500 animate-in zoom-in" /> 
                : null
            }
        />
      </div>

      {/* SUBMIT BUTTON */}
      <Button 
        type="submit" 
        disabled={isLoading}
        className={cn(
          "w-full h-14 text-base font-bold text-white shadow-xl shadow-red-600/10 transition-all rounded-2xl group",
          "bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 active:scale-[0.98]"
        )}
      >
        {isLoading ? (
            <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> 
                <span>Securing Account...</span>
            </span>
        ) : (
            'Set New Password'
        )}
      </Button>
    </form>
  );
}