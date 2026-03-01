import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle2, ArrowRight, XCircle, HelpCircle, 
  ChevronDown, ChevronUp, TrendingDown, Clock, 
  RefreshCw, ShieldAlert, BadgeDollarSign, Loader2, Info, Calculator, AlertTriangle 
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';
import { Button } from '@/components/ui/primitives/Button';
import { useMarketEngine } from '@/hooks/useMarketEngine'; 

// --- JSON-LD SEO SCHEMA ---
const armSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  "name": "5/1 Adjustable Rate Mortgage (ARM)",
  "description": "Lower initial interest rate fixed for 5 years, then adjustable.",
  "interestRate": {
    "@type": "QuantitativeValue",
    "value": "5.50",
    "unitText": "PERCENT"
  },
  "feesAndCommissionsSpecification": "Rate Caps apply (e.g., 2/2/5)"
};

// --- HELPER: Monthly Payment Calculator ---
const calculateMonthly = (rate, loan = 400000) => {
  if (!rate) return 0;
  const r = parseFloat(rate) / 100 / 12;
  const n = 360;
  return (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

// --- COMPONENTS ---

const MobileStickyCTA = () => (
  <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-border md:hidden animate-in slide-in-from-bottom">
    <Link href="/auth/register?product=arm" className="block w-full">
      <Button size="lg" className="w-full shadow-lg shadow-primary/20">
        Get Rate Quote <ArrowRight size={18} className="ml-2" />
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

export default function ARMLoanPage() {
  const { rates, loading } = useMarketEngine();
  
  // 1. SAFE DATA FETCHING
  // Use '5/1 ARM' if available, otherwise use a realistic spread from the 30Y rate
  const fixedRate = rates?.['30Y'] || '6.125';
  const armRate = rates?.['5/1 ARM'] || (parseFloat(fixedRate) - 0.625).toFixed(3); // ARMs usually ~0.625% lower
  
  // 2. RISK CALCULATION (Lifetime Cap)
  // Standard Cap is 5% over start rate. 
  const maxRate = (parseFloat(armRate) + 5.0).toFixed(3);
  
  // 3. PAYMENT LOGIC (Start vs Max)
  const loanAmount = 400000;
  const paymentInitial = calculateMonthly(armRate, loanAmount);
  const paymentMax = calculateMonthly(maxRate, loanAmount);
  
  // 4. SAVINGS LOGIC (vs Fixed)
  const paymentFixed = calculateMonthly(fixedRate, loanAmount);
  const monthlySavings = paymentFixed - paymentInitial;
  const fiveYearSavings = (monthlySavings * 60).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  // Formatting strings
  const strPaymentInitial = paymentInitial.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const strPaymentMax = paymentMax.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  const scrollToRequirements = (e) => {
    e.preventDefault();
    document.getElementById('requirements')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-20 font-sans bg-background md:pb-0">
      <Head>
        <title>ARM Loans | HomeRatesYard</title>
        <meta name="description" content="Adjustable Rate Mortgages (ARMs) offer lower initial interest rates. Smart financing for short-term homeowners." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(armSchema) }} />
      </Head>

      <main>
        
        {/* 1. HERO SECTION */}
        <section className="relative pt-12 pb-8 overflow-hidden border-b bg-background border-border">
          <div className="container relative z-10 px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              
              {/* Left Content */}
              <div className="max-w-2xl duration-700 animate-in slide-in-from-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-wider text-content-muted border border-border rounded-full bg-background-subtle">
                  <TrendingDown size={12} className="text-primary" />
                  Lowest Initial Rates
                </div>
                
                <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl font-display text-content">
                  Start Low. <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    Save Big Early On.
                  </span>
                </h1>
                
                <p className="mb-8 text-lg leading-relaxed text-content-muted">
                  An Adjustable Rate Mortgage (ARM) gives you a lower interest rate for the first 5, 7, or 10 years. 
                  Perfect if you plan to move or refinance before the rate adjusts.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="shadow-xl shadow-primary/20">
                    <Link href="/auth/register?product=arm">
                      Get Rate Quote <ArrowRight size={18} className="ml-2" />
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={scrollToRequirements}
                    className="bg-white hover:bg-background-subtle"
                  >
                    How It Works
                  </Button>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative hidden duration-700 delay-100 lg:block animate-in slide-in-from-right">
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[16/10] group border border-border">
                   <Image 
                    src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1000&auto=format&fit=crop" 
                    alt="Financial growth strategy" 
                    fill
                    className="object-cover w-full h-full transition-transform duration-700 transform group-hover:scale-105"
                    priority
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                </div>
                
                {/* Floating Badge 1 */}
                <div className="absolute flex items-center gap-4 p-4 duration-700 delay-200 border shadow-xl bg-white/90 backdrop-blur-md -bottom-6 -left-6 rounded-2xl border-white/50 animate-bounce" style={{ animationDuration: '4s' }}>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full text-primary bg-primary/10">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider">Fixed Period</p>
                    <p className="text-sm font-bold text-content">5, 7, or 10 Years</p>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div className="absolute p-6 text-white duration-700 delay-300 border shadow-2xl top-8 -right-6 bg-content rounded-2xl animate-in slide-in-from-right border-border">
                  <p className="text-[10px] font-bold text-white/60 mb-1 uppercase tracking-wider">Intro Rate</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold tracking-tight">{armRate}%</span>
                    <span className="mb-1.5 text-xs font-bold text-success px-1.5 py-0.5 bg-success/10 rounded">Fixed</span>
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
              <StatCard 
                label="Initial Savings" 
                value={`~${(parseFloat(fixedRate) - parseFloat(armRate)).toFixed(2)}%`} 
                sub="Lower rate vs 30-Year Fixed" 
              />
              <StatCard label="Fixed Term" value="5-10 Yrs" sub="Rate stays locked during this period" />
              <StatCard 
                label="Adjustment Cap" 
                value="5% Max" 
                sub="Lifetime cap protects from extreme hikes" 
                tooltip="Your rate can never go more than 5% above your initial start rate, no matter what the market does."
              />
            </div>
          </div>
        </section>

        {/* 3. BENEFITS GRID & ESTIMATOR */}
        <section className="py-24 bg-background">
          <div className="container px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-16 lg:grid-cols-2">
              
              {/* Left: Content */}
              <div>
                <h2 className="mb-6 text-3xl font-bold md:text-4xl font-display text-content">
                  Is an ARM right for you?
                </h2>
                <p className="mb-10 text-lg text-content-muted">
                  ARMs are strategic tools. By accepting rate adjustments later, you get a significant discount today.
                </p>

                <div className="space-y-8">
                  <BenefitItem 
                    icon={BadgeDollarSign} title="Maximize Cash Flow"
                    desc="Lower monthly payments in the early years free up cash for investments, renovations, or other debts."
                  />
                  <BenefitItem 
                    icon={RefreshCw} title="The 'Starter Home' Strategy"
                    desc="If you only plan to live in the home for 5-7 years, why pay for a 30-year fixed rate you won't use?"
                  />
                  <BenefitItem 
                    icon={TrendingDown} title="Principal Reduction"
                    desc="With a lower rate, more of your payment goes toward principal, helping you build equity faster initially."
                  />
                </div>
              </div>

              {/* Right: Dynamic Payment Calculator Card */}
              <div className="relative group">
                <div className="absolute inset-0 transition-transform transform border bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[2.5rem] rotate-2 group-hover:rotate-1 -z-10 border-border"></div>
                
                <div className="relative p-10 overflow-hidden text-white shadow-2xl bg-content rounded-[2rem]">
                  
                  <h3 className="mb-8 text-xl font-bold font-display">5/1 ARM Estimate</h3>
                  
                  <div className="space-y-6">
                    {/* Rate Row */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <span className="text-sm text-white/60">First 5 Years (Fixed)</span>
                      {loading ? (
                         <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      ) : (
                         <span className="text-2xl font-bold text-primary">{armRate}%</span>
                      )}
                    </div>

                    {/* Payment Row */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/60">Est. Payment</span>
                        <div className="relative group/pay">
                          <Calculator size={14} className="text-white/40 cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 text-[10px] text-content bg-white rounded-lg opacity-0 pointer-events-none group-hover/pay:opacity-100 transition-opacity z-50 shadow-lg">
                            Principal & Interest for a $400k loan during the fixed period.
                          </div>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-white">{strPaymentInitial}<span className="text-sm font-normal text-white/60">/mo</span></span>
                    </div>
                    
                    {/* Savings Row */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/60">5-Year Savings</span>
                        <div className="relative group/savings">
                          <Info size={14} className="text-white/40 cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 text-[10px] text-content bg-white rounded-lg opacity-0 pointer-events-none group-hover/savings:opacity-100 transition-opacity z-50 shadow-lg">
                            Comparison vs 30Y Fixed at {fixedRate}% on a $400k loan.
                          </div>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-success">+{fiveYearSavings}</span>
                    </div>
                    
                    {/* RISK TRANSPARENCY: Max Rate & Payment */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-warning/90">Max Possible Pmt</span>
                        <div className="relative group/risk">
                          <AlertTriangle size={14} className="text-warning cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 text-[10px] leading-relaxed text-content bg-white rounded-lg opacity-0 pointer-events-none group-hover/risk:opacity-100 transition-opacity z-50 shadow-lg">
                            Worst Case: If rates rise maximally after 5 years, your rate could hit {maxRate}%. Your payment would cap at {strPaymentMax}.
                          </div>
                        </div>
                      </div>
                      <span className="text-lg font-medium text-warning">{strPaymentMax}<span className="text-xs text-warning/60">/mo</span></span>
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. COMPARISON TABLE */}
        <section className="py-24 border-t bg-background border-border">
          <div className="container max-w-5xl px-4 mx-auto">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold font-display text-content">The Cost of Certainty</h2>
              <p className="max-w-xl mx-auto text-content-muted">
                Comparing a 5/1 ARM against the standard 30-Year Fixed loan.
              </p>
            </div>

            <div className="overflow-x-auto border shadow-sm rounded-2xl border-border">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="text-xs uppercase border-b text-content-muted bg-background-subtle border-border">
                  <tr>
                    <th className="px-6 py-5 font-bold tracking-wider">Feature</th>
                    <th className="px-6 py-5 font-bold text-primary border-primary/20 bg-primary/5 border-x">5/1 ARM</th>
                    <th className="px-6 py-5 font-bold tracking-wider text-content">30-Year Fixed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { feat: "Initial Rate", arm: `Lower (${armRate}%)`, fix: `Higher (${fixedRate}%)` },
                    { feat: "Rate Security", arm: "Fixed for 5 Years", fix: "Fixed Forever" },
                    { feat: "Best For", arm: "Moving in < 7 Years", fix: "Forever Home" },
                    { feat: "Risk Level", arm: "Medium (Rate Risk)", fix: "Low (No Risk)" },
                    { feat: "Qualification", arm: "Slightly Stricter", fix: "Standard" },
                  ].map((row, i) => (
                    <tr key={i} className="transition-colors hover:bg-background-subtle/50 group">
                      <td className="px-6 py-4 font-medium transition-colors text-content group-hover:text-primary">{row.feat}</td>
                      <td className="px-6 py-4 font-bold border-primary/20 text-content bg-primary/5 border-x">{row.arm}</td>
                      <td className="px-6 py-4 text-content-muted">{row.fix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. QUALIFICATION MATRIX (Inverted/Dark) */}
        <section id="requirements" className="relative py-24 overflow-hidden text-white bg-content scroll-mt-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="container relative z-10 max-w-5xl px-4 mx-auto">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl font-display">Who should get an ARM?</h2>
              <p className="max-w-2xl mx-auto text-white/60">It's all about your timeline and risk tolerance.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              
              {/* GREEN FLAGS */}
              <div className="relative p-8 overflow-hidden transition-colors border bg-white/5 backdrop-blur-sm border-success/20 rounded-3xl group hover:border-success/40">
                <div className="absolute top-0 left-0 w-full h-1 bg-success"></div>
                <h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-white">
                  <CheckCircle2 size={18} strokeWidth={3} className="text-success" /> ARM Green Flags
                </h3>
                <ul className="space-y-4">
                  {[
                    { l: "Short Timeline", s: "You plan to sell the home within 5-7 years." },
                    { l: "Career Growth", s: "You expect your income to rise significantly before adjustment." },
                    { l: "High Market Rates", s: "Current fixed rates are high, and you plan to refinance later." },
                    { l: "Aggressive Payoff", s: "You plan to pay down the mortgage aggressively with the savings." }
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

              {/* RED FLAGS */}
              <div className="relative p-8 overflow-hidden transition-colors border bg-white/5 backdrop-blur-sm border-danger/20 rounded-3xl group hover:border-danger/40">
                <div className="absolute top-0 left-0 w-full h-1 bg-danger"></div>
                <h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-white">
                  <XCircle size={18} strokeWidth={3} className="text-danger" /> Stick to Fixed Rate?
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-white/60">
                  If this is your "Forever Home," you are on a fixed income, or you lose sleep worrying about interest rates rising, an ARM is not for you.
                </p>
                <div className="mt-auto">
                    <Link href="/loans/conventional" className="block">
                      <Button variant="outline" className="w-full text-white bg-white/10 hover:bg-white/20 border-white/10">
                        View 30-Year Fixed Rates <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FAQ */}
        <section className="py-24 bg-background-subtle">
          <div className="container max-w-3xl px-4 mx-auto">
            <h2 className="mb-10 text-3xl font-bold text-center text-content">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <FaqItem 
                question="What happens after the fixed period ends?" 
                answer="The rate adjusts annually based on a market index (like SOFR) plus a margin. It can go up or down, but 'Caps' limit how much it can change." 
              />
              <FaqItem 
                question="What does 5/1 or 7/1 mean?" 
                answer="The first number (5 or 7) is the years the rate is fixed. The second number (1) means the rate adjusts once every year after that." 
              />
              <FaqItem 
                question="Can I refinance an ARM into a fixed rate?" 
                answer="Yes! This is a very common strategy. Borrowers use the ARM for low rates initially, then refinance into a fixed loan before the adjustment period begins." 
              />
            </div>
          </div>
        </section>

        <FinalCTA />
        <MobileStickyCTA />
      </main>
    </div>
  );
}

ARMLoanPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;