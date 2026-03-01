'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Compass, Info, ArrowRight, ShieldCheck, 
  RefreshCw, Search, AlertTriangle, ChevronRight,
  SlidersHorizontal, ChevronDown, ChevronUp, CheckCircle2
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';

// 🟢 FIX: Imported the Button primitive for standard UI interactions
import { Button } from '@/components/ui/primitives/Button';

// --- ENTERPRISE FORMATTERS ---
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
const formatRate = (val) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(val);

export default function LoanExplorer() {
  const { addToast } = useToast();
  
  // --- CORE STATE ---
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false); 

  // --- LOAN PARAMETERS ---
  const [params, setParams] = useState({
    purpose: 'purchase',
    homeValue: 450000,
    downPayment: 90000,
    creditScore: 'excellent', 
  });

  const [marketRates, setMarketRates] = useState([]);

  // --- DYNAMIC MATH ENGINE ---
  const safeHomeValue = Math.max(50000, params.homeValue);
  const safeDownPayment = Math.min(params.downPayment, safeHomeValue * 0.99); 
  const loanAmount = safeHomeValue - safeDownPayment;
  
  const downPaymentPercent = ((safeDownPayment / safeHomeValue) * 100).toFixed(1);
  const ltv = 100 - downPaymentPercent;

  const calculatePITI = useCallback((principal, annualRate, months, type) => {
    if (annualRate <= 0 || principal <= 0) return { total: 0, pi: 0, taxIns: 0, pmi: 0 };
    
    const monthlyRate = (annualRate / 100) / 12;
    const pi = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);

    const taxIns = ((safeHomeValue * 0.012) + (safeHomeValue * 0.0035)) / 12;

    let pmi = 0;
    if (type === 'Government' || ltv > 80) {
      pmi = (principal * 0.006) / 12; 
    }

    return { total: pi + taxIns + pmi, pi, taxIns, pmi };
  }, [safeHomeValue, ltv]);

  // --- DATA FETCHING (SIMULATED PRICING ENGINE) ---
  const fetchRates = useCallback(async () => {
    setIsUpdating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); 
      
      const scoreModifier = params.creditScore === 'excellent' ? 0 : params.creditScore === 'good' ? 0.375 : 0.875;
      
      setMarketRates([
        {
          id: 'conv-30',
          name: '30-Year Fixed',
          type: 'Conventional',
          rate: 6.500 + scoreModifier,
          apr: 6.625 + scoreModifier,
          paymentDetails: calculatePITI(loanAmount, 6.500 + scoreModifier, 360, 'Conventional'),
          fees: 1250,
          popular: true,
          tags: ['Fixed Payment', 'Most Popular', ltv <= 80 ? 'No PMI' : 'PMI Required']
        },
        {
          id: 'conv-15',
          name: '15-Year Fixed',
          type: 'Conventional',
          rate: 5.875 + scoreModifier,
          apr: 6.050 + scoreModifier,
          paymentDetails: calculatePITI(loanAmount, 5.875 + scoreModifier, 180, 'Conventional'),
          fees: 1100,
          popular: false,
          tags: ['Pay Off Faster', 'Lowest Rate']
        },
        {
          id: 'fha-30',
          name: '30-Year FHA',
          type: 'Government',
          rate: 6.250 + (scoreModifier * 0.5), 
          apr: 7.100 + (scoreModifier * 0.5), 
          paymentDetails: calculatePITI(loanAmount, 6.250 + (scoreModifier * 0.5), 360, 'Government'),
          fees: 1500,
          popular: false,
          tags: ['Lower Credit Ok', 'Low Down Pmt']
        },
        {
          id: 'arm-51',
          name: '5/1 ARM',
          type: 'Adjustable',
          rate: 6.125 + scoreModifier,
          apr: 6.850 + scoreModifier,
          paymentDetails: calculatePITI(loanAmount, 6.125 + scoreModifier, 360, 'Adjustable'),
          fees: 1200,
          popular: false,
          tags: ['Low Initial Rate', 'Short Term']
        }
      ]);
    } catch (error) {
      addToast('Failed to connect to pricing engine.', 'error');
    } finally {
      setLoading(false);
      setIsUpdating(false);
      setIsMobileFiltersOpen(false); 
    }
  }, [params.creditScore, loanAmount, calculatePITI, ltv, addToast]);

  useEffect(() => {
    setMounted(true);
    fetchRates();
  }, [fetchRates]);

  // --- HANDLERS ---
  const handleUpdateParams = (e) => {
    e.preventDefault();
    if (params.downPayment >= params.homeValue) {
      setParams(p => ({ ...p, downPayment: safeDownPayment }));
      addToast('Down payment automatically adjusted to maximum allowable limit.', 'info');
    }
    fetchRates();
  };

  // 🟢 FIX: Safe SSR Hydration Check
  if (!mounted) return null;

  // 🟢 FIX: Properly wrapped inside RouteGuard and DashboardLayout to prevent crashes
  return (
    <RouteGuard allowedRoles={['borrower']}>
      <DashboardLayout role="borrower">
        <Head><title>Loan Explorer | HomeRatesYard</title></Head>

        <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 px-4 sm:px-6 lg:px-8 pt-8">
          
          {/* --- HEADER ROW --- */}
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                <Compass className="text-[#B91C1C]" size={32} /> 
                Loan Explorer
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Compare live rates and find the perfect mortgage product for your goals.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-full border border-emerald-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Market Pricing
            </div>
          </div>

          {/* --- MOBILE FILTER TOGGLE --- */}
          <button 
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="flex items-center justify-between w-full p-4 text-sm font-bold bg-white border shadow-sm lg:hidden border-slate-200 rounded-2xl text-slate-700"
          >
            <span className="flex items-center gap-2"><SlidersHorizontal size={18} className="text-[#B91C1C]" /> Edit Loan Parameters</span>
            {isMobileFiltersOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {/* --- PRICING ENGINE FILTER BAR --- */}
          <form 
            onSubmit={handleUpdateParams}
            className={cn(
              "bg-white border border-slate-200 shadow-lg shadow-slate-200/40 rounded-[24px] p-6 lg:sticky lg:top-[90px] z-30 transition-all origin-top",
              isMobileFiltersOpen ? "block animate-in slide-in-from-top-2" : "hidden lg:block"
            )}
          >
             <div className="grid items-end grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Goal</label>
                   <select 
                     className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none appearance-none cursor-pointer bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                     value={params.purpose}
                     onChange={(e) => setParams({...params, purpose: e.target.value})}
                   >
                     <option value="purchase">Buy a Home</option>
                     <option value="refinance">Refinance</option>
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Home Price</label>
                   <div className="relative group">
                      <span className="absolute left-4 top-3.5 text-slate-400 font-bold group-focus-within:text-red-500 transition-colors">$</span>
                      <input 
                        type="number" min="50000" required
                        className="w-full h-12 pl-8 pr-4 font-mono text-sm font-bold transition-all bg-white border outline-none border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        value={params.homeValue || ''}
                        onChange={(e) => setParams({...params, homeValue: Number(e.target.value)})}
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Down Payment</label>
                   <div className="relative group">
                      <span className="absolute left-4 top-3.5 text-slate-400 font-bold group-focus-within:text-red-500 transition-colors">$</span>
                      <input 
                        type="number" min="0" required
                        className="w-full h-12 pl-8 pr-16 font-mono text-sm font-bold transition-all bg-white border outline-none border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        value={params.downPayment === 0 ? '' : params.downPayment}
                        onChange={(e) => setParams({...params, downPayment: Number(e.target.value)})}
                      />
                      <div className="absolute inset-y-0 right-1.5 flex items-center pointer-events-none">
                         <span className={cn(
                           "text-[10px] font-bold px-2 py-1 rounded-md transition-colors",
                           ltv > 97 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
                         )}>
                           {downPaymentPercent}%
                         </span>
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Credit Profile</label>
                   <select 
                     className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none appearance-none cursor-pointer bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                     value={params.creditScore}
                     onChange={(e) => setParams({...params, creditScore: e.target.value})}
                   >
                     <option value="excellent">Excellent (740+)</option>
                     <option value="good">Good (680-739)</option>
                     <option value="fair">Fair (620-679)</option>
                   </select>
                </div>

                {/* 🟢 FIX: Standardized Button Component */}
                <Button 
                  type="submit" 
                  disabled={isUpdating}
                  className="w-full h-12 gap-2 text-sm font-bold text-white transition-all shadow-lg rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-70 shadow-slate-900/20"
                >
                   {isUpdating ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                   Update Rates
                </Button>
             </div>

             <div className="flex flex-col justify-between gap-4 pt-5 mt-5 border-t border-slate-100 sm:flex-row sm:items-center">
               <div className="flex flex-wrap items-center gap-4 text-sm sm:gap-6">
                 <span className="font-medium text-slate-500">Loan Amount: <strong className="font-mono text-base tracking-tight text-slate-900">{formatCurrency(loanAmount)}</strong></span>
                 <span className="hidden text-slate-300 sm:block">|</span>
                 <span className="font-medium text-slate-500">LTV Ratio: <strong className={cn("font-mono text-base tracking-tight", ltv > 97 ? "text-red-600" : "text-slate-900")}>{ltv.toFixed(1)}%</strong></span>
               </div>
               
               {ltv > 97 && (
                 <div className="flex items-center gap-2 text-xs font-bold text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200 animate-in fade-in">
                   <AlertTriangle size={14} /> Low Down Payment: FHA loans recommended.
                 </div>
               )}
             </div>
          </form>

          {/* --- RATE CARDS GRID --- */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2 xl:grid-cols-4 animate-pulse">
               {[1,2,3,4].map(i => <div key={i} className="h-[460px] bg-slate-200 rounded-[24px]" />)}
            </div>
          ) : marketRates.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-[24px] mt-8">
              <Compass size={40} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-900">No Products Available</h3>
              <p className="text-sm text-slate-500">Please adjust your loan parameters.</p>
            </div>
          ) : (
            <div className={cn("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8 transition-opacity duration-500", isUpdating && "opacity-40 pointer-events-none")}>
               {marketRates.map((product) => (
                  <RateCard key={product.id} data={product} params={params} loanAmount={loanAmount} />
               ))}
            </div>
          )}

          {/* --- EDUCATIONAL BANNER --- */}
          <div className="mt-12 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-[24px] p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-center shadow-sm">
             <div className="p-5 text-blue-600 bg-white shadow-md rounded-2xl shrink-0">
                <ShieldCheck size={40} />
             </div>
             <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900">Lock in your homebuying power.</h3>
                <p className="max-w-3xl mt-2 text-sm leading-relaxed text-slate-600">
                   A verified pre-approval letter proves you are a serious buyer. It locks in your rate estimates, strengthens your offer, and requires zero hard credit pulls to initiate.
                </p>
             </div>
             <Link href="/borrower/pre-approvals" className="w-full md:w-auto mt-4 md:mt-0 shrink-0 px-8 py-4 bg-[#2563EB] text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-blue-500/30 text-center flex items-center justify-center gap-2">
                Get Pre-Approved <ChevronRight size={16} />
             </Link>
          </div>

        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}

