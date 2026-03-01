import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle2, Shield, ArrowRight, HelpCircle, 
  ChevronDown, ChevronUp, RefreshCw, TrendingDown, 
  Banknote, Percent, Calculator, Loader2, Info, Hourglass, XCircle 
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';
import { Button } from '@/components/ui/primitives/Button';
import { useMarketEngine } from '@/hooks/useMarketEngine'; 

// --- JSON-LD SEO SCHEMA ---
const refinanceSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  "name": "Mortgage Refinance",
  "description": "Lower your interest rate or change your loan term with a mortgage refinance.",
  "interestRate": {
    "@type": "QuantitativeValue",
    "value": "6.125",
    "unitText": "PERCENT"
  }
};

// --- HELPER: Savings Calculator ---
const calculateRefiMath = (currentRate, newRate, loanAmount) => {
  if (!currentRate || !newRate || !loanAmount) return { currentPayment: 0, newPayment: 0, savings: 0, breakEven: "N/A" };
  
  const r1 = parseFloat(currentRate) / 100 / 12;
  const r2 = parseFloat(newRate) / 100 / 12;
  const n = 360; // 30 year term
  
  const payment1 = (loanAmount * r1 * Math.pow(1 + r1, n)) / (Math.pow(1 + r1, n) - 1);
  const payment2 = (loanAmount * r2 * Math.pow(1 + r2, n)) / (Math.pow(1 + r2, n) - 1);
  
  const monthlySavings = payment1 - payment2;
  
  // Estimate Closing Costs at 2% of Loan Amount
  const closingCosts = loanAmount * 0.02;
  
  // Calculate Break Even (Months)
  // Logic: If savings <= 10 (negligible), break even is N/A
  const breakEvenMonths = monthlySavings > 10 ? (closingCosts / monthlySavings).toFixed(1) : "N/A";

  return {
    currentPayment: payment1,
    newPayment: payment2,
    savings: monthlySavings,
    breakEven: breakEvenMonths,
    costs: closingCosts
  };
};

// --- COMPONENTS ---

