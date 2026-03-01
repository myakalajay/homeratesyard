import React, { forwardRef, useId, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils/utils';

const Textarea = forwardRef(({ 
  className, 
  label, 
  error, 
  helperText, 
  id, 
  disabled, 
  autoResize = false, // 🟢 New Feature: Grow with content
  rows = 3,
  ...props 
}, ref) => {
  
  // 1. Stable ID Generation
  const generatedId = useId();
  const textareaId = id || generatedId;
  const errorId = `${textareaId}-error`;

  // 2. Auto-Resize Logic
  // We need an internal ref to measure scrollHeight even if external ref is passed
  const internalRef = useRef(null);

  const handleInput = (e) => {
    if (autoResize) {
      const target = e.target;
      target.style.height = 'auto'; // Reset height to calculate scrollHeight
      target.style.height = `${target.scrollHeight}px`; // Set to content height
    }
    // Pass original onChange if provided
    if (props.onInput) props.onInput(e);
  };

  // Merge refs (External + Internal)
  const setRefs = (element) => {
    internalRef.current = element;
    if (typeof ref === 'function') ref(element);
    else if (ref) ref.current = element;
  };

  return (
    <div className="w-full space-y-1.5">
      {/* Label */}
      {label && (
        <label 
          htmlFor={textareaId} 
          className={cn(
            "block text-sm font-medium transition-colors",
            error ? "text-red-600" : "text-slate-700",
            disabled && "opacity-50"
          )}
        >
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        ref={setRefs}
        disabled={disabled}
        rows={rows}
        onInput={handleInput}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "flex w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-all duration-200",
          // Auto-resize usually implies disabling manual resize handle
          autoResize ? "overflow-hidden resize-none" : "resize-y",
          // Border Colors
          error 
            ? "border-red-500 focus-visible:ring-red-500/20 text-red-900" 
            : "border-slate-200 focus-visible:border-red-500 focus-visible:ring-red-500/20 hover:border-red-200 text-slate-900",
          className
        )}
        {...props}
      />

      {/* Error Message */}
      {error && (
        <div id={errorId} className="flex items-center gap-1.5 text-xs font-medium text-red-600 animate-in slide-in-from-top-1">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}
      
      {/* Helper Text */}
      {!error && helperText && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";

export { Textarea };