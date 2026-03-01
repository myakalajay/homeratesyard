import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { cn } from '@/utils/utils';
import { formatCurrency } from '@/utils/currency';
import EmptyState from '@/components/ui/data/EmptyState';
import { PieChart as PieIcon } from 'lucide-react';

const LoanBreakdownChart = ({ principal, totalInterest, className }) => {
  // Handle empty or invalid data
  if (!principal || !totalInterest) {
    return (
      <div className={cn("h-[300px] w-full flex items-center justify-center border border-dashed border-border rounded-lg bg-background-subtle", className)}>
        <EmptyState 
          icon={PieIcon}
          title="No breakdown available" 
          description="Enter loan details to see the principal vs interest split." 
        />
      </div>
    );
  }

  const data = [
    { name: 'Principal Amount', value: principal },
    { name: 'Total Interest', value: totalInterest },
  ];

  const COLORS = ['#DC2626', '#EA580C']; // Primary (Red), Secondary (Orange)

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 border rounded-lg shadow-lg bg-background border-border">
          <p className="mb-1 text-sm font-semibold">{payload[0].name}</p>
          <p className="font-bold text-primary">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("w-full h-[300px]", className)}>
      <h4 className="mb-4 text-sm font-semibold text-center text-content">Total Payment Breakdown</h4>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            formatter={(value, entry) => (
              <span className="ml-1 text-sm text-content-muted">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LoanBreakdownChart;