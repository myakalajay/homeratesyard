import React, { forwardRef } from 'react';
import { cn } from '@/utils/utils';

const Radio = forwardRef(({ 
  className, 
  checked, 
  onChange, 
  disabled, 
  label, 
  value, 
  name, 
  id,
  error,
  ...props 
}, ref) => {
  
  // Safe ID generation
  const inputId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn("flex items-start space-x-2", className)}>
      <div className="relative flex items-center h-5 mt-0.5"> {/* mt-0.5 aligns with text line-height */}
        <input
          type="radio"
          id={inputId}
          name={name}
          value={value}
          ref={ref}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer" // Hidden native input
          {...props}
        />
        
        {/* Custom Circle */}
        <div 
          aria-hidden="true"
          className={cn(
            "h-4 w-4 rounded-full border bg-white flex items-center justify-center transition-all duration-200",
            // Base Border
            error ? "border-red-500" : "border-slate-300",
            // Checked State
            "peer-checked:border-red-600 peer-checked:bg-red-600",
            // Focus State (Accessibility Critical)
            "peer-focus-visible:ring-2 peer-focus-visible:ring-red-500/30 peer-focus-visible:ring-offset-2",
            // Hover State
            !disabled && "peer-hover:border-red-400 peer-hover:bg-red-50",
            // Disabled State
            disabled && "cursor-not-allowed opacity-50 bg-slate-100 border-slate-200"
          )}
        >
          {/* Inner Dot */}
          <div 
            className={cn(
              "h-1.5 w-1.5 rounded-full bg-white transition-transform duration-200 ease-out",
              checked ? "scale-100" : "scale-0"
            )} 
          />
        </div>
      </div>
      
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId} 
          className={cn(
            "text-sm font-medium leading-tight select-none",
            disabled ? "cursor-not-allowed text-slate-400" : "cursor-pointer text-slate-700 hover:text-slate-900",
            error && "text-red-600"
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
});

Radio.displayName = "Radio";

export { Radio };