import React from 'react';
import { cn } from '@/utils/utils';

/**
 * @component Skeleton
 * @description A placeholder component that mimics the shape of content while it loads.
 * Usage: <Skeleton className="h-4 w-[250px]" />
 */
function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };