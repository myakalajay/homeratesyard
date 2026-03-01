import React, { useState } from 'react';
import { X, Megaphone } from 'lucide-react';
import { cn } from '@/utils/utils';

const NotificationBanner = ({ 
  title, 
  children, 
  variant = 'info', // info, warning, danger
  className 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const styles = {
    info: "bg-background-inverted text-content-inverted",
    warning: "bg-warning text-warning-text",
    danger: "bg-danger text-danger-text",
  };

  return (
    <div className={cn(
      "relative flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-all",
      styles[variant],
      className
    )}>
      <div className="container flex items-center gap-3 mx-auto">
        <Megaphone className="w-4 h-4 shrink-0 opacity-80" />
        <div className="flex flex-wrap gap-1">
           {title && <span className="font-bold">{title}:</span>}
           <span>{children}</span>
        </div>
      </div>
      
      <button
        onClick={() => setIsVisible(false)}
        className="p-1 ml-4 transition-all rounded-full shrink-0 opacity-70 hover:opacity-100 hover:bg-black/10"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default NotificationBanner;