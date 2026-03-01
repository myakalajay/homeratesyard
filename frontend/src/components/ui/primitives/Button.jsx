'use client'; // 🟢 FIX: Ensures stability for interaction-heavy components

import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/utils';

const buttonVariants = cva(
  // 🟢 MICRO-ANIMATION BASE: Fluid easing, deeper active press, and 'group' for internal icon animations
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-white transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/10 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.97] group",
  {
    variants: {
      variant: {
        // 🟢 ELEVATION & GLOW: Buttons lift and cast wider colored shadows on hover
        default: "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/10 border border-transparent hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-600/20",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm border border-transparent hover:-translate-y-0.5 hover:shadow-md hover:shadow-red-500/20",
        outline: "border-2 border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 text-slate-700 hover:-translate-y-0.5 hover:shadow-sm",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200/80 hover:-translate-y-0.5 hover:shadow-sm",
        ghost: "hover:bg-slate-50 hover:text-red-600 text-slate-600 font-medium active:scale-95", // Ghost stays flat but squishes more
        link: "text-red-600 underline-offset-4 hover:underline active:scale-100", // Links shouldn't scale or lift
        white: "bg-white text-slate-900 hover:bg-slate-50 shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-6 py-2.5", 
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-full px-10 text-base font-semibold", 
        xl: "h-16 rounded-full px-12 text-lg font-semibold", 
        icon: "h-10 w-10 active:scale-90", // Icons get a deeper click animation
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * @component Button
 * @description Enterprise-grade button component synced with V3 branding and fluid micro-animations.
 * Includes loading states, full-width support, and Polymorphic Slot capabilities.
 */
const Button = React.forwardRef(({ 
  className, 
  variant, 
  size, 
  asChild = false, 
  loading = false, 
  fullWidth = false, 
  children, 
  disabled,
  ...props 
}, ref) => {
  
  const Comp = asChild ? Slot : "button";
  const isDisabled = disabled || loading;

  return (
    <Comp
      className={cn(
        buttonVariants({ variant, size, className }),
        fullWidth ? "w-full" : ""
      )}
      ref={ref}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />
          {/* Prevent text shift by keeping children visible but slightly transparent */}
          <span className="opacity-70">{children}</span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;