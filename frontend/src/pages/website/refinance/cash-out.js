import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle2, Shield, ArrowRight, XCircle, HelpCircle, 
  ChevronDown, ChevronUp, Wallet, Hammer, 
  CreditCard, TrendingUp, PieChart, AlertCircle, Loader2, Info, DollarSign, Lock 
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';
import { Button } from '@/components/ui/primitives/Button';
import { useMarketEngine } from '@/hooks/useMarketEngine'; 

// --- JSON-LD SEO SCHEMA ---
const cashOutSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  "name": "Cash-Out Refinance",
  "description": "Access your home equity to pay off debt or fund renovations.",
  "interestRate": {
    "@type": "QuantitativeValue",
    "value": "6.375",
    "unitText": "PERCENT"
  }
};

// --- HELPER: Equity & Payment Calculator ---
const calculateCashOutMath = (homeValue, currentBalance, maxLTV, interestRate) => {
  if (!homeValue || !interestRate) return { maxLoan: 0, availableCash: 0, newPayment: 0 };
  
  const maxLoanAmount = homeValue * maxLTV;
  const availableCash = Math.max(0, maxLoanAmount - currentBalance);
  
  const r = parseFloat(interestRate) / 100 / 12;
  const n = 360; 
  const newPayment = (maxLoanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  return {
    maxLoan: maxLoanAmount,
    availableCash: availableCash,
    newPayment: newPayment
  };
};

// --- COMPONENTS ---

const MobileStickyCTA = () => (
  <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-border md:hidden animate-in slide-in-from-bottom">
    <Link href="/auth/register?product=cashout" className="block w-full">
      <Button size="lg" className="w-full shadow-lg shadow-primary/20">
        Access My Equity <ArrowRight size={18} className="ml-2" />
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

export default function CashOutRefinancePage() {
  const { rates, loading } = useMarketEngine();
  
  // --- STATE ---
  const [homeValue, setHomeValue] = useState(500000);
  const [currentBalance, setCurrentBalance] = useState(300000);
  const [maxLTV, setMaxLTV] = useState(0.80);
  
  const baseRate = rates?.['30Y'] || '6.125';
  const cashOutRate = (parseFloat(baseRate) + 0.375).toFixed(3);
  
  const calculation = useMemo(() => {
    const data = calculateCashOutMath(homeValue, currentBalance, maxLTV, cashOutRate);
    return {
      maxLoan: data.maxLoan.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
      availableCash: data.availableCash.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
      newPayment: data.newPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
    };
  }, [homeValue, currentBalance, maxLTV, cashOutRate]);

  const scrollToRequirements = (e) => {
    e.preventDefault();
    document.getElementById('requirements')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-20 font-sans bg-background md:pb-0">
      <Head>
        <title>Cash-Out Refinance | HomeRatesYard</title>
        <meta name="description" content="Turn your home equity into cash for renovations or debt consolidation." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(cashOutSchema) }} />
      </Head>

      <main>
        {/* 1. HERO SECTION */}
        <section className="relative pt-12 pb-8 overflow-hidden border-b bg-background border-border">
          <div className="container relative z-10 px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              
              <div className="max-w-2xl duration-700 animate-in slide-in-from-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-wider text-content-muted border border-border rounded-full bg-background-subtle">
                  <Wallet size={12} className="text-primary" />
                  Equity Access
                </div>
                
                <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl font-display text-content">
                  Turn Home Equity <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    Into Real Cash.
                  </span>
                </h1>
                
                <p className="mb-8 text-lg leading-relaxed text-content-muted">
                  A Cash-Out Refinance replaces your current mortgage with a larger one, giving you the difference in tax-free cash.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="shadow-xl shadow-primary/20">
                    <Link href="/auth/register?product=cashout">
                      Get My Cash Quote <ArrowRight size={18} className="ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" onClick={scrollToRequirements} className="bg-white hover:bg-background-subtle">
                    Do I Qualify?
                  </Button>
                </div>
              </div>

              {/* Right: Interactive Equity Calculator - FIXED UI/UX */}
              <div className="relative hidden duration-700 delay-100 lg:block animate-in slide-in-from-right">
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[16/10] group border border-border">
                   <Image 
                    src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1000&auto=format&fit=crop" 
                    alt="Home renovation planning" fill className="object-cover w-full h-full transition-transform duration-700 transform group-hover:scale-105" priority
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>
                
                <div className="absolute p-6 text-white duration-700 delay-300 border shadow-2xl -bottom-12 -right-6 w-80 bg-content rounded-2xl animate-in slide-in-from-right border-border">
                  <h3 className="mb-4 text-sm font-bold tracking-wider uppercase text-white/60">Equity Unlocker</h3>
                  
                  <div className="space-y-4">
                    {/* Home Value Input */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs text-white/60">Home Value</span>
                      <div className="flex items-center gap-1 px-2 py-1 transition-colors rounded bg-white/10 focus-within:bg-white/20 focus-within:ring-1 focus-within:ring-primary/50">
                        <span className="text-xs text-white/60">$</span>
                        <input type="number" value={homeValue} onChange={(e) => setHomeValue(Number(e.target.value))} className="w-24 p-0 text-sm font-bold text-right text-white bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none" />
                      </div>
                    </div>

                    {/* Current Loan Input */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs text-white/60">Current Loan</span>
                      <div className="flex items-center gap-1 px-2 py-1 transition-colors rounded bg-white/10 focus-within:bg-white/20 focus-within:ring-1 focus-within:ring-primary/50">
                        <span className="text-xs text-white/60">$</span>
                        <input type="number" value={currentBalance} onChange={(e) => setCurrentBalance(Number(e.target.value))} className="w-24 p-0 text-sm font-bold text-right text-white bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs text-white/60">Max LTV</span>
                      <div className="flex p-1 rounded-lg bg-white/10">
                        <button onClick={() => setMaxLTV(0.80)} className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${maxLTV === 0.80 ? 'bg-primary text-white shadow-md' : 'text-white/60 hover:text-white'}`}>80%</button>
                        <button onClick={() => setMaxLTV(0.90)} className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${maxLTV === 0.90 ? 'bg-primary text-white shadow-md' : 'text-white/60 hover:text-white'}`}>90%</button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-white/60">Available Cash</p>
                          <p className="text-2xl font-bold text-success">{calculation.availableCash}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/60">New Payment</p>
                          <p className="text-sm font-bold text-white">{calculation.newPayment}/mo</p>
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
              <StatCard label="Max Loan-to-Value" value="80%" sub="Conventional Limit" tooltip="Most lenders require you to leave at least 20% equity in the home." />
              <StatCard label="Avg. Rate Delta" value={`+0.375%`} sub="Over standard Refi" />
              <StatCard label="Closing Time" value="~30 Days" sub="Fast wired funding" />
            </div>
          </div>
        </section>

        {/* 3. BENEFITS GRID - UPGRADED HEADINGS */}
        <section className="py-24 bg-background">
          <div className="container px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-16 lg:grid-cols-2">
              <div className="duration-700 animate-in slide-in-from-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 rounded-full bg-primary/5">
                  <TrendingUp size={12} />
                  Growth Strategy
                </div>
                <h2 className="mb-6 text-3xl font-bold leading-tight md:text-5xl font-display text-content">
                  Why pull cash <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Out?</span>
                </h2>
                <p className="mb-10 text-lg text-content-muted">Your home equity is dormant wealth. Put it to work for your financial future.</p>
                <div className="space-y-8">
                  <BenefitItem icon={CreditCard} title="Debt Consolidation" desc="Pay off 20%+ APR credit cards with a low-interest mortgage." />
                  <BenefitItem icon={Hammer} title="Home Improvement" desc="Renovate your kitchen or add a room to increase home value." />
                  <BenefitItem icon={PieChart} title="New Investments" desc="Use the cash as a down payment for a rental property." />
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 transition-transform transform border bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[2.5rem] rotate-2 group-hover:rotate-1 -z-10 border-border"></div>
                <div className="relative p-10 overflow-hidden text-white shadow-2xl bg-content rounded-[2rem]">
                  <h3 className="mb-8 text-xl font-bold font-display">Net Savings Impact</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <span className="text-sm text-white/60">Credit Card Debt ($30k)</span>
                      <span className="text-xl font-bold text-danger">$900/mo</span>
                    </div>
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <span className="text-sm text-white/60">Mortgage Increase</span>
                      <span className="text-2xl font-bold text-white">$210/mo</span>
                    </div>
                    <div className="p-5 mt-4 border bg-white/5 rounded-xl border-white/5">
                      <div className="flex gap-4">
                        <CheckCircle2 size={24} className="mt-0.5 shrink-0 text-success" />
                        <p className="text-xs leading-relaxed text-white/90">
                          <strong className="block mb-1 text-sm tracking-wide uppercase">Net Monthly Savings: $690</strong>
                          Consolidating high-interest debt into your mortgage is one of the fastest ways to improve monthly cash flow.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. COMPARISON & MATRIX */}
        <section className="py-24 border-t bg-background border-border">
          <div className="container max-w-6xl px-4 mx-auto">
             <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold font-display text-content">The Best Way to Borrow</h2>
              <p className="max-w-3xl mx-auto text-content-muted">Compare Cash-Out Refinancing against other common equity products.</p>
            </div>
            <div className="overflow-x-auto border shadow-sm rounded-2xl border-border">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="text-xs uppercase border-b text-content-muted bg-background-subtle border-border">
                  <tr>
                    <th className="px-6 py-5 font-bold tracking-wider">Feature</th>
                    <th className="px-6 py-5 font-bold text-primary border-primary/20 bg-primary/5 border-x">Cash-Out Refi</th>
                    <th className="px-6 py-5 font-bold tracking-wider text-content">HELOC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { feat: "Interest Rate", refi: "Lowest (Fixed)", heloc: "Variable (Higher)" },
                    { feat: "Loan Term", refi: "15-30 Years", heloc: "10 Year Draw" },
                    { feat: "Closing Costs", refi: "Standard (2-3%)", heloc: "None / Minimal" },
                    { feat: "Best For...", refi: "Large Projects", heloc: "Ongoing Needs" },
                  ].map((row, i) => (
                    <tr key={i} className="transition-colors hover:bg-background-subtle/50 group">
                      <td className="px-6 py-4 font-medium text-content">{row.feat}</td>
                      <td className="px-6 py-4 font-bold border-primary/20 text-content bg-primary/5 border-x">{row.refi}</td>
                      <td className="px-6 py-4 text-content-muted">{row.heloc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. REQUIREMENTS */}
        <section id="requirements" className="relative py-24 overflow-hidden text-white bg-content scroll-mt-20">
          <div className="container relative z-10 max-w-5xl px-4 mx-auto">
             <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="relative p-8 overflow-hidden transition-colors border bg-white/5 backdrop-blur-sm border-success/20 rounded-3xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-success"></div>
                <h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-white"><CheckCircle2 size={18} strokeWidth={3} className="text-success" /> Green Flags</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3"><CheckCircle2 size={16} className="mt-1 text-success shrink-0" /><div><span className="block text-sm font-bold text-white">20%+ Equity</span><span className="text-xs text-white/50">Required to qualify for Conventional.</span></div></li>
                  <li className="flex items-start gap-3"><CheckCircle2 size={16} className="mt-1 text-success shrink-0" /><div><span className="block text-sm font-bold text-white">620+ Credit Score</span><span className="text-xs text-white/50">Minimum for most cash-out programs.</span></div></li>
                </ul>
              </div>
              <div className="relative p-8 overflow-hidden transition-colors border bg-white/5 backdrop-blur-sm border-danger/20 rounded-3xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-danger"></div>
                <h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-white"><AlertCircle size={18} strokeWidth={3} className="text-danger" /> Limitations</h3>
                <p className="mb-6 text-sm text-white/60">If you just purchased or refinanced in the last 6 months, you usually have to wait for "seasoning" before doing a cash-out.</p>
                <Link href="/calculators/equity" className="block"><Button variant="outline" className="w-full text-white bg-white/10 border-white/10 hover:bg-white/20">Check Equity <ArrowRight size={16} className="ml-2" /></Button></Link>
              </div>
            </div>
          </div>
        </section>

        <FinalCTA />
        <MobileStickyCTA />
      </main>
    </div>
  );
}

CashOutRefinancePage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;