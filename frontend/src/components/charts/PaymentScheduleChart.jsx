import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { cn } from '@/utils/utils';
import { formatCurrency } from '@/utils/currency';
import EmptyState from '@/components/ui/data/EmptyState';
import { BarChart3 } from 'lucide-react';

const PaymentScheduleChart = ({ data, className }) => {
  if (!data || data.length === 0) {
    return (
      <div className={cn("h-[350px] w-full flex items-center justify-center border border-dashed border-border rounded-lg bg-background-subtle", className)}>
        <EmptyState 
          icon={BarChart3}
          title="Schedule not generated" 
          description="Calculate your loan to view the amortization timeline." 
        />
      </div>
    );
  }

  // Formatting Y-Axis to show "10k", "20k" for cleaner look
  const formatYAxis = (value) => {
    if (value >= 1000) return `$${value / 1000}k`;
    return `$${value}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 text-xs border rounded-lg shadow-lg bg-background border-border">
          <p className="mb-2 font-bold text-content">Year {label}</p>
          <div className="space-y-1">
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-content-muted">Principal:</span>
                <span className="font-mono">{formatCurrency(payload[0].value)}</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-content-muted">Interest:</span>
                <span className="font-mono">{formatCurrency(payload[1].value)}</span>
             </div>
             <div className="flex items-center gap-2 pt-1 mt-1 border-t border-border">
                <span className="font-medium text-content">Balance:</span>
                <span className="font-mono">{formatCurrency(payload[0].payload.balance)}</span>
             </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("w-full h-[350px]", className)}>
      <h4 className="mb-4 text-sm font-semibold text-content">Amortization Schedule (Yearly)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#DC2626" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EA580C" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#EA580C" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey="year" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fontSize: 12, fill: '#64748B' }}
            tickFormatter={(value) => `Yr ${value}`}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fontSize: 12, fill: '#64748B' }} 
            tickFormatter={formatYAxis}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
          
          <Area 
            type="monotone" 
            dataKey="principal" 
            name="Principal Paid"
            stackId="1" 
            stroke="#DC2626" 
            fill="url(#colorPrincipal)" 
            animationDuration={1500}
          />
          <Area 
            type="monotone" 
            dataKey="interest" 
            name="Interest Paid"
            stackId="1" 
            stroke="#EA580C" 
            fill="url(#colorInterest)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentScheduleChart;