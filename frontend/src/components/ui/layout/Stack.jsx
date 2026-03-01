import React from 'react';
import { cn } from '@/utils/utils';

const Stack = React.forwardRef(({ 
  className, 
  children, 
  direction = "col", // col, row
  gap = 4, 
  align = "stretch", // start, center, end, stretch
  justify = "start", // start, center, end, between
  wrap = false,
  ...props 
}, ref) => {

  const directions = {
    col: "flex-col",
    row: "flex-row",
  };

  const gaps = {
    0: "gap-0",
    1: "gap-1",
    2: "gap-2",
    4: "gap-4",
    6: "gap-6",
    8: "gap-8",
  };

  const alignments = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  const justifications = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "flex",
        directions[direction],
        gaps[gap],
        alignments[align],
        justifications[justify],
        wrap && "flex-wrap",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Stack.displayName = "Stack";

export default Stack;