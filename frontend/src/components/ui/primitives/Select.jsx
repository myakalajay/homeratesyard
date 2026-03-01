'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/utils';

export const Select = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select option", 
  label, 
  error, 
  icon: Icon,
  disabled = false,
  className,
  name 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') closeDropdown();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
      }
      if (e.key === 'Enter' && focusedIndex !== -1) {
        e.preventDefault();
        onChange?.(options[focusedIndex].value);
        closeDropdown();
      }
    };

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        closeDropdown();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, focusedIndex, options, closeDropdown, onChange]);

  return (
    <div className={cn("w-full space-y-2 relative", className)} ref={containerRef}>
      {label && (
        <label className={cn(
          "block text-[11px] font-semibold uppercase tracking-widest transition-colors duration-200",
          error ? "text-red-600" : "text-slate-500"
        )}>
          {label}
        </label>
      )}

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative w-full py-2.5 h-12 flex items-center justify-between px-4 bg-white border rounded-md transition-all duration-300 ease-out",
          "focus:outline-none focus:ring-2 focus:ring-[#0A1128]/10",
          isOpen ? "border-[#0A1128] shadow-sm" : "border-slate-200 hover:border-slate-300",
          error && "border-red-500 bg-red-50/20",
          disabled && "opacity-50 cursor-not-allowed bg-slate-100"
        )}
      >
        <div className="flex items-center gap-3 truncate">
          {Icon && <Icon size={18} className={cn("transition-colors", isOpen ? "text-[#0A1128]" : "text-slate-400")} />}
          <span className={cn("text-sm font-semibold truncate", !selectedOption ? "text-slate-400" : "text-[#0A1128]")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          className={cn("text-slate-400 transition-all duration-300 ease-in-out", isOpen && "rotate-180 text-[#0A1128]")} 
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          // 🟢 Z-INDEX UPGRADE: Absolute positioning with z-[9999]
          className="absolute left-0 w-full mt-2 py-2 bg-white border border-slate-100 rounded-md shadow-xl z-[9999] animate-in fade-in zoom-in-95 duration-200 origin-top"
        >
          <div className="px-2 space-y-1 overflow-y-auto max-h-90 custom-scrollbar">
            {options.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={value === option.value}
                onClick={() => { onChange?.(option.value); closeDropdown(); }}
                onMouseEnter={() => setFocusedIndex(index)}
                className={cn(
                  "group flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-md cursor-pointer transition-all duration-200",
                  value === option.value ? "bg-slate-100 text-[#0A1128]" : "text-slate-600 hover:bg-slate-50 hover:text-[#0A1128]",
                  focusedIndex === index && "bg-slate-50 text-[#0A1128]"
                )}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && (
                  <Check size={16} className="text-[#0A1128] animate-in zoom-in" />
                )}
              </li>
            ))}
          </div>
        </ul>
      )}

      {error && (
        <div className="flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-red-600 animate-in slide-in-from-top-1">
          <AlertCircle size={13} strokeWidth={3} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};