'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Zap, DollarSign, Percent, Calendar, 
  HelpCircle, PiggyBank, MapPin, ArrowRight, Info,
  AlertCircle, TrendingDown, Clock, CalendarDays,
  ShieldCheck, Lock, Share2, Printer, Mail, Check, X
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

// --- JSON-LD SEO SCHEMA ---
const calculatorSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Mortgage Payoff & Extra Payments Calculator",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "description": "Calculate how much time and interest you can save by making extra principal payments or switching to a bi-weekly schedule.",
};

// --- INTERACTIVE CHARTS ---
const SavingsDonut = ({ originalInterest, newInterest }) => {
  const [activeSegment, setActiveSegment] = useState(null);

  const safeOriginal = Math.max(0, Number(originalInterest) || 0);
  const safeNew = Math.max(0, Number(newInterest) || 0);
  const savedInterest = Math.max(0, safeOriginal - safeNew);

  if (safeOriginal <= 0) {
    return (
      <div className="relative flex items-center justify-center w-64 h-64 mx-auto rounded-full bg-slate-50 border-[16px] border-slate-100 shadow-inner group">
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Awaiting Data</span>
      </div>
    );
  }

  const paidPct = (safeNew / safeOriginal) * 100;
  const savedPct = (savedInterest / safeOriginal) * 100;

  const segments = [
    { id: 'paid', label: 'New Interest Cost', value: safeNew, color: '#f97316', pct: paidPct },
    { id: 'saved', label: 'Interest Saved', value: savedInterest, color: '#10b981', pct: savedPct },
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
      <div className="absolute flex flex-col items-center justify-center bg-white rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] inset-[24px] z-10 border border-slate-50">
        <div className="px-4 text-center">
          <span className={cn("block text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5 transition-all duration-300", activeSegment ? "scale-110" : "text-slate-400")} style={{ color: activeSegment?.color || '#94a3b8' }}>
            {activeSegment ? activeSegment.label : 'Original Interest'}
          </span>
          <div className="flex items-baseline justify-center text-slate-900">
            <span className="text-sm font-bold mr-0.5">$</span>
            <span className="text-3xl font-bold leading-none tracking-tighter tabular-nums">
              {Math.round(activeSegment ? activeSegment.value : safeOriginal).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-center h-4 mt-2">
            {activeSegment ? (
              <span className="text-[10px] font-bold text-slate-500 animate-in fade-in slide-in-from-bottom-1">{Math.round(activeSegment.pct)}% of Original</span>
            ) : (
              <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-slate-400">Total Projection</span>
            )}
          </div>
        </div>
      </div>
      <div className="absolute inset-[10px] rounded-full border border-slate-100/50 pointer-events-none" />
    </div>
  );
};

// 🟢 NEW FEATURE: Time Visualizer Bar
const TimeSavingsBar = ({ originalMonths, newMonths }) => {
  const safeOrig = Math.max(1, originalMonths);
  const safeNew = Math.max(0, newMonths);
  const saved = Math.max(0, safeOrig - safeNew);

  const newPct = (safeNew / safeOrig) * 100;
  const formatYrs = (m) => (m / 12).toFixed(1) + ' Yrs';

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Standard Payoff</span>
          <span>{formatYrs(safeOrig)}</span>
        </div>
        <div className="relative w-full h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="absolute top-0 left-0 h-full transition-all duration-700 rounded-full bg-slate-300" style={{ width: `100%` }} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-bold text-slate-900 uppercase tracking-widest">
          <span>Accelerated Payoff</span>
          <span className="text-emerald-600">{formatYrs(safeNew)}</span>
        </div>
        <div className="relative flex w-full h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full transition-all duration-700 bg-blue-500 rounded-full shadow-sm" style={{ width: `${newPct}%` }} />
        </div>
        {saved > 0 && (
          <p className="text-[9px] text-right text-emerald-600 font-bold tracking-tighter uppercase">
             Shaved off {formatYrs(saved)}
          </p>
        )}
      </div>
    </div>
  );
};

