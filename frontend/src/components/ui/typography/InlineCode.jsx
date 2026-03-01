import React from 'react';
import { cn } from '@/utils/utils';

const InlineCode = ({ children, className }) => {
  return (
    <code 
      className={cn(
        "relative rounded bg-background-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-content",
        className
      )}
    >
      {children}
    </code>
  );
};

export default InlineCode;