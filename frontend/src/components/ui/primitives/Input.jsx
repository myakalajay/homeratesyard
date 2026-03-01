'use client';

import React, { useState, forwardRef, useId } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/utils';

/**
 * @component Input
 * @description Enterprise-grade input field with inline validation.
 * 🟢 Fixed: Added Brand Red focus states and semibold placeholders for high legibility.
 */
const Input = forwardRef(({ 
  label, 
  icon: Icon, 
  rightIcon: RightIcon, 
  error, 
  type = "text",
  className,
  id,
  placeholder,
  disabled,
  helperText, 
  onInvalid,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Hydration-safe ID generation
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const isPasswordType = type === 'password';
  const currentType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

  // AVOID DEFAULT VALIDATION POP-UP
  const handleInvalid = (e) => {
    e.preventDefault(); 
    if (onInvalid) onInvalid(e);
  };

  return (
    <div className="w-full space-y-2">
      {/* 🏷️ LABEL */}
      {label && (
        <label 
          htmlFor={inputId} 
          className={cn(
            "block text-[11px] font-bold uppercase tracking-widest transition-colors duration-200",
            error ? "text-red-600" : "text-slate-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {label} {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      
      <div className="relative group">
        {/* 🎨 LEFT ICON */}
        {Icon && (
          <div className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none z-10",
            // 🟢 BRAND FIX: Icon turns Brand Red on focus
            error ? "text-red-400" : "text-slate-400 group-focus-within:text-red-600",
            disabled && "opacity-50"
          )}>
            {React.isValidElement(Icon) ? Icon : <Icon size={18} />}
          </div>
        )}

        {/* ⌨️ INPUT FIELD */}
        <input 
          ref={ref}
          id={inputId}
          type={currentType}
          placeholder={placeholder}
          disabled={disabled}
          onInvalid={handleInvalid} 
          aria-invalid={!!error}
          aria-describedby={error ? errorId : (helperText ? helperId : undefined)}
          className={cn(
            "flex w-full py-3 bg-white border rounded-md text-sm font-semibold text-[#0A1128] transition-all duration-300 ease-out shadow-sm",
            // 🟢 BRAND FIX: Focus ring and border now use Brand Red (red-600).
            // 🟢 TYPOGRAPHY FIX: Placeholder is now font-semibold for clarity.
            "placeholder:text-slate-500 placeholder:font-normal  focus-visible:border-red-600",
            Icon ? "pl-11" : "pl-4", 
            (isPasswordType || RightIcon) ? "pr-11" : "pr-4",
            error 
              ? "border-red-500 text-red-900 focus-visible:border-red-500" 
              : "border-slate-200 hover:border-slate-300",
            disabled && "bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200 opacity-70",
            className
          )}
          {...props} 
        />

        {/* 👁️ RIGHT ICON / PASSWORD TOGGLE */}
        <div className="absolute z-10 flex items-center -translate-y-1/2 right-3 top-1/2">
          {isPasswordType ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
              className="p-1.5 transition-colors rounded-md text-slate-400 hover:text-red-600 hover:bg-slate-100 focus:outline-none"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          ) : RightIcon ? (
            <div className={cn("text-slate-400", disabled && "opacity-50")}>
              {React.isValidElement(RightIcon) ? RightIcon : <RightIcon size={18} />}
            </div>
          ) : null}
        </div>
      </div>

      {/* ⚠️ ERROR OR HELPER TEXT */}
      {error ? (
        <div id={errorId} className="flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-red-600 animate-in slide-in-from-top-1">
          <AlertCircle size={13} strokeWidth={2.5} />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <div id={helperId} className="px-1 text-[11px] font-medium text-slate-500 animate-in fade-in">
          {helperText}
        </div>
      ) : null}
    </div>
  );
});

Input.displayName = "Input";
export { Input };
export default Input;