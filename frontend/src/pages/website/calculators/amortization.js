'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  CalendarClock, RefreshCw, HelpCircle, MapPin, 
  ArrowRight, Calendar, Table as TableIcon, Percent,
  PiggyBank, Share2, Printer, X, Mail, ShieldCheck, 
  TrendingUp, Target, Home, Lock, ChevronRight, AlertTriangle
} from 'lucide-react';
import { cn } from '@/utils/utils';

// --- CORE SERVICES & CONTEXT ---
import { useLocation } from '@/context/LocationContext';
import { useMarketEngine } from '@/hooks/useMarketEngine';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';
import { Button } from '@/components/ui/primitives/Button'; 
import { CurrencyInput } from '@/components/ui/primitives/CurrencyInput'; 
import { Select } from '@/components/ui/primitives/Select';

// --- INTERNAL COMPONENTS ---

const WealthTeaser = () => (
  <div className="relative overflow-hidden border bg-slate-900 p-8 rounded-[2rem] shadow-xl">
    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_#ef4444_0%,_transparent_60%)]" />
    <div className="relative z-10 flex flex-col items-center text-center">
      <div className="flex items-center justify-center w-12 h-12 mb-4 text-red-500 rounded-full bg-white/10">
        <Lock size={24} />
      </div>
      <h3 className="mb-2 text-lg font-bold text-white">Unlock Payoff Intelligence</h3>
      <p className="mb-6 text-sm font-medium text-slate-400">
        Discover precisely when you'll reach 20% and 50% equity milestones with your custom interest savings strategy.
      </p>
      <Link href="/auth/register">
        <Button className="px-8 font-bold text-white bg-red-600 border-none h-11 hover:bg-red-700 rounded-xl">
          Login to View Timeline <ArrowRight size={16} className="ml-2" />
        </Button>
      </Link>
    </div>
  </div>
);