// --- AUTH GATED COMPONENTS ---
const SavingsTeaser = () => (
  <div className="relative overflow-hidden border bg-slate-900 p-8 rounded-[1rem] shadow-xl text-center">
    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_#ef4444_0%,_transparent_60%)]" />
    <div className="relative z-10 flex flex-col items-center">
      <div className="flex items-center justify-center w-12 h-12 mb-4 text-red-500 rounded-full bg-white/10"><Lock size={24} /></div>
      <h3 className="mb-2 text-lg font-bold text-white">Unlock Freedom Intelligence</h3>
      <p className="mb-6 text-sm font-medium text-slate-400">Discover the exact month you will be debt-free and securely save this strategy to your dashboard.</p>
      <Link href="/auth/register">
        <Button className="px-8 font-bold text-white bg-red-600 border-none h-11 hover:bg-red-700">
          Login to View Timeline <ArrowRight size={16} className="ml-2" />
        </Button>
      </Link>
    </div>
  </div>
);

const FreedomMetrics = ({ freedomDate, timeSaved }) => (
  <div className="bg-white p-8 rounded-[1rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
    <div className="flex items-center gap-3 mb-8">
      <Clock size={22} className="text-emerald-500" />
      <h3 className="text-lg font-bold text-slate-900">Debt Freedom Timeline</h3>
    </div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="p-5 border bg-slate-50/50 border-slate-100 rounded-2xl">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Freedom Date</span>
        <span className="block text-xl font-bold text-slate-900">{freedomDate}</span>
        <span className="block text-[10px] font-bold text-slate-500 mt-1">Projected zero balance</span>
      </div>
      <div className="p-5 border bg-emerald-50/50 border-emerald-100 rounded-2xl">
        <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Time Eliminated</span>
        <span className="block text-xl font-bold text-emerald-900">{timeSaved}</span>
        <span className="block text-[10px] font-bold text-emerald-700 mt-1">Years shaved off mortgage</span>
      </div>
    </div>
  </div>
);

