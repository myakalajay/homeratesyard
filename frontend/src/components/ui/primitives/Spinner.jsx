import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/utils';

/**
 * @component Spinner
 * @description Indeterminate loading indicator.
 * Inherits text color from parent by default (currentColor).
 */
const Spinner = ({ 
  className, 
  size = "md", 
  label = "Loading...", // Screen reader text
  ...props 
}) => {
  
  const sizes = {
    sm: "h-4 w-4",      // 16px (Buttons)
    md: "h-6 w-6",      // 24px (Cards)
    lg: "h-10 w-10",    // 40px (Page Center)
    xl: "h-16 w-16",    // 64px (Hero)
  };

  return (
    <div role="status" className="inline-flex items-center justify-center">
      <Loader2 
        className={cn(
          "animate-spin", 
          sizes[size], 
          className // Allows overriding color, e.g., 'text-red-600' or 'text-white'
        )} 
        {...props} 
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

export { Spinner };