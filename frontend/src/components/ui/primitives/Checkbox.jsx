'use client';

import React, { forwardRef, useId, useEffect, useRef } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/utils/utils';

/**
 * @component Checkbox
 * @description Highly interactive, accessible, custom-styled checkbox.
 * Supports: Checked, Unchecked, Indeterminate, Disabled, Error states, and Descriptions.
 */
export const Checkbox = forwardRef(({ 
  label, 
  description, // Added for enterprise form flexibility
  id, 
  checked = false, 
  indeterminate = false, 
  disabled = false,
  error = false,
  onChange, 
  className,
  ...props
}, forwardedRef) => {
  
  // 🟢 FIX 1: Hydration-safe ID generation
  const generatedId = useId();
  const inputId = id || generatedId;

  // Manage internal ref for native indeterminate state linking
  const internalRef = useRef(null);
  const ref = forwardedRef || internalRef;

  useEffect(() => {
    if (ref && ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [ref, indeterminate]);

  return (
    <div className={cn("flex items-start group", className)}>
      <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="absolute z-20 w-full h-full opacity-0 cursor-pointer peer disabled:cursor-not-allowed"
          {...props}
        />
        
        {/* 🟢 FIX 2: Smooth Brand Visuals & Animations */}
        <div 
          aria-hidden="true"
          className={cn(
            "absolute inset-0 rounded-[4px] border-2 flex items-center justify-center transition-all duration-300 ease-out pointer-events-none",
            // Base Colors
            "bg-white border-slate-300",
            // Hover State: Soft red aura
            !disabled && "peer-hover:border-red-400 peer-hover:shadow-[0_0_0_4px_rgba(220,38,38,0.08)]",
            // Checked / Indeterminate State: Brand Gradient
            (checked || indeterminate) && "bg-gradient-to-br from-red-600 to-orange-500 border-transparent shadow-sm",
            // Focus Ring (Keyboard Navigation)
            "peer-focus-visible:ring-2 peer-focus-visible:ring-red-500/20 peer-focus-visible:ring-offset-2",
            // Tactile Click Animation
            !disabled && "group-active:scale-90",
            // Error State
            error && !checked && "border-red-500 bg-red-50",
            // Disabled State
            disabled && "bg-slate-100 border-slate-200 cursor-not-allowed opacity-50"
          )}
        >
          {indeterminate ? (
            <Minus size={12} strokeWidth={4} className="text-white" />
          ) : (
            <Check 
              size={12} 
              strokeWidth={4} 
              className={cn(
                "text-white transition-all duration-300", 
                checked ? "scale-100 opacity-100 rotate-0" : "scale-50 opacity-0 -rotate-12"
              )} 
            />
          )}
        </div>
      </div>
      
      {/* 🟢 FIX 3: Label & Description Stack */}
      {(label || description) && (
        <div className="flex flex-col ml-3">
          {label && (
            <label 
              htmlFor={inputId} 
              className={cn(
                "text-sm font-medium select-none transition-colors leading-tight mt-0.5",
                disabled ? "text-slate-400 cursor-not-allowed" : "text-slate-600 cursor-pointer group-hover:text-slate-700",
                error && "text-red-600"
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={cn(
              "text-xs mt-1 font-medium leading-relaxed", 
              disabled ? "text-slate-300" : "text-slate-500"
            )}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = "Checkbox";