const MobileStickyCTA = () => (
  <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-border md:hidden animate-in slide-in-from-bottom">
    <Link href="/auth/register?product=refinance" className="block w-full">
      <Button size="lg" className="w-full shadow-lg shadow-primary/20">
        Check Refinance Rates <ArrowRight size={18} className="ml-2" />
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

export default function HomeRefinancePage() {
  const { rates, loading } = useMarketEngine();
  
  // --- REAL-TIME CALCULATOR STATE ---
  const [currentRate, setCurrentRate] = useState(7.00); 
  const [loanAmount, setLoanAmount] = useState(400000); 
  
  // Fetch dynamic rate (Refi rates are often same as purchase or slightly higher)
  const newRate = rates?.['30Y'] || '6.125';
  
  // --- DYNAMIC CALCULATIONS ---
  const calculation = useMemo(() => {
    const data = calculateRefiMath(currentRate, newRate, loanAmount);
    
    return {
      currentPayment: data.currentPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
      newPayment: data.newPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
      savings: data.savings.toFixed(0),
      breakEven: data.breakEven,
      isProfitable: data.savings > 0
    };
  }, [currentRate, newRate, loanAmount]);

  const scrollToRequirements = (e) => {
    e.preventDefault();
    document.getElementById('requirements')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-20 font-sans bg-background md:pb-0">
      <Head>
        <title>Home Refinance Loans | HomeRatesYard</title>
        <meta name="description" content="Lower your monthly payments or shorten your loan term. See today's refinance rates and calculate your savings." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(refinanceSchema) }} />
      </Head>

      <main>
        
        {/* 1. HERO SECTION */}
        <section className="relative pt-12 pb-8 overflow-hidden border-b bg-background border-border">
          <div className="container relative z-10 px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              
              {/* Left Content */}
              <div className="max-w-2xl duration-700 animate-in slide-in-from-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-wider text-content-muted border border-border rounded-full bg-background-subtle">
                  <RefreshCw size={12} className="text-primary" />
                  Rate & Term Refinance
                </div>
                
                <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl font-display text-content">
                  Lower Your Rate. <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    Keep More Cash.
                  </span>
                </h1>
                
                <p className="mb-8 text-lg leading-relaxed text-content-muted">
                  Refinancing replaces your current mortgage with a better one. 
                  Reduce your monthly payment, pay off your home faster, or switch from an adjustable to a fixed rate.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="shadow-xl shadow-primary/20">
                    <Link href="/auth/register?product=refinance">
                      Check Refinance Rates <ArrowRight size={18} className="ml-2" />
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={scrollToRequirements}
                    className="bg-white hover:bg-background-subtle"
                  >
                    Do I Qualify?
                  </Button>
                </div>
              </div>

              {/* Right: Interactive Savings Calculator */}
              <div className="relative hidden duration-700 delay-100 lg:block animate-in slide-in-from-right">
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[16/10] group border border-border">
                   <Image 
                    src="https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=1000&auto=format&fit=crop" 
                    alt="Calculating savings on a tablet" 
                    fill
                    className="object-cover w-full h-full transition-transform duration-700 transform group-hover:scale-105"
                    priority
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>
                
                {/* Floating Calculator Widget */}
                <div className="absolute p-6 text-white duration-700 delay-300 border shadow-2xl -bottom-6 -right-6 w-80 bg-content rounded-2xl animate-in slide-in-from-right border-border">
                  <h3 className="mb-4 text-sm font-bold tracking-wider uppercase text-white/60">Refi Analyzer</h3>
                  
                  <div className="space-y-4">
                    
                    {/* INPUT: Loan Amount (Polished: No Spinners, Custom Focus) */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs text-white/60">Loan Balance</span>
                      <div className="flex items-center gap-1 px-2 py-1 transition-colors rounded bg-white/10 focus-within:bg-white/20 focus-within:ring-1 focus-within:ring-primary/50">
                        <span className="text-xs text-white/60">$</span>
                        <input 
                          type="number" 
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(Number(e.target.value))}
                          // FIX: Removed spinners and outline
                          className="w-24 p-0 text-sm font-bold text-right text-white bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>

                    {/* INPUT: Current Rate (Polished) */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs text-white/60">Current Rate</span>
                      <div className="flex items-center gap-1 px-2 py-1 transition-colors rounded bg-white/10 focus-within:bg-white/20 focus-within:ring-1 focus-within:ring-primary/50">
                        <input 
                          type="number" 
                          value={currentRate}
                          onChange={(e) => setCurrentRate(e.target.value)}
                          // FIX: Removed spinners and outline
                          className="w-12 p-0 text-sm font-bold text-right text-white bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-xs">%</span>
                      </div>
                    </div>
                    
                    {/* DISPLAY: New Rate */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs text-white/60">New Rate</span>
                      {loading ? <Loader2 size={12} className="text-white animate-spin" /> : <span className="text-sm font-bold text-success">{newRate}%</span>}
                    </div>

                    <div className="pt-2">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-white/60">Monthly Savings</p>
                          <p className={`text-2xl font-bold ${calculation.isProfitable ? 'text-white' : 'text-white/50'}`}>
                            ${calculation.savings}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/60">Break Even</p>
                          <p className="flex items-center justify-end gap-1 text-sm font-bold text-success">
                            <Hourglass size={12} /> {calculation.breakEven} mo
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
              <StatCard label="Break-Even Point" value="18-24 Mo" sub="Time to recoup closing costs" tooltip="If you plan to move before this time, refinancing might not save you money." />
              <StatCard label="Min. Equity" value="3-5%" sub="Depends on loan type (FHA/Conv)" />
              <StatCard label="Credit Score" value="620+" sub="Higher score = better rate drop" />
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
                  <Banknote size={12} />
                  Cash Flow Strategy
                </div>
                <h2 className="mb-6 text-3xl font-bold leading-tight md:text-5xl font-display text-content">
                  Why refinance <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Now?</span>
                </h2>
                <p className="mb-10 text-lg text-content-muted">
                  Market conditions change. If rates have dropped or your credit has improved, you could be overpaying on your current loan.
                </p>

                <div className="space-y-8">
                  <BenefitItem 
                    icon={Banknote} title="Increase Cash Flow"
                    desc="Lowering your interest rate can save you hundreds per month, freeing up cash for other goals."
                  />
                  <BenefitItem 
                    icon={Shield} title="Switch to Fixed Rate"
                    desc="Have an Adjustable Rate Mortgage (ARM)? Lock in a fixed rate now to protect yourself from future hikes."
                  />
                  <BenefitItem 
                    icon={Percent} title="Remove Mortgage Insurance"
                    desc="If your home value has increased, refinancing can help you eliminate costly PMI payments."
                  />
                </div>
              </div>

              {/* Right: Visual Rate Card */}
              <div className="relative group">
                <div className="absolute inset-0 transition-transform transform border bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[2.5rem] rotate-2 group-hover:rotate-1 -z-10 border-border"></div>
                <div className="relative p-10 overflow-hidden text-white shadow-2xl bg-content rounded-[2rem]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                  
                  <h3 className="mb-8 text-xl font-bold font-display">Example Savings</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <span className="text-sm text-white/60">Current Rate ({currentRate}%)</span>
                      <span className="text-xl font-bold line-through text-white/60 decoration-danger">{calculation.currentPayment}/mo</span>
                    </div>
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <span className="text-sm text-white/60">New Rate ({newRate}%)</span>
                      <span className="text-2xl font-bold text-white">{calculation.newPayment}/mo</span>
                    </div>
                    
                    <div className="p-5 mt-4 border bg-white/5 rounded-xl border-white/5">
                      <div className="flex gap-4">
                        <CheckCircle2 size={24} className="mt-0.5 shrink-0 text-success" />
                        <p className="text-xs leading-relaxed text-white/90">
                          <strong className="block mb-1 text-sm tracking-wide uppercase">Recoup Costs in {calculation.breakEven} Months</strong>
                          If you plan to stay in the home longer than {calculation.breakEven} months, this refinance is profitable.
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
              <h2 className="mb-4 text-3xl font-bold font-display text-content">Refinance Options</h2>
              <p className="max-w-2xl mx-auto text-content-muted">
                Choose the right path based on your financial goals.
              </p>
            </div>

            <div className="overflow-x-auto border shadow-sm rounded-2xl border-border">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="text-xs uppercase border-b text-content-muted bg-background-subtle border-border">
                  <tr>
                    <th className="px-6 py-5 font-bold tracking-wider">Feature</th>
                    <th className="px-6 py-5 font-bold text-primary border-primary/20 bg-primary/5 border-x">Rate & Term Refi</th>
                    <th className="px-6 py-5 font-bold tracking-wider text-content">Cash-Out Refi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { feat: "Primary Goal", rt: "Lower Rate / Change Term", co: "Get Cash at Closing" },
                    { feat: "Interest Rate", rt: "Lowest Available", co: "Slightly Higher (~0.125%)" },
                    { feat: "Max Loan-to-Value", rt: "Up to 97%", co: "Up to 80%" },
                    { feat: "Closing Costs", rt: "Standard", co: "Standard" },
                    { feat: "Appraisal Needed?", rt: "Sometimes Waived", co: "Required" },
                  ].map((row, i) => (
                    <tr key={i} className="transition-colors hover:bg-background-subtle/50 group">
                      <td className="px-6 py-4 font-medium transition-colors text-content group-hover:text-primary">{row.feat}</td>
                      <td className="px-6 py-4 font-bold border-primary/20 text-content bg-primary/5 border-x">{row.rt}</td>
                      <td className="px-6 py-4 text-content-muted">{row.co}</td>
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
              <h2 className="mb-4 text-3xl font-bold md:text-4xl font-display">Do you qualify?</h2>
              <p className="max-w-2xl mx-auto text-white/60">Refinancing has slightly different rules than buying.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="relative p-8 overflow-hidden transition-colors border bg-white/5 backdrop-blur-sm border-success/20 rounded-3xl group hover:border-success/40">
                <div className="absolute top-0 left-0 w-full h-1 bg-success"></div>
                <h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-white">
                  <CheckCircle2 size={18} strokeWidth={3} className="text-success" /> Green Flags
                </h3>
                <ul className="space-y-4">
                  {[
                    { l: "Credit Score 620+", s: "For Conventional loans. FHA allows lower scores." },
                    { l: "Equity Position", s: "Ideally 5-20% equity in your home." },
                    { l: "DTI Ratio", s: "Debt-to-Income ratio below 45-50%." },
                    { l: "Payment History", s: "No late mortgage payments in the last 12 months." }
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
                  <XCircle size={18} strokeWidth={3} className="text-danger" /> When to Wait?
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-white/60">
                  If you plan to move within 2 years, refinancing might not make sense because you won't have time to recoup the closing costs through monthly savings.
                </p>
                <div className="mt-auto">
                    <Link href="/calculators/refinance" className="block">
                      <Button variant="outline" className="w-full text-white bg-white/10 hover:bg-white/20 border-white/10">
                        Calculate Break-Even <Calculator size={16} className="ml-2" />
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
              <FaqItem question="What does it cost to refinance?" answer="Closing costs typically range from 2-5% of the loan amount. However, you can often roll these costs into the new loan so you pay nothing out of pocket at closing." />
              <FaqItem question="Will refinancing hurt my credit?" answer="Initially, there is a small dip due to the hard inquiry and opening a new loan. However, making on-time payments on the new loan will quickly rebuild it." />
              <FaqItem question="Can I skip a payment when I refinance?" answer="Yes! In many cases, the timing of the closing allows you to skip one month's mortgage payment, putting extra cash in your pocket immediately." />
            </div>
          </div>
        </section>

        <FinalCTA />
        <MobileStickyCTA />
      </main>
    </div>
  );
}

HomeRefinancePage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;