import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/utils';

const Loader = ({ 
  variant = 'default', // 'default' (inline), 'overlay' (full screen blocking)
  size = 'md',
  text = 'Loading...',
  className 
}) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 p-4 rounded-lg animate-fade-in">
          <Loader2 className={cn("animate-spin text-primary", sizes['lg'])} />
          {text && <p className="text-sm font-medium text-content-muted">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center gap-2 p-4", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizes[size])} />
      {text && <span className="text-sm text-content-muted">{text}</span>}
    </div>
  );
};

export default Loader;