export default function ExtraPaymentsCalculator() {
  const { location, updateLocation } = useLocation();
  const { rates } = useMarketEngine(location?.zip);
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); 

  // --- STATE ---
  const [zipCode, setZipCode] = useState('20148');
  
  // Current Loan
  const [loanBalance, setLoanBalance] = useState(300000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [remainingYears, setRemainingYears] = useState(30);
  
  // Strategy
  const [monthlyExtra, setMonthlyExtra] = useState(200);
  const [oneTimeLumpSum, setOneTimeLumpSum] = useState(0);
  const [isBiWeekly, setIsBiWeekly] = useState(false); 

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareSent, setShareSent] = useState(false);

  // Results
  const [results, setResults] = useState({
    originalTotalInterest: 0,
    newTotalInterest: 0,
    timeSaved: 0,
    totalSaved: 0,
    freedomDate: '',
    basePmt: 0,
    originalMonths: 360,
    newMonths: 360
  });

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (location?.zip) setZipCode(location.zip); }, [location]);
  useEffect(() => { if (rates?.['30Y']) setInterestRate(parseFloat(rates['30Y'])); }, [rates]);

  // --- CALCULATION ENGINE ---
  useEffect(() => {
    const safeBalance = Math.max(0, Number(loanBalance) || 0);
    const safeRate = Math.max(0, Number(interestRate) || 0);
    const safeYears = Math.max(1, Number(remainingYears) || 30);
    const safeMonthly = Math.max(0, Number(monthlyExtra) || 0);
    const safeLump = Math.max(0, Number(oneTimeLumpSum) || 0);

    if (safeBalance > 0 && safeYears > 0) {
      const r = safeRate / 100 / 12;
      const n = safeYears * 12;
      
      const basePmt = r === 0 ? safeBalance / n : safeBalance * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
      const intOriginal = r === 0 ? 0 : (basePmt * n) - safeBalance;

      let balNew = safeBalance - safeLump;
      let intNew = 0;
      let monthsNew = 0;
      const maxMonths = 720; 
      
      // Bi-Weekly mathematically adds 1 extra monthly payment per year (basePmt / 12)
      const biWeeklyImpact = isBiWeekly ? (basePmt / 12) : 0;
      const totalMonthlyExtra = safeMonthly + biWeeklyImpact;

      if (balNew <= 0) {
          intNew = 0;
          monthsNew = 0;
      } else {
          while (balNew > 0 && monthsNew < maxMonths) {
            const interest = balNew * r;
            let principal = (basePmt + totalMonthlyExtra) - interest;
            
            if (principal > balNew) principal = balNew;
            
            balNew -= principal;
            intNew += interest;
            monthsNew++;
          }
      }

      const today = new Date();
      const futureDate = new Date(today.setMonth(today.getMonth() + monthsNew));
      const freedomDateString = futureDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      setResults({
        originalTotalInterest: intOriginal,
        newTotalInterest: intNew,
        totalSaved: Math.max(0, intOriginal - intNew),
        timeSaved: Math.max(0, n - monthsNew),
        freedomDate: freedomDateString,
        basePmt: basePmt,
        originalMonths: n,
        newMonths: monthsNew
      });

    } else {
      setResults({ originalTotalInterest: 0, newTotalInterest: 0, totalSaved: 0, timeSaved: 0, freedomDate: '-', basePmt: 0, originalMonths: 0, newMonths: 0 });
    }
  }, [loanBalance, interestRate, remainingYears, monthlyExtra, oneTimeLumpSum, isBiWeekly]);

  const formatTimeSaved = (totalMonths) => {
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    if (years === 0 && months === 0) return '0 Months';
    if (years === 0) return `${months} Months`;
    if (months === 0) return `${years} Years`;
    return `${years} Years, ${months} Mos`;
  };

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
        <title>Extra Payments Intelligence | HomeRatesYard</title>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }} />
      </Head>

      {/* SHARE MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="relative w-full max-w-sm p-8 mx-4 bg-white shadow-2xl rounded-[1rem] animate-in zoom-in-95 text-center">
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
                        <h3 className="mb-2 text-xl font-bold text-slate-900">Email Strategy Report</h3>
                        <p className="mb-6 text-sm font-normal leading-relaxed text-slate-500">Send your payoff strategy and freedom timeline.</p>
                        <input type="email" required placeholder="name@email.com" value={shareEmail} onChange={e => setShareEmail(e.target.value)} className="w-full h-12 px-4 mb-4 text-sm font-bold transition-all border outline-none text-slate-900 border-slate-200 rounded-xl focus:border-red-600 focus:ring-4 focus:ring-red-600/10" />
                        <Button type="submit" className="w-full h-12 font-semibold text-white bg-red-600 shadow-xl hover:bg-red-700">Send Report</Button>
                    </form>
                )}
            </div>
        </div>
      )}

      <PublicLayout>
        {/* HERO SECTION */}
        <section className="relative px-6 pt-24 pb-24 overflow-hidden text-center bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ef444415,_transparent_70%)]" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold tracking-widest text-red-400 uppercase bg-red-500/10 border border-red-500/20 rounded-full">
               <Zap size={12} /> Payoff Intelligence
            </div>
            <h1 className="mb-6 text-3xl font-bold tracking-tight text-white md:text-5xl">
               Accelerate Your <span className="text-red-500">Freedom</span>
            </h1>
            <p className="max-w-4xl mx-auto font-normal leading-relaxed text-md text-slate-400">
               Calculate exactly how much time and interest you can save by making extra principal payments or switching to a bi-weekly schedule.
            </p>
          </div>
        </section>

        {/* WORKSPACE */}
        <div className="relative z-20 grid items-start grid-cols-1 gap-10 px-4 mx-auto -mt-12 max-w-7xl md:px-8 lg:grid-cols-12">
          
          {/* LEFT COLUMN: INPUTS */}
          <div className="space-y-8 lg:col-span-7">
            
            {/* LOAN CONTEXT */}
            <div className="bg-white p-8 md:p-10 rounded-[1rem] border border-slate-100 shadow-xl shadow-slate-200/40">
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
                    <label className="text-[13px] font-bold text-slate-700">Remaining Balance</label>
                    <Tooltip text="How much is left on your loan principal." />
                  </div>
                  <CurrencyInput value={loanBalance} onChange={setLoanBalance} className="text-xl h-14 border-slate-200 focus:border-red-500" />
                  <input type="range" min="10000" max="1000000" step="5000" value={loanBalance} onChange={(e) => setLoanBalance(Number(e.target.value))} className="w-full h-1.5 mt-8 rounded-full cursor-pointer bg-slate-100 accent-red-600" />
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><label className="text-[13px] font-bold text-slate-700">Interest Rate (%)</label><Tooltip text="Your current annual interest rate." /></div>
                    <CurrencyInput value={interestRate} onChange={setInterestRate} icon={Percent} suffix="%" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[13px] font-bold text-slate-700 block">Years Remaining</label>
                    <input type="number" value={remainingYears} onChange={(e) => setRemainingYears(e.target.value)} className="w-full h-12 px-4 text-sm font-bold border outline-none border-slate-200 rounded-xl focus:border-red-500" />
                  </div>
                </div>

                {/* 🟢 NEW: Explicit Base Payment Context */}
                <div className="flex items-center justify-between p-4 border bg-slate-100/70 border-slate-100 rounded-xl">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Required Base P&I</span>
                        <Tooltip text="Your minimum required monthly payment (Principal & Interest only). Extra payments are added on top of this." />
                    </div>
                    <span className="text-xl font-bold text-slate-900 tabular-nums">${Math.round(results.basePmt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* ACCELERATION STRATEGY */}
            <div className="bg-white p-8 md:p-10 rounded-[1rem] border border-slate-100 shadow-sm">
               <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center justify-center w-10 h-10 text-emerald-600 rounded-xl bg-emerald-50"><PiggyBank size={20} /></div>
                  <h3 className="text-lg font-bold text-slate-900">Acceleration Strategy</h3>
               </div>

               {/* Bi-Weekly Toggle */}
               <div className="flex items-center justify-between p-5 mb-10 border border-emerald-100 bg-emerald-50/50 rounded-2xl">
                  <div className="flex items-center gap-4">
                     <CalendarDays className="text-emerald-600" size={24} />
                     <div>
                        <span className="block text-sm font-bold text-emerald-900">Bi-Weekly Payments</span>
                        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mt-1 block">Effectively 1 extra payment per year</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsBiWeekly(!isBiWeekly)}>
                    <div className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all", isBiWeekly ? "bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-500/30" : "bg-white border-slate-300")}>
                        {isBiWeekly && <Check size={14} className="text-white" strokeWidth={3} />}
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-8 mb-10 md:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                        <label className="text-[13px] font-bold text-slate-700">Monthly Extra ($)</label>
                        <Tooltip text="Added to every payment moving forward." />
                    
                    </div>
                    <CurrencyInput value={monthlyExtra} onChange={setMonthlyExtra} />
                    <input type="range" min="0" max="2000" step="50" value={monthlyExtra} onChange={(e) => setMonthlyExtra(Number(e.target.value))} className="w-full h-1.5 mt-6 rounded-full cursor-pointer bg-slate-100 accent-emerald-500" />
                  </div>
                  <div className="space-y-3">
                     <div className="flex items-center gap-2">
                        <label className="text-[13px] font-bold text-slate-700">One-Time Lump Sum</label>
                        <Tooltip text="A single principal payment made today." />
                     </div>
                     <CurrencyInput value={oneTimeLumpSum} onChange={setOneTimeLumpSum} />
                  </div>
               </div>
            </div>

            {/* AUTH GATED CONTENT */}
            {isAuthenticated ? (
               <FreedomMetrics freedomDate={results.freedomDate} timeSaved={formatTimeSaved(results.timeSaved)} />
            ) : (
               <SavingsTeaser />
            )}
          </div>

          {/* RIGHT COLUMN: STICKY RESULTS */}
          <div className="space-y-6 lg:col-span-5 lg:sticky lg:top-28 h-fit">
            <div className="bg-white p-10 rounded-[1rem] border border-slate-100 shadow-2xl relative overflow-hidden text-center transition-all">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-orange-500" />
              
              <div className="flex items-center justify-center gap-6 pb-6 mb-8 border-b border-slate-50">
                 <button onClick={() => window.print()} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-red-600 transition-all uppercase tracking-widest"><Printer size={16} /> Print</button>
                 <div className="w-px h-3 bg-slate-200" />
                 <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-red-600 transition-all uppercase tracking-widest"><Share2 size={16} /> Share</button>
              </div>

              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-4">Projected Savings</p>
              
              <div className="mb-10">
                <p className="text-6xl font-bold tracking-tight md:text-7xl text-slate-900 tabular-nums">
                    ${Math.round(results.totalSaved).toLocaleString()}
                </p>
                <p className="mt-2 text-xs font-bold tracking-widest uppercase text-slate-400">Total Interest Kept</p>
              </div>
              
              {/* Interactive Donut Chart */}
              <div className="flex justify-center mb-12 transition-transform duration-700 scale-110 pointer-events-none">
                  <SavingsDonut originalInterest={results.originalTotalInterest} newInterest={results.newTotalInterest} />
              </div>

              {/* 🟢 NEW: Time Visualizer */}
              <div className="mb-10 text-left">
                 <TimeSavingsBar originalMonths={results.originalMonths} newMonths={results.newMonths} />
              </div>
              
              <div className="pt-8 mb-10 space-y-4 text-left border-t border-slate-50">
                <ResultRow label="Original Interest Cost" value={results.originalTotalInterest} color="bg-slate-300" sub="If paid on standard schedule" />
                <ResultRow label="New Interest Paid" value={results.newTotalInterest} color="bg-orange-500" sub="With accelerated strategy" />
                <ResultRow label="Interest Saved" value={results.totalSaved} color="bg-emerald-500" sub="Your total profit" />
              </div>

              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="w-full h-16 font-bold text-white transition-all shadow-xl bg-slate-900 hover:bg-slate-800 shadow-slate-900/20 group">
                    Save Strategy to Dashboard <Save className="ml-2 transition-transform group-hover:scale-110" size={18}/>
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/register">
                  <Button className="w-full font-semibold text-white transition-all bg-red-600 shadow-xl hover:bg-red-700 shadow-red-600/30 group">
                    View Freedom Timeline <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18}/>
                  </Button>
                </Link>
              )}
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-[1rem] space-y-4 shadow-sm">
               <div className="flex items-center gap-2 text-slate-700">
                  <AlertCircle size={18} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Strategy Intelligence</span>
               </div>
               <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                  Switching to <strong>Bi-Weekly payments</strong> effectively results in one extra full mortgage payment applied to your principal every year, mathematically compounding your interest savings without significantly changing your standard monthly budget.
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
  <div className="flex items-center justify-between p-4 transition-all border bg-slate-100/70 rounded-xl border-slate-100/50 hover:bg-white group">
    <div className="flex items-center gap-3">
      <div className={cn("w-3.5 h-3.5 rounded-full shadow-sm", color)} />
      <div>
         <span className="text-sm font-bold transition-colors text-slate-700 group-hover:text-slate-900">{label}</span>
         {sub && <p className="text-[9px] font-bold text-slate-500 uppercase tracking-normal mt-0.5">{sub}</p>}
      </div>
    </div>
    <span className="text-sm font-bold text-slate-900 tabular-nums">
      ${Math.round(value).toLocaleString()}
    </span>
  </div>
);