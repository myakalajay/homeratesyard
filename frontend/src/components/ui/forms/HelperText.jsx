import React from 'react';
import { cn } from '@/utils/utils';

const HelperText = ({ children, className, ...props }) => {
  if (!children) return null;
  
  return (
    <p 
      className={cn("text-[0.8rem] text-content-muted mt-1.5", className)} 
      {...props}
    >
      {children}
    </p>
  );
};

export default HelperText;