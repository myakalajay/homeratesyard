import React from 'react';
import { cn } from '@/utils/utils';

export const List = ({ children, className }) => {
  return (
    <ul className={cn("flex flex-col w-full divide-y divide-border", className)}>
      {children}
    </ul>
  );
};

export const ListItem = ({ 
  children, 
  className, 
  onClick,
  action 
}) => {
  return (
    <li 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between py-4 px-1 group",
        onClick && "cursor-pointer hover:bg-background-muted/30 transition-colors rounded-sm px-2 -mx-2",
        className
      )}
    >
      <div className="flex items-center w-full min-w-0 gap-3">
        {children}
      </div>
      {action && (
        <div className="ml-4 shrink-0 text-content-muted">
          {action}
        </div>
      )}
    </li>
  );
};

export const ListItemIcon = ({ icon: Icon, className }) => {
  return (
    <div className={cn("h-10 w-10 rounded-full bg-background-muted flex items-center justify-center shrink-0", className)}>
      <Icon className="w-5 h-5 text-content" />
    </div>
  );
};

export const ListItemText = ({ primary, secondary, className }) => {
  return (
    <div className={cn("flex flex-col min-w-0", className)}>
      <span className="text-sm font-medium truncate text-content">{primary}</span>
      {secondary && <span className="text-xs truncate text-content-muted">{secondary}</span>}
    </div>
  );
};