import React from 'react';
import { cn } from '@/utils/utils';

const Grid = React.forwardRef(({ 
  className, 
  children, 
  cols = 1, // Default to single column mobile
  gap = 4, 
  ...props 
}, ref) => {
  
  // Mapping simplistic column counts to responsive Tailwind classes
  // Default is mobile-first (1 col), then breaks out at md/lg
  const responsiveCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    12: "grid-cols-12", // For complex layouts
  };

  const gaps = {
    0: "gap-0",
    2: "gap-2",
    4: "gap-4",
    6: "gap-6",
    8: "gap-8",
    10: "gap-10",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "grid",
        responsiveCols[cols] || `grid-cols-${cols}`,
        gaps[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Grid.displayName = "Grid";

export default Grid;