'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { 
  Calculator, MapPin, ArrowRight, Share2, Printer, Percent,
  ShieldCheck, PieChart, PiggyBank, X, List, ChevronRight, 
  Mail, RefreshCcw, Info, Download, AlertTriangle, HelpCircle, 
  Search, Target, Home, TrendingUp, Lock
} from 'lucide-react';
import { cn } from '@/utils/utils';

// --- AUTH & CONTEXT ---
import { useLocation } from '@/context/LocationContext';
import { useMarketEngine } from '@/hooks/useMarketEngine';
// Assuming you have an AuthContext to check login status
// import { useAuth } from '@/context/AuthContext'; 

import PublicLayout from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/primitives/Button';
import { Select } from '@/components/ui/primitives/Select';
import { CurrencyInput } from '@/components/ui/primitives/CurrencyInput'; 
import { PaymentDonut } from '@/components/charts/PaymentDonut';     

// --- INTERNAL COMPONENT: THE TEASER (Lead Magnet) ---
const WealthTeaser = () => (
  <div className="relative overflow-hidden border bg-slate-900 p-8 rounded-[1rem] shadow-xl">
    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_#ef4444_0%,_transparent_60%)]" />
    <div className="relative z-10 flex flex-col items-center text-center">
      <div className="flex items-center justify-center w-12 h-12 mb-4 text-red-500 rounded-full bg-white/10">
        <Lock size={24} />
      </div>
      <h3 className="mb-2 text-lg font-bold text-white">Unlock Wealth Intelligence</h3>
      <p className="mb-6 text-sm font-medium text-slate-400">
        See exactly when you'll exit PMI, hit 50% equity, and reach full ownership based on your current strategy.
      </p>
      <Button className="font-bold text-white bg-red-600 border-none h-11 hover:bg-red-700">
        Login to View Timeline <ArrowRight size={16} className="ml-2" />
      </Button>
    </div>
  </div>
);

