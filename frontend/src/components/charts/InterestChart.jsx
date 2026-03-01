import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { cn } from '@/utils/utils';
import EmptyState from '@/components/ui/data/EmptyState';
import { TrendingUp } from 'lucide-react';

const InterestChart = ({ data, className, showForecast = true }) => {
  if (!data || data.length === 0) {
    return (
      <div className={cn("h-[300px] w-full flex items-center justify-center border border-dashed border-border rounded-lg bg-background-subtle", className)}>
        <EmptyState 
          icon={TrendingUp}
          title="Market Data Unavailable" 
          description="Unable to load current interest rate trends." 
        />
      </div>
    );
  }

  // Find the min/max for the Y-Axis domain to make the chart look dynamic
  const values = data.map(d => parseFloat(d.value));
  const minVal = Math.min(...values) - 0.1;
  const maxVal = Math.max(...values) + 0.1;

  // Split data into historical and forecast segments for different styling
  const historicalData = data.filter(d => !d.isForecast);
  // Forecast starts from the last historical point to connect the lines
  const forecastData = [historicalData[historicalData.length - 1], ...data.filter(d => d.isForecast)];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isForecast = payload[0].payload.isForecast;
      return (
        <div className="p-2 text-xs border rounded shadow-md bg-background border-border">
          <p className="mb-1 text-content-muted">{label} {isForecast && '(Forecast)'}</p>
          <p className="text-sm font-bold text-primary">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("w-full h-[300px]", className)}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-content">30-Year Fixed Rate Trend</h4>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
             <span className="w-3 h-0.5 bg-primary"></span>
             <span className="text-content-muted">Historical</span>
          </div>
          {showForecast && (
            <div className="flex items-center gap-1">
               <span className="w-3 h-0.5 bg-secondary border-t border-dashed border-secondary"></span>
               <span className="text-content-muted">Forecast</span>
            </div>
          )}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey="date" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fontSize: 10, fill: '#64748B' }}
            interval={4} // Show every 4th label to avoid clutter
          />
          <YAxis 
            domain={[minVal, maxVal]} 
            tickLine={false} 
            axisLine={false} 
            tick={{ fontSize: 10, fill: '#64748B' }}
            tickFormatter={(val) => `${val.toFixed(2)}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Historical Line (Solid) */}
          <Line 
            data={data} // Pass full data but hide forecast points via strokeDasharray trick or separated lines
            type="monotone" 
            dataKey="value" 
            stroke="#DC2626" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />

          {/* Reference Line for "Today" if forecast exists */}
          {showForecast && (
             <ReferenceLine x={historicalData[historicalData.length-1].date} stroke="#94A3B8" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fontSize: 10, fill: '#64748B' }} />
          )}

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InterestChart;