import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  TrendingDown, DollarSign, Percent, RefreshCw, 
  Shield, Check, MapPin, ArrowRight, 
  Filter, AlertCircle, Lock, Loader2, Calendar, ChevronDown
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';
import { Button } from '@/components/ui/primitives/Button';
import { useMarketEngine } from '@/hooks/useMarketEngine'; 

// --- JSON-LD SEO SCHEMA ---
const ratePageSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  "name": "Live Refinance Rates",
  "description": "Customized mortgage refinance rates based on your home value and credit score.",
  "provider": { "@type": "Organization", "name": "HomeRatesYard" }
};

// --- SUB-COMPONENT: Mobile CTA ---
const MobileStickyCTA = () => (
  <div className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t bg-white/95 backdrop-blur-md border-border md:hidden animate-in slide-in-from-bottom">
    <Link href="/auth/register" className="block w-full">
      <Button size="lg" className="w-full text-white shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
        Lock My Rate <ArrowRight size={18} className="ml-2" />
      </Button>
    </Link>
  </div>
);

// --- HELPER: Rate Card Component ---
const RateCard = ({ title, rate, apr, payment, savings, popular, loading }) => (
  <div className={`relative p-6 bg-white border rounded-2xl transition-all hover:shadow-lg group ${popular ? 'border-primary/30 ring-1 ring-primary/20' : 'border-border'}`}>
    {popular && (
      <div className="absolute top-0 right-0 px-3 py-1 text-[10px] font-bold text-white uppercase transform translate-x-2 -translate-y-2 bg-gradient-to-r from-primary to-secondary rounded-lg shadow-sm">
        Most Popular
      </div>
    )}
    
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      {/* Product Info */}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-content">{title}</h3>
        <div className="flex items-baseline gap-2 mt-1">
          {loading ? (
            <div className="w-24 h-8 rounded bg-background-muted animate-pulse" />
          ) : (
            <>
              <span className="text-3xl font-extrabold text-content">{rate}%</span>
              <span className="text-xs font-medium text-content-muted">Rate</span>
            </>
          )}
        </div>
        <p className="text-xs text-content-muted">APR {apr}%</p>
      </div>

      {/* Payment Info */}
      <div className="text-left sm:text-right">
        {loading ? (
           <div className="w-32 h-8 ml-auto rounded bg-background-muted animate-pulse" />
        ) : (
           <p className="text-2xl font-bold text-content">${payment}<span className="text-sm font-medium text-content-muted">/mo</span></p>
        )}
        
        {savings > 0 ? (
          <p className="flex items-center justify-end gap-1 text-xs font-bold text-success">
            <TrendingDown size={12} /> Save ${savings}/mo
          </p>
        ) : (
          <p className="text-xs font-medium text-content-muted">Principal & Interest</p>
        )}
      </div>

      {/* CTA */}
      <div>
        <Button asChild size="lg" className={`w-full sm:w-auto shadow-md ${popular ? 'shadow-primary/20 bg-primary text-white hover:bg-primary/90' : 'bg-content text-white hover:bg-content/90'}`}>
            <Link href="/auth/register">
                Lock Rate
            </Link>
        </Button>
      </div>
    </div>
  </div>
);

// --- HELPER: Sidebar Input ---
const CurrencyInput = ({ value, onChange, icon: Icon, label, suffix }) => (
  <div className="mb-4">
    <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-content-muted">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 transition-colors pointer-events-none text-content-muted group-focus-within:text-primary">
        <Icon size={16} />
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full py-2.5 pr-8 pl-10 font-bold text-sm bg-background-subtle border border-border rounded-lg text-content focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none"
      />
      {suffix && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-bold pointer-events-none text-content-muted">
            {suffix}
        </div>
      )}
    </div>
  </div>
);

