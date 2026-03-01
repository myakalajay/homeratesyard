import React from 'react';
import { cn } from '@/utils/utils';

const DataGrid = ({ 
  children, 
  columns = 3, // Default desktop columns
  gap = 6, 
  className 
}) => {
  // Map column count to Tailwind classes
  const gridCols = {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  };

  const gapSize = {
    2: "gap-2",
    4: "gap-4",
    6: "gap-6",
    8: "gap-8",
  };

  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2", // Default mobile/tablet
      gridCols[columns], 
      gapSize[gap],
      className
    )}>
      {children}
    </div>
  );
};

export default DataGrid;