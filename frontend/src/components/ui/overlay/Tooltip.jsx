import React from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/utils/utils';

const Tooltip = ({ 
  text, 
  children, 
  position = "top", 
  className, 
  icon: Icon = HelpCircle, // 🟢 Default standard icon, but can be overridden
  iconSize = 14,
  iconClassName
}) => {
  // Graceful fallback if no text is provided
  if (!text) return <>{children}</>;

  // Tooltip bubble positioning logic
  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2.5 translate-y-1 group-hover:-translate-y-0.5 group-focus-within:-translate-y-0.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2.5 -translate-y-1 group-hover:translate-y-0.5 group-focus-within:translate-y-0.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-2.5 translate-x-1 group-hover:-translate-x-0.5 group-focus-within:-translate-x-0.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-2.5 -translate-x-1 group-hover:translate-x-0.5 group-focus-within:translate-x-0.5",
  };

  // Tooltip directional arrow logic
  const arrowPositions = {
    top: "top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-b-slate-900",
    left: "left-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-l-slate-900",
    right: "right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-slate-900",
  };

  return (
    <div className="relative inline-flex items-center justify-center group cursor-help">
      
      {/* Smart Fallback: Renders custom icon, default HelpCircle, or wrapped children */}
      {children ? children : (
         <Icon 
            size={iconSize} 
            className={cn(
              "transition-colors text-slate-400 group-hover:text-red-500", // 🟢 Standard baseline
              iconClassName // Allows override
            )} 
         />
      )}
      
      <div 
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-[1000] w-max max-w-[240px] text-left rounded-xl bg-slate-900 p-3 text-[11px] font-medium leading-relaxed text-white opacity-0 shadow-2xl shadow-slate-900/20 transition-all duration-300 ease-out scale-95 group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100",
          positions[position],
          className
        )}
      >
        {text}
        
        {/* Tooltip Arrow Indicator */}
        <div 
          className={cn(
            "absolute",
            arrowPositions[position]
          )}
        />
      </div>
    </div>
  );
};

export default Tooltip;