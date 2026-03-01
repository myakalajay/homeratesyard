'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  TrendingDown, RefreshCw, HelpCircle, MapPin, 
  ArrowRight, AlertCircle, Percent, Scale, Share2, 
  Printer, X, Mail, ShieldCheck, Lock, Save, Banknote, Check
} from 'lucide-react';
import { cn } from '@/utils/utils';

// --- CORE SERVICES ---
import { useLocation } from '@/context/LocationContext';
import { useMarketEngine } from '@/hooks/useMarketEngine';

// --- COMPONENTS ---
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';
import { Button } from '@/components/ui/primitives/Button'; 
import { CurrencyInput } from '@/components/ui/primitives/CurrencyInput'; 
import { Select } from '@/components/ui/primitives/Select';

// --- VISUALIZATION: SVG Break-even Horizon Chart ---
const BreakevenChart = ({ costs, monthlySavings, breakevenMonths }) => {
  // If no savings or costs, the chart is irrelevant
  if (monthlySavings <= 0 || costs <= 0) return null;

  return (
    <div className="relative w-full h-40 max-w-sm mx-auto mt-6 mb-10 duration-700 select-none animate-in fade-in zoom-in-95">
      {/* 🟢 FIX: 2:1 ViewBox prevents the circle from warping into an oval */}
      <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 200 100" preserveAspectRatio="none">
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

        {/* Phase Areas */}
        <polygon points="0,100 100,50 0,50" fill="url(#redGrad)" />
        <polygon points="100,50 200,0 200,50" fill="url(#greenGrad)" />

        {/* Cost Threshold Line */}
        <line x1="0" y1="50" x2="200" y2="50" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />

        {/* Cumulative Savings Trajectory */}
        <line x1="0" y1="100" x2="100" y2="50" stroke="#ef4444" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        <line x1="100" y1="50" x2="200" y2="0" stroke="#10b981" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" />

        {/* Intersection Node Indicator */}
        <circle cx="100" cy="50" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* UI Overlays */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-[50%] left-0 -translate-y-1/2 bg-white/80 px-1 backdrop-blur-sm -mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
           Cost Barrier
         </div>
         
         <div className="absolute bottom-2 left-0 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm">
           Recovery Phase
         </div>
         
         <div className="absolute top-2 right-0 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 shadow-sm">
           Profit Phase
         </div>

         <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 bg-white px-5 py-2.5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col items-center z-10 pointer-events-auto transition-transform hover:scale-110 cursor-help" title="Time required for your monthly savings to pay off your closing costs.">
            <span className="text-4xl font-black leading-none tracking-tighter text-slate-900 tabular-nums">{breakevenMonths}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Months</span>
         </div>
      </div>
    </div>
  );
};