const EquityMilestones = ({ schedule, homePrice }) => {
  if (!schedule || schedule.length === 0) return null;
  
  const milestones = [
    { label: 'Equity Exit', pct: 20, target: homePrice * 0.20, icon: ShieldCheck, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Equity Split', pct: 50, target: homePrice * 0.50, icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Full Ownership', pct: 100, target: homePrice, icon: Home, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  const milestoneData = milestones.map(m => {
    const data = schedule.find(s => (homePrice - s.balance) >= m.target) || schedule[schedule.length - 1];
    return { ...m, year: data.year };
  });

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp size={22} className="text-emerald-500" />
        <h3 className="text-lg font-bold text-slate-900">Wealth Accumulation Timeline</h3>
      </div>
      <div className="relative flex flex-col justify-between gap-8 md:flex-row md:gap-4">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 hidden md:block" />
        {milestoneData.map((m) => (
          <div key={m.label} className="relative z-10 flex flex-col items-center flex-1 text-center group">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110 shadow-sm border border-white", m.bg, m.color)}>
              <m.icon size={28} />
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</span>
              <span className="block text-lg font-bold text-slate-900">Year {m.year}</span>
              <span className="block text-[11px] font-medium text-slate-500">${Math.round(m.target).toLocaleString()} Equity</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CostDonut = ({ principal, interest }) => {
  const total = principal + interest;
  if (total <= 0) return null;
  const principalDeg = (principal / total) * 360;
  const gradient = `conic-gradient(#dc2626 0deg ${principalDeg}deg, #f97316 ${principalDeg}deg 360deg)`;

  return (
    <div className="relative mx-auto rounded-full shadow-lg w-60 h-60" style={{ background: gradient }}>
      <div className="absolute flex flex-col items-center justify-center bg-white rounded-full inset-[18px] border border-slate-50">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Payback</span>
        <span className="text-4xl font-bold text-slate-900 tabular-nums">${Math.round(total/1000)}k</span>
        <span className="mt-1 text-[10px] font-bold tracking-widest uppercase text-slate-400">P + I Lifetime</span>
      </div>
    </div>
  );
};

export default function AmortizationCalculator() {
  const { location, updateLocation } = useLocation();
  const { rates } = useMarketEngine(location?.zip);
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated] = useState(false); // Auth Toggle

  const [zipInput, setZipInput] = useState("");
  const [loanAmount, setLoanAmount] = useState(350000);
  const [interestRate, setInterestRate] = useState(6.950);
  const [loanTerm, setLoanTerm] = useState(30);
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [extraPayment, setExtraPayment] = useState(0);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (location?.zip) setZipInput(location.zip); }, [location]);
  useEffect(() => { if (rates?.['30Y']) setInterestRate(parseFloat(rates['30Y'])); }, [rates]);

  const results = useMemo(() => {
    const principal = Number(loanAmount) || 0;
    const rate = Number(interestRate) || 0;
    const termYears = Number(loanTerm) || 30;
    const extra = Number(extraPayment) || 0;
    const firstYear = Number(startYear) || new Date().getFullYear();

    if (principal <= 0) return { schedule: [], totalInterest: 0, payoffDate: '-', savings: 0, payoffYearsSaved: 0, totalCost: 0 };

    const monthlyRate = rate / 100 / 12;
    const totalMonths = termYears * 12;
    
    const standardMonthlyPI = monthlyRate > 0 
      ? (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : principal / totalMonths;
      
    const standardTotalInterest = (standardMonthlyPI * totalMonths) - principal;
    
    let balance = principal;
    let totalInterestPaid = 0;
    let monthCount = 0;
    let annualInterest = 0;
    let annualPrincipal = 0;
    const schedule = [];

    // Safety limit of 50 years to prevent infinite loops
    while (balance > 0.01 && monthCount < 600) {
      monthCount++;
      const interestM = balance * monthlyRate;
      let principalM = (standardMonthlyPI + extra) - interestM;

      if (balance < principalM) principalM = balance;

      balance -= principalM;
      totalInterestPaid += interestM;
      annualInterest += interestM;
      annualPrincipal += principalM;

      if (monthCount % 12 === 0 || balance <= 0.01) {
        schedule.push({
          year: firstYear + Math.floor((monthCount - 1) / 12),
          interest: annualInterest,
          principal: annualPrincipal,
          balance: Math.max(0, balance)
        });
        annualInterest = 0;
        annualPrincipal = 0;
      }
      if (balance <= 0) break;
    }

    const payoffDate = new Date(firstYear, 0, 1);
    payoffDate.setMonth(payoffDate.getMonth() + monthCount);

    return {
      schedule,
      totalInterest: Math.round(totalInterestPaid),
      payoffDate: payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      savings: Math.max(0, Math.round(standardTotalInterest - totalInterestPaid)),
      payoffYearsSaved: Number(((totalMonths - monthCount) / 12).toFixed(1)),
      totalCost: Math.round(principal + totalInterestPaid)
    };
  }, [loanAmount, interestRate, loanTerm, startYear, extraPayment]);

  if (!mounted) return null;

  return (
    <PublicLayout>
      <Head><title>Amortization Strategy Hub | HomeRatesYard</title></Head>

      {isShareModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-xl p-8 rounded-[1rem] shadow-2xl relative animate-in zoom-in-95 text-center">
            <button onClick={() => setIsShareModalOpen(false)} className="absolute transition-colors top-6 right-6 text-slate-400 hover:text-slate-900"><X size={20}/></button>
            <div className="flex items-center justify-center mx-auto mb-6 text-red-600 shadow-sm w-14 h-14 bg-red-50 rounded-2xl"><Mail size={28}/></div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">Email Full Schedule</h3>
            <p className="mb-6 text-sm font-medium text-slate-500">Receive a professional year-by-year principal vs. interest breakdown PDF.</p>
            <input 
              type="email" placeholder="name@email.com" 
              className="w-full h-12 px-4 mb-4 font-medium border outline-none border-slate-200 rounded-xl focus:ring-4 focus:ring-red-500/10"
              value={shareEmail} onChange={(e) => setShareEmail(e.target.value)}
            />
            <Button className="w-full h-12 font-semibold text-white bg-red-600 rounded-xl" onClick={() => setIsShareModalOpen(false)}>Email Report</Button>
          </div>
        </div>
      )}

      <div className="min-h-screen pb-2 bg-slate-50 selection:bg-red-50 selection:text-red-600">
        <section className="relative px-6 pt-16 pb-24 overflow-hidden text-center bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ef444415,_transparent_70%)]" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold tracking-widest text-red-400 uppercase bg-red-500/10 border border-red-500/20 rounded-full">
               <CalendarClock size={12} /> Strategic Payoff Hub
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
               Plan Your <span className="text-red-500">Debt-Free</span> Journey
            </h1>
            <p className="max-w-2xl mx-auto text-lg font-medium leading-relaxed text-slate-400">
               Simulate interest savings, visualize equity markers, and optimize your payoff timeline with 2026 data.
            </p>
          </div>
        </section>

        <div className="relative z-20 grid items-start grid-cols-1 gap-10 px-4 mx-auto -mt-12 max-w-7xl md:px-8 lg:grid-cols-12">
          
          <div className="space-y-8 lg:col-span-7">
            <div className="bg-white p-8 md:p-10 rounded-[1rem] border border-slate-100 shadow-xl shadow-slate-200/40">
              <div className="flex flex-col justify-between gap-6 pb-8 mb-10 border-b md:flex-row md:items-center border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center text-red-600 shadow-inner w-14 h-14 rounded-2xl bg-red-50"><MapPin size={28}/></div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Market Context</h3>
                    <p className="mt-1 text-xs font-bold tracking-widest uppercase text-slate-400">Estimating for: <span className="font-semibold text-red-600">{location?.city || 'Detecting...'}, {location?.state}</span></p>
                  </div>
                </div>
                <div className="w-full md:w-40">
                    <div className="relative">
                        <input 
                            type="text" maxLength={5} placeholder="Zipcode"
                            value={zipInput} onChange={(e) => setZipInput(e.target.value.replace(/\D/g, ''))}
                            onBlur={() => updateLocation?.(zipInput)}
                            className="w-full h-12 pl-4 pr-10 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500"
                        />
                        <button className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-300 hover:text-red-600"><RefreshCw size={16}/></button>
                    </div>
                </div>
              </div>

              <div className="space-y-12">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <label className="text-[13px] font-bold text-slate-700">Principal Loan Amount</label>
                    <HelpCircle size={14} className="text-slate-300 cursor-help" />
                  </div>
                  <CurrencyInput value={loanAmount} onChange={setLoanAmount} className="text-xl transition-all h-14 border-slate-200 focus:border-red-500" />
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="block text-[13px] font-bold text-slate-700">Interest Rate (%)</label>
                    <CurrencyInput value={interestRate} icon={Percent} suffix="%" onChange={setInterestRate} />
                  </div>
                  <Select label="Term Length" value={loanTerm} onChange={(v) => setLoanTerm(Number(v))} options={[{label:'30 Years Fixed', value:30},{label:'15 Years Fixed', value:15}]} />
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="block text-[13px] font-bold text-slate-700">Start Date (Year)</label>
                    <input type="number" value={startYear} onChange={(e) => setStartYear(e.target.value)} className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-red-500" />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[13px] font-bold text-slate-700 text-emerald-600">Extra Monthly Pay</label>
                    <CurrencyInput value={extraPayment} onChange={setExtraPayment} className="border-emerald-100 bg-emerald-50/20 focus:border-emerald-500" />
                  </div>
                </div>
              </div>
            </div>

            {isAuthenticated ? (
               <EquityMilestones schedule={results.schedule} loanAmount={loanAmount} homePrice={loanAmount * 1.2} />
            ) : (
               <WealthTeaser />
            )}

            <div className="hidden lg:block bg-white border border-slate-100 rounded-[1rem] shadow-sm overflow-hidden">
               <div className="flex items-center gap-4 p-8 border-b border-slate-200">
                  <div className="p-3 text-white shadow-lg bg-slate-900 rounded-2xl"><TableIcon size={24}/></div>
                  <h3 className="text-xl font-bold text-slate-900">Annual Amortization Table</h3>
               </div>
               <div className="p-8">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <th className="px-4 py-4">Year</th>
                        <th className="px-4 py-4">Principal</th>
                        <th className="px-4 py-4 text-red-500/80">Interest</th>
                        <th className="px-4 py-4 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {results.schedule.slice(0, 15).map((row) => (
                        <tr key={row.year} className="transition-colors hover:bg-slate-50/50 group">
                          <td className="px-4 py-5 text-sm font-bold text-slate-900">Year {row.year}</td>
                          <td className="px-4 py-5 text-sm font-medium text-slate-600">${Math.round(row.principal).toLocaleString()}</td>
                          <td className="px-4 py-5 text-sm font-medium text-red-500">${Math.round(row.interest).toLocaleString()}</td>
                          <td className="px-4 py-5 font-mono text-sm font-bold text-right text-slate-900">${Math.round(row.balance).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pt-8 mt-8 text-center border-t border-slate-50">
                     <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Showing standard 15-year forecast.<br/>Login to generate and download full lifecycle report.</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-8 lg:col-span-5 lg:sticky lg:top-28 h-fit">
            <div className="bg-white p-10 rounded-[1rem] border border-slate-100 shadow-2xl relative overflow-hidden text-center transition-all">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-orange-500" />
              
              <div className="flex items-center justify-center gap-6 pb-6 mb-8 border-b border-slate-50">
                 <button onClick={() => window.print()} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-red-600 transition-all uppercase tracking-widest"><Printer size={16} /> Print</button>
                 <div className="w-px h-3 bg-slate-200" />
                 <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-red-600 transition-all uppercase tracking-widest"><Share2 size={16} /> Share</button>
              </div>

              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-4">Projected Payoff Date</p>
              <div className="mb-10 text-4xl font-bold tracking-tighter md:text-5xl text-slate-900">{results.payoffDate}</div>
              
              <div className="flex justify-center mb-12 transition-transform duration-700 scale-110 pointer-events-none"><CostDonut principal={loanAmount} interest={results.totalInterest} /></div>
              
              <div className="mb-10 space-y-4 text-left">
                <ResultRow label="Principal Amount" value={loanAmount} color="bg-red-600" />
                <ResultRow label="Lifetime Interest" value={results.totalInterest} color="bg-orange-500" />
                {results.savings > 0 && <ResultRow label="Strategy Savings" value={results.savings} color="bg-emerald-500" sub="Interest saved via extra pay" />}
              </div>

              <Button className="w-full font-semibold text-white transition-all bg-red-600 shadow-xl hover:bg-red-700 shadow-red-600/30 group">
                Check personalized quotes <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18}/>
              </Button>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-[1rem] space-y-4 shadow-sm">
               <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle size={18} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Accuracy Disclaimer</span>
               </div>
               <p className="text-[11px] leading-relaxed text-slate-600 font-normal">
                  Projected payoff dates assume consistent payments. Figures do not account for taxes or insurance unless integrated into a primary mortgage loan.
               </p>
            </div>
          </div>
        </div>
      </div>
      <FinalCTA />
    </PublicLayout>
  );
}

const ResultRow = ({ label, value, color, sub }) => (
  <div className="flex items-center justify-between p-4 transition-all border bg-slate-50/50 rounded-2xl border-slate-100/50 hover:bg-white group">
    <div className="flex items-center gap-3">
      <div className={cn("w-3.5 h-3.5 rounded-full shadow-sm", color)} />
      <div>
        <span className="text-sm font-bold transition-colors text-slate-700 group-hover:text-slate-900">{label}</span>
        {sub && <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter mt-0.5">{sub}</p>}
      </div>
    </div>
    <span className="text-sm font-bold text-slate-900 tabular-nums">${value.toLocaleString()}</span>
  </div>
);