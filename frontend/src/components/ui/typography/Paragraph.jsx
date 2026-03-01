import React from 'react';
import { cn } from '@/utils/utils';

const Paragraph = ({ className, children, size = "base", ...props }) => {
  const sizes = {
    sm: "text-sm leading-6",
    base: "text-base leading-7",
    lg: "text-lg leading-8",
  };

  return (
    <p 
      className={cn(
        "text-content-subtle [&:not(:first-child)]:mt-6", 
        sizes[size],
        className
      )} 
      {...props}
    >
      {children}
    </p>
  );
};

export default Paragraph;