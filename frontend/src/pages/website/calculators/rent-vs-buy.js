'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Home, Key, Percent, TrendingUp, HelpCircle, MapPin, 
  ArrowRight, AlertCircle, Scale, RefreshCw, LineChart,
  Printer, Share2, ShieldCheck, Lock, X, Mail, Settings
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
  "name": "Rent vs. Buy Intelligence Calculator",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "description": "Compare the total long-term cost of homeownership vs renting, factoring in opportunity costs, local taxes, HOA, and equity building.",
};

// --- 🟢 NEW: DYNAMIC TRAJECTORY CHART ---
const CostTrajectoryChart = ({ data }) => {
  if (!data || data.length < 2) return null;

  // Calculate scales
  const maxY = Math.max(...data.map(d => Math.max(d.rentCost, d.buyCost, 0)));
  const minY = Math.min(...data.map(d => Math.min(d.rentCost, d.buyCost, 0)));
  const range = maxY - minY || 1;

  const getX = (index) => (index / (data.length - 1)) * 100;
  const getY = (val) => 100 - (((val - minY) / range) * 100);

  const rentPoints = data.map((d, i) => `${getX(i)},${getY(d.rentCost)}`).join(' ');
  const buyPoints = data.map((d, i) => `${getX(i)},${getY(d.buyCost)}`).join(' ');

  // Find intersection for visual node
  let intersectionNode = null;
  for (let i = 1; i < data.length; i++) {
    const prevRent = data[i-1].rentCost;
    const prevBuy = data[i-1].buyCost;
    const currRent = data[i].rentCost;
    const currBuy = data[i].buyCost;
    
    // If lines crossed this year
    if ((prevBuy > prevRent && currBuy <= currRent) || (prevBuy < prevRent && currBuy >= currRent)) {
        intersectionNode = { x: getX(i), y: getY(currBuy) };
        break;
    }
  }

  return (
    <div className="relative w-full h-40 mt-6 mb-8 duration-700 select-none animate-in fade-in zoom-in-95">
      <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Zero Baseline if applicable */}
        {minY < 0 && (
           <line x1="0" y1={getY(0)} x2="100" y2={getY(0)} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
        )}
        
        {/* Plot Lines */}
        <polyline points={rentPoints} fill="none" stroke="#f97316" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={buyPoints} fill="none" stroke="#dc2626" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />

        {/* Intersection Marker */}
        {intersectionNode && (
            <circle cx={intersectionNode.x} cy={intersectionNode.y} r="4" fill="#dc2626" stroke="#ffffff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        )}
      </svg>
      
      {/* UI Axis Labels */}
      <div className="absolute inset-0 pointer-events-none">
         <span className="absolute bottom-[-20px] left-0 text-[9px] font-bold text-slate-400 uppercase">Today</span>
         <span className="absolute bottom-[-20px] right-0 text-[9px] font-bold text-slate-400 uppercase">Year {data[data.length-1].year}</span>
         {intersectionNode && (
             <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md border border-slate-100 flex items-center gap-1.5">
                 <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700">Breakeven Point</span>
             </div>
         )}
      </div>
    </div>
  );
};

// --- VISUALIZATION: Flat Savings Bar ---
const ComparisonBar = ({ rentCost, buyCost, opportunityCost }) => {
  const netRentCost = Math.max(0, rentCost - opportunityCost);
  const netBuyCost = buyCost;

  const max = Math.max(netRentCost, netBuyCost) * 1.1;
  const rentPct = max > 0 ? (netRentCost / max) * 100 : 0;
  const buyPct = max > 0 ? (netBuyCost / max) * 100 : 0;
  
  const isBuyingCheaper = netBuyCost < netRentCost;

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-orange-500 rounded-full" /> Renting Cost</span>
          <span>${(netRentCost / 1000).toFixed(0)}k</span>
        </div>
        <div className="relative w-full h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="absolute top-0 left-0 h-full transition-all duration-700 bg-orange-500 rounded-full" style={{ width: `${rentPct}%` }} />
        </div>
        {opportunityCost > 0 && (
            <p className="text-[9px] text-right text-orange-600 font-bold tracking-tighter uppercase">
                Includes ${Math.round(opportunityCost/1000)}k investment gains
            </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-bold text-slate-900 uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-red-600 rounded-full" /> Buying Cost</span>
          <span className={isBuyingCheaper ? 'text-red-600' : 'text-slate-900'}>${(netBuyCost / 1000).toFixed(0)}k</span>
        </div>
        <div className="relative w-full h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="absolute top-0 left-0 h-full transition-all duration-700 bg-red-600 rounded-full shadow-sm" style={{ width: `${buyPct}%` }} />
        </div>
      </div>
    </div>
  );
};

// --- AUTH GATED COMPONENTS ---
const RentVsBuyTeaser = () => (
  <div className="relative overflow-hidden border bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-center mt-8">
    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_#ef4444_0%,_transparent_60%)]" />
    <div className="relative z-10 flex flex-col items-center">
      <div className="flex items-center justify-center w-12 h-12 mb-4 text-red-500 rounded-full bg-white/10"><Lock size={24} /></div>
      <h3 className="mb-2 text-lg font-bold text-white">Unlock Wealth Projections</h3>
      <p className="mb-6 text-sm font-medium text-slate-400">Discover your exact equity build-up, investment portfolio trajectory, and pinpoint the exact year buying becomes cheaper than renting.</p>
      <Link href="/auth/register">
        <Button className="px-8 font-bold text-white bg-red-600 border-none h-11 hover:bg-red-700 rounded-xl">Login to View Analysis <ArrowRight size={16} className="ml-2" /></Button>
      </Link>
    </div>
  </div>
);

const WealthProjections = ({ buyEquity, rentPortfolio, breakevenYear }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mt-8 animate-in fade-in slide-in-from-bottom-4">
    <div className="flex items-center gap-3 mb-8">
      <TrendingUp size={22} className="text-emerald-500" />
      <h3 className="text-lg font-bold text-slate-900">Wealth Projections & Timeline</h3>
    </div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="p-5 border border-orange-100 bg-orange-50/50 rounded-2xl">
        <span className="block text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">Renter Portfolio Value</span>
        <span className="block text-xl font-bold text-orange-900">${Math.round(rentPortfolio).toLocaleString()}</span>
        <span className="block text-[10px] font-bold text-orange-700 mt-1">If down payment is invested</span>
      </div>
      <div className="p-5 border border-red-100 bg-red-50/50 rounded-2xl">
        <span className="block text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Buyer Home Equity</span>
        <span className="block text-xl font-bold text-red-900">${Math.round(buyEquity).toLocaleString()}</span>
        <span className="block text-[10px] font-bold text-red-700 mt-1">Home value minus loan balance</span>
      </div>
      <div className="p-5 border bg-slate-50 border-slate-200 rounded-2xl">
        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Breakeven Horizon</span>
        <span className="block text-xl font-bold text-slate-900">{breakevenYear > 0 ? `Year ${breakevenYear}` : 'Never'}</span>
        <span className="block text-[10px] font-bold text-slate-500 mt-1">When buying becomes cheaper</span>
      </div>
    </div>
  </div>
);

export default function RentVsBuyCalculator() {
  const { location, updateLocation } = useLocation();
  const { rates } = useMarketEngine(location?.zip);
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated] = useState(false); 

  const [zipCode, setZipCode] = useState('20148');
  
  // Rent Inputs
  const [monthlyRent, setMonthlyRent] = useState(2500);
  const [rentInflation, setRentInflation] = useState(3); 
  const [investmentReturn, setInvestmentReturn] = useState(6); 

  // Buy Inputs
  const [homePrice, setHomePrice] = useState(450000);
  const [downPayment, setDownPayment] = useState(20000); 
  const [interestRate, setInterestRate] = useState(6.75);
  const [homeAppreciation, setHomeAppreciation] = useState(3); 
  const [holdingPeriod, setHoldingPeriod] = useState(7); 

  // Expenses & Assumptions
  const [monthlyHoa, setMonthlyHoa] = useState(0); 
  const [taxRate, setTaxRate] = useState(1.15); 
  const [insuranceRate, setInsuranceRate] = useState(0.35); 
  const [maintRate, setMaintRate] = useState(1.0); 

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareSent, setShareSent] = useState(false);

  const [results, setResults] = useState({
    totalRentCost: 0, totalBuyCost: 0, opportunityCost: 0, netBenefit: 0,
    isBuyingBetter: false, buyEquity: 0, rentPortfolio: 0, breakevenYear: 0,
    chartData: [] // 🟢 Holds data for the SVG Curve
  });

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (location?.zip) setZipCode(location.zip); }, [location]);
  useEffect(() => { if (rates?.['30Y']) setInterestRate(parseFloat(rates['30Y'])); }, [rates]);

  // --- BULLETPROOF CALCULATION ENGINE ---
  useEffect(() => {
    const safeHomePrice = Math.max(0, Number(homePrice) || 0);
    const safeDown = Math.max(0, Number(downPayment) || 0);
    const safeRent = Math.max(0, Number(monthlyRent) || 0);
    const safeRate = Math.max(0, Number(interestRate) || 0);
    const safeHold = Math.max(1, Number(holdingPeriod) || 7);
    
    const safeHoa = Math.max(0, Number(monthlyHoa) || 0);
    const safeTax = Math.max(0, Number(taxRate) || 1.15) / 100;
    const safeIns = Math.max(0, Number(insuranceRate) || 0.35) / 100;
    const safeMaint = Math.max(0, Number(maintRate) || 1.0) / 100;

    const loanAmount = Math.max(0, safeHomePrice - safeDown);
    const r = safeRate / 100 / 12;
    const n = 30 * 12; 
    
    // Zero-Rate Fallback
    const monthlyPI = r === 0 ? loanAmount / n : loanAmount * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    const ltv = safeHomePrice > 0 ? (loanAmount / safeHomePrice) * 100 : 0;
    const monthlyPMI = ltv > 80 ? (loanAmount * 0.005) / 12 : 0; 

    const upfrontBuyCost = safeDown + (safeHomePrice * 0.03); 
    let totalBuyOutflow = upfrontBuyCost; 
    let currentHomeValue = safeHomePrice;
    let loanBalance = loanAmount;
    
    let totalRentOutflow = 0;
    let currentRent = safeRent;
    
    let renterInvestments = upfrontBuyCost; 
    const monthlyInvRate = (Number(investmentReturn) || 6) / 100 / 12;

    let foundBreakeven = 0;
    
    // Initialize chart data with Year 0 (Today)
    const yearData = [{ year: 0, rentCost: 0, buyCost: upfrontBuyCost }];

    for (let i = 1; i <= safeHold * 12; i++) {
      const tax = (currentHomeValue * safeTax) / 12;
      const ins = (currentHomeValue * safeIns) / 12;
      const maint = (currentHomeValue * safeMaint) / 12;
      
      const currentLTV = (loanBalance / currentHomeValue) * 100;
      const thisPMI = currentLTV > 80 ? monthlyPMI : 0;

      const monthlyBuyCost = monthlyPI + tax + ins + maint + safeHoa + thisPMI;
      totalBuyOutflow += monthlyBuyCost;

      if (i > 1 && i % 12 === 1) currentRent *= (1 + ((Number(rentInflation) || 3) / 100));
      const monthlyRentCost = currentRent + 15; 
      totalRentOutflow += monthlyRentCost;

      const diff = monthlyBuyCost - monthlyRentCost;
      renterInvestments *= (1 + monthlyInvRate);
      renterInvestments += diff; 

      const interestPayment = loanBalance * r;
      const principalPayment = monthlyPI - interestPayment;
      loanBalance -= principalPayment;

      if (i > 0 && i % 12 === 0) {
          currentHomeValue *= (1 + ((Number(homeAppreciation) || 3) / 100));

          const yrSellingCosts = currentHomeValue * 0.06;
          const yrEquityRecovered = currentHomeValue - yrSellingCosts - loanBalance;
          const yrNetBuyCost = totalBuyOutflow - yrEquityRecovered;

          const yrInvestmentGains = Math.max(0, renterInvestments - upfrontBuyCost);
          const yrNetRentCost = totalRentOutflow - yrInvestmentGains;

          if (foundBreakeven === 0 && yrNetBuyCost < yrNetRentCost) foundBreakeven = i / 12;

          yearData.push({ year: i/12, rentCost: yrNetRentCost, buyCost: yrNetBuyCost });
      }
    }

    const sellingCosts = currentHomeValue * 0.06;
    const equityRecovered = currentHomeValue - sellingCosts - loanBalance;
    const netBuyCost = totalBuyOutflow - equityRecovered;

    const investmentGains = Math.max(0, renterInvestments - upfrontBuyCost);
    const finalNetRentCost = totalRentOutflow - investmentGains;

    const netBenefit = Math.abs(finalNetRentCost - netBuyCost);
    const isBuyingBetter = netBuyCost < finalNetRentCost;

    setResults({
        totalRentCost: Math.round(totalRentOutflow),
        totalBuyCost: Math.round(netBuyCost),
        opportunityCost: Math.round(investmentGains),
        netBenefit: Math.round(netBenefit),
        isBuyingBetter,
        buyEquity: Math.round(equityRecovered),
        rentPortfolio: Math.round(renterInvestments),
        breakevenYear: foundBreakeven,
        chartData: yearData
    });

  }, [monthlyRent, rentInflation, homePrice, downPayment, interestRate, homeAppreciation, holdingPeriod, investmentReturn, monthlyHoa, taxRate, insuranceRate, maintRate]);

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
        <title>Rent vs. Buy Intelligence Hub | HomeRatesYard</title>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }} />
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
                        <h3 className="mb-2 text-xl font-bold text-slate-900">Email Strategy Report</h3>
                        <p className="mb-6 text-sm font-medium leading-relaxed text-slate-500">Send your Rent vs. Buy comparison analysis.</p>
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
               <Scale size={12} /> Investment Intelligence
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
               Rent vs. <span className="text-red-500">Buy</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg font-medium leading-relaxed text-slate-400">
               Compare the true lifetime cost of homeownership against renting, factoring in opportunity costs, maintenance, and equity growth.
            </p>
          </div>
        </section>

        {/* WORKSPACE */}
        <div className="relative z-20 grid items-start grid-cols-1 gap-10 px-4 mx-auto -mt-12 max-w-7xl md:px-8 lg:grid-cols-12">
          
          {/* LEFT COLUMN: INPUTS */}
          <div className="space-y-8 lg:col-span-7">
            
            {/* CURRENT RENT */}
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
              <div className="flex flex-col justify-between gap-6 pb-8 mb-10 border-b md:flex-row md:items-center border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center text-orange-600 shadow-inner w-14 h-14 rounded-2xl bg-orange-50"><MapPin size={28}/></div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Current Rent</h3>
                    <p className="mt-1 text-xs font-bold tracking-widest uppercase text-slate-400">Estimating for: <span className="text-orange-600">{location?.city || 'Selected Market'}</span></p>
                  </div>
                </div>
                <div className="w-full md:w-40">
                    <input type="text" maxLength={5} value={zipCode} onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))} onBlur={() => updateLocation?.(zipCode)} placeholder="Zipcode" className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2"><label className="text-[13px] font-bold text-slate-700">Monthly Rent</label><Tooltip text="What you currently pay in rent." /></div>
                  <CurrencyInput value={monthlyRent} onChange={setMonthlyRent} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2"><label className="text-[13px] font-bold text-slate-700">Investment Return (%)</label><Tooltip text="If you rented and invested your down payment in the stock market instead, what return would you expect?" /></div>
                  <CurrencyInput value={investmentReturn} onChange={setInvestmentReturn} icon={LineChart} suffix="%" />
                </div>
              </div>
            </div>

            {/* PURCHASE SCENARIO */}
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center justify-center w-10 h-10 text-red-600 rounded-xl bg-red-50"><Home size={20} /></div>
                  <h3 className="text-lg font-bold text-slate-900">Purchase Scenario</h3>
               </div>

               <div className="mb-10 space-y-12">
                  <div>
                    <label className="text-[13px] font-bold text-slate-700 mb-4 block">Target Home Price</label>
                    <CurrencyInput value={homePrice} onChange={setHomePrice} className="text-xl h-14 border-slate-200 focus:border-red-500" />
                    <input type="range" min="100000" max="1500000" step="5000" value={homePrice} onChange={(e) => setHomePrice(Number(e.target.value))} className="w-full h-1.5 mt-8 rounded-full cursor-pointer bg-slate-100 accent-red-600" />
                  </div>

                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-3">
                      <label className="text-[13px] font-bold text-slate-700 block">Down Payment</label>
                      <CurrencyInput value={downPayment} onChange={setDownPayment} />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[13px] font-bold text-slate-700 block">Interest Rate (%)</label>
                      <CurrencyInput value={interestRate} onChange={setInterestRate} icon={Percent} suffix="%" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[13px] font-bold text-slate-700 block">Home Appreciation (%)</label>
                      <CurrencyInput value={homeAppreciation} onChange={setHomeAppreciation} icon={TrendingUp} suffix="%" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <label className="text-[13px] font-bold text-slate-700 block">Years Before Moving</label>
                        <Tooltip text="How many years do you plan to live in the home before selling?" />
                      </div>
                      <input type="number" value={holdingPeriod} onChange={(e) => setHoldingPeriod(e.target.value)} className="w-full h-12 px-4 text-sm font-bold border outline-none border-slate-200 rounded-xl focus:border-red-500" />
                    </div>
                  </div>
               </div>
            </div>

            {/* EXPENSES & ASSUMPTIONS */}
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center justify-center w-10 h-10 text-slate-600 rounded-xl bg-slate-100"><Settings size={20} /></div>
                  <h3 className="text-lg font-bold text-slate-900">Expenses & Assumptions</h3>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2"><label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">HOA Dues</label><Tooltip text="Monthly Homeowners Association fees." /></div>
                        <CurrencyInput value={monthlyHoa} onChange={setMonthlyHoa} />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Prop. Tax (%)</label>
                        <CurrencyInput value={taxRate} onChange={setTaxRate} icon={Percent} suffix="%" />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Insurance (%)</label>
                        <CurrencyInput value={insuranceRate} onChange={setInsuranceRate} icon={Percent} suffix="%" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2"><label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Maint. (%)</label><Tooltip text="Annual home maintenance cost (Usually 1% of home value)." /></div>
                        <CurrencyInput value={maintRate} onChange={setMaintRate} icon={Percent} suffix="%" />
                    </div>
                </div>
            </div>

            {/* AUTH GATED CONTENT */}
            {isAuthenticated ? (
               <WealthProjections buyEquity={results.buyEquity} rentPortfolio={results.rentPortfolio} breakevenYear={results.breakevenYear} />
            ) : (
               <RentVsBuyTeaser />
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

              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-4">After {holdingPeriod} Years</p>
              
              <div className="mb-10">
                <p className={cn("text-xl font-black uppercase tracking-wider mb-2", results.isBuyingBetter ? "text-red-600" : "text-orange-500")}>
                    {results.isBuyingBetter ? 'Buying Wins' : 'Renting Wins'}
                </p>
                <p className="text-6xl font-bold tracking-tighter md:text-7xl text-slate-900 tabular-nums">
                    ${results.netBenefit.toLocaleString()}
                </p>
                <p className="mt-2 text-xs font-bold tracking-widest uppercase text-slate-400">Net Financial Advantage</p>
              </div>
              
              {/* 🟢 NEW: DYNAMIC TRAJECTORY CHART */}
              <CostTrajectoryChart data={results.chartData} />

              <div className="mb-10 text-left">
                <ComparisonBar rentCost={results.totalRentCost} buyCost={results.totalBuyCost} opportunityCost={results.opportunityCost} />
              </div>
              
              <div className="pt-8 mb-10 space-y-4 text-left border-t border-slate-50">
                <ResultRow label="Net Rent Cost" value={results.totalRentCost - results.opportunityCost} color="bg-orange-500" sub="Total Rent - Investment Gains" />
                <ResultRow label="Net Buy Cost" value={results.totalBuyCost} color="bg-red-600" sub="Total Payments - Equity Profit" />
              </div>

              <Link href="/auth/register">
                 <Button className="w-full h-16 font-bold text-white transition-all bg-red-600 shadow-xl hover:bg-red-700 rounded-2xl shadow-red-600/30 group">
                    {results.isBuyingBetter ? 'Get Pre-Approved' : 'See Rent Trends'} <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18}/>
                 </Button>
              </Link>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-[2rem] space-y-4 shadow-sm">
               <div className="flex items-center gap-2 text-slate-700">
                  <AlertCircle size={18} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Strategy Intelligence</span>
               </div>
               <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                  This simulation assumes you strictly invest your entire down payment into the market at a {investmentReturn}% return if you choose to rent. Without investing those funds, buying is almost universally more profitable over a {holdingPeriod}-year period.
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