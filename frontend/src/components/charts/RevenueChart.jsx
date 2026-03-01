import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { cn } from '@/utils/utils';
import { formatCurrency } from '@/utils/currency';
import EmptyState from '@/components/ui/data/EmptyState';
import { BarChart2 } from 'lucide-react';

const RevenueChart = ({ data, className, title = "Monthly Payment Comparison" }) => {
  if (!data || data.length === 0) {
     return (
       <div className={cn("h-[250px] w-full flex items-center justify-center border border-dashed border-border rounded-lg bg-background-subtle", className)}>
         <EmptyState icon={BarChart2} title="No comparison data" />
       </div>
     );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 text-xs border rounded shadow-sm bg-background border-border">
          <p className="mb-1 text-content-muted">{label}</p>
          <p className="font-bold text-content">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("w-full h-[250px]", className)}>
      <h4 className="mb-4 text-sm font-semibold text-content">{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical" // Horizontal bars for easier comparison labels
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            tickLine={false} 
            axisLine={false}
            tick={{ fontSize: 12, fill: '#0F172A', fontWeight: 500 }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.highlight ? '#10B981' : '#CBD5E1'} // Green for "Savings/New", Grey for "Old"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;