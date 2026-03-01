import React, { useState, useMemo } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/utils/utils';

// 1. Consistent Sizing Variants
const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full transition-opacity hover:opacity-90",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-[10px]",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-14 w-14 text-base",
        xl: "h-20 w-20 text-xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const statusVariants = cva(
  "absolute bottom-0 right-0 rounded-full ring-2 ring-white",
  {
    variants: {
      status: {
        online: "bg-green-500",
        offline: "bg-slate-400",
        busy: "bg-red-500",
        away: "bg-amber-500",
      },
      size: {
        xs: "h-1.5 w-1.5",
        sm: "h-2 w-2",
        md: "h-2.5 w-2.5",
        lg: "h-3.5 w-3.5",
        xl: "h-5 w-5",
      }
    },
    defaultVariants: {
      status: "online",
      size: "md",
    }
  }
);

// 2. Helper: Generate consistent pastel color from string
const generateColor = (name) => {
  if (!name) return 'bg-slate-200 text-slate-600';
  
  const colors = [
    'bg-red-100 text-red-700',
    'bg-orange-100 text-orange-700',
    'bg-amber-100 text-amber-700',
    'bg-green-100 text-green-700',
    'bg-emerald-100 text-emerald-700',
    'bg-teal-100 text-teal-700',
    'bg-cyan-100 text-cyan-700',
    'bg-blue-100 text-blue-700',
    'bg-indigo-100 text-indigo-700',
    'bg-violet-100 text-violet-700',
    'bg-purple-100 text-purple-700',
    'bg-fuchsia-100 text-fuchsia-700',
    'bg-pink-100 text-pink-700',
    'bg-rose-100 text-rose-700',
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

const Avatar = ({ 
  src, 
  alt, 
  initials, 
  className, 
  size = "md",
  status, // 'online' | 'offline' | 'busy' | 'away'
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);
  
  // Memoize color so it doesn't flicker on re-renders
  const fallbackColorClass = useMemo(() => 
    generateColor(initials || alt), 
  [initials, alt]);

  // Derived Initials logic
  const displayInitials = initials 
    ? initials.slice(0, 2).toUpperCase()
    : alt 
      ? alt.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
      : "?";

  return (
    <div className="relative inline-block">
      <div 
        className={cn(avatarVariants({ size }), className)} 
        {...props}
      >
        {!hasError && src ? (
          <img
            src={src}
            alt={alt || "Avatar"}
            className="object-cover w-full h-full aspect-square"
            onError={() => setHasError(true)}
            loading="lazy"
          />
        ) : (
          <div className={cn(
            "flex items-center justify-center w-full h-full font-bold select-none",
            fallbackColorClass
          )}>
            {displayInitials}
          </div>
        )}
      </div>

      {/* 3. Status Indicator (Optional) */}
      {status && (
        <span className={cn(statusVariants({ status, size }))} />
      )}
    </div>
  );
};

export { Avatar };