// ==========================================
// 🧱 RATE CARD COMPONENT
// ==========================================

const RateCard = React.memo(({ data, params, loanAmount }) => {
  return (
    <div className={cn(
      "flex flex-col bg-white border rounded-[24px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group relative",
      data.popular ? "border-[#B91C1C] shadow-lg ring-1 ring-red-100" : "border-slate-200 shadow-sm"
    )}>
      
      {data.popular && (
        <div className="bg-gradient-to-r from-[#B91C1C] to-red-900 text-white text-[10px] font-black uppercase tracking-widest text-center py-2 w-full shadow-sm">
          Most Popular Choice
        </div>
      )}

      <div className="flex flex-col flex-1 p-6">
        {/* Header */}
        <div className="mb-6">
           <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-md">{data.type}</span>
           </div>
           <h3 className="text-xl font-bold tracking-tight text-slate-900">{data.name}</h3>
        </div>

        {/* Main Rate Block */}
        <div className="flex items-baseline gap-1.5 mb-1">
           <span className="text-4xl font-black tracking-tighter text-slate-900">{formatRate(data.rate)}</span>
           <span className="mb-1 text-sm font-bold text-slate-500">%</span>
        </div>
        
        {/* 🟢 FIX: Tooltip Alignment Corrected */}
        <div className="relative flex items-center gap-2 pb-6 mb-6 text-xs font-semibold border-b text-slate-500 border-slate-100 group/tooltip w-fit">
           <span>{formatRate(data.apr)}% APR</span>
           <Info size={14} className="transition-colors cursor-help text-slate-400 hover:text-slate-600" />
           <div className="absolute left-0 bottom-full mb-2 w-48 p-2.5 bg-slate-900 text-white text-[10px] leading-relaxed rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20 shadow-xl pointer-events-none">
             Annual Percentage Rate includes interest and estimated fees over the life of the loan.
           </div>
        </div>

        {/* Feature Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
           {data.tags.map(tag => (
             <span key={tag} className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md flex items-center gap-1.5">
               <CheckCircle2 size={12} className={cn(tag.includes('PMI Required') ? "text-orange-500" : "text-emerald-500")} /> 
               {tag}
             </span>
           ))}
        </div>

        {/* Advanced Math Breakdown (PITI) */}
        <div className="flex-1 mb-8 space-y-4">
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                Est. Mo. Payment
                <span className="text-slate-300 normal-case tracking-normal text-[9px] font-semibold">(PITI)</span>
              </p>
              <p className="font-mono text-3xl font-bold tracking-tight text-slate-900">{formatCurrency(data.paymentDetails.total)}</p>
           </div>
           
           <div className="pt-3 border-t border-slate-100 space-y-1.5">
             <div className="flex justify-between text-xs">
               <span className="font-medium text-slate-500">Principal & Interest</span>
               <span className="font-mono font-semibold text-slate-900">{formatCurrency(data.paymentDetails.pi)}</span>
             </div>
             <div className="flex justify-between text-xs">
               <span className="font-medium text-slate-500">Taxes & Insurance</span>
               <span className="font-mono font-semibold text-slate-900">{formatCurrency(data.paymentDetails.taxIns)}</span>
             </div>
             {data.paymentDetails.pmi > 0 && (
               <div className="flex justify-between px-2 py-1 text-xs text-orange-700 rounded bg-orange-50">
                 <span className="font-semibold">Mortgage Insurance</span>
                 <span className="font-mono font-bold">{formatCurrency(data.paymentDetails.pmi)}</span>
               </div>
             )}
           </div>
        </div>

        <Link 
          href={{
            pathname: '/borrower/applications/new',
            query: { 
              product: data.id, 
              rate: data.rate, 
              amount: loanAmount,
              purpose: params.purpose,
              homeValue: params.homeValue,
              downPayment: params.downPayment,
              creditScore: params.creditScore
            }
          }}
          className={cn(
            "mt-auto flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold rounded-xl transition-all active:scale-95",
            data.popular 
              ? "bg-[#B91C1C] text-white hover:bg-red-800 shadow-lg shadow-red-200" 
              : "bg-[#0A1128] text-white hover:bg-slate-800 shadow-md"
          )}
        >
          Select Product <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
});

RateCard.displayName = 'RateCard';