// --- INTERNAL COMPONENT: EQUITY MILESTONES (The Prize) ---
const EquityMilestones = ({ schedule, homePrice }) => {
  if (!schedule || schedule.length === 0) return null;

  const milestones = [
    { label: 'PMI Exit', pct: 20, target: homePrice * 0.20, icon: ShieldCheck, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Equity Split', pct: 50, target: homePrice * 0.50, icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Full Ownership', pct: 100, target: homePrice, icon: Home, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  const milestoneData = milestones.map(m => {
    const yearData = schedule.find(s => s.equity >= m.target) || schedule[schedule.length - 1];
    return { ...m, year: yearData.year };
  });

  return (
    <div className="bg-white p-8 rounded-[1rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp size={22} className="text-emerald-500" />
        <h3 className="text-lg font-bold text-slate-900">Wealth Accumulation Timeline</h3>
      </div>
      <div className="relative flex flex-col justify-between gap-8 md:flex-row md:gap-4">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 hidden md:block" />
        {milestoneData.map((m) => (
          <div key={m.label} className="relative z-10 flex flex-col items-center flex-1 text-center">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-white", m.bg, m.color)}>
              <m.icon size={28} />
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</span>
              <span className="block text-lg font-bold text-slate-900">Year {m.year}</span>
              <span className="block text-xs font-medium text-slate-500">${m.target.toLocaleString()} Equity</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function MortgageCalculator() {
  const { location, updateLocation } = useLocation() || {};
  const { rates, loading, conformingLimit } = useMarketEngine(location?.zip) || {}; 
  
  // Simulated Auth State - Toggle this to see the difference
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [zipInput, setZipInput] = useState("");
  const [homePrice, setHomePrice] = useState(450000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.950);
  const [loanTerm, setLoanTerm] = useState(30);
  const [extraPayment, setExtraPayment] = useState(0);
  
  const [activeModal, setActiveModal] = useState(null); 
  const [includeEscrow, setIncludeEscrow] = useState(true);
  const [shareEmail, setShareEmail] = useState("");

  const [propertyTax, setPropertyTax] = useState(450);
  const [homeInsurance, setHomeInsurance] = useState(150);
  const [hoaFees, setHoaFees] = useState(0);

  useEffect(() => { 
    setMounted(true); 
    if (location?.zip) setZipInput(location.zip);
  }, [location]);

  const loanAmount = Math.max(0, homePrice - (homePrice * (downPaymentPercent / 100)));
  const currentMaxLimit = conformingLimit || 766550; 
  const isOverLimit = loanAmount > currentMaxLimit;

  const calculations = useMemo(() => {
    const r = (interestRate / 100) / 12;
    const n = loanTerm * 12;
    const pni = r > 0 ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loanAmount / n;
    const pmi = (loanAmount / homePrice) > 0.8 ? (loanAmount * 0.007) / 12 : 0;
    const monthlyEscrow = includeEscrow ? (Number(propertyTax) + Number(homeInsurance) + Number(hoaFees) + pmi) : 0;
    
    let schedule = [];
    let balance = loanAmount;
    let totalInt = 0;
    for (let i = 1; i <= n; i++) {
      const intP = balance * r;
      const prinP = (pni + Number(extraPayment)) - intP;
      totalInt += intP;
      balance = Math.max(0, balance - prinP);
      if (i % 12 === 0 || balance === 0) {
        schedule.push({ year: i / 12, balance: Math.round(balance), interest: Math.round(totalInt), equity: Math.round(homePrice - balance) });
      }
      if (balance === 0) break;
    }

    return { pni: Math.round(pni), escrow: Math.round(monthlyEscrow), total: Math.round(pni + monthlyEscrow), schedule };
  }, [loanAmount, interestRate, loanTerm, propertyTax, homeInsurance, hoaFees, extraPayment, includeEscrow, homePrice]);

  if (!mounted) return null;

  return (
    <PublicLayout>
      <Head><title>The Hub for Digital Mortgage | HomeRatesYard</title></Head>

      {/* --- AMORTIZATION MODAL --- */}
      {activeModal === 'schedule' && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[1rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="flex items-center justify-between p-8 bg-white border-b border-slate-100">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Amortization Schedule</h3>
                <p className="text-sm font-medium text-slate-500">Principal & Interest breakdown over {loanTerm} years</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-3 transition-colors rounded-full bg-slate-50 hover:bg-red-50 hover:text-red-600"><X size={20}/></button>
            </div>
            <div className="flex-1 p-8 pt-0 overflow-y-auto custom-scrollbar">
               <table className="w-full text-left">
                  <thead className="sticky top-0 z-10 py-4 bg-white">
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                      <th className="px-4 py-5">Year</th>
                      <th className="px-4 py-5">Remaining Balance</th>
                      <th className="px-4 py-5">Home Equity</th>
                      <th className="px-4 py-5 text-right">Total Interest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {calculations.schedule.map((r) => (
                      <tr key={r.year} className="transition-colors hover:bg-slate-50/50 text-slate-600">
                        <td className="px-4 py-5 text-sm font-bold text-slate-900">Year {r.year}</td>
                        <td className="px-4 py-5 font-mono text-sm font-medium">${r.balance.toLocaleString()}</td>
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-emerald-600">${r.equity.toLocaleString()}</span>
                            <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                              <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (r.equity / homePrice) * 100)}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-5 font-mono text-sm font-bold text-right text-red-500">${r.interest.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      )}

      {/* --- SHARE ESTIMATE MODAL --- */}
      {activeModal === 'share' && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md p-8 rounded-[1rem] shadow-2xl relative animate-in zoom-in-95 text-center">
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><X size={20}/></button>
            <div className="flex items-center justify-center mx-auto mb-6 text-red-600 shadow-sm w-14 h-14 bg-red-50 rounded-2xl shadow-red-200"><Mail size={28}/></div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">Email My Estimate</h3>
            <p className="mb-6 text-sm font-medium leading-relaxed text-slate-500">Receive a professional PDF breakdown of this strategy directly to your inbox.</p>
            <input 
              type="email" placeholder="name@email.com" 
              className="w-full h-12 px-4 mb-4 font-medium transition-all border outline-none border-slate-200 rounded-xl focus:ring-4 focus:ring-red-500/10"
              value={shareEmail} onChange={(e) => setShareEmail(e.target.value)}
            />
            <Button className="w-full h-12 font-semibold text-white bg-red-600" onClick={() => setActiveModal(null)}>Send Report</Button>
          </div>
        </div>
      )}

      <div className="min-h-screen pb-24 font-sans bg-slate-50 selection:bg-red-50">
        
        {/* HERO SECTION */}
        <section className="relative px-6 pt-24 pb-24 overflow-hidden text-center bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ef444412,_transparent_35%)]" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-[10px] font-bold tracking-widest text-red-400 uppercase bg-red-400/10 border border-red-400/20 rounded-lg">
                <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} /> 6.950% MARKET PULSE
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
              The Hub for <span className="text-red-500">Digital Mortgage</span>
            </h1>
            <p className="max-w-6xl mx-auto text-lg font-normal leading-relaxed text-slate-400">
              Simulate purchase scenarios, visualize equity milestones, and synchronize your home buying journey with real-time market data.
            </p>
          </div>
        </section>

        {/* MAIN CALCULATOR GRID */}
        <div className="relative z-30 grid items-start grid-cols-1 gap-8 px-4 mx-auto -mt-16 max-w-7xl md:px-8 lg:grid-cols-12">
          
          {/* LEFT COLUMN: CONTROLS */}
          <div className="space-y-6 lg:col-span-7">
            <div className="bg-white p-8 md:p-10 rounded-[1rem] border border-slate-100 shadow-xl shadow-slate-200/40">
              <div className="flex flex-col justify-between gap-6 pb-8 mb-10 border-b md:flex-row md:items-center border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center text-red-600 shadow-inner w-14 h-14 rounded-2xl bg-red-50 shadow-red-200/50"><MapPin size={28}/></div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Market Context</h4>
                    <p className="mt-1 text-xs font-bold tracking-wide uppercase text-slate-400">
                      Target: <span className="font-semibold text-red-600">{location?.city || 'Detecting...'}, {location?.state}</span>
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-40">
                    <div className="relative">
                        <input 
                            type="text" maxLength={5} placeholder="Zipcode"
                            value={zipInput} onChange={(e) => setZipInput(e.target.value.replace(/\D/g, ''))}
                            onBlur={() => updateLocation?.(zipInput)}
                            className="w-full h-12 pl-4 pr-10 text-sm font-bold transition-all border shadow-sm outline-none border-slate-200 rounded-xl focus:ring-4 focus:ring-red-500/10"
                        />
                        <button className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-slate-300 hover:text-red-600"><Search size={16}/></button>
                    </div>
                </div>
              </div>

              <div className="space-y-10">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <label className="text-[13px] font-bold text-slate-700">Purchase Price</label>
                        <Tooltip text="The total cost of the home you wish to acquire." />
                    </div>
                    <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm", isOverLimit ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50")}>
                      {isOverLimit ? `Jumbo (Max: $${currentMaxLimit.toLocaleString()})` : 'Conforming Loan'}
                    </span>
                  </div>
                  <CurrencyInput value={homePrice} onChange={setHomePrice} className="text-xl h-14 border-slate-200 focus:border-red-500" />
                  <input type="range" min="100000" max="2500000" step="5000" value={homePrice} onChange={(e) => setHomePrice(Number(e.target.value))} className="w-full h-1.5 mt-8 accent-red-600 bg-slate-100 rounded-full cursor-pointer" />
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><label className="text-[13px] font-bold text-slate-700">Down Payment (%)</label><Tooltip text="A standard 20% down payment helps you avoid PMI monthly fees." /></div>
                    <CurrencyInput value={downPaymentPercent} icon={Percent} onChange={setDownPaymentPercent} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><label className="text-[13px] font-bold text-slate-700">Interest Rate (%)</label><Tooltip text="Your annual percentage rate determines the interest cost." /></div>
                    <CurrencyInput value={interestRate} icon={Percent} suffix="%" onChange={setInterestRate} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <Select label="Loan Term" value={loanTerm} onChange={(v) => setLoanTerm(Number(v))} options={[{label:'30 Years Fixed', value:30},{label:'15 Years Fixed', value:15}]} />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><label className="text-[13px] font-bold text-slate-700">Monthly Extra Principal</label><Tooltip text="Additional payments applied directly to principal reduce your interest." /></div>
                    <CurrencyInput value={extraPayment} onChange={setExtraPayment} className="border-emerald-100 bg-emerald-50/20 focus:border-emerald-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* ESCROW CUSTOMIZATION */}
            <div className="bg-white p-8 rounded-[1rem] border border-slate-100 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <PieChart size={22} className="text-orange-500" />
                    <h3 className="text-lg font-bold text-slate-900">Escrow Customization</h3>
                  </div>
                  <div onClick={() => setIncludeEscrow(!includeEscrow)} className="flex items-center gap-3 cursor-pointer group">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-red-600 transition-colors">Include Taxes</span>
                    <div className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all", includeEscrow ? "bg-red-600 border-red-600 shadow-md shadow-red-600/20" : "bg-white border-slate-200")}>
                      {includeEscrow && <ShieldCheck size={14} className="text-white" />}
                    </div>
                  </div>
               </div>
               <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300", !includeEscrow && "opacity-30 pointer-events-none grayscale")}>
                  <div className="space-y-2"><label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Property Tax</label><CurrencyInput value={propertyTax} onChange={setPropertyTax} /></div>
                  <div className="space-y-2"><label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Insurance</label><CurrencyInput value={homeInsurance} onChange={setHomeInsurance} /></div>
                  <div className="space-y-2"><label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">HOA Dues</label><CurrencyInput value={hoaFees} onChange={setHoaFees} /></div>
               </div>
            </div>

            {/* AUTH GATED SECTION */}
            {isAuthenticated ? (
               <EquityMilestones schedule={calculations.schedule} homePrice={homePrice} />
            ) : (
               <WealthTeaser />
            )}

            {/* FULL SCHEDULE ACTION */}
            <div className="p-8 bg-slate-900 rounded-[1rem] text-white flex items-center justify-between group cursor-pointer shadow-lg hover:shadow-red-900/10 transition-all" onClick={() => setActiveModal('schedule')}>
               <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 text-red-500 bg-white/10 rounded-2xl"><List size={24}/></div>
                  <div>
                    <h4 className="text-lg font-bold leading-none">Explore Amortization</h4>
                    <p className="mt-2 text-xs font-medium leading-relaxed text-slate-400">Detailed principal vs. interest breakdown over the life of the loan.</p>
                  </div>
               </div>
               <div className="flex items-center justify-center w-10 h-10 transition-all border rounded-full border-white/10 group-hover:bg-red-600 group-hover:border-red-600">
                    <ChevronRight size={20}/>
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN: STICKY RESULTS */}
          <div className="space-y-6 lg:col-span-5 lg:sticky lg:top-28 h-fit">
            <div className="bg-white p-10 rounded-[1rem] border border-slate-100 shadow-2xl relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-orange-500" />
              
              <div className="flex items-center justify-center gap-6 pb-6 mb-8 border-b border-slate-50">
                 <button onClick={() => window.print()} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-red-600 transition-all uppercase tracking-[0.15em]">
                    <Printer size={14} /> Print
                 </button>
                 <div className="w-px h-3 bg-slate-200" />
                 <button onClick={() => setActiveModal('share')} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-red-600 transition-all uppercase tracking-[0.15em]">
                    <Share2 size={14} /> Share
                 </button>
              </div>

              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-4">Total Monthly commitment</p>
              <div className="mb-10 text-6xl font-bold tracking-tight text-slate-900">${calculations.total.toLocaleString()}</div>
              
              <div className="flex justify-center mb-12 scale-110"><PaymentDonut pni={calculations.pni} tax={includeEscrow ? propertyTax : 0} ins={includeEscrow ? homeInsurance : 0} hoa={includeEscrow ? hoaFees : 0} /></div>
              
              <div className="mb-10 space-y-4 text-left">
                <ResultRow label="Principal & Interest" value={calculations.pni} color="bg-red-600" />
                {includeEscrow && <ResultRow label="Escrow Account" value={calculations.escrow} color="bg-orange-500" />}
              </div>

              <Button className="w-full font-semibold text-white transition-all bg-red-600 shadow-xl hover:bg-red-700 shadow-red-600/30">
                Get Custom Rates <ArrowRight size={18} className="ml-2"/>
              </Button>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-[1rem] space-y-4 shadow-sm">
               <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle size={18} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Accuracy Disclaimer</span>
               </div>
               <p className="text-[11px] leading-relaxed text-slate-600">
                  Estimates are for illustrative purposes. Actual rates, taxes, and insurance will vary based on credit and location.
               </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

// --- SHARED UI HELPERS ---

const Tooltip = ({ text }) => (
  <div className="relative group cursor-help">
    <HelpCircle size={14} className="transition-colors text-slate-300 hover:text-red-500" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-52 p-3 bg-slate-900 text-white text-[11px] font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-[100] shadow-2xl leading-relaxed">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900" />
    </div>
  </div>
);

const ResultRow = ({ label, value, color }) => (
  <div className="flex items-center justify-between p-4 transition-all border shadow-sm bg-slate-50/50 rounded-2xl border-slate-100/50 group hover:bg-white">
    <div className="flex items-center gap-3">
      <div className={cn("w-3.5 h-3.5 rounded-full shadow-sm", color)} />
      <span className="text-sm font-semibold transition-colors text-slate-600 group-hover:text-slate-900">{label}</span>
    </div>
    <span className="text-sm font-bold text-slate-900">${(Number(value) || 0).toLocaleString()}</span>
  </div>
);