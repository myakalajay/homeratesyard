import React from 'react';
import { cn } from '@/utils/utils';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ error, className, ...props }) => {
  if (!error) return null;

  // Handle both string errors and RHF error objects
  const message = typeof error === 'string' ? error : error.message;

  if (!message) return null;

  return (
    <div 
      className={cn("flex items-center gap-x-1 mt-1.5 text-danger font-medium text-xs animate-accordion-down", className)} 
      {...props}
    >
      <AlertCircle className="w-3 h-3" />
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;