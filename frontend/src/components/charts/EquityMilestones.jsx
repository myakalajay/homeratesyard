'use client';

import React from 'react';
import { ShieldCheck, Home, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/utils';

/**
 * @component EquityMilestones
 * @description Visualizes key homeownership milestones based on the amortization strategy.
 */
export function EquityMilestones({ schedule, homePrice }) {
  if (!schedule || schedule.length === 0) return null;

  // Calculate specific milestones
  const milestones = [
    { 
      label: 'PMI Exit', 
      pct: 20, 
      target: homePrice * 0.20, 
      icon: ShieldCheck, 
      color: 'text-orange-500', 
      bg: 'bg-orange-50' 
    },
    { 
      label: 'Equity Split', 
      pct: 50, 
      target: homePrice * 0.50, 
      icon: Target, 
      color: 'text-blue-500', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Full Ownership', 
      pct: 100, 
      target: homePrice, 
      icon: Home, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50' 
    },
  ];

  // Find the years these milestones are reached
  const milestoneData = milestones.map(m => {
    const yearData = schedule.find(s => s.equity >= m.target) || schedule[schedule.length - 1];
    return { ...m, year: yearData.year };
  });

  return (
    <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp size={22} className="text-emerald-500" />
        <h3 className="text-xl font-bold text-slate-900">Wealth Accumulation Timeline</h3>
      </div>

      <div className="relative flex flex-col justify-between gap-8 md:flex-row md:gap-4">
        {/* Progress Line Connector (Desktop) */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 hidden md:block" />

        {milestoneData.map((m, idx) => (
          <div key={m.label} className="relative z-10 flex flex-col items-center flex-1 text-center group">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 shadow-sm border border-white",
              m.bg, m.color
            )}>
              <m.icon size={28} />
            </div>
            
            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</span>
              <span className="block text-lg font-bold text-slate-900">Year {m.year}</span>
              <span className="block text-xs font-medium text-slate-500">${m.target.toLocaleString()} Equity</span>
            </div>

            {/* Status Indicator */}
            <div className={cn(
                "mt-4 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter",
                idx === 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-400"
            )}>
              {idx === 0 ? "Priority Target" : "Future Milestone"}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 mt-10 border bg-slate-50 rounded-2xl border-slate-100">
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed text-center">
          *Projections assume home value remains stable. Adding <strong>extra payments</strong> will shift these years closer to the present.
        </p>
      </div>
    </section>
  );
}