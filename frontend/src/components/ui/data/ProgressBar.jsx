import React from 'react';
import { cn } from '@/utils/utils';

/**
 * @component ProgressBar
 * @description Linear progress indicator.
 * @param {number} value - 0 to 100
 */
const ProgressBar = ({ value = 0, max = 100, className, colorClass = "bg-primary" }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-background-muted", className)}
    >
      <div
        className={cn("h-full transition-all duration-500 ease-in-out", colorClass)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;