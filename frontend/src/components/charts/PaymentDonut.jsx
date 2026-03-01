'use client';

import React, { useState } from 'react';
import { cn } from '@/utils/utils';

/**
 * @component PaymentDonut
 * @description Interactive SVG-based chart. Hovering segments updates center intelligence data.
 */
export function PaymentDonut({ pni, tax, ins, hoa }) {
  const [activeSegment, setActiveSegment] = useState(null);

  // 1. DATA SANITIZATION
  const safeValues = {
    pni: Math.max(0, Number(pni) || 0),
    tax: Math.max(0, Number(tax) || 0),
    ins: Math.max(0, Number(ins) || 0),
    hoa: Math.max(0, Number(hoa) || 0),
  };

  const total = Object.values(safeValues).reduce((a, b) => a + b, 0);
  
  if (total <= 0) {
    return (
      <div className="relative flex items-center justify-center w-64 h-64 mx-auto rounded-full bg-slate-50 border-[16px] border-slate-100 shadow-inner group">
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Awaiting Data</span>
      </div>
    );
  }

  // 2. SEGMENT MAPPING
  const pniPct = (safeValues.pni / total) * 100;
  const taxPct = (safeValues.tax / total) * 100;
  const insPct = (safeValues.ins / total) * 100;
  const hoaPct = (safeValues.hoa / total) * 100;

  const segments = [
    { id: 'pni', label: 'Principal & Interest', value: safeValues.pni, color: '#dc2626', pct: pniPct },
    { id: 'tax', label: 'Property Taxes', value: safeValues.tax, color: '#f97316', pct: taxPct },
    { id: 'ins', label: 'Insurance & PMI', value: safeValues.ins, color: '#10b981', pct: insPct },
    { id: 'hoa', label: 'HOA Fees', value: safeValues.hoa, color: '#2563eb', pct: hoaPct },
  ];

  // 3. SVG ARC CALCULATIONS
  let currentOffset = 0;
  const strokeWidth = 14;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative flex items-center justify-center w-64 h-64 mx-auto duration-700 select-none animate-in fade-in zoom-in-95">
      
      {/* SVG RING */}
      <svg className="absolute inset-0 w-full h-full overflow-visible transform -rotate-90" viewBox="0 0 100 100">
        {segments.map((seg) => {
          const dashArray = (seg.pct * circumference) / 100;
          const dashOffset = (currentOffset * circumference) / 100;
          currentOffset += seg.pct;

          if (seg.pct <= 0) return null;

          return (
            <circle
              key={seg.id}
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashArray} ${circumference}`}
              strokeDashoffset={-dashOffset}
              strokeLinecap="butt"
              className={cn(
                "transition-all duration-500 cursor-crosshair",
                activeSegment && activeSegment.id !== seg.id ? "opacity-20 blur-[1px]" : "opacity-100"
              )}
              style={{
                strokeWidth: activeSegment?.id === seg.id ? strokeWidth + 4 : strokeWidth,
                filter: activeSegment?.id === seg.id ? `drop-shadow(0 0 8px ${seg.color}40)` : 'none'
              }}
              onMouseEnter={() => setActiveSegment(seg)}
              onMouseLeave={() => setActiveSegment(null)}
            />
          );
        })}
      </svg>

      {/* CENTER INTELLIGENCE PANEL */}
      <div className="absolute flex flex-col items-center justify-center bg-white rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] inset-[24px] z-10 border border-slate-50">
        <div className="px-4 text-center">
          <span 
            className={cn(
              "block text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5 transition-all duration-300",
              activeSegment ? "scale-110" : "text-slate-400"
            )} 
            style={{ color: activeSegment?.color || '#94a3b8' }}
          >
            {activeSegment ? activeSegment.label : 'Total Monthly'}
          </span>
          
          <div className="flex items-baseline justify-center text-slate-900">
            <span className="text-sm font-bold mr-0.5">$</span>
            <span className="text-4xl font-bold leading-none tracking-tighter tabular-nums">
              {Math.round(activeSegment ? activeSegment.value : total).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-center h-4 mt-2">
            {activeSegment ? (
              <div className="flex items-center gap-1 animate-in fade-in slide-in-from-bottom-1">
                <span className="text-[10px] font-bold text-slate-500">
                  {Math.round(activeSegment.pct)}% of Total
                </span>
              </div>
            ) : (
              <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-slate-400">
                Purchase Strategy
              </span>
            )}
          </div>
        </div>
      </div>

      {/* DECORATIVE OUTER RING */}
      <div className="absolute inset-[10px] rounded-full border border-slate-100/50 pointer-events-none" />
    </div>
  );
}