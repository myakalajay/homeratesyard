import React from 'react';
import { cva } from 'class-variance-authority';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/utils/utils';

const alertVariants = cva(
  "relative w-full rounded-2xl border p-4 text-sm transition-all duration-300 flex gap-4 items-start shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-white text-slate-900 border-slate-200",
        destructive: "border-red-200 text-red-900 bg-red-50/50 [&>svg]:text-red-600",
        success: "border-emerald-200 text-emerald-900 bg-emerald-50/50 [&>svg]:text-emerald-600",
        warning: "border-amber-200 text-amber-900 bg-amber-50/50 [&>svg]:text-amber-600",
        info: "border-blue-200 text-blue-900 bg-blue-50/50 [&>svg]:text-blue-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Icons = {
  default: Info,
  destructive: XCircle,
  success: CheckCircle2,
  warning: AlertCircle,
  info: Info,
};

/**
 * @component Alert
 * @description Enhanced feedback component with high-contrast variants and accessibility gates.
 * @param {function} onClose - Optional callback to render a dismiss button.
 */
const Alert = React.forwardRef(({ 
  className, 
  variant = "default", 
  title, 
  children, 
  onClose,
  ...props 
}, ref) => {
  const Icon = Icons[variant] || Icons.default;

  return (
    <div
      ref={ref}
      role="alert"
      aria-live={variant === 'destructive' ? 'assertive' : 'polite'}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {/* Icon Container with Flex alignment safety */}
      <div className="shrink-0 mt-0.5">
        <Icon className="w-5 h-5" strokeWidth={2.5} />
      </div>

      {/* Content Container */}
      <div className="flex-1 min-w-0 space-y-1">
        {title && (
          <h5 className="font-bold leading-none tracking-tight">
            {title}
          </h5>
        )}
        <div className="text-sm font-medium leading-relaxed opacity-90">
          {children}
        </div>
      </div>

      {/* 🟢 NEW: Dismiss Button Logic */}
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 -mr-1 transition-colors rounded-lg shrink-0 opacity-40 hover:opacity-100 hover:bg-black/5"
          aria-label="Dismiss Alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
});

Alert.displayName = "Alert";

export default Alert;