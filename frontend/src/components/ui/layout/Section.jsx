import React from 'react';
import { cn } from '@/utils/utils';

const Section = React.forwardRef(({ 
  className, 
  children, 
  variant = "default", // default, muted, brand
  padding = "default", // none, sm, default, lg
  ...props 
}, ref) => {
  
  const variants = {
    default: "bg-background text-content",
    muted: "bg-background-muted text-content",
    brand: "bg-primary text-primary-text",
    inverted: "bg-background-inverted text-content-inverted",
  };

  const paddings = {
    none: "py-0",
    sm: "py-6 sm:py-8",
    default: "py-12 sm:py-16",
    lg: "py-20 sm:py-24",
  };

  return (
    <section
      ref={ref}
      className={cn(
        "relative w-full",
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
});
Section.displayName = "Section";

export default Section;