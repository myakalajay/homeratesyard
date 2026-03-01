import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle2, ArrowRight, XCircle, HelpCircle, 
  ChevronDown, ChevronUp, TrendingUp, Building, 
  Wallet, Briefcase, LineChart, PieChart, Loader2, Info, Calculator, DollarSign 
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';
import { Button } from '@/components/ui/primitives/Button';
import { useMarketEngine } from '@/hooks/useMarketEngine'; 

// --- JSON-LD SEO SCHEMA ---
const investorSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  "name": "DSCR Investor Loan",
  "description": "Investment property loans qualified by rental income (DSCR), not personal tax returns.",
  "interestRate": {
    "@type": "QuantitativeValue",
    "value": "6.875",
    "unitText": "PERCENT"
  },
  "audience": {
    "@type": "Audience",
    "audienceType": "Real Estate Investors"
  }
};

// --- HELPER: P&I Calculator ---
const calculatePI = (rate, loanAmount) => {
  if (!rate || !loanAmount) return 0;
  const r = parseFloat(rate) / 100 / 12;
  const n = 360; 
  return (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

// --- COMPONENTS ---

const MobileStickyCTA = () => (
  <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-border md:hidden animate-in slide-in-from-bottom">
    <Link href="/auth/register?product=investor" className="block w-full">
      <Button size="lg" className="w-full shadow-lg shadow-primary/20">
        Check DSCR Rates <ArrowRight size={18} className="ml-2" />
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

export default function InvestorsLoanPage() {
  const { rates, loading } = useMarketEngine();
  
  // Investor Logic: Conventional Rate + 0.875% margin (Risk Premium)
  const baseRate = rates?.['30Y'] || '6.125';
  const investorRate = (parseFloat(baseRate) + 0.875).toFixed(3);
  
  // --- REAL-TIME CALCULATOR STATE ---
  const [purchasePrice, setPurchasePrice] = useState(500000);
  const [rentalIncome, setRentalIncome] = useState(3800);
  const [ltv, setLtv] = useState(0.80); // 80% LTV default
  
  // --- DYNAMIC CALCULATIONS ---
  const calculation = useMemo(() => {
    const loanAmount = purchasePrice * ltv;
    const piPayment = calculatePI(investorRate, loanAmount);
    
    // Taxes & Insurance Estimate: 1.25% of Purchase Price / 12 months
    const estTaxesIns = (purchasePrice * 0.0125) / 12;
    
    const totalPayment = piPayment + estTaxesIns;
    const ratio = totalPayment > 0 ? (rentalIncome / totalPayment).toFixed(2) : "0.00";
    
    return {
      loanAmount,
      totalPayment,
      estTaxesIns,
      ratio,
      isPassing: parseFloat(ratio) >= 1.00
    };
  }, [purchasePrice, rentalIncome, ltv, investorRate]);

  const scrollToRequirements = (e) => {
    e.preventDefault();
    document.getElementById('requirements')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-20 font-sans bg-background md:pb-0">
      <Head>
        <title>Investment Loans | HomeRatesYard</title>
        <meta name="description" content="Scale your real estate portfolio with DSCR loans. No personal income verification required. Qualify based on property cash flow." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(investorSchema) }} />
      </Head>

      <main>
        
        {/* 1. HERO SECTION */}
        <section className="relative pt-12 pb-8 overflow-hidden border-b bg-background border-border">
          <div className="container relative z-10 px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              
              {/* Left Content */}
              <div className="max-w-2xl duration-700 animate-in slide-in-from-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-wider text-content-muted border border-border rounded-full bg-background-subtle">
                  <LineChart size={12} className="text-primary" />
                  Real Estate Investor Solutions
                </div>
                
                <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl font-display text-content">
                  Scale Your Portfolio <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    Without the Red Tape.
                  </span>
                </h1>
                
                <p className="mb-8 text-lg leading-relaxed text-content-muted">
                  Stop relying on personal tax returns. Our DSCR loans let you qualify based on the property's rental income, not your W2.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="shadow-xl shadow-primary/20">
                    <Link href="/auth/register?product=investor">
                      Check DSCR Rates <ArrowRight size={18} className="ml-2" />
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={scrollToRequirements}
                    className="bg-white hover:bg-background-subtle"
                  >
                    Qualification Rules
                  </Button>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative hidden duration-700 delay-100 lg:block animate-in slide-in-from-right">
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[16/10] group border border-border">
                   <Image 
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop" 
                    alt="Modern skyscraper business district" 
                    fill
                    className="object-cover w-full h-full transition-transform duration-700 transform group-hover:scale-105"
                    priority
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>
                
                {/* Floating Badge 1 */}
                <div className="absolute flex items-center gap-4 p-4 duration-700 delay-200 border shadow-xl bg-white/90 backdrop-blur-md -bottom-6 -left-6 rounded-2xl border-white/50 animate-bounce" style={{ animationDuration: '4s' }}>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full text-primary bg-primary/10">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider">Cash Flow</p>
                    <p className="text-sm font-bold text-content">1.0+ DSCR Ratio</p>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div className="absolute p-6 text-white duration-700 delay-300 border shadow-2xl top-8 -right-6 bg-content rounded-2xl animate-in slide-in-from-right border-border">
                  <p className="text-[10px] font-bold text-white/60 mb-1 uppercase tracking-wider">Max Loan</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold tracking-tight">$3.5M</span>
                    <span className="mb-1.5 text-xs font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded">/ Prop</span>
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
              <StatCard label="Doc Type" value="No Tax Returns" sub="Qualify via Rental Income (DSCR)" />
              <StatCard label="Max LTV" value="80%" sub="For Purchases (75% for Refinance)" />
              <StatCard label="Property Limit" value="Unlimited" sub="No cap on number of financed properties" />
            </div>
          </div>
        </section>

        {/* 3. BENEFITS GRID & DSCR CALCULATOR */}
        <section className="py-24 bg-background">
          <div className="container px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-16 lg:grid-cols-2">
              
              {/* Left: Content - UPDATED HEADINGS */}
              <div className="duration-700 animate-in slide-in-from-left">
                {/* NEW: Why Us Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 rounded-full bg-primary/5">
                  <TrendingUp size={12} />
                  Why Us?
                </div>
                {/* NEW: Gradient Heading */}
                <h2 className="mb-6 text-3xl font-bold leading-tight md:text-5xl font-display text-content">
                  Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Investors.</span>
                </h2>
                <p className="mb-10 text-lg text-content-muted">
                  Whether you are buying your first duplex or your 50th door, our investor products remove the friction of traditional lending.
                </p>

                <div className="space-y-8">
                  <BenefitItem 
                    icon={Briefcase} title="Close in an LLC"
                    desc="Protect your personal assets. We allow you to close and hold title directly in your LLC or corporation name."
                  />
                  <BenefitItem 
                    icon={Building} title="Short-Term Rentals OK"
                    desc="Qualify using projected Airbnb/VRBO income (AirDNA data) rather than just long-term lease agreements."
                  />
                  <BenefitItem 
                    icon={TrendingUp} title="Unlimited Cash Out"
                    desc="Tap into your equity to buy the next property. We offer aggressive cash-out refinance options to fuel your growth."
                  />
                </div>
              </div>

              {/* Right: Interactive DSCR Calculator - FIXED UI */}
              <div className="relative group">
                <div className="absolute inset-0 transition-transform transform border bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[2.5rem] rotate-2 group-hover:rotate-1 -z-10 border-border"></div>
                <div className="relative p-10 overflow-hidden text-white shadow-2xl bg-content rounded-[2rem]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                  
                  <h3 className="mb-8 text-xl font-bold font-display">Profitability Check</h3>
                  
                  <div className="space-y-6">
                    
                    {/* INPUT: Purchase Price (Fix: Removed Spinners, Removed Blue Focus Ring) */}
                    <div className="pb-4 border-b border-white/10">
                      <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-white/60">Purchase Price</label>
                      {/* FIX: added focus-within styles to container, outline-none to input */}
                      <div className="flex items-center gap-3 px-4 py-3 transition-all border rounded-xl bg-white/5 border-white/10 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
                        <DollarSign size={20} className="shrink-0 text-white/40" />
                        <input 
                          type="number" 
                          value={purchasePrice} 
                          onChange={(e) => setPurchasePrice(Number(e.target.value))}
                          className="w-full text-2xl font-bold text-white bg-transparent border-none outline-none font-display placeholder-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>

                    {/* INPUT: Rental Income (Fix: Removed Spinners, Removed Blue Focus Ring) */}
                    <div className="pb-4 border-b border-white/10">
                      <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-white/60">Projected Rent</label>
                      <div className="flex items-center gap-3 px-4 py-3 transition-all border rounded-xl bg-white/5 border-white/10 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
                        <DollarSign size={20} className="shrink-0 text-white/40" />
                        <input 
                          type="number" 
                          value={rentalIncome} 
                          onChange={(e) => setRentalIncome(Number(e.target.value))}
                          className="w-full text-2xl font-bold text-white bg-transparent border-none outline-none font-display placeholder-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>

                    {/* INPUT: Down Payment Toggle */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <span className="text-sm text-white/60">Down Payment (LTV)</span>
                      <div className="flex p-1 rounded-lg bg-white/10">
                        <button 
                          onClick={() => setLtv(0.80)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${ltv === 0.80 ? 'bg-primary text-white shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                        >
                          20%
                        </button>
                        <button 
                          onClick={() => setLtv(0.75)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${ltv === 0.75 ? 'bg-primary text-white shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                        >
                          25%
                        </button>
                      </div>
                    </div>

                    {/* OUTPUTS */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <span className="text-sm text-white/60">Total PITIA</span>
                      <span className="text-xl font-bold text-white">${Math.round(calculation.totalPayment)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/60">DSCR Ratio</span>
                        <div className="relative group/dscr">
                          <Info size={14} className="text-white/40 cursor-help" />
                          <div className="absolute left-1/2 bottom-full -translate-x-1/2 mb-2 w-56 p-2 text-[10px] text-content bg-white rounded-lg opacity-0 pointer-events-none group-hover/dscr:opacity-100 transition-opacity z-50 shadow-lg">
                            (Rent / Payment). 1.0 = Break Even. &gt;1.0 = Cash Flow.
                          </div>
                        </div>
                      </div>
                      <span className={`text-3xl font-bold ${calculation.isPassing ? 'text-success' : 'text-danger'}`}>{calculation.ratio}</span>
                    </div>
                    
                    {/* Dynamic Feedback */}
                    <div className={`p-4 mt-4 border rounded-xl flex gap-3 transition-colors ${calculation.isPassing ? 'bg-success/10 border-success/20' : 'bg-danger/10 border-danger/20'}`}>
                        {calculation.isPassing ? <CheckCircle2 size={24} className="mt-0.5 shrink-0 text-success" /> : <XCircle size={24} className="mt-0.5 shrink-0 text-danger" />}
                        <p className="text-xs leading-relaxed text-white/90">
                          <strong className="block mb-1 text-sm tracking-wide uppercase">{calculation.isPassing ? 'APPROVED' : 'NEEDS INCOME'}</strong>
                          {calculation.isPassing 
                            ? "This property qualifies! The rental income covers the debt service." 
                            : "Rent is lower than the mortgage. Try increasing the down payment to 25%."}
                        </p>
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
              <h2 className="mb-4 text-3xl font-bold font-display text-content">Invest Smart</h2>
              <p className="max-w-3xl mx-auto text-content-muted">
                Comparing specialized DSCR Investor loans against standard Conventional Investment loans.
              </p>
            </div>

            <div className="overflow-x-auto border shadow-sm rounded-2xl border-border">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="text-xs uppercase border-b text-content-muted bg-background-subtle border-border">
                  <tr>
                    <th className="px-6 py-5 font-bold tracking-wider">Feature</th>
                    <th className="px-6 py-5 font-bold text-primary border-primary/20 bg-primary/5 border-x">DSCR Investor</th>
                    <th className="px-6 py-5 font-bold tracking-wider text-content">Conventional Inv.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { feat: "Income Verification", dscr: "None (Property Only)", conv: "Full Tax Returns (W2)" },
                    { feat: "Debt-to-Income (DTI)", dscr: "Ignored", conv: "Strict (Max 45-50%)" },
                    { feat: "Property Limit", dscr: "Unlimited", conv: "Max 10 Financed" },
                    { feat: "Close in LLC?", dscr: "Yes", conv: "No (Personal Name)" },
                    { feat: "Closing Speed", dscr: "Faster (Less Docs)", conv: "Standard (30 Days)" },
                  ].map((row, i) => (
                    <tr key={i} className="transition-colors hover:bg-background-subtle/50 group">
                      <td className="px-6 py-4 font-medium transition-colors text-content group-hover:text-primary">{row.feat}</td>
                      <td className="px-6 py-4 font-bold border-primary/20 text-content bg-primary/5 border-x">{row.dscr}</td>
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
              <h2 className="mb-4 text-3xl font-bold md:text-4xl font-display">Investor Criteria</h2>
              <p className="max-w-2xl mx-auto text-white/60">Qualification is based on the asset, but you still need a strong profile.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="relative p-8 overflow-hidden transition-colors border bg-white/5 backdrop-blur-sm border-success/20 rounded-3xl group hover:border-success/40">
                <div className="absolute top-0 left-0 w-full h-1 bg-success"></div>
                <h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-white">
                  <CheckCircle2 size={18} strokeWidth={3} className="text-success" /> Green Flags
                </h3>
                <ul className="space-y-4">
                  {[
                    { l: "Credit Score 660+", s: "Higher score = Lower rate & Higher LTV." },
                    { l: "20-25% Down Payment", s: "Standard for investment properties." },
                    { l: "6 Months Reserves", s: "Liquid cash to cover vacancies." },
                    { l: "DSCR > 1.0", s: "Rent is equal to or greater than the mortgage." }
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
                  <XCircle size={18} strokeWidth={3} className="text-danger" /> Deal Killers
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-white/60">
                  Investor loans are strictly for business purposes. If you plan to live in the property (even for a few months), you cannot use a DSCR loan.
                </p>
                <div className="mt-auto">
                    <Link href="/loans/conventional" className="block">
                      <Button variant="outline" className="w-full text-white bg-white/10 hover:bg-white/20 border-white/10">
                        Check Owner-Occupied Loans <ArrowRight size={16} className="ml-2" />
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
              <FaqItem question="What exactly is DSCR?" answer="Debt Service Coverage Ratio (DSCR) is calculated by dividing the monthly rent by the total monthly mortgage payment (PITIA). A ratio of 1.0 means they break even. Above 1.0 means positive cash flow." />
              <FaqItem question="Can I use this for Airbnb?" answer="Yes. Many lenders allow you to use 'AirDNA' or short-term rental projections to calculate the income, which is often higher than long-term rent." />
              <FaqItem question="Do I need to own a home already?" answer="Usually, yes. Most DSCR programs require you to own a primary residence or have a history of managing rentals. However, some First-Time Investor programs exist with stricter terms." />
            </div>
          </div>
        </section>

        <FinalCTA />
        <MobileStickyCTA />
      </main>
    </div>
  );
}

InvestorsLoanPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;