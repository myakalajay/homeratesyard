import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle2, Shield, ArrowRight, XCircle, HelpCircle, 
  ChevronDown, ChevronUp, Layers, TrendingUp, 
  Coins, Lock, Calculator, Loader2, Info, Hourglass, AlertTriangle, DollarSign, PieChart 
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';
import { Button } from '@/components/ui/primitives/Button';
import { useMarketEngine } from '@/hooks/useMarketEngine'; 

// --- JSON-LD SEO SCHEMA ---
const equitySchema = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  "name": "Home Equity Loan",
  "description": "Lump-sum fixed-rate second mortgage allowing you to access equity while keeping your current first mortgage rate.",
  "interestRate": {
    "@type": "QuantitativeValue",
    "value": "8.50",
    "unitText": "PERCENT"
  }
};

// --- HELPER: Equity Payment Calculator ---
const calculateEquityPayment = (loanAmount, interestRate, termYears = 20) => {
  if (!loanAmount || !interestRate) return { monthlyPayment: 0 };
  
  const r = parseFloat(interestRate) / 100 / 12;
  const n = termYears * 12;
  
  const monthlyPayment = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  
  return {
    monthlyPayment: monthlyPayment
  };
};

// --- COMPONENTS ---

const MobileStickyCTA = () => (
  <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-border md:hidden animate-in slide-in-from-bottom">
    <Link href="/auth/register?product=home-equity" className="block w-full">
      <Button size="lg" className="w-full shadow-lg shadow-primary/20">
        Check Equity Rates <ArrowRight size={18} className="ml-2" />
      </Button>
    </Link>
  </div>
);

const StatCard = ({ label, value, sub, tooltip }) => (
  <div className="relative p-6 transition-all bg-white border shadow-sm rounded-2xl border-border hover:shadow-md hover:-translate-y-1 group">
    <div className="flex items-center justify-between mb-3">
      <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider group-hover:text-primary transition-colors">
        {label}
      </p>
      {tooltip && (
        <div className="relative group/tooltip">
          <Info size={14} className="text-content-muted cursor-help" />
          <div className="absolute right-0 z-50 w-56 p-3 mb-2 text-xs leading-relaxed text-white transition-opacity rounded-lg shadow-xl opacity-0 pointer-events-none bottom-full bg-slate-900 group-hover/tooltip:opacity-100">
            {tooltip}
          </div>
        </div>
      )}
    </div>
    <p className="mb-1 text-3xl font-bold font-display text-content tabular-nums">
      {value}
    </p>
    <p className="text-xs font-medium text-content-muted">
      {sub}
    </p>
  </div>
);

