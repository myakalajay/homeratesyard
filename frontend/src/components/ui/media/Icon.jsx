import React from 'react';
import { cn } from '@/utils/utils';

/**
 * @component Icon
 * @description Standardized wrapper for Lucide icons to enforce size and color tokens.
 */
const Icon = ({ icon: LucideIcon, size = "md", color, className, ...props }) => {
  if (!LucideIcon) return null;

  const sizes = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
    "2xl": "h-12 w-12",
  };

  const colors = {
    default: "text-content",
    muted: "text-content-muted",
    subtle: "text-content-subtle",
    primary: "text-primary",
    secondary: "text-secondary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    inverted: "text-content-inverted",
  };

  return (
    <LucideIcon 
      className={cn(
        "shrink-0",
        sizes[size],
        color && colors[color],
        className
      )} 
      {...props} 
    />
  );
};

export default Icon;