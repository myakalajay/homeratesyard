'use client';

import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { DollarSign } from 'lucide-react';
import { cn } from '@/utils/utils';

/**
 * @component CurrencyInput
 * @description Production-grade currency field with stable cursor management.
 * Fixes: Cursor jumping, leading zeros, and NaN state handling.
 */
const CurrencyInput = forwardRef(({ 
  value, 
  onChange, 
  icon: Icon = DollarSign, 
  className, 
  placeholder = "0",
  disabled,
  error,
  suffix,
  ...props 
}, ref) => {
  
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef(null);

  // 🟢 HELPER: Format Number to Locale String with precision awareness
  const formatDisplay = (val) => {
    if (val === undefined || val === null || val === '') return '';
    const num = Number(val);
    if (isNaN(num)) return '';
    
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // 🟢 SYNC: Handle external value changes (initial load or resets)
  useEffect(() => {
    const formatted = formatDisplay(value);
    // Only update if the numeric value is different to avoid cursor flickering
    if (parseFloat(displayValue.replace(/,/g, '')) !== value) {
      setDisplayValue(value === 0 ? '' : formatted);
    }
  }, [value]);

  const handleChange = (e) => {
    const originalValue = e.target.value;
    const cursorPosition = e.target.selectionStart;

    // 1. Allow empty state
    if (originalValue === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }

    // 2. Strip everything except numbers and one dot
    let cleanRaw = originalValue.replace(/[^0-9.]/g, '');
    
    // Prevent multiple dots
    const parts = cleanRaw.split('.');
    if (parts.length > 2) return;

    // Prevent leading zeros (e.g., 0500 -> 500) unless it's "0."
    if (parts[0].length > 1 && parts[0].startsWith('0')) {
        parts[0] = parts[0].replace(/^0+/, '');
    }

    const rawNumberString = parts.join('.');
    
    // 3. Construct the pretty display value
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const decimalPart = parts.length > 1 ? `.${parts[1].slice(0, 2)}` : '';
    const newDisplay = `${integerPart}${decimalPart}`;

    // 4. Update internal UI state
    setDisplayValue(newDisplay);
    
    // 5. Calculate cursor offset to prevent jumping
    // (Compensates for added/removed commas)
    setTimeout(() => {
        const addedCommas = (newDisplay.match(/,/g) || []).length;
        const oldCommas = (originalValue.match(/,/g) || []).length;
        const newPos = cursorPosition + (addedCommas - oldCommas);
        e.target.setSelectionRange(newPos, newPos);
    }, 0);

    // 6. Send numeric float to parent
    const floatVal = parseFloat(rawNumberString);
    onChange(isNaN(floatVal) ? 0 : floatVal);
  };

  return (
    <div className={cn("relative group w-full", className)}>
      {/* Icon Slot */}
      <div className={cn(
        "absolute inset-y-0 left-0 flex items-center pl-4 transition-colors pointer-events-none z-10",
        error ? "text-red-500" : "text-slate-400 group-focus-within:text-red-500"
      )}>
        <Icon size={18} strokeWidth={2} />
      </div>
      
      <input
        ref={(node) => {
            inputRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
        }}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full h-12 pl-11 pr-4 bg-slate-50/50 border rounded-xl text-sm font-bold transition-all outline-none",
          "placeholder:text-slate-400 placeholder:font-medium",
          error 
            ? "border-red-500 bg-red-50/30 text-red-900 focus:ring-4 focus:ring-red-500/10" 
            : "border-slate-200 text-slate-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/5 hover:border-slate-300",
          disabled && "bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
        )}
        {...props}
      />

      {suffix && (
        <div className="absolute inset-y-0 flex items-center pointer-events-none right-4">
            <span className="text-xs font-bold tracking-widest uppercase text-slate-400">{suffix}</span>
        </div>
      )}
    </div>
  );
});

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };