import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/utils';

const Stepper = ({ steps, currentStep, className }) => {
  return (
    <div className={cn("w-full", className)}>
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <li key={index} className={cn("flex items-center", isLast ? "w-auto" : "w-full")}>
              <div className="relative flex items-center">
                <div 
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors z-10",
                    isCompleted ? "bg-primary border-primary text-white" : 
                    isCurrent ? "border-primary bg-background text-primary" : 
                    "border-border bg-background text-content-muted"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="absolute -translate-x-1/2 top-10 left-1/2 whitespace-nowrap">
                   <span className={cn(
                     "text-xs font-medium",
                     isCurrent ? "text-primary" : "text-content-muted"
                   )}>
                     {step.label}
                   </span>
                </div>
              </div>

              {!isLast && (
                <div className={cn(
                  "flex-auto h-[2px] transition-colors mx-2",
                  isCompleted ? "bg-primary" : "bg-border"
                )} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default Stepper;