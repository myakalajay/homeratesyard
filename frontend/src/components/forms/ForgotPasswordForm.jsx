'use client'; 

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { authService } from '@/services/auth.service'; 
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { cn } from '@/utils/utils';

/**
 * @component ForgotPasswordForm
 * @description Secure password reset request form.
 * UI ALIGNED: Matches LoginForm/SignupForm typography, inline validation, and button metrics.
 * SECURITY: Implements User Enumeration Protection by handling API responses securely.
 */
export default function ForgotPasswordForm() {
  const { addToast } = useToast() || {};
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [apiError, setApiError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setEmail(e.target.value);
    // Clear global and inline errors the moment the user types
    if (apiError) setApiError('');
    if (fieldErrors.email) setFieldErrors({});
  };

  // 🟢 INLINE VALIDATION ENGINE
  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email format.";
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
      // Send request to the hardened backend route
      await authService.forgotPassword(email);
      
      // The backend returns 200 OK regardless of whether the email exists
      // to prevent bad actors from fishing for registered accounts.
      setIsSent(true);

    } catch (err) {
      console.error("Forgot Password Pipeline Error:", err);
      
      // Since the backend handles enumeration protection, a caught error here 
      // means a true system failure (e.g., 500 Server Error, Rate Limiting).
      const msg = err.response?.data?.message || err.message || "Unable to send email. Please try again later.";
      setApiError(msg);
      if (addToast) addToast(msg, 'error');
      
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 🟢 SUCCESS VIEW
  // ==========================================
  if (isSent) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6 text-center duration-500 animate-in fade-in zoom-in">
        <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-20"></div>
          <div className="relative flex items-center justify-center w-full h-full border rounded-full text-emerald-600 border-emerald-100 bg-emerald-50">
             <ShieldCheck size={40} />
          </div>
        </div>
        
        <div className="space-y-2">
            <h3 className="text-2xl font-medium tracking-tight text-slate-900">Check your inbox</h3>
            <p className="max-w-xs mx-auto text-sm font-medium leading-relaxed text-slate-500">
              If an account exists for <span className="font-bold text-slate-900">{email}</span>, you will receive password reset instructions shortly.
            </p>
        </div>

        <div className="pt-6">
            <Link href="/auth/login" className="block w-full">
                <Button 
                  className="w-full h-14 text-base font-bold text-white shadow-xl bg-slate-900 hover:bg-slate-800 rounded-2xl active:scale-[0.98] transition-all"
                >
                    Return to Sign In
                </Button>
            </Link>
        </div>
        
        <p className="mt-4 text-xs font-medium text-slate-400">
            Didn't receive it? Check your spam folder or try again in 5 minutes.
        </p>
      </div>
    );
  }

  // ==========================================
  // 🔴 REQUEST VIEW
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

      {/* 🟢 FIX: Passed Icon as an instantiated component to prevent React rendering errors */}
      <Input 
        label="Email Address"
        name="email"
        type="email"
        icon={<Mail size={18} className="text-slate-400" />}
        placeholder="e.g. name@example.com"
        value={email}
        onChange={handleChange}
        error={fieldErrors.email}
        disabled={isLoading}
        className="font-medium"
        autoComplete="email"
        required
        autoFocus
      />

      {/* SUBMIT BUTTON */}
      <Button 
        type="submit" 
        disabled={isLoading}
        className={cn(
          "w-full h-14 text-base font-semibold text-white shadow-xl shadow-red-600/10 transition-all rounded-2xl group",
          "bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 active:scale-[0.98]"
        )}
      >
        {isLoading ? (
            <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> 
                <span>Sending Link...</span>
            </span>
        ) : (
            'Send Reset Link'
        )}
      </Button>

      <div className="pt-2 text-center">
        <Link 
          href="/auth/login" 
          className="inline-flex items-center gap-2 text-sm font-bold transition-colors text-slate-500 hover:text-slate-900 group"
        >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> 
            Back to Sign In
        </Link>
      </div>
    </form>
  );
}