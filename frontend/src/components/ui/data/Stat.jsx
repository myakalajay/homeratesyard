import React from 'react';
import { cn } from '@/utils/utils';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

/**
 * @component Stat
 * @description Displays a single metric with a label, value, and optional trend.
 */
const Stat = ({ 
  label, 
  value, 
  trend, // number (percentage)
  trendLabel, 
  icon: Icon,
  className 
}) => {
  const isPositive = trend > 0;
  const isNeutral = trend === 0;
  const isNegative = trend < 0;

  return (
    <div className={cn("rounded-lg border border-border bg-background p-6 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-content-muted">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-content-muted" />}
      </div>
      
      <div className="flex items-baseline gap-2 mt-2">
        <h3 className="text-2xl font-bold tracking-tight text-content tabular-nums">
          {value}
        </h3>
      </div>

      {(trend !== undefined || trendLabel) && (
        <div className="flex items-center mt-3 text-xs">
           <span className={cn(
             "flex items-center font-medium",
             isPositive && "text-success",
             isNegative && "text-danger",
             isNeutral && "text-content-muted"
           )}>
             {isPositive && <ArrowUpRight className="w-3 h-3 mr-1" />}
             {isNegative && <ArrowDownRight className="w-3 h-3 mr-1" />}
             {isNeutral && <Minus className="w-3 h-3 mr-1" />}
             {Math.abs(trend)}%
           </span>
           {trendLabel && (
             <span className="ml-2 text-xs text-content-muted">
               {trendLabel}
             </span>
           )}
        </div>
      )}
    </div>
  );
};

export default Stat;