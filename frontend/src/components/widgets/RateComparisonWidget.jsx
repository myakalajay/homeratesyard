import React from 'react';
import { cn } from '@/utils/utils';
import { Badge } from '@/components/ui/primitives/Badge';
import { Check, X } from 'lucide-react';

const rates = [
  { bank: "Big Bank Corp", rate: "7.25%", fee: "$1,200", isUs: false },
  { bank: "Traditional lender", rate: "7.15%", fee: "$950", isUs: false },
  { bank: "FintechApp", rate: "6.85%", fee: "$0", isUs: true },
];

export default function RateComparisonWidget({ className }) {
  return (
    <div className={cn("rounded-xl border border-border bg-background overflow-hidden", className)}>
      <div className="p-4 border-b border-border">
        <h3 className="font-bold text-content">Why choose us?</h3>
        <p className="text-sm text-content-muted">Live comparison based on today's market.</p>
      </div>
      
      <div className="divide-y divide-border">
        {rates.map((item, idx) => (
          <div 
            key={idx} 
            className={cn(
              "flex items-center justify-between p-4 transition-colors",
              item.isUs ? "bg-primary-subtle/30" : "bg-transparent"
            )}
          >
            <div className="flex flex-col">
              <span className={cn("font-medium text-sm", item.isUs ? "text-primary font-bold" : "text-content")}>
                {item.bank}
                {item.isUs && <Badge variant="default" className="ml-2 text-[10px] h-5 px-1.5">BEST</Badge>}
              </span>
              <span className="text-xs text-content-muted">Org. Fee: {item.fee}</span>
            </div>
            
            <div className="text-right">
              <span className={cn("block font-bold", item.isUs ? "text-xl text-primary" : "text-lg text-content-muted")}>
                {item.rate}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 text-center bg-background-muted">
         <p className="text-[10px] text-content-muted">
           *Rates are estimates based on credit score of 740+. Terms apply.
         </p>
      </div>
    </div>
  );
}