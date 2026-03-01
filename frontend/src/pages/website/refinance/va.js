'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle2, Shield, ArrowRight, XCircle, HelpCircle, 
  ChevronDown, ChevronUp, Zap, FileX, 
  Flag, TrendingDown, Percent, Calculator, Loader2, Info, Share2, Printer, DollarSign
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';
import { Button } from '@/components/ui/primitives/Button';
import { useMarketEngine } from '@/hooks/useMarketEngine'; 

// --- JSON-LD SEO SCHEMA ---
const vaSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  "name": "VA IRRRL Refinance",
  "description": "Interest Rate Reduction Refinance Loan for Veterans. No appraisal and no income verification required.",
  "interestRate": { "@type": "QuantitativeValue", "value": "5.75", "unitText": "PERCENT" },
  "audience": { "@type": "Audience", "audienceType": "Veterans" }
};

// --- HELPER: IRRRL Math Engine (Bulletproofed) ---
const calculateIRRRL = (currentBalance, currentRate, newRate) => {
  if (!currentBalance || !currentRate || !newRate) return { passed: false, savings: 0, recoup: 0, newPmt: 0, totalCosts: 0 };

  const r1 = parseFloat(currentRate) / 100 / 12;
  const r2 = parseFloat(newRate) / 100 / 12;
  const n = 360; 

  // 1. Old Payment
  const oldPmt = (currentBalance * r1 * Math.pow(1 + r1, n)) / (Math.pow(1 + r1, n) - 1);

  // 2. New Loan (Add 0.5% Funding Fee + Est $2500 Closing Costs)
  const fundingFee = currentBalance * 0.005; 
  const estCosts = 2500; 
  const totalCosts = fundingFee + estCosts;
  const newBalance = currentBalance + totalCosts;

  // 3. New Payment
  const newPmt = (newBalance * r2 * Math.pow(1 + r2, n)) / (Math.pow(1 + r2, n) - 1);

  // 4. Compliance Checks
  const savings = oldPmt - newPmt;
  const recoupMonths = savings > 0 ? (totalCosts / savings) : 999;
  
  // VA Rule: Rate drop >= 0.5% OR Recoup <= 36 months
  const rateDrop = currentRate - newRate;
  const passed = rateDrop >= 0.5 && recoupMonths <= 36;

  return {
    passed,
    savings,
    recoup: recoupMonths.toFixed(1),
    newPmt,
    totalCosts
  };
};

// --- SUB-COMPONENTS ---
const MobileStickyCTA = ({ mounted }) => {
  if (!mounted) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t bg-white/95 backdrop-blur-md border-slate-200 md:hidden animate-in slide-in-from-bottom">
      <Link href="/auth/register?product=va-irrrl" className="block w-full">
        <Button size="lg" className="w-full text-white bg-red-600 shadow-lg shadow-red-600/20 hover:bg-red-700">
          Check Eligibility <ArrowRight size={18} className="ml-2" />
        </Button>
      </Link>
    </div>
  );
};

const StatCard = ({ label, value, sub, tooltip }) => (
  <div className="relative p-6 transition-all bg-white border shadow-sm rounded-2xl border-slate-200 hover:shadow-md hover:-translate-y-1 group">
    <div className="flex items-center justify-between mb-3">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-red-600 transition-colors">
        {label}
      </p>
      {tooltip && (
        <div className="relative group/tooltip">
          <Info size={14} className="text-slate-400 cursor-help" />
          <div className="absolute right-0 z-50 w-56 p-3 mb-2 text-xs leading-relaxed text-white transition-opacity rounded-lg shadow-xl opacity-0 pointer-events-none bottom-full bg-slate-900 group-hover/tooltip:opacity-100">
            {tooltip}
          </div>
        </div>
      )}
    </div>
    <p className="mb-1 text-3xl font-bold font-display text-slate-900 tabular-nums">{value}</p>
    <p className="text-xs font-medium text-slate-500">{sub}</p>
  </div>
);

