'use client';

import React, { useState } from 'react';
import Head from 'next/head';

// Layout & Branding
import PublicLayout from '@/components/layout/PublicLayout';
import Logo from '@/components/navigation/shared/Logo';
import { TrustBadgeRow } from '@/components/navigation/shared/TrustBadges';

// Primitives
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Checkbox } from '@/components/ui/primitives/Checkbox';
import { Button } from '@/components/ui/primitives/Button';

// Icons
import { 
  Mail, Lock, Globe, Home, 
  CheckCircle2, Search, Zap,
  ChevronRight, PieChart
} from 'lucide-react';
import { cn } from '@/utils/utils';

export default function ComponentLab() {
  // FORM STATE
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    agree: false,
  });

  const [errors] = useState({
    email: 'Invalid business email format.',
    role: null
  });

  return (
    <PublicLayout>
      <Head>
        <title>UI Component Lab | HomeRatesYard</title>
      </Head>

      <div className="min-h-screen pb-24 bg-slate-50 selection:bg-red-50 selection:text-red-600">
        {/* --- LAB HEADER --- */}
        <div className="mb-12 bg-white border-b border-slate-200">
          <div className="px-6 py-12 mx-auto max-w-7xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest mb-4 border border-red-100">
              <Zap size={12} fill="currentColor" /> System Health: Optimal
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Enterprise Component Lab</h1>
            <p className="mt-2 text-lg font-medium text-slate-500">Verified production primitives & data visualizations for v2.0</p>
          </div>
        </div>

        <div className="px-6 mx-auto space-y-16 max-w-7xl">
          
          {/* --- ROW 1: UI PRIMITIVES --- */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            
            {/* COL 1: IDENTITY & TRUST */}
            <div className="space-y-8">
              <section className="space-y-4">
                <SectionHeader title="Brand Identity" />
                <div className="p-8 space-y-8 bg-white border shadow-sm border-slate-100 rounded-3xl">
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Light Mode</p>
                    <Logo variant="default" link={false} />
                  </div>
                  <div className="p-6 space-y-2 bg-slate-950 rounded-2xl">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Dark Mode</p>
                    <Logo variant="dark" link={false} />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <SectionHeader title="Compliance Badges" />
                <div className="p-8 bg-white border shadow-sm border-slate-100 rounded-3xl">
                   <TrustBadgeRow className="opacity-100 grayscale-0" />
                </div>
              </section>
            </div>

            {/* COL 2: FORM PRIMITIVES */}
            <div className="space-y-8 lg:col-span-1">
              <section className="space-y-4">
                <SectionHeader title="Inputs & Selects" />
                <div className="p-8 space-y-6 bg-white border shadow-xl border-slate-100 rounded-[2rem]">
                  <Input 
                    label="Email Address"
                    icon={Mail}
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  <Input 
                    label="Password (Error State)"
                    icon={Lock}
                    error={errors.email}
                    placeholder="••••••••"
                    type="password"
                  />
                  <Select 
                    label="Loan Product"
                    icon={Home}
                    placeholder="Select a product"
                    options={[
                      { label: '30-Year Fixed Conventional', value: '30f' },
                      { label: '15-Year Fixed Conventional', value: '15f' },
                      { label: 'FHA Purchase', value: 'fha' }
                    ]}
                  />
                  <Checkbox 
                    label="Accept Digital Disclosures"
                    description="Allow electronic delivery of loan documents."
                    checked={formData.agree}
                    onChange={(e) => setFormData({...formData, agree: e.target.checked})}
                  />
                </div>
              </section>
            </div>

            {/* COL 3: THEMED ACTIONS */}
            <div className="space-y-8">
              <section className="space-y-4">
                <SectionHeader title="Action Theme" />
                <div className="p-8 space-y-4 bg-white border shadow-sm border-slate-100 rounded-3xl">
                   <Button className="w-full font-bold text-white transition-all bg-red-600 shadow-xl h-14 rounded-2xl shadow-red-600/20 active:scale-95">
                      Primary Action <ChevronRight className="ml-2" size={18} />
                   </Button>
                   <Button variant="outline" className="w-full font-bold transition-all h-14 border-slate-200 text-slate-700 rounded-2xl active:scale-95 hover:bg-slate-50">
                      Secondary Outline
                   </Button>
                </div>
              </section>

              <section className="space-y-4">
                 <SectionHeader title="Status System" />
                 <div className="flex flex-wrap gap-3 p-6 bg-white border rounded-3xl border-slate-100">
                    <StatusBadge label="In Review" color="bg-amber-100 text-amber-700 border border-amber-200" />
                    <StatusBadge label="Approved" color="bg-emerald-100 text-emerald-700 border border-emerald-200" />
                    <StatusBadge label="Closed" color="bg-slate-100 text-slate-700 border border-slate-200" />
                 </div>
              </section>
            </div>
          </div>

          {/* --- ROW 2: DATA VISUALIZATION GALLERY --- */}
          <div className="pt-12 border-t border-slate-200">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Interactive Chart Gallery</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Hover over the donuts to test interactive segments. Compare these models to finalize the Refinance UI.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              
              {/* Chart 1: Refinance Donut (The recommended choice for Refi) */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col items-center">
                 <div className="w-full mb-8 text-left">
                    <h3 className="font-bold text-slate-900">Refinance Composition</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">RefinanceDonut Component</p>
                 </div>
                 <RefinanceDonut balance={300000} cashOut={45000} costs={6000} rollIn={true} />
              </div>

              {/* Chart 2: Standard Payment Donut */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col items-center">
                 <div className="w-full mb-8 text-left">
                    <h3 className="font-bold text-slate-900">Monthly Commitment</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">PaymentDonut Component</p>
                 </div>
                 <PaymentDonut pni={2100} tax={450} ins={150} hoa={0} />
              </div>

              {/* Chart 3: Breakeven Horizon SVG */}
              <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl flex flex-col justify-between">
                 <div className="w-full mb-6 text-left">
                    <h3 className="font-bold text-white">Breakeven Horizon</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">BreakevenChart Component</p>
                 </div>
                 <div className="bg-white rounded-[2rem] p-6 shadow-inner border border-slate-100 flex-1 flex items-center justify-center relative overflow-hidden">
                    <BreakevenChart costs={5000} monthlySavings={250} breakevenMonths={20} />
                 </div>
              </div>

              {/* Chart 4: Savings Bar Comparison */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl lg:col-span-3">
                 <div className="w-full mb-8 text-left">
                    <h3 className="font-bold text-slate-900">Payment Comparison Bar</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">SavingsBar Component</p>
                 </div>
                 <div className="max-w-md mx-auto">
                   <SavingsBar current={2400} newPmt={1950} />
                 </div>
              </div>

            </div>
          </div>

          <footer className="pt-10 pb-12 mt-20 text-center">
             <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-full text-xs font-bold shadow-lg">
                <CheckCircle2 size={16} className="text-emerald-400" /> Engineering Lab v2.1.0 Ready
             </div>
          </footer>

        </div>
      </div>
    </PublicLayout>
  );
}

// ==========================================
// 📊 CHART COMPONENTS (Extract to /charts later)
// ==========================================

const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-px bg-slate-200"></div>
    <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-red-600 whitespace-nowrap">{title}</h2>
    <div className="flex-1 h-px bg-slate-200"></div>
  </div>
);

const StatusBadge = ({ label, color }) => (
  <span className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider", color)}>
    {label}
  </span>
);

// --- 1. REFINANCE DONUT ---
const RefinanceDonut = ({ balance, cashOut, costs, rollIn }) => {
  const [activeSegment, setActiveSegment] = useState(null);
  const total = balance + cashOut + (rollIn ? costs : 0);
  if (total <= 0) return null;

  const segments = [
    { id: 'balance', label: 'Existing Principal', value: balance, color: '#dc2626', pct: (balance / total) * 100 },
    { id: 'cashout', label: 'Cash Out Equity', value: cashOut, color: '#10b981', pct: (cashOut / total) * 100 },
    { id: 'costs', label: 'Financed Costs', value: rollIn ? costs : 0, color: '#f97316', pct: (rollIn ? costs : 0 / total) * 100 },
  ];

  let currentOffset = 0;
  const strokeWidth = 14;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative flex items-center justify-center w-64 h-64 select-none">
      <svg className="absolute inset-0 w-full h-full overflow-visible transform -rotate-90" viewBox="0 0 100 100">
        {segments.map((seg) => {
          const dashArray = (seg.pct * circumference) / 100;
          const dashOffset = (currentOffset * circumference) / 100;
          currentOffset += seg.pct;
          if (seg.pct <= 0) return null;
          return (
            <circle
              key={seg.id} cx="50" cy="50" r={radius} fill="transparent" stroke={seg.color} strokeWidth={strokeWidth}
              strokeDasharray={`${dashArray} ${circumference}`} strokeDashoffset={-dashOffset} strokeLinecap="butt"
              className={cn("transition-all duration-500 cursor-crosshair", activeSegment && activeSegment.id !== seg.id ? "opacity-20 blur-[1px]" : "opacity-100")}
              style={{ strokeWidth: activeSegment?.id === seg.id ? strokeWidth + 4 : strokeWidth, filter: activeSegment?.id === seg.id ? `drop-shadow(0 0 8px ${seg.color}40)` : 'none' }}
              onMouseEnter={() => setActiveSegment(seg)} onMouseLeave={() => setActiveSegment(null)}
            />
          );
        })}
      </svg>
      <div className="absolute flex flex-col items-center justify-center bg-white rounded-full shadow-lg inset-[24px] z-10 border border-slate-50">
        <div className="px-4 text-center">
          <span className={cn("block text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5 transition-all duration-300", activeSegment ? "scale-110" : "text-slate-400")} style={{ color: activeSegment?.color || '#94a3b8' }}>
            {activeSegment ? activeSegment.label : 'New Loan Total'}
          </span>
          <div className="flex items-baseline justify-center text-slate-900">
            <span className="text-sm font-bold mr-0.5">$</span>
            <span className="text-3xl font-bold leading-none tracking-tighter tabular-nums">{Math.round(activeSegment ? activeSegment.value : total).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 2. PAYMENT DONUT (Mortgage Calc) ---
const PaymentDonut = ({ pni, tax, ins, hoa }) => {
  const [activeSegment, setActiveSegment] = useState(null);
  const total = pni + tax + ins + hoa;
  if (total <= 0) return null;

  const segments = [
    { id: 'pni', label: 'Principal & Interest', value: pni, color: '#dc2626', pct: (pni / total) * 100 },
    { id: 'tax', label: 'Property Taxes', value: tax, color: '#f97316', pct: (tax / total) * 100 },
    { id: 'ins', label: 'Insurance', value: ins, color: '#10b981', pct: (ins / total) * 100 },
    { id: 'hoa', label: 'HOA Fees', value: hoa, color: '#2563eb', pct: (hoa / total) * 100 },
  ];

  let currentOffset = 0;
  const radius = 38; const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative flex items-center justify-center w-64 h-64 select-none">
      <svg className="absolute inset-0 w-full h-full overflow-visible transform -rotate-90" viewBox="0 0 100 100">
        {segments.map((seg) => {
          const dashArray = (seg.pct * circumference) / 100;
          const dashOffset = (currentOffset * circumference) / 100;
          currentOffset += seg.pct;
          if (seg.pct <= 0) return null;
          return (
            <circle
              key={seg.id} cx="50" cy="50" r={radius} fill="transparent" stroke={seg.color} strokeWidth={14}
              strokeDasharray={`${dashArray} ${circumference}`} strokeDashoffset={-dashOffset} strokeLinecap="butt"
              className={cn("transition-all duration-500 cursor-crosshair", activeSegment && activeSegment.id !== seg.id ? "opacity-20 blur-[1px]" : "opacity-100")}
              style={{ strokeWidth: activeSegment?.id === seg.id ? 18 : 14 }}
              onMouseEnter={() => setActiveSegment(seg)} onMouseLeave={() => setActiveSegment(null)}
            />
          );
        })}
      </svg>
      <div className="absolute flex flex-col items-center justify-center bg-white rounded-full shadow-lg inset-[24px] z-10">
        <span className="block text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5 text-slate-400" style={{ color: activeSegment?.color || '#94a3b8' }}>
          {activeSegment ? activeSegment.label : 'Total Monthly'}
        </span>
        <div className="flex items-baseline justify-center text-slate-900">
          <span className="text-sm font-bold mr-0.5">$</span>
          <span className="text-3xl font-bold leading-none tracking-tighter tabular-nums">{Math.round(activeSegment ? activeSegment.value : total).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// --- 3. BREAKEVEN CHART SVG ---
const BreakevenChart = ({ costs, monthlySavings, breakevenMonths }) => (
  <div className="relative w-full h-40 max-w-sm select-none">
    <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="redGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#fee2e2" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#fee2e2" stopOpacity="0.1"/>
        </linearGradient>
        <linearGradient id="greenGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#d1fae5" stopOpacity="0.1"/>
          <stop offset="100%" stopColor="#d1fae5" stopOpacity="0.8"/>
        </linearGradient>
      </defs>
      <polygon points="0,100 50,50 0,50" fill="url(#redGrad)" />
      <polygon points="50,50 100,0 100,50" fill="url(#greenGrad)" />
      <line x1="0" y1="50" x2="100" y2="50" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
      <line x1="0" y1="100" x2="50" y2="50" stroke="#ef4444" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      <line x1="50" y1="50" x2="100" y2="0" stroke="#10b981" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      <circle cx="50" cy="50" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
    <div className="absolute inset-0 pointer-events-none">
       <div className="absolute top-[50%] left-0 -translate-y-1/2 bg-white/80 px-1 backdrop-blur-sm -mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cost Barrier</div>
       <div className="absolute bottom-2 left-0 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm">Recovery Phase</div>
       <div className="absolute top-2 right-0 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 shadow-sm">Profit Phase</div>
       <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 bg-white px-5 py-2.5 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center pointer-events-auto">
          <span className="text-3xl font-black leading-none tracking-tighter text-slate-900 tabular-nums">{breakevenMonths}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Months</span>
       </div>
    </div>
  </div>
);

// --- 4. SAVINGS BAR ---
const SavingsBar = ({ current, newPmt }) => {
  const max = Math.max(current, newPmt) * 1.2;
  const currentPct = (current / max) * 100;
  const newPct = (newPmt / max) * 100;

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Current Payment</span><span>${current.toLocaleString()}</span>
        </div>
        <div className="relative w-full h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="absolute top-0 left-0 h-full rounded-full bg-slate-300" style={{ width: `${currentPct}%` }} />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-bold text-slate-900 uppercase tracking-widest">
          <span>New Payment</span><span className="text-emerald-600">${newPmt.toLocaleString()}</span>
        </div>
        <div className="relative w-full h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="absolute top-0 left-0 h-full rounded-full shadow-sm bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${newPct}%` }} />
        </div>
      </div>
    </div>
  );
};

// 🟢 CRITICAL: Allow public access
ComponentLab.authGuard = false;