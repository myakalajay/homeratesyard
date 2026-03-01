import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/utils/utils';

const headingVariants = cva(
  "font-bold text-content tracking-tight",
  {
    variants: {
      level: {
        1: "text-4xl sm:text-5xl font-extrabold",
        2: "text-3xl sm:text-4xl font-bold",
        3: "text-2xl sm:text-3xl font-bold",
        4: "text-xl sm:text-2xl font-semibold",
        5: "text-lg sm:text-xl font-semibold",
        6: "text-base font-semibold",
      },
      gradient: {
        true: "bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent",
      }
    },
    defaultVariants: {
      level: 1,
      gradient: false,
    },
  }
);

const Heading = ({ level = 1, children, className, gradient, ...props }) => {
  const Component = `h${Math.min(Math.max(level, 1), 6)}`;

  return (
    <Component 
      className={cn(headingVariants({ level, gradient }), className)} 
      {...props}
    >
      {children}
    </Component>
  );
};

export default Heading;