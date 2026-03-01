'use client'; 

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Home, Briefcase, Mail, Lock, Loader2, 
  Check, BadgeCheck, AlertCircle 
} from 'lucide-react';

import { useAuthContext } from '@/components/providers/AuthProvider'; 
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input'; 
import { Checkbox } from '@/components/ui/primitives/Checkbox';
import { cn } from '@/utils/utils';

/**
 * @component SignupForm
 * @description Professional registration form with dynamic role selection.
 * UI ALIGNED: Features comprehensive inline validations and custom primitives.
 */
export default function SignupForm() {
  const auth = useAuthContext() || {};
  const { register } = auth;
  const { addToast } = useToast() || {};
  
  const isMounted = useRef(true);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(''); 
  const [role, setRole] = useState('borrower');
  
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [termsError, setTermsError] = useState(false); // 🟢 FIX: Local visual error for terms
  const [errors, setErrors] = useState({}); 

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    nmlsId: '',
    companyName: ''
  });

  // Component lifecycle tracking for safe state updates
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Cleanup lender data when switching roles
  useEffect(() => {
    if (role === 'borrower') {
      setFormData(prev => ({ ...prev, nmlsId: '', companyName: '' }));
      setErrors(prev => ({ ...prev, nmlsId: null, companyName: null }));
    }
    setApiError(''); 
  }, [role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear inline error the moment the user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    if (apiError) setApiError('');
  };

  const handleTermsChange = (payload) => {
    // 🟢 FIX: Bulletproof handler for custom Checkbox primitives (event vs boolean)
    const isChecked = typeof payload === 'boolean' ? payload : payload?.target?.checked;
    setAgreeTerms(isChecked);
    if (isChecked) setTermsError(false);
  };

  // 🟢 INLINE VALIDATION ENGINE
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required.';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email format.';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (role === 'lender') {
      if (!formData.nmlsId.trim()) newErrors.nmlsId = 'NMLS ID is required.';
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required.';
    }

    setErrors(newErrors);

    // Terms check validation
    let isValidTerms = true;
    if (!agreeTerms) {
      setTermsError(true);
      isValidTerms = false;
      if (Object.keys(newErrors).length === 0 && addToast) {
        addToast('Please accept the Terms & Conditions to proceed.', 'error');
      }
    }

    return Object.keys(newErrors).length === 0 && isValidTerms;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    // Halt submission if validations fail
    if (!validateForm()) return;
    
    if (!register) {
      setApiError("Authentication system is initializing. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      const payload = {
        name: fullName,
        email: formData.email,
        password: formData.password,
        role: role,
        ...(role === 'lender' && {
          nmlsId: formData.nmlsId,
          companyName: formData.companyName
        })
      };

      await register(payload);
      
      if (isMounted.current && addToast) {
         addToast('Welcome to HomeRatesYard! Account created.', 'success');
      }
    } catch (err) {
      if (isMounted.current) {
        const msg = err.message || "Registration failed. Please check your details.";
        setApiError(msg);
        if (addToast) addToast(msg, 'error');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const roleStyles = {
    borrower: {
      active: 'border-red-500 bg-red-50/50 text-red-700 ring-4 ring-red-500/10',
      checkBg: 'bg-red-100',
      checkText: 'text-red-600'
    },
    lender: {
      active: 'border-orange-500 bg-orange-50/50 text-orange-700 ring-4 ring-orange-500/10',
      checkBg: 'bg-orange-100',
      checkText: 'text-orange-600'
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="w-full max-w-md mx-auto space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4"
      noValidate 
    >
      
      {/* GLOBAL API ERROR BANNER */}
      {apiError && (
        <div className="flex items-center gap-3 p-4 text-sm font-medium text-red-800 duration-300 border border-red-100 rounded-2xl bg-red-50 animate-in shake">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* 🎭 ROLE SELECTOR */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { id: 'borrower', label: 'Borrower', icon: Home },
          { id: 'lender', label: 'Lender', icon: Briefcase }
        ].map((type) => {
          const isActive = role === type.id;
          const styles = roleStyles[type.id];
          
          return (
            <button 
              key={type.id}
              type="button"
              onClick={() => setRole(type.id)}
              className={cn(
                "relative p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all duration-300",
                isActive 
                  ? styles.active 
                  : "border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50"
              )}
            >
              {isActive && (
                <div className={cn("absolute top-2 right-2 rounded-full p-0.5", styles.checkBg)}>
                  <Check size={10} className={styles.checkText} strokeWidth={3} />
                </div>
              )}
              <type.icon size={24} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase">{type.label}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {/* NAMES */}
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="First Name"
            name="firstName" 
            placeholder="Jane" 
            value={formData.firstName} 
            onChange={handleChange} 
            error={errors.firstName} 
            className="font-medium"
            disabled={isLoading}
            required 
          />
          <Input 
            label="Last Name"
            name="lastName" 
            placeholder="Doe" 
            value={formData.lastName} 
            onChange={handleChange} 
            error={errors.lastName} 
            className="font-medium"
            disabled={isLoading}
            required 
          />
        </div>

        {/* EMAIL */}
        <Input 
          label="Email Address"
          name="email" 
          type="email" 
          placeholder="e.g. jane@example.com" 
          icon={Mail} 
          value={formData.email} 
          onChange={handleChange} 
          error={errors.email} 
          className="font-medium"
          disabled={isLoading}
          autoComplete="email"
          required 
        />

        {/* 🏦 LENDER PANEL */}
        {role === 'lender' && (
          <div className="overflow-hidden duration-300 border border-orange-200 rounded-2xl bg-orange-50/30 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-orange-100 bg-orange-50/50">
              <BadgeCheck className="w-4 h-4 text-orange-600" />
              <span className="text-[10px] font-bold tracking-wider text-orange-800 uppercase">
                Professional Credentials
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 p-4">
              <Input 
                label="NMLS ID"
                name="nmlsId" 
                placeholder="NMLS ID Number" 
                value={formData.nmlsId} 
                onChange={handleChange}
                error={errors.nmlsId} 
                disabled={isLoading}
                className="font-medium bg-white"
              />
              <Input 
                label="Brokerage / Company"
                name="companyName" 
                placeholder="Company Name" 
                value={formData.companyName} 
                onChange={handleChange}
                error={errors.companyName} 
                disabled={isLoading}
                className="font-medium bg-white"
              />
            </div>
          </div>
        )}

        {/* PASSWORDS */}
        <Input 
          label="Secure Password"
          name="password" 
          type="password" 
          placeholder="8+ characters" 
          icon={Lock} 
          value={formData.password} 
          onChange={handleChange} 
          error={errors.password} 
          disabled={isLoading}
          autoComplete="new-password"
          required 
        />
        <Input 
          label="Confirm Password"
          name="confirmPassword" 
          type="password" 
          placeholder="Confirm Password" 
          icon={Lock} 
          value={formData.confirmPassword} 
          onChange={handleChange} 
          error={errors.confirmPassword} 
          disabled={isLoading}
          autoComplete="new-password"
          required 
        />
      </div>

      {/* TERMS CHECKBOX */}
      <div className={cn(
        "p-4 border rounded-2xl transition-colors", 
        termsError ? "border-red-300 bg-red-50/50 ring-4 ring-red-500/10" : "border-slate-100 bg-slate-50/50"
      )}>
        <Checkbox 
          id="terms"
          checked={agreeTerms}
          onChange={handleTermsChange}
          disabled={isLoading}
          label={
            <span className={cn("font-medium leading-relaxed transition-colors", termsError ? "text-red-700" : "text-slate-500")}>
              I agree to the <Link href="/website/legal/terms" className="font-semibold underline text-slate-900 decoration-slate-200 hover:text-red-600">Terms of Service</Link> and <Link href="/website/privacy" className="font-semibold underline text-slate-900 decoration-slate-200 hover:text-red-600">Privacy Policy</Link>.
            </span>
          }
        />
      </div>

      {/* SUBMIT BUTTON */}
      <Button 
        type="submit" 
        disabled={isLoading}
        className={cn(
          "w-full h-14 text-base font-bold text-white shadow-xl transition-all active:scale-[0.98] rounded-2xl",
          role === 'lender' 
            ? "bg-gradient-to-r from-orange-500 to-red-600 shadow-orange-500/20 hover:from-orange-600 hover:to-red-700" 
            : "bg-gradient-to-r from-red-600 to-orange-500 shadow-red-500/20 hover:from-red-700 hover:to-orange-600"
        )}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Verifying Details...
          </span>
        ) : (
          'Create Free Account'
        )}
      </Button>

      <p className="text-sm font-medium text-center text-slate-500">
        Already a member?{' '}
        <Link href="/auth/login" className="font-bold transition-colors text-slate-900 hover:text-red-600 decoration-slate-200 hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}