export default function GetRefinanceRates() {
  const { rates, loading } = useMarketEngine();

  // --- STATE ---
  const [zipCode, setZipCode] = useState(20148);
  const [homeValue, setHomeValue] = useState(450000);
  const [loanBalance, setLoanBalance] = useState(320000);
  const [creditScore, setCreditScore] = useState(740);
  const [currentRate, setCurrentRate] = useState(6.75);

  // --- COMPUTED VALUES ---
  const calculations = useMemo(() => {
    // 1. LTV Logic
    const ltvRaw = homeValue > 0 ? (loanBalance / homeValue) * 100 : 0;
    const ltv = ltvRaw.toFixed(0);
    
    // 2. Current Est Payment
    const r = currentRate / 100 / 12;
    const n = 360; 
    const currentPmtRaw = loanBalance * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    const currentPmt = isNaN(currentPmtRaw) ? 0 : Math.round(currentPmtRaw);

    return { ltv, currentPmt };
  }, [homeValue, loanBalance, currentRate]);

  // --- SAFE MATH CALCULATORS ---
  const getPaymentRaw = (rateStr, term) => {
    if (!rateStr) return 0;
    const rate = parseFloat(rateStr);
    const r = rate / 100 / 12;
    const n = term * 12;
    const pmt = loanBalance * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    return isNaN(pmt) ? 0 : Math.round(pmt);
  };

  const getPaymentString = (rateStr, term) => {
    return getPaymentRaw(rateStr, term).toLocaleString();
  };

  const getSavings = (rateStr, term) => {
    const newPmt = getPaymentRaw(rateStr, term);
    const savings = calculations.currentPmt - newPmt;
    return Math.max(0, savings).toLocaleString();
  };

  const getAPR = (rateStr) => {
      if(!rateStr) return "0.000";
      return (parseFloat(rateStr) + 0.125).toFixed(3);
  };

  return (
    <div className="min-h-screen font-sans bg-background-subtle">
      <Head>
        <title>Get Refinance Rates | HomeRatesYard</title>
        <meta name="description" content="View live refinance rates customized to your home value and credit score. Lock in your savings today." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ratePageSchema) }} />
      </Head>

      <main>
        
        {/* 1. COMPACT HERO */}
        <section className="relative h-[220px] flex items-center justify-center overflow-hidden bg-content">
          {/* Red/Orange Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="relative z-10 px-4 mt-8 text-center text-white">
            <h1 className="flex items-center justify-center gap-3 mb-2 text-3xl font-bold font-display md:text-4xl drop-shadow-md">
              <TrendingDown size={32} className="text-primary" />
              Today's Live Rates
            </h1>
            <p className="flex items-center justify-center gap-2 text-sm text-white/80">
              <Calendar size={14} /> Updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </section>

        {/* 2. DASHBOARD CONTAINER */}
        <div className="container relative z-20 px-4 pb-20 mx-auto mt-16 max-w-7xl">
          <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* --- LEFT: FILTERS & INPUTS --- */}
            <div className="lg:col-span-4">
              <div className="p-6 bg-white border shadow-xl rounded-2xl border-border">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border">
                  <Filter size={20} className="text-primary" />
                  <h3 className="text-lg font-bold text-content">Customize Quote</h3>
                </div>

                <div className="space-y-1">
                  <CurrencyInput label="Zip Code" value={zipCode} onChange={setZipCode} icon={MapPin} />
                  
                  <CurrencyInput label="Est. Home Value" value={homeValue} onChange={setHomeValue} icon={DollarSign} />
                  
                  <CurrencyInput label="Remaining Balance" value={loanBalance} onChange={setLoanBalance} icon={DollarSign} />
                  
                  {/* LTV Indicator */}
                  <div className="flex items-center justify-between px-1 mb-4">
                    <span className="text-xs font-bold text-content-muted">Loan-to-Value (LTV)</span>
                    <span className={`text-xs font-bold ${Number(calculations.ltv) > 80 ? 'text-secondary' : 'text-success'}`}>
                        {calculations.ltv}%
                    </span>
                  </div>

                  <CurrencyInput label="Current Rate" value={currentRate} onChange={setCurrentRate} icon={Percent} suffix="%" />

                  <div className="mb-4">
                    <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-content-muted">Credit Score</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 transition-colors pointer-events-none text-content-muted group-focus-within:text-primary">
                            <Shield size={16} />
                        </div>
                        <select 
                        className="w-full py-2.5 pl-10 pr-4 font-bold text-sm bg-background-subtle border border-border rounded-lg text-content focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none"
                        value={creditScore}
                        onChange={(e) => setCreditScore(e.target.value)}
                        >
                        <option value="760">Excellent (760+)</option>
                        <option value="720">Very Good (720-759)</option>
                        <option value="680">Good (680-719)</option>
                        <option value="640">Fair (640-679)</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-content-muted">
                            <ChevronDown size={14} />
                        </div>
                    </div>
                  </div>

                  <Button className="w-full mt-2 bg-content hover:bg-content/90" size="lg">
                    <RefreshCw size={16} className="mr-2" /> Recalculate
                  </Button>
                </div>
              </div>
            </div>

            {/* --- RIGHT: RATE RESULTS --- */}
            <div className="space-y-6 lg:col-span-8">
              
              {/* Alert / Context */}
              <div className="p-4 border border-primary/20 bg-primary/5 rounded-xl">
                <div className="flex gap-3">
                  <AlertCircle size={20} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed text-content/80">
                    Based on a <strong>{calculations.ltv}% LTV</strong> and <strong>{creditScore} credit score</strong>, you may qualify for the rates below. 
                    Your estimated current payment is <strong>${calculations.currentPmt.toLocaleString()}/mo</strong>.
                  </p>
                </div>
              </div>

              {/* Rate Cards */}
              <div className="space-y-4">
                
                {/* 30-Year Fixed */}
                <RateCard 
                  title="30-Year Fixed Refinance"
                  rate={rates?.['30Y']}
                  apr={getAPR(rates?.['30Y'])}
                  payment={getPaymentString(rates?.['30Y'], 30)}
                  savings={getSavings(rates?.['30Y'], 30)}
                  loading={loading}
                  popular={true}
                />

                {/* 20-Year Fixed */}
                <RateCard 
                  title="20-Year Fixed Refinance"
                  rate={rates?.['20Y']}
                  apr={getAPR(rates?.['20Y'])}
                  payment={getPaymentString(rates?.['20Y'], 20)}
                  savings={getSavings(rates?.['20Y'], 20)}
                  loading={loading}
                  popular={false}
                />

                {/* 15-Year Fixed */}
                <RateCard 
                  title="15-Year Fixed Refinance"
                  rate={rates?.['15Y']}
                  apr={getAPR(rates?.['15Y'])}
                  payment={getPaymentString(rates?.['15Y'], 15)}
                  savings={getSavings(rates?.['15Y'], 15)}
                  loading={loading}
                  popular={false}
                />

                {/* 5/1 ARM */}
                <RateCard 
                  title="5/1 ARM (Adjustable Rate)"
                  rate={rates?.['5/1 ARM']}
                  apr={getAPR(rates?.['5/1 ARM'])}
                  payment={getPaymentString(rates?.['5/1 ARM'], 30)}
                  savings={getSavings(rates?.['5/1 ARM'], 30)}
                  loading={loading}
                  popular={false}
                />
              </div>

              {/* Disclaimer */}
              <p className="mt-8 text-[10px] leading-relaxed text-center text-content-muted">
                Rates displayed are estimates based on the information provided and current market conditions. 
                Actual rates may vary. Rates are subject to change without notice. 
                <Link href="/licenses" className="ml-1 underline hover:text-content">View Licensing Information</Link>.
              </p>

            </div>

          </div>
        </div>

        <FinalCTA />
        <MobileStickyCTA />
      </main>
    </div>
  );
}

GetRefinanceRates.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;