import React from 'react';
import { cn } from '@/utils/utils';

/**
 * @component Divider
 * @description Sophisticated separator for layout structure.
 * 🟢 Supports: Horizontal, Vertical, and Labeled ("--- OR ---") states.
 */
const Divider = ({ 
  className, 
  orientation = "horizontal", 
  variant = "solid", // "solid" | "gradient"
  children, 
  ...props 
}) => {
  
  // Line styling based on variant
  const lineStyle = cn(
    "flex-grow transition-all duration-500",
    variant === "solid" ? "bg-slate-200" : "bg-gradient-to-r from-transparent via-slate-200 to-transparent",
    orientation === "horizontal" ? "h-[1px]" : "w-[1px]"
  );

  // SCENARIO A: Labeled Divider (e.g., Auth "OR" social login)
  if (children && orientation === "horizontal") {
    return (
      <div 
        className={cn("relative flex items-center w-full my-8", className)} 
        role="separator" 
        aria-label={typeof children === 'string' ? children : 'Section Divider'}
        {...props}
      >
        <div className={cn(lineStyle, "bg-gradient-to-r from-transparent to-slate-200")} />
        <span className="flex-shrink-0 mx-5 text-[10px] font-black tracking-[0.2em] uppercase select-none text-slate-400 bg-white">
          {children}
        </span>
        <div className={cn(lineStyle, "bg-gradient-to-l from-transparent to-slate-200")} />
      </div>
    );
  }

  // SCENARIO B: Standard Line (Horizontal or Vertical)
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        variant === "solid" ? "bg-slate-200" : "bg-gradient-to-b from-transparent via-slate-200 to-transparent",
        orientation === "horizontal" 
          ? "h-[1px] w-full my-6 bg-gradient-to-r" 
          : "h-auto w-[1px] mx-6 self-stretch min-h-[1em]",
        className
      )}
      {...props}
    />
  );
};

export { Divider };