// --- VISUALIZATION: Refinance Donut Chart ---
const RefinanceDonut = ({ balance, cashOut, costs, rollIn }) => {
  const [activeSegment, setActiveSegment] = useState(null);

  const safeBalance = Math.max(0, Number(balance) || 0);
  const safeCashOut = Math.max(0, Number(cashOut) || 0);
  const safeCosts = rollIn ? Math.max(0, Number(costs) || 0) : 0;
  const total = safeBalance + safeCashOut + safeCosts;

  if (total <= 0) {
    return (
      <div className="relative flex items-center justify-center w-64 h-64 mx-auto rounded-full bg-slate-50 border-[16px] border-slate-100 shadow-inner group">
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Awaiting Data</span>
      </div>
    );
  }

  const segments = [
    { id: 'balance', label: 'Existing Principal', value: safeBalance, color: '#dc2626', pct: (safeBalance / total) * 100 },
    { id: 'cashout', label: 'Cash Out Equity', value: safeCashOut, color: '#10b981', pct: (safeCashOut / total) * 100 },
    { id: 'costs', label: 'Financed Costs', value: safeCosts, color: '#f97316', pct: (safeCosts / total) * 100 },
  ];

  let currentOffset = 0;
  const strokeWidth = 14;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative flex items-center justify-center w-64 h-64 mx-auto duration-700 select-none animate-in fade-in zoom-in-95">
      <svg className="absolute inset-0 w-full h-full overflow-visible transform -rotate-90" viewBox="0 0 100 100">
        {segments.map((seg) => {
          const dashArray = (seg.pct * circumference) / 100;
          const dashOffset = (currentOffset * circumference) / 100;
          currentOffset += seg.pct; // Sequential offset mapping
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
              className={cn("transition-all duration-500 cursor-crosshair", activeSegment && activeSegment.id !== seg.id ? "opacity-20 blur-[1px]" : "opacity-100")}
              style={{ strokeWidth: activeSegment?.id === seg.id ? strokeWidth + 4 : strokeWidth, filter: activeSegment?.id === seg.id ? `drop-shadow(0 0 8px ${seg.color}40)` : 'none' }}
              onMouseEnter={() => setActiveSegment(seg)}
              onMouseLeave={() => setActiveSegment(null)}
            />
          );
        })}
      </svg>
      
      {/* Center Intelligence Panel */}
      <div className="absolute flex flex-col items-center justify-center bg-white rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] inset-[24px] z-10 border border-slate-50">
        <div className="px-4 text-center">
          <span className={cn("block text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5 transition-all duration-300", activeSegment ? "scale-110" : "text-slate-400")} style={{ color: activeSegment?.color || '#94a3b8' }}>
            {activeSegment ? activeSegment.label : 'New Loan Total'}
          </span>
          <div className="flex items-baseline justify-center text-slate-900">
            <span className="text-sm font-bold mr-0.5">$</span>
            <span className="text-3xl font-bold leading-none tracking-tighter tabular-nums">
              {Math.round(activeSegment ? activeSegment.value : total).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-center h-4 mt-2">
            {activeSegment ? (
              <span className="text-[10px] font-bold text-slate-500 animate-in fade-in slide-in-from-bottom-1">{Math.round(activeSegment.pct)}% of Loan</span>
            ) : (
              <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-slate-400">Principal Breakdown</span>
            )}
          </div>
        </div>
      </div>
      <div className="absolute inset-[10px] rounded-full border border-slate-100/50 pointer-events-none" />
    </div>
  );
};

// --- VISUALIZATION: Flat Savings Bar ---
const SavingsBar = ({ current, newPmt }) => {
  const safeCurrent = Number(current) || 0;
  const safeNew = Number(newPmt) || 0;
  const max = Math.max(safeCurrent, safeNew) * 1.2;
  const currentPct = max > 0 ? Math.min((safeCurrent / max) * 100, 100) : 0;
  const newPct = max > 0 ? Math.min((safeNew / max) * 100, 100) : 0;

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Current Payment</span>
          <span>${Math.round(safeCurrent).toLocaleString()}</span>
        </div>
        <div className="relative w-full h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="absolute top-0 left-0 h-full transition-all duration-700 rounded-full bg-slate-300" style={{ width: `${currentPct}%` }} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-bold text-slate-900 uppercase tracking-widest">
          <span>New Payment</span>
          <span className={safeNew > safeCurrent ? "text-red-600" : "text-emerald-600"}>${Math.round(safeNew).toLocaleString()}</span>
        </div>
        <div className="relative w-full h-3 overflow-hidden rounded-full bg-slate-100">
          <div className={cn("absolute top-0 left-0 h-full transition-all duration-700 rounded-full shadow-sm", safeNew > safeCurrent ? "bg-red-500" : "bg-gradient-to-r from-emerald-500 to-emerald-400")} style={{ width: `${newPct}%` }} />
        </div>
      </div>
    </div>
  );
};

// --- AUTH GATED COMPONENTS ---
const RefinanceTeaser = () => (
  <div className="relative overflow-hidden border bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-center">
    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_#ef4444_0%,_transparent_60%)]" />
    <div className="relative z-10 flex flex-col items-center">
      <div className="flex items-center justify-center w-12 h-12 mb-4 text-red-500 rounded-full bg-white/10"><Lock size={24} /></div>
      <h3 className="mb-2 text-lg font-bold text-white">Unlock Refinance Intelligence</h3>
      <p className="mb-6 text-sm font-medium text-slate-400">Discover your exact break-even timeline, verify your LTV limits, and see your lifetime wealth impact.</p>
      <Link href="/auth/register">
        <Button className="px-8 font-bold text-white bg-red-600 border-none h-11 hover:bg-red-700 rounded-xl">Login to View Metrics <ArrowRight size={16} className="ml-2" /></Button>
      </Link>
    </div>
  </div>
);

