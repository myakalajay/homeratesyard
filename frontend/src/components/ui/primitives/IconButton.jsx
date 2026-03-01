import React from 'react';
import { Button } from '@/components/ui/primitives/Button'; // Import our enhanced Button
import { cn } from '@/utils/utils';

const IconButton = React.forwardRef(({ 
  className, 
  icon: Icon, 
  label, 
  tooltip,
  variant = "ghost", // Default to ghost for icons
  size = "icon",
  loading = false,
  ...props 
}, ref) => {
  
  // 🟢 A11Y GUARD: Ensure we have a label for screen readers
  if (!label && !props['aria-label']) {
    console.warn('IconButton: "label" prop is required for accessibility.');
  }

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn("rounded-full", className)}
      aria-label={label}
      title={tooltip || label} // Native tooltip fallback
      loading={loading}
      {...props}
    >
      {/* If loading, the Button component handles the spinner.
        If not loading, we render the passed Icon.
      */}
      {!loading && Icon && (
        <Icon className="w-5 h-5" aria-hidden="true" />
      )}
    </Button>
  );
});

IconButton.displayName = "IconButton";

export { IconButton };