const BenefitItem = ({ title, desc, icon: Icon }) => (
  <div className="flex items-start gap-4 group">
    <div className="flex items-center justify-center w-12 h-12 transition-colors rounded-2xl bg-primary/10 shrink-0 group-hover:bg-primary/20">
      <Icon size={24} className="text-primary" />
    </div>
    <div>
      <h4 className="mb-2 text-lg font-bold text-content">{title}</h4>
      <p className="text-sm leading-relaxed text-content-muted">{desc}</p>
    </div>
  </div>
);

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="overflow-hidden transition-all duration-300 bg-white border shadow-sm rounded-2xl border-border">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-6 text-left transition-colors focus:outline-none hover:bg-background-subtle"
        aria-expanded={isOpen}
      >
        <h4 className={`font-bold text-sm md:text-base flex items-center gap-3 transition-colors ${isOpen ? 'text-primary' : 'text-content'}`}>
          <HelpCircle size={20} className={`shrink-0 ${isOpen ? 'text-primary' : 'text-content-muted'}`} /> 
          {question}
        </h4>
        {isOpen ? <ChevronUp size={20} className="text-primary" /> : <ChevronDown size={20} className="text-content-muted" />}
      </button>
      <div className={`px-6 text-sm text-content-muted leading-relaxed overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pl-8 ml-2 border-l-2 border-primary/20">{answer}</div>
      </div>
    </div>
  );
};

export default function HomeEquityPage() {
  const { rates, loading } = useMarketEngine();
  
  // --- REAL-TIME CALCULATOR STATE ---
  const [loanAmount, setLoanAmount] = useState(50000); 
  const [term, setTerm] = useState(20); // 20 Year Term Default
  
  // Equity rates are typically higher than 1st mortgage rates
  const baseRate = rates?.['30Y'] || '6.125';
  const equityRate = (parseFloat(baseRate) + 2.375).toFixed(3); // Example spread
  
  // --- DYNAMIC CALCULATIONS ---
  const calculation = useMemo(() => {
    const data = calculateEquityPayment(loanAmount, equityRate, term);
    
    return {
      monthlyPayment: data.monthlyPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
      totalInterest: ((data.monthlyPayment * term * 12) - loanAmount).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
    };
  }, [loanAmount, equityRate, term]);

  const scrollToRequirements = (e) => {
    e.preventDefault();
    document.getElementById('requirements')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-20 font-sans bg-background md:pb-0">
      <Head>
        <title>Home Equity Loans | HomeRatesYard</title>
        <meta name="description" content="Access your home equity with a fixed lump sum while keeping your current low first-mortgage rate." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(equitySchema) }} />
      </Head>

      <main>
        
        {/* 1. HERO SECTION */}
        <section className="relative pt-12 pb-8 overflow-hidden border-b bg-background border-border">
          <div className="container relative z-10 px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              
              {/* Left Content */}
              <div className="max-w-2xl duration-700 animate-in slide-in-from-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-wider text-content-muted border border-border rounded-full bg-background-subtle">
                  <Layers size={12} className="text-primary" />
                  Second Mortgage
                </div>
                
                <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl font-display text-content">
                  Keep Your Low Rate. <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    Access Your Cash.
                  </span>
                </h1>
                
                <p className="mb-8 text-lg leading-relaxed text-content-muted">
                  Don't touch your primary mortgage if you have a low rate. A Home Equity Loan provides a fixed-rate lump sum that layers on top of your existing loan.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="shadow-xl shadow-primary/20">
                    <Link href="/auth/register?product=home-equity">
                      Check Equity Rates <ArrowRight size={18} className="ml-2" />
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={scrollToRequirements}
                    className="bg-white hover:bg-background-subtle"
                  >
                    Loan Limits
                  </Button>
                </div>
              </div>

              {/* Right: Interactive Calculator */}
              <div className="relative hidden duration-700 delay-100 lg:block animate-in slide-in-from-right">
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[16/10] group border border-border">
                   <Image 
                    src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1000&auto=format&fit=crop" 
                    alt="Growing home equity" 
                    fill
                    className="object-cover w-full h-full transition-transform duration-700 transform group-hover:scale-105"
                    priority
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>
                
                {/* Floating Calculator Widget */}
                <div className="absolute p-6 text-white duration-700 delay-300 border shadow-2xl -bottom-12 -right-6 w-80 bg-content rounded-2xl animate-in slide-in-from-right border-border">
                  <h3 className="mb-4 text-sm font-bold tracking-wider uppercase text-white/60">Payment Estimator</h3>
                  
                  <div className="space-y-4">
                    
                    {/* INPUT: Loan Amount */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs text-white/60">Cash Needed</span>
                      <div className="flex items-center gap-1 px-2 py-1 transition-colors rounded bg-white/10 focus-within:bg-white/20 focus-within:ring-1 focus-within:ring-primary/50">
                        <span className="text-xs text-white/60">$</span>
                        <input 
                          type="number" 
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(Number(e.target.value))}
                          className="w-24 p-0 text-sm font-bold text-right text-white bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </div>
                    </div>

                    {/* INPUT: Term Toggle */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs text-white/60">Loan Term</span>
                      <div className="flex p-1 rounded-lg bg-white/10">
                        <button 
                          onClick={() => setTerm(10)}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${term === 10 ? 'bg-primary text-white' : 'text-white/60 hover:text-white'}`}
                        >
                          10Y
                        </button>
                        <button 
                          onClick={() => setTerm(15)}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${term === 15 ? 'bg-primary text-white' : 'text-white/60 hover:text-white'}`}
                        >
                          15Y
                        </button>
                        <button 
                          onClick={() => setTerm(20)}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${term === 20 ? 'bg-primary text-white' : 'text-white/60 hover:text-white'}`}
                        >
                          20Y
                        </button>
                      </div>
                    </div>
                    
                    {/* DISPLAY: Rate */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs text-white/60">Est. Rate</span>
                      {loading ? <Loader2 size={12} className="text-white animate-spin" /> : <span className="text-sm font-bold text-success">{equityRate}%</span>}
                    </div>

                    <div className="pt-2">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-white/60">Monthly Payment</p>
                          <p className="text-2xl font-bold text-white">
                            {calculation.monthlyPayment}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 2. STATS BAR */}
        <section className="py-12 border-b bg-background-subtle border-border">
          <div className="container max-w-6xl px-4 mx-auto">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <StatCard label="Loan Terms" value="5-30 Yrs" sub="Customize your payoff timeline" tooltip="Shorter terms have lower rates but higher monthly payments." />
              <StatCard label="Max CLTV" value="85-90%" sub="Combined Loan-to-Value" tooltip="The total of your 1st mortgage plus this new loan cannot exceed 90% of your home's value." />
              <StatCard label="Funding Speed" value="15 Days" sub="Fast wired transfer" />
            </div>
          </div>
        </section>

        {/* 3. BENEFITS GRID */}
        <section className="py-24 bg-background">
          <div className="container px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-16 lg:grid-cols-2">
              
              {/* Left: Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 rounded-full bg-primary/5">
                  <TrendingUp size={12} />
                  Market Strategy
                </div>
                <h2 className="mb-6 text-3xl font-bold leading-tight md:text-5xl font-display text-content">
                  Protect Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Portfolio.</span>
                </h2>
                <p className="mb-10 text-lg text-content-muted">
                  Unlike a HELOC which has variable rates, a Home Equity Loan locks in your rate for the life of the loan. Perfect for budgeting.
                </p>

                <div className="space-y-8">
                  <BenefitItem 
                    icon={Lock} title="Guaranteed Fixed Rate"
                    desc="Your interest rate and monthly payment will never change, no matter what happens to the economy."
                  />
                  <BenefitItem 
                    icon={Coins} title="Lump Sum Cash"
                    desc="Get your money all at once. Ideal for contractors who need large deposits for renovations or consolidating debt."
                  />
                  <BenefitItem 
                    icon={Layers} title="Preserve Your 1st Mortgage"
                    desc="If you have a 3% rate on your main home loan, keep it! Add this second loan only for the amount you need."
                  />
                </div>
              </div>

              {/* Right: Visual Rate Card */}
              <div className="relative group">
                <div className="absolute inset-0 transition-transform transform border bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[2.5rem] rotate-2 group-hover:rotate-1 -z-10 border-border"></div>
                <div className="relative p-10 overflow-hidden text-white shadow-2xl bg-content rounded-[2rem]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                  
                  <h3 className="mb-8 text-xl font-bold font-display">The "Blended Rate" Strategy</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <span className="text-sm text-white/60">1st Mortgage (3.0%)</span>
                      <span className="text-xl font-bold text-white/60">$200k</span>
                    </div>
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <span className="text-sm text-white/60">Home Equity Loan (7.5%)</span>
                      <span className="text-2xl font-bold text-white">$50k</span>
                    </div>
                    
                    <div className="p-5 mt-4 border bg-white/5 rounded-xl border-white/5">
                      <div className="flex gap-4">
                        <PieChart size={24} className="mt-0.5 shrink-0 text-success" />
                        <p className="text-xs leading-relaxed text-white/90">
                          <strong className="block mb-1 text-sm tracking-wide uppercase">Effective Blended Rate: ~3.9%</strong>
                          This is much cheaper than refinancing the entire $250k balance at today's rate of 6.5%.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. COMPARISON TABLE */}
        <section className="py-24 border-t bg-background border-border">
          <div className="container max-w-6xl px-4 mx-auto">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold font-display text-content">Know Your Options</h2>
              <p className="max-w-2xl mx-auto text-content-muted">
                Home Equity Loan vs. HELOC vs. Cash-Out Refinance.
              </p>
            </div>

            <div className="overflow-x-auto border shadow-sm rounded-2xl border-border">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="text-xs uppercase border-b text-content-muted bg-background-subtle border-border">
                  <tr>
                    <th className="px-6 py-5 font-bold tracking-wider">Feature</th>
                    <th className="px-6 py-5 font-bold text-primary border-primary/20 bg-primary/5 border-x">Home Equity Loan</th>
                    <th className="px-6 py-5 font-bold tracking-wider text-content">HELOC</th>
                    <th className="px-6 py-5 font-bold tracking-wider text-content">Cash-Out Refi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { feat: "Interest Rate", he: "Fixed", heloc: "Variable", cor: "Fixed" },
                    { feat: "Payout Style", he: "Lump Sum", heloc: "Credit Line", cor: "Lump Sum" },
                    { feat: "Effect on 1st Mtg", he: "None (Keeps Rate)", heloc: "None (Keeps Rate)", cor: "Replaces It" },
                    { feat: "Closing Costs", he: "Lower", heloc: "Lowest", cor: "Higher" },
                    { feat: "Payment Stability", he: "Excellent", heloc: "Low (Fluctuates)", cor: "Excellent" },
                  ].map((row, i) => (
                    <tr key={i} className="transition-colors hover:bg-background-subtle/50 group">
                      <td className="px-6 py-4 font-medium transition-colors text-content group-hover:text-primary">{row.feat}</td>
                      <td className="px-6 py-4 font-bold border-primary/20 text-content bg-primary/5 border-x">{row.he}</td>
                      <td className="px-6 py-4 text-content-muted">{row.heloc}</td>
                      <td className="px-6 py-4 text-content-muted">{row.cor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. QUALIFICATION MATRIX & 6. FAQ */}
        <section id="requirements" className="relative py-24 overflow-hidden text-white bg-content scroll-mt-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="container relative z-10 max-w-5xl px-4 mx-auto">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl font-display">Approval Checklist</h2>
              <p className="max-w-2xl mx-auto text-white/60">Equity is the main requirement, but credit matters too.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="relative p-8 overflow-hidden transition-colors border bg-white/5 backdrop-blur-sm border-success/20 rounded-3xl group hover:border-success/40">
                <div className="absolute top-0 left-0 w-full h-1 bg-success"></div>
                <h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-white">
                  <CheckCircle2 size={18} strokeWidth={3} className="text-success" /> Green Flags
                </h3>
                <ul className="space-y-4">
                  {[
                    { l: "High Equity", s: "You retain at least 15-20% equity after the new loan." },
                    { l: "Credit Score 680+", s: "Slightly higher requirement than a primary mortgage." },
                    { l: "Low DTI", s: "Debt-to-income ratio including new payment under 43%." },
                    { l: "Stable Income", s: "2 years of consistent employment history." }
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="mt-1 text-success shrink-0" />
                      <div>
                        <span className="block text-sm font-bold text-white">{item.l}</span>
                        <span className="text-xs text-white/50">{item.s}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative p-8 overflow-hidden transition-colors border bg-white/5 backdrop-blur-sm border-danger/20 rounded-3xl group hover:border-danger/40">
                <div className="absolute top-0 left-0 w-full h-1 bg-danger"></div>
                <h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-white">
                  <AlertTriangle size={18} strokeWidth={3} className="text-danger" /> Not Ideal If...
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-white/60">
                  If you don't know exactly how much the project will cost, a <strong>HELOC</strong> might be better so you only pay interest on what you use. A Home Equity Loan charges interest on the full amount immediately.
                </p>
                <div className="mt-auto">
                    <Link href="/refinance/heloc" className="block">
                      <Button variant="outline" className="w-full text-white bg-white/10 hover:bg-white/20 border-white/10">
                        Compare to HELOC <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-background-subtle">
          <div className="container max-w-3xl px-4 mx-auto">
            <h2 className="mb-10 text-3xl font-bold text-center text-content">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <FaqItem question="Is the interest tax-deductible?" answer="Often, yes! If the funds are used to 'buy, build, or substantially improve' the home that secures the loan, the interest may be tax-deductible. Consult your CPA." />
              <FaqItem question="Can I get a Home Equity Loan with bad credit?" answer="It is more difficult. Because this is a 'second' mortgage, the lender takes more risk. Most lenders require at least a 620-660 score, though some specialized programs exist." />
              <FaqItem question="How long does it take to get the money?" answer="Home Equity Loans typically close faster than full refinances, often in 15-30 days. You receive the full lump sum via wire transfer at closing." />
            </div>
          </div>
        </section>

        <FinalCTA />
        <MobileStickyCTA />
      </main>
    </div>
  );
}

HomeEquityPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;