const LifetimeImpactMetrics = ({ monthlySavings, lifetimeSavings, breakevenMonths, cashOut, ltv }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
    <div className="flex items-center gap-3 mb-8">
      <Scale size={22} className="text-emerald-500" />
      <h3 className="text-lg font-bold text-slate-900">Lifetime Wealth Impact</h3>
    </div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="p-5 border bg-slate-50/50 border-slate-100 rounded-2xl">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Cash Flow</span>
        <span className={cn("block text-xl font-bold", monthlySavings > 0 ? "text-emerald-600" : "text-red-600")}>
          {monthlySavings > 0 ? '+' : ''}${Math.round(monthlySavings).toLocaleString()}
        </span>
        <span className="block text-[10px] font-bold text-slate-500 mt-1">Payment difference</span>
      </div>
      <div className="p-5 border bg-slate-50/50 border-slate-100 rounded-2xl">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cost Recovery</span>
        <span className="block text-xl font-bold text-slate-900">{breakevenMonths > 0 ? `${breakevenMonths} Months` : 'Instant'}</span>
        <span className="block text-[10px] font-bold text-slate-500 mt-1">Time to break even</span>
      </div>
      <div className={cn("p-5 border rounded-2xl", lifetimeSavings > 0 ? "bg-emerald-50/50 border-emerald-100" : "bg-red-50/50 border-red-100")}>
        <span className={cn("block text-[10px] font-bold uppercase tracking-widest mb-1", lifetimeSavings > 0 ? "text-emerald-600" : "text-red-600")}>Total Net Savings</span>
        <span className={cn("block text-xl font-bold", lifetimeSavings > 0 ? "text-emerald-900" : "text-red-900")}>
          {lifetimeSavings > 0 ? '+' : ''}${Math.round(lifetimeSavings).toLocaleString()}
        </span>
        <span className={cn("block text-[10px] font-bold mt-1", lifetimeSavings > 0 ? "text-emerald-700" : "text-red-700")}>Life of loan impact</span>
      </div>
    </div>
    {cashOut > 0 && (
       <div className={cn("mt-6 p-4 border rounded-xl flex items-start gap-3", ltv > 80 ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-100")}>
          <Banknote size={20} className={ltv > 80 ? "text-red-600 mt-0.5" : "text-blue-600 mt-0.5"} />
          <div>
            <span className={cn("block text-[11px] font-bold uppercase tracking-widest mb-1", ltv > 80 ? "text-red-800" : "text-blue-800")}>Cash-Out Strategy ({ltv.toFixed(1)}% LTV)</span>
            <span className={cn("block text-sm font-medium", ltv > 80 ? "text-red-700" : "text-blue-900")}>
               {ltv > 80 ? `Warning: Your total loan exceeds 80% of your home's value. Conventional lenders generally cap cash-out refinances at 80% LTV.` : `You are extracting $${Math.round(cashOut).toLocaleString()} in liquid equity while keeping your LTV under 80%.`}
            </span>
          </div>
       </div>
    )}
  </div>
);

export default function RefinanceBreakeven() {
  const { location, updateLocation } = useLocation();
  const { rates } = useMarketEngine(location?.zip);
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated] = useState(false); 

  // --- STATE ---
  const [zipCode, setZipCode] = useState('20148');
  const [homeValue, setHomeValue] = useState(450000);
  const [currentBalance, setCurrentBalance] = useState(300000);
  const [currentRate, setCurrentRate] = useState(6.5); 
  const [yearsLeft, setYearsLeft] = useState(26); 
  
  const [newRate, setNewRate] = useState(5.75);
  const [newTerm, setNewTerm] = useState(30);
  const [closingCosts, setClosingCosts] = useState(5000);
  const [rollInCosts, setRollInCosts] = useState(true); 
  const [cashOutAmount, setCashOutAmount] = useState(0); 

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareSent, setShareSent] = useState(false);

  const [results, setResults] = useState({
    currentPmt: 0, newPayment: 0, monthlySavings: 0, breakevenMonths: 0, yearOneSavings: 0, lifetimeSavings: 0, totalNewLoan: 0, ltv: 0, netCash: 0 
  });

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (location?.zip) setZipCode(location.zip); }, [location]);
  useEffect(() => { if (rates?.['30Y']) setNewRate(parseFloat(rates['30Y'])); }, [rates]);

  // --- BULLETPROOF CALCULATION ENGINE ---
  useEffect(() => {
    const safeValue = Math.max(1, Number(homeValue) || 1); 
    const safeBalance = Math.max(0, Number(currentBalance) || 0);
    const safeCurRate = Math.max(0, Number(currentRate) || 0);
    const safeYearsLeft = Math.max(0, Number(yearsLeft) || 0);
    
    const safeNewRate = Math.max(0, Number(newRate) || 0);
    const safeTerm = Math.max(1, Number(newTerm) || 30);
    const safeCosts = Math.max(0, Number(closingCosts) || 0);
    const safeCashOut = Math.max(0, Number(cashOutAmount) || 0);

    if (safeBalance > 0 && safeYearsLeft > 0) {
      
      // 1. DEDUCE CURRENT PAYMENT (Zero-Rate Fallback)
      const curR = safeCurRate / 100 / 12;
      const curN = safeYearsLeft * 12;
      const curPmt = curR === 0 ? safeBalance / curN : safeBalance * ((curR * Math.pow(1 + curR, curN)) / (Math.pow(1 + curR, curN) - 1));

      // 2. NEW LOAN CREATION
      const financedCosts = rollInCosts ? safeCosts : 0;
      const totalNewLoan = safeBalance + safeCashOut + financedCosts;
      const currentLTV = (totalNewLoan / safeValue) * 100;

      // 3. NEW PAYMENT (Zero-Rate Fallback)
      const newR = safeNewRate / 100 / 12;
      const newN = safeTerm * 12;
      const newPmt = newR === 0 ? totalNewLoan / newN : totalNewLoan * ((newR * Math.pow(1 + newR, newN)) / (Math.pow(1 + newR, newN) - 1));
      
      // 4. METRICS
      const savings = curPmt - newPmt;
      const netCashToClose = safeCashOut - (rollInCosts ? 0 : safeCosts); 
      
      let months = 0;
      let yearOne = 0;
      if (savings > 0) {
        months = safeCosts > 0 ? Math.ceil(safeCosts / savings) : 0;
        yearOne = (savings * 12) - safeCosts;
      }

      const currentLifetimeCost = curPmt * curN;
      const upfrontCosts = rollInCosts ? 0 : safeCosts;
      const newLifetimeCost = (newPmt * newN) + upfrontCosts - safeCashOut; 
      
      const lifetimeNet = currentLifetimeCost - newLifetimeCost;

      setResults({
        currentPmt: curPmt, newPayment: newPmt, monthlySavings: savings, breakevenMonths: months, yearOneSavings: yearOne, lifetimeSavings: lifetimeNet, totalNewLoan: totalNewLoan, ltv: currentLTV, netCash: netCashToClose
      });
    } else {
      setResults({ currentPmt: 0, newPayment: 0, monthlySavings: 0, breakevenMonths: 0, yearOneSavings: 0, lifetimeSavings: 0, totalNewLoan: 0, ltv: 0, netCash: 0 });
    }
  }, [homeValue, currentBalance, currentRate, yearsLeft, newRate, newTerm, closingCosts, rollInCosts, cashOutAmount]);

  const executeShare = (e) => {
    e.preventDefault();
    if (!shareEmail) return;
    setTimeout(() => {
        setShareSent(true);
        setTimeout(() => setIsShareModalOpen(false), 2000);
    }, 800);
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen font-sans bg-slate-50 selection:bg-red-50 selection:text-red-600">
      <Head>
        <title>Refinance Intelligence Hub | HomeRatesYard</title>
        <meta name="description" content="Calculate your refinance break-even timeline, cash-out options, and analyze lifetime wealth impact." />
      </Head>

      {/* SHARE MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="relative w-full max-w-sm p-8 mx-4 bg-white shadow-2xl rounded-[2.5rem] animate-in zoom-in-95 text-center">
                <button onClick={() => setIsShareModalOpen(false)} className="absolute p-2 transition-colors rounded-full top-6 right-6 text-slate-400 hover:text-slate-900"><X size={20} /></button>
                {shareSent ? (
                    <div className="py-6">
                        <div className="flex items-center justify-center mx-auto mb-4 shadow-sm w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600"><ShieldCheck size={28} /></div>
                        <h3 className="mb-2 text-xl font-bold text-slate-900">Report Sent!</h3>
                        <p className="text-sm font-medium text-slate-500">Check your inbox for the breakdown.</p>
                    </div>
                ) : (
                    <form onSubmit={executeShare}>
                        <div className="flex items-center justify-center mx-auto mb-6 text-red-600 shadow-sm w-14 h-14 bg-red-50 rounded-2xl"><Mail size={28} /></div>
                        <h3 className="mb-2 text-xl font-bold text-slate-900">Email Refinance Report</h3>
                        <p className="mb-6 text-sm font-medium leading-relaxed text-slate-500">Send your break-even timeline and lifetime savings analysis.</p>
                        <input type="email" required placeholder="name@email.com" value={shareEmail} onChange={e => setShareEmail(e.target.value)} className="w-full h-12 px-4 mb-4 text-sm font-bold transition-all border outline-none text-slate-900 border-slate-200 rounded-xl focus:border-red-600 focus:ring-4 focus:ring-red-600/10" />
                        <Button type="submit" className="w-full h-12 font-bold text-white bg-red-600 shadow-xl hover:bg-red-700 rounded-xl">Send Report</Button>
                    </form>
                )}
            </div>
        </div>
      )}

      <PublicLayout>
        {/* HERO SECTION */}
        <section className="relative px-6 pt-32 pb-24 overflow-hidden text-center bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ef444415,_transparent_70%)]" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold tracking-widest text-red-400 uppercase bg-red-500/10 border border-red-500/20 rounded-full">
               <TrendingDown size={12} /> Refinance Intelligence
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
               Optimize Your <span className="text-red-500">Debt Strategy</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg font-medium leading-relaxed text-slate-400">
               Calculate your true break-even point, verify LTV limits for cash-out, and analyze the long-term wealth impact of refinancing.
            </p>
          </div>
        </section>

        {/* WORKSPACE */}
        <div className="relative z-20 grid items-start grid-cols-1 gap-10 px-4 mx-auto -mt-12 max-w-7xl md:px-8 lg:grid-cols-12">
          
          {/* LEFT COLUMN */}
          <div className="space-y-8 lg:col-span-7">
            
            {/* CURRENT LOAN */}
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
              <div className="flex flex-col justify-between gap-6 pb-8 mb-10 border-b md:flex-row md:items-center border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center text-red-600 shadow-inner w-14 h-14 rounded-2xl bg-red-50"><MapPin size={28}/></div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Current Mortgage</h3>
                    <p className="mt-1 text-xs font-bold tracking-widest uppercase text-slate-400">Estimating for: <span className="text-red-600">{location?.city || 'Selected Market'}</span></p>
                  </div>
                </div>
                <div className="w-full md:w-40">
                    <input type="text" maxLength={5} value={zipCode} onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))} onBlur={() => updateLocation?.(zipCode)} placeholder="Zipcode" className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500" />
                </div>
              </div>

              <div className="space-y-12">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <label className="text-[13px] font-bold text-slate-700">Est. Home Value</label>
                    <Tooltip text="Used to calculate your Loan-to-Value (LTV) limit for cash-out." />
                  </div>
                  <CurrencyInput value={homeValue} onChange={setHomeValue} className="text-xl h-14 border-slate-200 focus:border-red-500" />
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                  <div className="space-y-3">
                    <label className="text-[13px] font-bold text-slate-700">Remaining Balance</label>
                    <CurrencyInput value={currentBalance} onChange={setCurrentBalance} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[13px] font-bold text-slate-700">Current Rate (%)</label>
                    <CurrencyInput value={currentRate} onChange={setCurrentRate} icon={Percent} suffix="%" />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[13px] font-bold text-slate-700">Years Left</label>
                    <input type="number" value={yearsLeft} onChange={(e) => setYearsLeft(e.target.value)} className="w-full h-12 px-4 text-sm font-bold border outline-none border-slate-200 rounded-xl focus:border-red-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* NEW STRATEGY & CASH OUT */}
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center justify-center w-10 h-10 text-blue-600 rounded-xl bg-blue-50"><RefreshCw size={20} /></div>
                  <h3 className="text-lg font-bold text-slate-900">New Loan Strategy</h3>
               </div>

               <div className="grid grid-cols-1 gap-8 mb-10 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="block text-[13px] font-bold text-slate-700">New Interest Rate (%)</label>
                    <CurrencyInput value={newRate} onChange={setNewRate} icon={Percent} suffix="%" />
                  </div>
                  
                  <Select 
                    label="New Loan Term" 
                    value={newTerm} 
                    onChange={(v) => setNewTerm(Number(v))} 
                    options={[
                      {label:'30 Years Fixed', value:30},
                      {label:'20 Years Fixed', value:20},
                      {label:'15 Years Fixed', value:15}
                    ]} 
                  />
               </div>

               <div className="grid grid-cols-1 gap-8 pt-8 border-t md:grid-cols-2 border-slate-50">
                  <div className="space-y-3">
                     <div className="flex items-center gap-2">
                        <label className="text-[13px] font-bold text-emerald-700">Cash-Out Amount</label>
                        <Tooltip text="Extract equity from your home. Subject to 80% LTV limits." />
                     </div>
                     <CurrencyInput value={cashOutAmount} onChange={setCashOutAmount} className="border-emerald-200 bg-emerald-50/30 focus:border-emerald-500" />
                  </div>
                  <div className="space-y-3">
                     <div className="flex items-center gap-2">
                        <label className="text-[13px] font-bold text-slate-700">Est. Closing Costs</label>
                        <Tooltip text="Typically 2-5% of the loan. You can pay upfront or finance them." />
                     </div>
                     <CurrencyInput value={closingCosts} onChange={setClosingCosts} />
                     
                     <div className="flex items-center gap-3 pt-2 cursor-pointer group" onClick={() => setRollInCosts(!rollInCosts)}>
                        <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all", rollInCosts ? "bg-red-600 border-red-600 shadow-sm" : "bg-white border-slate-300")}>
                            {rollInCosts && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                            Finance costs into loan
                        </span>
                     </div>
                  </div>
               </div>
            </div>

            {/* AUTH GATED CONTENT */}
            {isAuthenticated ? (
               <LifetimeImpactMetrics monthlySavings={results.monthlySavings} lifetimeSavings={results.lifetimeSavings} breakevenMonths={results.breakevenMonths} cashOut={cashOutAmount} ltv={results.ltv} />
            ) : (
               <RefinanceTeaser />
            )}
          </div>

          {/* RIGHT COLUMN: STICKY RESULTS */}
          <div className="space-y-6 lg:col-span-5 lg:sticky lg:top-28 h-fit">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden text-center transition-all">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-orange-500" />
              
              <div className="flex items-center justify-center gap-6 pb-6 mb-8 border-b border-slate-50">
                 <button onClick={() => window.print()} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-red-600 transition-all uppercase tracking-widest"><Printer size={16} /> Print</button>
                 <div className="w-px h-3 bg-slate-200" />
                 <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-red-600 transition-all uppercase tracking-widest"><Share2 size={16} /> Share</button>
              </div>

              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-4">Break-even Horizon</p>
              
              <div className="mb-4">
                {results.monthlySavings > 0 ? (
                  <BreakevenChart costs={closingCosts} monthlySavings={results.monthlySavings} breakevenMonths={results.breakevenMonths} />
                ) : (
                  <div className="py-12 mb-10 border-y border-slate-50">
                    <p className="text-2xl font-bold text-red-600">Payment Increases</p>
                    <p className="mt-2 text-sm font-medium text-slate-500">This strategy raises your monthly cost.</p>
                  </div>
                )}
              </div>
              
              <div className="mb-10 text-left">
                <SavingsBar current={results.currentPmt} newPmt={results.newPayment} />
              </div>
              
              {/* Visual Refinance Donut Component */}
              <div className="flex justify-center mb-12 transition-transform duration-700 scale-110 pointer-events-none">
                  <RefinanceDonut balance={currentBalance} cashOut={cashOutAmount} costs={closingCosts} rollIn={rollInCosts} />
              </div>
              
              <div className="pt-8 mb-10 space-y-4 text-left border-t border-slate-50">
                <ResultRow label="New Loan Total" value={results.totalNewLoan} color="bg-blue-500" sub={rollInCosts ? "Includes financed costs" : "Excludes upfront costs"} />
                <ResultRow 
                   label={results.netCash >= 0 ? "Net Cash to Borrower" : "Cash Due at Closing"} 
                   value={Math.abs(results.netCash)} 
                   color={results.netCash >= 0 ? "bg-emerald-500" : "bg-orange-500"} 
                   sub={results.netCash >= 0 ? "Liquid equity you receive" : "Check required to close"} 
                />
                <ResultRow label="Monthly Savings" value={results.monthlySavings} color={results.monthlySavings > 0 ? "bg-emerald-500" : "bg-red-500"} sub="Difference in P&I payment" />
              </div>

              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="w-full h-16 font-bold text-white transition-all shadow-xl bg-slate-900 hover:bg-slate-800 rounded-2xl shadow-slate-900/20 group">
                    Save Strategy to Dashboard <Save className="ml-2 transition-transform group-hover:scale-110" size={18}/>
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/register">
                  <Button className="w-full h-16 font-bold text-white transition-all bg-red-600 shadow-xl hover:bg-red-700 rounded-2xl shadow-red-600/30 group">
                    Analyze Lifetime Impact <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18}/>
                  </Button>
                </Link>
              )}
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-[2rem] space-y-4 shadow-sm">
               <div className="flex items-center gap-2 text-slate-700">
                  <AlertCircle size={18} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Strategy Intelligence</span>
               </div>
               <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                  {results.ltv > 80 ? (
                    <span className="font-bold text-red-600">LTV Warning: Cash-out pushes LTV above 80%.</span>
                  ) : results.lifetimeSavings < 0 ? (
                    `Warning: Extending your loan to ${newTerm} years means paying $${Math.abs(Math.round(results.lifetimeSavings)).toLocaleString()} MORE in interest.`
                  ) : results.monthlySavings > 0 ? (
                    `Strong Strategy: You save monthly AND keep $${Math.round(results.lifetimeSavings).toLocaleString()} in interest.`
                  ) : (
                    `Cost Warning: Refinancing increases your monthly P&I payment.`
                  )}
               </p>
            </div>
          </div>
        </div>
      </PublicLayout>
    </div>
  );
}

// --- SHARED UI HELPERS ---

const Tooltip = ({ text }) => (
  <div className="relative group cursor-help">
    <HelpCircle size={14} className="transition-colors text-slate-300 hover:text-red-500" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-3 bg-slate-900 text-white text-[11px] font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-[100] shadow-2xl leading-relaxed">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900" />
    </div>
  </div>
);

const ResultRow = ({ label, value, color, sub }) => (
  <div className="flex items-center justify-between p-4 transition-all border bg-slate-50/50 rounded-2xl border-slate-100/50 hover:bg-white group">
    <div className="flex items-center gap-3">
      <div className={cn("w-3.5 h-3.5 rounded-full shadow-sm", color)} />
      <div>
         <span className="text-sm font-bold transition-colors text-slate-700 group-hover:text-slate-900">{label}</span>
         {sub && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{sub}</p>}
      </div>
    </div>
    <span className="text-sm font-bold text-slate-900 tabular-nums">
      {value < 0 ? '-' : ''}${Math.abs(Math.round(value)).toLocaleString()}
    </span>
  </div>
);