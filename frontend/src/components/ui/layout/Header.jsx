import React from 'react';
import { cn } from '@/utils/utils';

const Header = ({ 
  title, 
  description, 
  actions, 
  breadcrumbs, 
  className 
}) => {
  return (
    <div className={cn("flex flex-col gap-4 pb-6 border-b border-border mb-6", className)}>
      {/* Breadcrumbs Area */}
      {breadcrumbs && (
        <div className="mb-1">
          {breadcrumbs}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Title & Description */}
        <div className="space-y-1">
          {title && (
            <h1 className="text-2xl font-bold tracking-tight text-content">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-sm text-content-muted">
              {description}
            </p>
          )}
        </div>

        {/* Action Buttons (e.g., "Create New") */}
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;