import React from 'react';
import { cn } from '@/utils/utils';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = PackageOpen, 
  title = "No data available", 
  description = "There is nothing to show here yet.", 
  action,
  className 
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-border-subtle rounded-lg bg-background-subtle/50",
      className
    )}>
      <div className="p-4 mb-4 rounded-full shadow-sm bg-background ring-1 ring-border-subtle">
        <Icon className="w-8 h-8 text-content-muted" />
      </div>
      
      <h3 className="mb-1 text-lg font-semibold text-content">
        {title}
      </h3>
      
      <p className="max-w-sm mb-6 text-sm text-content-muted text-balance">
        {description}
      </p>

      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;