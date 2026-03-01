import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/utils/utils';

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap select-none",
  {
    variants: {
      variant: {
        // 🟢 STATUS VARIANTS (Subtle Styles for Dashboard)
        default: "border-transparent bg-slate-900 text-white shadow hover:bg-slate-800",
        secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200",
        
        // Semantic Statuses
        destructive: "border-transparent bg-red-100 text-red-700 hover:bg-red-200", // e.g. "Rejected"
        success: "border-transparent bg-green-100 text-green-700 hover:bg-green-200", // e.g. "Approved"
        warning: "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200", // e.g. "Pending"
        info: "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200",       // e.g. "Draft"
        
        outline: "text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-[1px] text-[10px]", // Compact for dense tables
        lg: "px-3 py-1 text-sm", // For headers
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Badge({ className, variant, size, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };