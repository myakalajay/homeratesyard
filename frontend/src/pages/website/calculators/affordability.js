'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Wallet, RefreshCw, HelpCircle, MapPin, 
  ArrowRight, AlertCircle, TrendingUp, Percent,
  Briefcase, CreditCard, PiggyBank, X, Mail, Share2, 
  Printer, Lock, ShieldCheck, Settings, Home, Save
} from 'lucide-react';
import { cn } from '@/utils/utils';

// --- CORE SERVICES ---
import { useLocation } from '@/context/LocationContext';
import { useMarketEngine } from '@/hooks/useMarketEngine';

// --- COMPONENTS ---
import PublicLayout from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/primitives/Button'; 
import { CurrencyInput } from '@/components/ui/primitives/CurrencyInput'; 
import { Select } from '@/components/ui/primitives/Select';
import FinalCTA from '@/components/marketing/cta';

// --- JSON-LD SEO SCHEMA ---
const calculatorSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Home Affordability Intelligence Calculator",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "description": "Calculate your maximum home buying power based on lender DTI guidelines, real-time market rates, and local tax profiles.",
};

// --- INTERACTIVE CHART ---
const BudgetDonut = ({ housing, debts, remaining }) => {
  const [activeSegment, setActiveSegment] = useState(null);

  const safeHousing = Math.max(0, Number(housing) || 0);
  const safeDebts = Math.max(0, Number(debts) || 0);
  const safeRemaining = Math.max(0, Number(remaining) || 0);
  const total = safeHousing + safeDebts + safeRemaining;

  if (total <= 0) {
    return (
      <div className="relative flex items-center justify-center w-64 h-64 mx-auto rounded-full bg-slate-50 border-[16px] border-slate-100 shadow-inner">
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Enter Income</span>
      </div>
    );
  }

  const housingPct = (safeHousing / total) * 100;
  const debtsPct = (safeDebts / total) * 100;
  const remainingPct = (safeRemaining / total) * 100;

  const segments = [
    { id: 'housing', label: 'Max Housing Budget', value: safeHousing, color: '#dc2626', pct: housingPct },
    { id: 'debts', label: 'Monthly Debts', value: safeDebts, color: '#f97316', pct: debtsPct },
    { id: 'remaining', label: 'Remaining Income', value: safeRemaining, color: '#10b981', pct: remainingPct },
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
            {activeSegment ? activeSegment.label : 'Gross Monthly'}
          </span>
          <div className="flex items-baseline justify-center text-slate-900">
            <span className="text-sm font-bold mr-0.5">$</span>
            <span className="text-4xl font-bold leading-none tracking-tighter tabular-nums">
              {Math.round(activeSegment ? activeSegment.value : total).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-center h-4 mt-2">
            {activeSegment ? (
              <span className="text-[10px] font-bold text-slate-500 animate-in fade-in slide-in-from-bottom-1">{Math.round(activeSegment.pct)}% of Income</span>
            ) : (
              <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-slate-400">Income Breakdown</span>
            )}
          </div>
        </div>
      </div>
      <div className="absolute inset-[10px] rounded-full border border-slate-100/50 pointer-events-none" />
    </div>
  );
};

// --- AUTH GATED COMPONENTS ---
const AffordabilityTeaser = () => (
  <div className="relative overflow-hidden border bg-slate-900 p-8 rounded-[1rem] shadow-xl text-center">
    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_#ef4444_0%,_transparent_60%)]" />
    <div className="relative z-10 flex flex-col items-center">
      <div className="flex items-center justify-center w-12 h-12 mb-4 text-red-500 rounded-full bg-white/10"><Lock size={24} /></div>
      <h3 className="mb-2 text-lg font-bold text-white">Unlock Approval Intelligence</h3>
      <p className="mb-6 text-sm font-medium text-slate-400">
        Discover your estimated closing costs, required cash reserves, and exact lender approval odds based on your DTI profile.
      </p>
      <Link href="/auth/register">
        <Button className="px-8 font-semibold text-white bg-red-600 border-none h-11 hover:bg-red-700">
          Login to View Metrics <ArrowRight size={16} className="ml-2" />
        </Button>
      </Link>
    </div>
  </div>
);

const ApprovalMetrics = ({ maxPrice, downPayment }) => {
  const estClosingCosts = maxPrice * 0.03; 
  const requiredReserves = (maxPrice * 0.007) * 3; 
  const totalCashNeeded = downPayment + estClosingCosts + requiredReserves;

  return (
    <div className="bg-white p-8 rounded-[1rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck size={22} className="text-emerald-500" />
        <h3 className="text-lg font-bold text-slate-900">Lender Approval Metrics</h3>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-5 border bg-slate-50/50 border-slate-100 rounded-2xl">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Est. Closing Costs</span>
          <span className="block text-xl font-bold text-slate-900">${Math.round(estClosingCosts).toLocaleString()}</span>
          <span className="block text-[10px] font-bold text-slate-500 mt-1">~3% of purchase</span>
        </div>
        <div className="p-5 border bg-slate-50/50 border-slate-100 rounded-2xl">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Required Reserves</span>
          <span className="block text-xl font-bold text-slate-900">${Math.round(requiredReserves).toLocaleString()}</span>
          <span className="block text-[10px] font-bold text-slate-500 mt-1">3 months PITI</span>
        </div>
        <div className="p-5 border bg-emerald-50/50 border-emerald-100 rounded-2xl">
          <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Cash to Close</span>
          <span className="block text-xl font-bold text-emerald-900">${Math.round(totalCashNeeded).toLocaleString()}</span>
          <span className="block text-[10px] font-bold text-emerald-700 mt-1">Down + Costs + Reserves</span>
        </div>
      </div>
    </div>
  );
};

export default function AffordabilityCalculator() {
  const { location, updateLocation } = useLocation();
  const { rates } = useMarketEngine(location?.zip);
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated] = useState(false); // Auth Toggle

  // --- STATE ---
  const [zipCode, setZipCode] = useState('20148');
  
  // Income Mode
  const [incomeMode, setIncomeMode] = useState('annual'); // 'annual' | 'monthly'
  const [rawIncome, setRawIncome] = useState(95000); 
  
  const [monthlyDebts, setMonthlyDebts] = useState(600); 
  const [downPayment, setDownPayment] = useState(40000);
  
  // Loan & Expense Settings
  const [interestRate, setInterestRate] = useState(6.875);
  const [loanTerm, setLoanTerm] = useState(30);
  const [dtiRatio, setDtiRatio] = useState(36); 
  
  // Escrow Assumptions
  const [monthlyHoa, setMonthlyHoa] = useState(0); 
  const [taxRate, setTaxRate] = useState(1.15); 
  const [insuranceRate, setInsuranceRate] = useState(0.35); 

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareSent, setShareSent] = useState(false);

  // Derived Values
  const annualIncome = incomeMode === 'annual' ? rawIncome : rawIncome * 12;
  const pmiRate = 0.50; 
  const [results, setResults] = useState({ maxHomePrice: 0, monthlyHousingBudget: 0, remainingIncome: 0, monthlyGross: 0 });

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (location?.zip) setZipCode(location.zip); }, [location]);
  useEffect(() => { if (rates?.['30Y']) setInterestRate(parseFloat(rates['30Y'])); }, [rates]);

  // --- CALCULATION ENGINE ---
  useEffect(() => {
    const safeIncome = Number(annualIncome) || 0;
    const safeDebts = Number(monthlyDebts) || 0;
    const safeDown = Number(downPayment) || 0;
    const safeHoa = Number(monthlyHoa) || 0;
    const safeRate = Number(interestRate) || 0;
    const safeTerm = Number(loanTerm) || 30;
    const safeDti = Number(dtiRatio) || 36;
    const safeTax = Number(taxRate) || 1.15;
    const safeIns = Number(insuranceRate) || 0.35;

    const mGross = safeIncome / 12;
    const maxTotalDebtPayment = mGross * (safeDti / 100);
    const maxHousingPayment = Math.max(0, maxTotalDebtPayment - safeDebts);
    
    let calculatedPrice = 0;
    
    const r = safeRate / 100 / 12;
    const n = safeTerm * 12;
    const mortgageFactor = safeRate === 0 ? (1 / n) : (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const escrowFactor = (safeTax / 100 / 12) + (safeIns / 100 / 12);
    
    let basePrice = (maxHousingPayment - safeHoa + (safeDown * mortgageFactor)) / (mortgageFactor + escrowFactor);
    let calculated = basePrice;

    // PMI Check: If LTV > 80% (Down < 20%), add PMI factor algebraically 
    if (safeDown < (basePrice * 0.20)) {
        const pmiFactor = pmiRate / 100 / 12;
        calculated = (maxHousingPayment - safeHoa + (safeDown * (mortgageFactor + pmiFactor))) / (mortgageFactor + escrowFactor + pmiFactor);
    }

    setResults({
        maxHomePrice: Math.max(0, Math.floor(calculated)),
        monthlyHousingBudget: Math.max(0, Math.floor(maxHousingPayment)),
        monthlyGross: Math.max(0, Math.floor(mGross)),
        remainingIncome: Math.max(0, Math.floor(mGross - maxHousingPayment - safeDebts))
    });

  }, [annualIncome, monthlyDebts, downPayment, monthlyHoa, taxRate, insuranceRate, interestRate, loanTerm, dtiRatio]);

  const handleIncomeChange = (val) => setRawIncome(val);

  const toggleIncomeMode = () => {
     if (incomeMode === 'annual') {
        setRawIncome(Math.round(rawIncome / 12));
        setIncomeMode('monthly');
     } else {
        setRawIncome(rawIncome * 12);
        setIncomeMode('annual');
     }
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
        <title>Affordability Strategy Hub | HomeRatesYard</title>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }} />
      </Head>

      {/* SHARE MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="relative w-full max-w-md p-8 mx-4 bg-white shadow-2xl rounded-[1rem] animate-in zoom-in-95 text-center">
                <button onClick={() => setIsShareModalOpen(false)} className="absolute p-2 transition-colors rounded-full top-6 right-6 text-slate-400 hover:text-slate-900"><X size={20} /></button>
                {shareSent ? (
                    <div className="py-6">
                        <div className="flex items-center justify-center mx-auto mb-4 shadow-sm w-14 h-14 bg-emerald-50 text-emerald-600"><Wallet size={28} /></div>
                        <h3 className="mb-2 text-xl font-semibold text-slate-900">Report Sent!</h3>
                        <p className="text-sm font-medium text-slate-500">Check your inbox for the detailed breakdown.</p>
                    </div>
                ) : (
                    <form onSubmit={executeShare}>
                        <div className="flex items-center justify-center mx-auto mb-6 text-red-600 shadow-sm w-14 h-14 bg-red-50 rounded-2xl"><Mail size={28} /></div>
                        <h3 className="mb-2 text-xl font-bold text-slate-900">Email Affordability Report</h3>
                        <p className="mb-6 text-sm font-medium leading-relaxed text-slate-500">
                            Send a breakdown of your <strong className="text-slate-900">${results.maxHomePrice.toLocaleString()}</strong> buying power strategy.
                        </p>
                        <input type="email" required placeholder="name@email.com" value={shareEmail} onChange={e => setShareEmail(e.target.value)} className="w-full h-12 px-4 mb-4 text-sm font-bold transition-all border outline-none text-slate-900 border-slate-200 rounded-xl focus:border-red-600 focus:ring-4 focus:ring-red-600/10" />
                        <Button type="submit" className="w-full h-12 font-semibold text-white bg-red-600 shadow-xl hover:bg-red-700">Send Report</Button>
                    </form>
                )}
            </div>
        </div>
      )}

      <PublicLayout>
        <section className="relative px-6 pt-24 pb-24 overflow-hidden text-center bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ef444415,_transparent_70%)]" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold tracking-widest text-red-400 uppercase bg-red-500/10 border border-red-500/20 rounded-full">
               <Wallet size={12} /> Affordability Intelligence
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
               Discover Your <span className="text-red-500">Buying Power</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg font-normal leading-relaxed text-slate-400">
               Simulate lender guidelines, test debt-to-income scenarios, and understand your true budget with 2026 market data.
            </p>
          </div>
        </section>
        
        <div className="relative z-20 grid items-start grid-cols-1 gap-10 px-4 pb-8 mx-auto -mt-12 max-w-7xl md:px-8 lg:grid-cols-12">
          
          {/* --- LEFT COLUMN: INPUTS --- */}
          <div className="space-y-8 lg:col-span-7">
            
            {/* CORE FINANCIALS */}
            <div className="bg-white p-8 md:p-10 rounded-[1rem] border border-slate-100 shadow-xl shadow-slate-200/40">
              <div className="flex flex-col justify-between gap-6 pb-8 mb-10 border-b md:flex-row md:items-center border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center text-red-600 shadow-inner w-14 h-14 rounded-2xl bg-red-50"><MapPin size={28}/></div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Market Context</h3>
                    <p className="mt-1 text-xs font-semibold tracking-wide uppercase text-slate-500">Estimating for: <span className="text-red-600">{location?.city || 'Selected Market'}</span></p>
                  </div>
                </div>
                <div className="w-full md:w-40">
                    <input type="text" maxLength={5} value={zipCode} onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))} onBlur={() => updateLocation?.(zipCode)} placeholder="Zipcode" className="w-full h-12 px-4 text-sm font-semibold transition-all border outline-none border-slate-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500" />
                </div>
              </div>

              <div className="space-y-12">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <label className="text-[13px] font-bold text-slate-700">
                           {incomeMode === 'annual' ? 'Gross Annual Income' : 'Gross Monthly Income'}
                        </label>
                        <Tooltip text="Total household income before taxes. Toggle for monthly/annual view." />
                    </div>
                    <button onClick={toggleIncomeMode} className="text-[10px] font-bold text-red-600 uppercase tracking-widest hover:text-red-700 bg-red-50 px-3 py-1 rounded-lg">
                        Switch to {incomeMode === 'annual' ? 'Monthly' : 'Annual'}
                    </button>
                  </div>
                  <CurrencyInput value={rawIncome} onChange={handleIncomeChange} className="text-xl h-14 border-slate-200 focus:border-red-500" />
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><label className="text-[13px] font-bold text-slate-700">Monthly Debts</label><Tooltip text="Auto loans, student loans, minimum credit card payments." /></div>
                    <CurrencyInput value={monthlyDebts} onChange={setMonthlyDebts} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <label className="text-[13px] font-bold text-slate-700">Down Payment</label>
                        {/* 🟢 FIX 2: Added explicit cash-to-close warning */}
                        <Tooltip text="Funds applied directly to the loan. Excludes closing costs and required reserves." />
                    </div>
                    <CurrencyInput value={downPayment} onChange={setDownPayment} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* EXPENSES & ASSUMPTIONS */}
            <div className="bg-white p-8 md:p-10 rounded-[1rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center justify-center w-10 h-10 text-slate-600 rounded-xl bg-slate-100"><Settings size={20} /></div>
                  <h3 className="text-lg font-bold text-slate-900">Expenses & Assumptions</h3>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="space-y-3">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">HOA Dues</label>
                        <CurrencyInput value={monthlyHoa} onChange={setMonthlyHoa} />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Prop. Tax (%)</label>
                        <CurrencyInput value={taxRate} onChange={setTaxRate} icon={Percent} suffix="%" />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Home Ins (%)</label>
                        <CurrencyInput value={insuranceRate} onChange={setInsuranceRate} icon={Percent} suffix="%" />
                    </div>
                </div>
            </div>

            {/* LENDING GUIDELINES */}
            <div className="bg-white p-8 md:p-10 rounded-[1rem] border border-slate-100 shadow-sm">
               <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center justify-center w-10 h-10 text-orange-600 rounded-xl bg-orange-50"><TrendingUp size={20} /></div>
                  <h3 className="text-lg font-bold text-slate-900">Lending Guidelines</h3>
               </div>

               <div className="grid grid-cols-1 gap-8 mb-10 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="block text-[13px] font-bold text-slate-700">Interest Rate (%)</label>
                    <CurrencyInput value={interestRate} onChange={setInterestRate} icon={Percent} suffix="%" />
                  </div>
                  <Select label="Loan Term" value={loanTerm} onChange={(v)=>setLoanTerm(Number(v))} options={[{label:'30 Years Fixed', value:30},{label:'15 Years Fixed', value:15}]} />
               </div>

               <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <label className="text-[13px] font-bold text-slate-700">Debt-to-Income Limit (DTI)</label>
                        <Tooltip text="The maximum percentage of your gross income a lender will allow for debts." />
                    </div>
                    <span className={cn("text-sm font-bold px-3 py-1 rounded-md", dtiRatio > 43 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600")}>{dtiRatio}%</span>
                  </div>
                  <input type="range" min="20" max="50" value={dtiRatio} onChange={(e)=>setDtiRatio(Number(e.target.value))} className={cn("w-full h-1.5 rounded-full cursor-pointer bg-slate-100", dtiRatio > 43 ? "accent-red-600" : "accent-emerald-500")} />
                  <div className="flex justify-between mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Conservative (28%)</span>
                    <span>Standard (36%)</span>
                    <span>Aggressive (45%)</span>
                  </div>
               </div>
            </div>

            {/* AUTH GATED CONTENT */}
            {isAuthenticated ? (
               <ApprovalMetrics maxPrice={results.maxHomePrice} downPayment={downPayment} />
            ) : (
               <AffordabilityTeaser />
            )}
          </div>

          {/* --- RIGHT COLUMN: RESULTS (Sticky) --- */}
          <div className="space-y-6 lg:col-span-5 lg:sticky lg:top-28 h-fit">
            <div className="bg-white p-10 rounded-[1rem] border border-slate-100 shadow-2xl relative overflow-hidden text-center transition-all">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-orange-500" />
              
              <div className="flex items-center justify-center gap-6 pb-6 mb-8 border-b border-slate-50">
                 <button onClick={() => window.print()} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-red-600 transition-all uppercase tracking-widest"><Printer size={16} /> Print</button>
                 <div className="w-px h-3 bg-slate-200" />
                 <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-red-600 transition-all uppercase tracking-widest"><Share2 size={16} /> Share</button>
              </div>

              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.25em] mb-4">Maximum Buying Power</p>
              <div className="mb-10 text-5xl font-bold tracking-tigh md:text-6xl text-slate-900">${results.maxHomePrice.toLocaleString()}</div>
              
              <div className="flex justify-center mb-12 scale-110"><BudgetDonut housing={results.monthlyHousingBudget} debts={monthlyDebts} remaining={results.remainingIncome} /></div>
              
              <div className="mb-10 space-y-4 text-left">
                <ResultRow label="Max Housing Payment" value={results.monthlyHousingBudget} color="bg-red-600" />
                <ResultRow label="Existing Debt Load" value={monthlyDebts} color="bg-orange-500" />
                <ResultRow label="Remaining Income" value={results.remainingIncome} color="bg-emerald-500" />
              </div>

              {/* 🟢 FIX 1: DYNAMIC AUTH CTA */}
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="w-full h-16 font-bold text-white transition-all shadow-xl bg-slate-900 hover:bg-slate-800 rounded-2xl shadow-slate-900/20 group">
                    Save Strategy to Dashboard <Save className="ml-2 transition-transform group-hover:scale-110" size={18}/>
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/register">
                  <Button className="w-full font-semibold text-white transition-all bg-red-600 shadow-xl hover:bg-red-700 shadow-red-600/30 group">
                    Verify Approval Odds <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18}/>
                  </Button>
                </Link>
              )}
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-[1rem] space-y-4 shadow-sm">
               <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle size={18} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Lending Disclaimer</span>
               </div>
               <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                  Results use your target <strong>{dtiRatio}% DTI limit</strong>. Pushing beyond 43% may trigger manual lender review. Calculations assume {taxRate}% property tax and {insuranceRate}% home insurance.
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

const ResultRow = ({ label, value, color }) => (
  <div className="flex items-center justify-between p-4 transition-all border bg-slate-50/50 rounded-2xl border-slate-100/50 hover:bg-white group">
    <div className="flex items-center gap-3">
      <div className={cn("w-3.5 h-3.5 rounded-full shadow-sm", color)} />
      <span className="text-sm font-bold transition-colors text-slate-700 group-hover:text-slate-900">{label}</span>
    </div>
    <span className="text-sm font-bold text-slate-900 tabular-nums">${value.toLocaleString()}</span>
  </div>
);