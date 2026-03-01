import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { cn } from '@/utils/utils';
import { formatCurrency } from '@/utils/currency';
import { Input } from '@/components/ui/primitives/Input';
import { Label } from '@/components/ui/forms/Label';

export default function EMIWidget({ className }) {
  const [amount, setAmount] = useState(50000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(5);
  const [emi, setEmi] = useState(0);

  useEffect(() => {
    // EMI Calculation: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const r = rate / 12 / 100;
    const n = years * 12;
    const calc = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setEmi(calc);
  }, [amount, rate, years]);

  return (
    <div className={cn("rounded-xl border border-border bg-background shadow-sm overflow-hidden", className)}>
      <div className="flex items-center gap-2 p-4 border-b bg-background-subtle border-border">
        <div className="bg-primary/10 p-1.5 rounded-md text-primary">
          <Calculator className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-semibold text-content">Quick EMI Estimate</h3>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-1">
          <Label className="text-xs">Loan Amount</Label>
          <Input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))}
            className="h-8 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Interest (%)</Label>
            <Input 
              type="number" 
              step="0.1" 
              value={rate} 
              onChange={(e) => setRate(Number(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Duration (Yrs)</Label>
            <Input 
              type="number" 
              value={years} 
              onChange={(e) => setYears(Number(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
        </div>

        <div className="pt-2">
          <div className="p-3 text-center rounded-lg bg-primary-subtle">
             <p className="text-xs font-medium tracking-wide uppercase text-primary">Monthly Payment</p>
             <p className="text-2xl font-bold tracking-tight text-primary tabular-nums">
               {formatCurrency(emi)}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}