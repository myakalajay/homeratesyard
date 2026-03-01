import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/utils/utils';

const textVariants = cva(
  "text-content transition-colors",
  {
    variants: {
      size: {
        xs: "text-xs",
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
        xl: "text-xl",
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      },
      variant: {
        default: "text-content",
        muted: "text-content-muted",
        subtle: "text-content-subtle",
        primary: "text-primary",
        success: "text-success-text",
        warning: "text-warning-text",
        danger: "text-danger-text",
        inverted: "text-content-inverted",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      }
    },
    defaultVariants: {
      size: "base",
      weight: "normal",
      variant: "default",
      align: "left",
    },
  }
);

const Text = ({ as: Component = "span", size, weight, variant, align, className, children, ...props }) => {
  return (
    <Component 
      className={cn(textVariants({ size, weight, variant, align }), className)} 
      {...props}
    >
      {children}
    </Component>
  );
};

export default Text;