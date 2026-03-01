import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle2, ArrowRight, XCircle, HelpCircle, 
  ChevronDown, ChevronUp, FileSpreadsheet, Briefcase, 
  Unlock, Wallet, Layers, LineChart, Loader2, Info, Calculator, TrendingUp, DollarSign, Calendar 
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';
import { Button } from '@/components/ui/primitives/Button';
import { useMarketEngine } from '@/hooks/useMarketEngine'; 

// --- JSON-LD SEO SCHEMA ---
const nonQmSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  "name": "Non-QM Mortgage",
  "description": "Flexible income verification loans for self-employed and high-net-worth borrowers.",
  "interestRate": {
    "@type": "QuantitativeValue",
    "value": "7.5",
    "unitText": "PERCENT"
  },
  "audience": {
    "@type": "Audience",
    "audienceType": "Self-Employed"
  }
};

// --- HELPER: Buying Power Calculator ---
const calculateMaxLoan = (monthlyIncome, dtiLimit = 0.50, interestRate) => {
  if (!monthlyIncome || !interestRate) return { loanAmount: 0, payment: 0 };
  
  const r = parseFloat(interestRate) / 100 / 12;
  const n = 360;
  
  // Assume 20% of payment capacity goes to Tax/Ins, so 80% to P&I
  const maxPI = (monthlyIncome * dtiLimit) * 0.80;
  
  const loanAmount = (maxPI * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
  
  return { loanAmount, payment: maxPI };
};

// --- COMPONENTS ---

const MobileStickyCTA = () => (
  <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-border md:hidden animate-in slide-in-from-bottom">
    <Link href="/auth/register?product=nonqm" className="block w-full">
      <Button size="lg" className="w-full shadow-lg shadow-primary/20">
        Check Eligibility <ArrowRight size={18} className="ml-2" />
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

export default function NonQMLoanPage() {
  const { rates, loading } = useMarketEngine();
  
  // --- STATE ---
  const [taxIncome, setTaxIncome] = useState(45000); // Low tax return income
  const [bankIncome, setBankIncome] = useState(120000); // High actual cash flow
  const [months, setMonths] = useState(12); // 12 vs 24 Month Toggle
  
  // Non-QM Rate Logic: 
  // Base 30Y + 1.5% (12 Months) OR + 1.25% (24 Months - Lower Risk)
  const baseRate = rates?.['30Y'] || '6.125';
  const margin = months === 24 ? 1.25 : 1.50;
  const nonQmRate = (parseFloat(baseRate) + margin).toFixed(3);
  
  // --- DYNAMIC CALCULATIONS ---
  const calculation = useMemo(() => {
    // 1. Calculate Monthly Income
    const monthlyTax = taxIncome / 12;
    const monthlyBank = bankIncome / 12;
    
    // 2. Calculate Max Loan Capacity (50% DTI)
    const resTax = calculateMaxLoan(monthlyTax, 0.50, nonQmRate);
    const resBank = calculateMaxLoan(monthlyBank, 0.50, nonQmRate);
    
    const difference = resBank.loanAmount - resTax.loanAmount;
    
    return {
      loanTax: resTax.loanAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
      loanBank: resBank.loanAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
      paymentBank: resBank.payment.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
      difference: difference.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
      multiplier: resTax.loanAmount > 0 ? (resBank.loanAmount / resTax.loanAmount).toFixed(1) : "N/A"
    };
  }, [taxIncome, bankIncome, nonQmRate]);

  const scrollToRequirements = (e) => {
    e.preventDefault();
    document.getElementById('requirements')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-20 font-sans bg-background md:pb-0">
      <Head>
        <title>Non-QM Loans | HomeRatesYard</title>
        <meta name="description" content="Flexible mortgage options for self-employed borrowers. Qualify with bank statements or asset depletion instead of tax returns." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(nonQmSchema) }} />
      </Head>

      <main>
        
        {/* 1. HERO SECTION */}
        <section className="relative pt-12 pb-8 overflow-hidden border-b bg-background border-border">
          <div className="container relative z-10 px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              
              {/* Left Content */}
              <div className="max-w-2xl duration-700 animate-in slide-in-from-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-wider text-content-muted border border-border rounded-full bg-background-subtle">
                  <Briefcase size={12} className="text-primary" />
                  Self-Employed & Gig Workers
                </div>
                
                <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl font-display text-content">
                  Income is Complex. <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    Qualifying shouldn't be.
                  </span>
                </h1>
                
                <p className="mb-8 text-lg leading-relaxed text-content-muted">
                  No tax returns? No problem. Non-QM loans allow you to qualify using bank statements, 1099s, or liquid assets.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="shadow-xl shadow-primary/20">
                    <Link href="/auth/register?product=nonqm">
                      Check Eligibility <ArrowRight size={18} className="ml-2" />
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={scrollToRequirements}
                    className="bg-white hover:bg-background-subtle"
                  >
                    View Programs
                  </Button>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative hidden duration-700 delay-100 lg:block animate-in slide-in-from-right">
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[16/10] group border border-border">
                   <Image 
                    src="https://images.unsplash.com/photo-1593642532973-d31b6557fa68?q=80&w=1000&auto=format&fit=crop" 
                    alt="Entrepreneur working from modern home office" 
                    fill
                    className="object-cover w-full h-full transition-transform duration-700 transform group-hover:scale-105"
                    priority
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                </div>
                
                {/* Floating Badge 1 */}
                <div className="absolute flex items-center gap-4 p-4 duration-700 delay-200 border shadow-xl bg-white/90 backdrop-blur-md -bottom-6 -left-6 rounded-2xl border-white/50 animate-bounce" style={{ animationDuration: '4s' }}>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full text-primary bg-primary/10">
                    <FileSpreadsheet size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider">Accepted Docs</p>
                    <p className="text-sm font-bold text-content">12-24mo Bank Stmts</p>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div className="absolute p-6 text-white duration-700 delay-300 border shadow-2xl top-8 -right-6 bg-content rounded-2xl animate-in slide-in-from-right border-border">
                  <p className="text-[10px] font-bold text-white/60 mb-1 uppercase tracking-wider">Loan Limit</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold tracking-tight">$3M+</span>
                    <span className="mb-1.5 text-xs font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded">Jumbo</span>
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
              <StatCard label="Income Verification" value="Flexible" sub="Bank Statements, 1099, or Assets" />
              <StatCard label="Credit Score" value="620+" sub="We accept recent credit events" />
              <StatCard label="Max DTI" value="50-55%" sub="Higher debt allowance than Conventional" />
            </div>
          </div>
        </section>

        {/* 3. BENEFITS GRID & CALCULATOR */}
        <section className="py-24 bg-background">
          <div className="container px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-16 lg:grid-cols-2">
              
              {/* Left: Content - UPDATED TYPOGRAPHY */}
              <div className="duration-700 animate-in slide-in-from-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 rounded-full bg-primary/5">
                  <Briefcase size={12} />
                  Self-Employed Specialist
                </div>
                <h2 className="mb-6 text-3xl font-bold leading-tight md:text-5xl font-display text-content">
                  Beyond the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Tax Return.</span>
                </h2>
                <p className="mb-10 text-lg text-content-muted">
                  Traditional loans punish business owners for writing off expenses. Non-QM loans look at your actual cash flow to determine purchasing power.
                </p>

                <div className="space-y-8">
                  <BenefitItem 
                    icon={FileSpreadsheet} title="Bank Statement Loans"
                    desc="We average the deposits from your last 12 or 24 months of personal or business bank statements to calculate your income."
                  />
                  <BenefitItem 
                    icon={Layers} title="Asset Depletion"
                    desc="Have high net worth but low monthly income? We can divide your liquid assets by the loan term to create a 'virtual' income."
                  />
                  <BenefitItem 
                    icon={Unlock} title="Recent Credit Events OK"
                    desc="A bankruptcy or foreclosure doesn't have to mean waiting 4-7 years. Some Non-QM programs allow you to buy just 1 day after discharge."
                  />
                </div>
              </div>

              {/* Right: Interactive Buying Power Calculator - FIXED UI */}
              <div className="relative group">
                <div className="absolute inset-0 transition-transform transform border bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[2.5rem] rotate-2 group-hover:rotate-1 -z-10 border-border"></div>
                
                <div className="relative p-10 overflow-hidden text-white shadow-2xl bg-content rounded-[2rem]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                  
                  <h3 className="mb-8 text-xl font-bold font-display">Buying Power Unlocker</h3>
                  
                  <div className="space-y-6">
                    
                    {/* INPUT 1: Tax Income (Fixed UI) */}
                    <div className="pb-4 border-b border-white/10">
                      <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-white/60">Tax Return Income (Net)</label>
                      <div className="flex items-center gap-3 px-4 py-3 transition-all border rounded-xl bg-white/5 border-white/10 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
                        <DollarSign size={20} className="shrink-0 text-white/40" />
                        <input 
                          type="number" 
                          value={taxIncome} 
                          onChange={(e) => setTaxIncome(Number(e.target.value))}
                          className="w-full text-xl font-bold text-white bg-transparent border-none outline-none font-display placeholder-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div className="mt-2 text-sm text-white/60">
                        Qualified Loan: <span className="text-white">{calculation.loanTax}</span>
                      </div>
                    </div>

                    {/* INPUT 2: Bank Income (Fixed UI) */}
                    <div className="pb-4 border-b border-white/10">
                      <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-white/60">Real Cash Flow (Gross)</label>
                      <div className="flex items-center gap-3 px-4 py-3 transition-all border rounded-xl bg-white/5 border-white/10 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
                        <DollarSign size={20} className="shrink-0 text-white/40" />
                        <input 
                          type="number" 
                          value={bankIncome} 
                          onChange={(e) => setBankIncome(Number(e.target.value))}
                          className="w-full text-xl font-bold text-white bg-transparent border-none outline-none font-display placeholder-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-white/60">Qualified Loan: <span className="font-bold text-success">{calculation.loanBank}</span></span>
                      </div>
                    </div>

                    {/* NEW: 12 vs 24 Month Toggle */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-white/60" />
                        <span className="text-sm text-white/60">Statements</span>
                      </div>
                      <div className="flex p-1 rounded-lg bg-white/10">
                        <button 
                          onClick={() => setMonths(12)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${months === 12 ? 'bg-primary text-white shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                        >
                          12 Mo
                        </button>
                        <button 
                          onClick={() => setMonths(24)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${months === 24 ? 'bg-primary text-white shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                        >
                          24 Mo
                        </button>
                      </div>
                    </div>

                    {/* RESULT BOX */}
                    <div className="p-5 mt-4 border rounded-xl bg-success/10 border-success/20">
                      <div className="flex gap-4">
                        <TrendingUp size={24} className="mt-1 text-success shrink-0" />
                        <div>
                          <p className="text-xs font-bold tracking-wider uppercase text-success">Unlocked Potential</p>
                          <p className="mt-1 text-sm leading-relaxed text-white/90">
                            You increased your buying power by <strong className="text-lg text-white">+{calculation.difference}</strong> ({calculation.multiplier}x).
                          </p>
                          <p className="mt-2 text-xs text-white/60">
                            Est. Payment on new loan amount: <span className="text-white">{calculation.paymentBank}/mo</span>
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

        {/* 4. COMPARISON TABLE */}
        <section className="py-24 border-t bg-background border-border">
          <div className="container max-w-6xl px-4 mx-auto">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold font-display text-content">Alternative vs. Traditional</h2>
              <p className="max-w-2xl mx-auto text-content-muted">
                Non-QM loans offer flexibility, but rates are typically slightly higher to account for risk.
              </p>
            </div>

            <div className="overflow-x-auto border shadow-sm rounded-2xl border-border">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="text-xs uppercase border-b text-content-muted bg-background-subtle border-border">
                  <tr>
                    <th className="px-6 py-5 font-bold tracking-wider">Feature</th>
                    <th className="px-6 py-5 font-bold text-primary border-primary/20 bg-primary/5 border-x">Non-QM / Bank Stmt</th>
                    <th className="px-6 py-5 font-bold tracking-wider text-content">Conventional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { feat: "Documentation", nqm: "Bank Statements / Assets", conv: "W2 / Tax Returns" },
                    { feat: "Max Loan Amount", nqm: "$3M - $5M", conv: "$766,550" },
                    { feat: "Self-Employed", nqm: "Primary Focus", conv: "Difficult (Net Income)" },
                    { feat: "Waiting Periods", nqm: "Minimal / None", conv: "2-7 Years" },
                    { feat: "Interest Rates", nqm: "Higher (+1% to 2%)", conv: "Lowest Available" },
                  ].map((row, i) => (
                    <tr key={i} className="transition-colors hover:bg-background-subtle/50 group">
                      <td className="px-6 py-4 font-medium transition-colors text-content group-hover:text-primary">{row.feat}</td>
                      <td className="px-6 py-4 font-bold border-primary/20 text-content bg-primary/5 border-x">{row.nqm}</td>
                      <td className="px-6 py-4 text-content-muted">{row.conv}</td>
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
              <h2 className="mb-4 text-3xl font-bold md:text-4xl font-display">Who is this for?</h2>
              <p className="max-w-2xl mx-auto text-white/60">Perfect for borrowers who don't fit the standard "square box".</p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="relative p-8 overflow-hidden transition-colors border bg-white/5 backdrop-blur-sm border-success/20 rounded-3xl group hover:border-success/40">
                <div className="absolute top-0 left-0 w-full h-1 bg-success"></div>
                <h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-white">
                  <CheckCircle2 size={18} strokeWidth={3} className="text-success" /> Great Fit If...
                </h3>
                <ul className="space-y-4">
                  {[
                    { l: "Self-Employed", s: "You write off expenses to lower taxable income." },
                    { l: "Large Down Payment", s: "You have 10-20% down but lack income docs." },
                    { l: "High Net Worth", s: "You are retired or living off investments." },
                    { l: "Complex Income", s: "Commission, Gig work, or multiple businesses." }
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="mt-1 text-success shrink-0" />
                      <div><span className="block text-sm font-bold text-white">{item.l}</span><span className="text-xs text-white/50">{item.s}</span></div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative p-8 overflow-hidden transition-colors border bg-white/5 backdrop-blur-sm border-danger/20 rounded-3xl group hover:border-danger/40">
                <div className="absolute top-0 left-0 w-full h-1 bg-danger"></div>
                <h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-white">
                  <XCircle size={18} strokeWidth={3} className="text-danger" /> Not a Fit If...
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-white/60">
                  If you are a standard W2 employee with good credit and traceable income, a Non-QM loan is likely unnecessary and more expensive than you need.
                </p>
                <div className="mt-auto">
                    <Link href="/loans/conventional" className="block">
                      <Button variant="outline" className="w-full text-white bg-white/10 hover:bg-white/20 border-white/10">
                        Check Standard Rates <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-background-subtle">
          <div className="container max-w-4xl px-4 mx-auto">
            <h2 className="mb-10 text-3xl font-bold text-center text-content">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <FaqItem question="Why are Non-QM rates higher?" answer="Because these loans are considered higher risk (due to lack of standard documentation) and cannot be sold to Fannie Mae or Freddie Mac, lenders charge a premium to hold them." />
              <FaqItem question="Are these subprime loans?" answer="No. 'Non-QM' simply means 'Non-Qualified Mortgage'. It refers to the documentation type, not necessarily bad credit. Many borrowers have 700+ credit scores but just lack W2s." />
              <FaqItem question="Can I refinance out of a Non-QM loan?" answer="Absolutely. Many borrowers use Non-QM as a bridge. Once they file tax returns showing sufficient income or their credit event ages, they refinance into a lower-rate Conventional loan." />
            </div>
          </div>
        </section>

        <FinalCTA />
        <MobileStickyCTA />
      </main>
    </div>
  );
}

NonQMLoanPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;