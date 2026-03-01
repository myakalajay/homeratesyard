import React from 'react';
import { cn } from '@/utils/utils';

const Container = React.forwardRef(({ className, children, size = "lg", ...props }, ref) => {
  const sizes = {
    sm: "max-w-3xl", // Blog post / Form
    md: "max-w-5xl", // Dashboard widgets
    lg: "max-w-7xl", // Standard Dashboard
    xl: "max-w-[1400px]", // Wide tables
    fluid: "max-w-full", // Full width
  };

  return (
    <div
      ref={ref}
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Container.displayName = "Container";

export default Container;