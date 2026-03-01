import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils/utils';

const InlineError = ({ message, className }) => {
  if (!message) return null;

  return (
    <div 
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium text-danger animate-accordion-down",
        className
      )}
    >
      <AlertCircle className="h-3.5 w-3.5" />
      <span>{message}</span>
    </div>
  );
};

export default InlineError;