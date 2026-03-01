import React from 'react';
import { cn } from '@/utils/utils';

export const Tabs = ({ value, onValueChange, children, className }) => {
  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value, onValueChange });
        }
        return child;
      })}
    </div>
  );
};

export const TabsList = ({ children, className }) => {
  return (
    <div className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-background-muted p-1 text-content-muted",
      className
    )}>
      {children}
    </div>
  );
};

export const TabsTrigger = ({ value, onValueChange, activeValue, children, className, disabled }) => {
  // Logic to determine active state if managed by parent Tabs component
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => onValueChange && onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive 
          ? "bg-background text-content shadow-sm" 
          : "hover:bg-background/50 hover:text-content",
        className
      )}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, activeValue, children, className }) => {
  if (value !== activeValue) return null;

  return (
    <div
      role="tabpanel"
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 animate-fade-in",
        className
      )}
    >
      {children}
    </div>
  );
};