import React from 'react';
import { cn } from '@/utils/utils';

const CircularProgress = ({ 
  size = 48, 
  strokeWidth = 4, 
  value, 
  max = 100,
  className 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = value ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const dashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-background-muted"
        />
        {/* Foreground Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out text-primary"
        />
      </svg>
      {/* Optional: Text in center */}
      {value !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-content">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

export default CircularProgress;