const BenefitItem = ({ title, desc, icon: Icon }) => (
  <div className="flex items-start gap-4 group">
    <div className="flex items-center justify-center w-12 h-12 transition-colors rounded-2xl bg-red-50 shrink-0 group-hover:bg-red-100">
      <Icon size={24} className="text-red-600" />
    </div>
    <div>
      <h4 className="mb-2 text-lg font-bold text-slate-900">{title}</h4>
      <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
    </div>
  </div>
);

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="overflow-hidden transition-all duration-300 bg-white border shadow-sm rounded-2xl border-slate-200">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full p-6 text-left hover:bg-slate-50 focus:outline-none">
        <h4 className={`font-bold text-sm md:text-base flex items-center gap-3 transition-colors ${isOpen ? 'text-red-600' : 'text-slate-900'}`}>
          <HelpCircle size={20} className={isOpen ? 'text-red-600' : 'text-slate-400'} /> {question}
        </h4>
        {isOpen ? <ChevronUp size={20} className="text-red-600" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>
      <div className={`px-6 text-sm text-slate-600 leading-relaxed overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pl-8 ml-2 border-l-2 border-red-100">{answer}</div>
      </div>
    </div>
  );
};

export default function VARefinancePage() {
  const { rates, loading } = useMarketEngine();
  const [mounted, setMounted] = useState(false);
  
  // --- CALCULATOR STATE ---
  const [currentBalance, setCurrentBalance] = useState(350000);
  const [currentRate, setCurrentRate] = useState(6.75);
  
  // VA IRRRL rates are typically lower than Conventional
  const vaMarketRate = rates?.['VA'] || '5.750';

  useEffect(() => { setMounted(true); }, []);
  
  // --- REAL-TIME ANALYSIS ---
  const analysis = useMemo(() => {
    // 🟢 FIX 1: Robust parsing to prevent NaN crashes
    const parseNum = (val) => Number(String(val).replace(/[^0-9.-]+/g, "")) || 0;
    
    const safeBalance = parseNum(currentBalance);
    const safeRate = parseNum(currentRate);
    const safeMarketRate = parseNum(vaMarketRate);

    const data = calculateIRRRL(safeBalance, safeRate, safeMarketRate);
    
    return {
      monthlySavings: Math.max(0, data.savings).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
      newPayment: data.newPmt.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
      recoupMonths: data.recoup,
      totalCosts: data.totalCosts.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
      isCompliant: data.passed,
      statusColor: data.passed ? 'text-emerald-500' : 'text-orange-500',
      statusText: data.passed ? 'PASSED' : 'CHECK REQ',
      badgeColor: data.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'
    };
  }, [currentBalance, currentRate, vaMarketRate]);

  const scrollToRequirements = (e) => {
    e.preventDefault();
    document.getElementById('requirements')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShare = () => {
    if (navigator.share) {
        navigator.share({ title: 'VA IRRRL Estimate', url: window.location.href }).catch(console.error);
    } else {
        alert("Link copied!");
    }
  };

  return (
    <div className="min-h-screen pb-20 font-sans bg-slate-50 md:pb-0">
      <Head>
        <title>VA Refinance & IRRRL | HomeRatesYard</title>
        <meta name="description" content="Streamline your VA loan with an IRRRL. No appraisal and no income verification required." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(vaSchema) }} />
      </Head>

      <main>
        
        {/* 1. HERO SECTION - IMAGE ON RIGHT */}
        <section className="relative pt-16 pb-12 overflow-hidden bg-white border-b border-slate-200">
          <div className="container relative z-10 px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
              
              {/* Left: Text Content */}
              <div className="max-w-2xl duration-700 animate-in slide-in-from-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-200 rounded-full bg-slate-50">
                  <Flag size={12} className="text-red-600" />
                  Official VA Streamline (IRRRL)
                </div>
                <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl font-display text-slate-900">
                  Drop Your Rate. <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
                    Skip the Paperwork.
                  </span>
                </h1>
                <p className="mb-8 text-lg leading-relaxed text-slate-500">
                  The VA IRRRL is the simplest loan in the industry. Lower your interest rate with <strong>no appraisal</strong> and <strong>no income verification</strong>.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="text-white bg-red-600 shadow-xl shadow-red-600/20 hover:bg-red-700">
                    <Link href="/auth/register?product=va-irrrl">
                      Check IRRRL Rates <ArrowRight size={18} className="ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" onClick={scrollToRequirements} className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700">
                    Eligibility Rules
                  </Button>
                </div>
              </div>

              {/* Right: Visual Trust Image */}
              <div className="relative hidden duration-700 delay-100 lg:block animate-in slide-in-from-right">
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[16/10] group border border-slate-200">
                   <Image 
                    src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1000&auto=format&fit=crop" 
                    alt="Military family at home" 
                    fill
                    className="object-cover w-full h-full transition-transform duration-700 transform group-hover:scale-105"
                    priority
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>
                
                {/* Floating Badge: No Appraisal */}
                <div className="absolute flex items-center gap-4 p-4 duration-700 delay-200 border shadow-xl bg-white/95 backdrop-blur -bottom-6 -left-6 rounded-2xl border-slate-200 animate-in slide-in-from-bottom">
                  <div className="flex items-center justify-center w-12 h-12 text-red-600 rounded-full bg-red-50">
                    <FileX size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requirement</p>
                    <p className="text-sm font-bold text-slate-900">No Appraisal</p>
                  </div>
                </div>

                {/* Floating Badge: Savings */}
                <div className="absolute p-5 text-white duration-700 delay-300 border shadow-xl top-8 -right-6 bg-slate-900 rounded-2xl animate-in slide-in-from-right border-slate-800">
                  <p className="text-[10px] font-bold text-white/60 mb-1 uppercase tracking-wider">Avg Savings</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold tracking-tight">$300+</span>
                    <span className="mb-1 text-sm font-medium text-red-400">/mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. STATS BAR */}
        <section className="py-12 border-b bg-slate-50 border-slate-200">
          <div className="container max-w-6xl px-4 mx-auto text-left">
             <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <StatCard label="Appraisal" value="Waived" sub="Uses original value" tooltip="The VA uses your original loan's appraisal, saving you ~$600 and time." />
                <StatCard label="Income Docs" value="None" sub="No W2s or Paystubs" tooltip="Employment is not re-verified for an IRRRL." />
                <StatCard label="Funding Fee" value="0.5%" sub="Reduced from 2.3%" tooltip="The VA funding fee is significantly lower for Streamline refinances." />
             </div>
          </div>
        </section>

        {/* 3. BENEFITS & CALCULATOR */}
        <section className="py-24 bg-white">
          <div className="container px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-16 lg:grid-cols-2">
              
              {/* Left: Benefits Content */}
              <div>
                
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-200 rounded-full bg-slate-50">
                  <Flag size={12} className="text-red-600" />
                  Veteran Benefit
                </div>
                <h2 className="mb-6 text-3xl font-bold leading-tight md:text-5xl font-display text-slate-900">
                  Why use the <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">IRRRL?</span>
                </h2>
                <p className="mb-10 text-lg text-slate-600">
                  The Interest Rate Reduction Refinance Loan (IRRRL) is a benefit exclusively for Veterans with an existing VA loan. It removes almost all friction from the process.
                </p>
                <div className="mt-10 space-y-8">
                  <BenefitItem icon={Zap} title="Lightning Fast Process" desc="Since we don't need to verify your income or appraise the home again, we can close your loan in weeks, not months." />
                  <BenefitItem icon={TrendingDown} title="Immediate Savings" desc="The main requirement is that the new loan MUST lower your interest rate (Net Tangible Benefit), guaranteeing you save money." />
                  <BenefitItem icon={Shield} title="No Out-of-Pocket Costs" desc="You can roll all closing costs and the simplified Funding Fee (0.5%) into the new loan balance." />
                </div>
              </div>

              {/* Right: INTERACTIVE IRRRL SAVINGS ENGINE */}
              <div className="relative group">
                <div className="absolute inset-0 transition-transform transform border bg-gradient-to-tr from-red-600/20 to-orange-500/20 rounded-[2.5rem] rotate-2 group-hover:rotate-1 -z-10 border-slate-200"></div>
                <div className="relative p-10 overflow-hidden text-white shadow-2xl bg-slate-900 rounded-[2rem] border border-slate-800">
                  <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-red-600/20 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                  
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="flex items-center gap-2 text-xl font-bold font-display">
                      <Calculator size={20} className="text-red-500" /> IRRRL Engine
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={handleShare} className="transition-colors text-slate-400 hover:text-white"><Share2 size={16}/></button>
                        <button onClick={() => window.print()} className="transition-colors text-slate-400 hover:text-white"><Printer size={16}/></button>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {/* 🟢 FIX 2: Standardized Input Layouts */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/50 tracking-widest mb-1.5 block">Current Balance</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 text-white/40"><DollarSign size={16}/></div>
                        <input 
                            type="text" 
                            value={currentBalance} 
                            onChange={(e) => setCurrentBalance(e.target.value.replace(/[^0-9.-]+/g, ""))} 
                            className="w-full h-12 pl-8 pr-3 text-sm font-bold text-white transition-all border outline-none bg-white/5 border-white/10 rounded-xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600"
                        />
                      </div>
                      <input 
                         type="range" min="50000" max="1000000" step="5000"
                         value={Number(String(currentBalance).replace(/[^0-9.-]+/g,'')) || 0}
                         onChange={(e) => setCurrentBalance(e.target.value)}
                         className="w-full h-1 mt-4 rounded-lg appearance-none cursor-pointer bg-white/10 accent-red-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Current Rate</label>
                      <div className="relative flex items-center">
                        <input 
                            type="text" 
                            value={currentRate} 
                            onChange={(e) => setCurrentRate(e.target.value.replace(/[^0-9.-]+/g, ""))} 
                            className="w-full h-12 pl-4 pr-8 text-sm font-bold text-white transition-all border outline-none bg-white/5 border-white/10 rounded-xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600"
                        />
                        <div className="absolute right-4 text-white/40"><Percent size={14}/></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                        <span className="text-sm font-medium text-white/60">New VA Market Rate</span>
                        {loading ? <Loader2 size={16} className="text-red-500 animate-spin" /> : <span className="text-xl font-bold text-red-400">{vaMarketRate}%</span>}
                    </div>

                    <div className="p-5 border rounded-2xl bg-slate-800/50 border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white/80">Monthly Savings</span>
                        <span className={`text-3xl font-bold tabular-nums ${analysis.statusColor}`}>{analysis.monthlySavings}</span>
                      </div>
                      
                      <div className="mt-3 flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider">
                        <span className="text-white/40">Status:</span>
                        <span className={`px-2 py-0.5 rounded ${analysis.badgeColor}`}>
                            {analysis.statusText}
                        </span>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-[10px] font-bold tracking-widest uppercase text-white/40">
                        <span>Est. Costs: {analysis.totalCosts}</span>
                        <span>Recoup: {analysis.recoupMonths} Mos</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. COMPARISON TABLE */}
        <section className="py-24 border-t bg-slate-50 border-slate-200">
          <div className="container max-w-6xl px-4 mx-auto">
             <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold font-display text-slate-900">Choose Your Path</h2>
              <p className="max-w-3xl mx-auto text-slate-600">VA IRRRL (Streamline) vs. VA Cash-Out vs. Conventional.</p>
            </div>
            <div className="overflow-x-auto bg-white border shadow-sm rounded-3xl border-slate-200">
              <table className="w-full text-sm text-left min-w-[800px]">
                <thead className="text-[10px] tracking-widest uppercase border-b text-slate-500 bg-slate-50 border-slate-200">
                  <tr>
                    <th className="px-6 py-5 font-bold">Feature</th>
                    <th className="px-6 py-5 font-bold text-red-600 border-red-100 bg-red-50/50 border-x">VA IRRRL</th>
                    <th className="px-6 py-5 font-bold text-slate-700">VA Cash-Out</th>
                    <th className="px-6 py-5 font-bold text-slate-700">Conventional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { feat: "Primary Goal", irrrl: "Lower Rate Fast", co: "Get Cash", conv: "Remove PMI" },
                    { feat: "Appraisal", irrrl: "No", co: "Yes", conv: "Usually Yes" },
                    { feat: "Income Docs", irrrl: "No", co: "Yes (Full)", conv: "Yes (Full)" },
                    { feat: "Max LTV", irrrl: "Unlimited", co: "100%", conv: "80% (Cash Out)" },
                    { feat: "Funding Fee", irrrl: "0.5% (Reduced)", co: "2.3% - 3.6%", conv: "None" },
                  ].map((row, i) => (
                    <tr key={i} className="transition-colors hover:bg-slate-50/50 group">
                      <td className="px-6 py-5 font-semibold text-slate-900">{row.feat}</td>
                      <td className="px-6 py-5 font-bold text-red-600 border-red-50 bg-red-50/30 border-x">{row.irrrl}</td>
                      <td className="px-6 py-5 font-medium text-slate-600">{row.co}</td>
                      <td className="px-6 py-5 font-medium text-slate-600">{row.conv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. REQUIREMENTS MATRIX */}
        <section id="requirements" className="relative py-24 overflow-hidden text-white bg-slate-900 scroll-mt-20">
          <div className="container relative z-10 max-w-5xl px-4 mx-auto">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              
              <div className="relative p-8 overflow-hidden border bg-white/5 backdrop-blur-sm border-emerald-500/20 rounded-3xl">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
                <h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-white">
                  <CheckCircle2 size={24} className="text-emerald-500" /> Green Flags
                </h3>
                <ul className="space-y-4 text-sm text-white/80">
                  <li className="flex items-start gap-3"><CheckCircle2 size={16} className="mt-1 text-emerald-500 shrink-0" /><div><span className="block font-bold text-white">Current VA Loan</span><span>You must already have a VA loan to use IRRRL.</span></div></li>
                  <li className="flex items-start gap-3"><CheckCircle2 size={16} className="mt-1 text-emerald-500 shrink-0" /><div><span className="block font-bold text-white">Net Tangible Benefit</span><span>The new rate must be lower (usually by 0.5%).</span></div></li>
                </ul>
              </div>

              <div className="relative p-8 overflow-hidden border bg-white/5 backdrop-blur-sm border-orange-500/20 rounded-3xl">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-500"></div>
                <h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-white">
                  <XCircle size={24} className="text-orange-500" /> Disqualifiers
                </h3>
                <p className="mb-6 text-sm font-medium leading-relaxed text-white/60">
                  If you have a 30-day late payment in the last 12 months, you cannot do an IRRRL. Also, you cannot receive any "Cash Back" at closing.
                </p>
                <Link href="/website/refinance/cash-out">
                    <Button variant="outline" className="w-full font-bold text-white transition-colors bg-transparent border-white/20 hover:bg-white/10">Need Cash? See Cash-Out <ArrowRight size={16} className="ml-2" /></Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FAQ */}
        <section className="py-24 bg-slate-50">
          <div className="container max-w-3xl px-4 mx-auto">
            <h2 className="mb-10 text-3xl font-bold text-center text-slate-900">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <FaqItem question="Do I need to live in the home?" answer="For an IRRRL, you only need to certify that you *previously* occupied the home. This makes it great for converting a former primary residence into a rental property." />
              <FaqItem question="What is the Funding Fee?" answer="For an IRRRL, the VA Funding Fee is reduced to just 0.5% of the loan amount (compared to 2.3%+ for purchase). If you have a service-connected disability, this fee is WAIVED completely." />
              <FaqItem question="Can I skip two payments?" answer="Yes! By timing the closing correctly, you can often skip up to two months of mortgage payments, keeping that cash in your pocket during the transition." />
            </div>
          </div>
        </section>

        <FinalCTA />
        <MobileStickyCTA mounted={mounted} />
      </main>
    </div>
  );
}

VARefinancePage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;