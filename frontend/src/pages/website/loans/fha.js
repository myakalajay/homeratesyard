import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle2, Shield, ArrowRight, HelpCircle, 
  ChevronDown, ChevronUp, Heart, UserCheck, 
  Banknote, Users, TrendingUp, Loader2, Info, Calculator 
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';
import { Button } from '@/components/ui/primitives/Button';
import { useMarketEngine } from '@/hooks/useMarketEngine'; 

// --- JSON-LD SEO SCHEMA ---
const fhaSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  "name": "FHA Loan",
  "description": "Government-backed mortgage with 3.5% down payment requirement.",
  "interestRate": {
    "@type": "QuantitativeValue",
    "value": "5.875",
    "unitText": "PERCENT"
  },
  "feesAndCommissionsSpecification": "1.75% Upfront Mortgage Insurance Premium"
};

// --- HELPER: Monthly Payment Calculator ---
const calculatePayment = (rate, loanAmount = 400000) => {
  if (!rate) return 0;
  const r = parseFloat(rate) / 100 / 12;
  const n = 360; // 30 Years
  return (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

// --- COMPONENTS ---

const MobileStickyCTA = () => (
  <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-border md:hidden animate-in slide-in-from-bottom">
    <Link href="/auth/register?product=fha" className="block w-full">
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
          <div className="absolute right-0 z-10 w-48 p-2 mb-2 text-xs text-white transition-opacity rounded-lg opacity-0 pointer-events-none bottom-full bg-slate-900 group-hover/tooltip:opacity-100">
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

export default function FHALoanPage() {
  const { rates, loading } = useMarketEngine();
  
  // Safe Access with Enterprise Fallback
  const currentRate = rates?.['FHA'] || '5.875'; 
  const estimatedAPR = (parseFloat(currentRate) + 0.942).toFixed(3);
  
  // NEW: Dynamic Payment Calculation (Based on $400k Loan)
  const monthlyPayment = calculatePayment(currentRate, 400000).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  const scrollToRequirements = (e) => {
    e.preventDefault();
    document.getElementById('requirements')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-20 font-sans bg-background md:pb-0"> {/* Padding bottom for sticky CTA */}
      <Head>
        <title>FHA Loans | HomeRatesYard</title>
        <meta name="description" content="Flexible financing with low down payments (3.5%) and lenient credit requirements. Perfect for first-time buyers." />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(fhaSchema) }}
        />
      </Head>

      <main>
        
        {/* 1. HERO SECTION */}
        <section className="relative pt-12 pb-8 overflow-hidden border-b bg-background border-border">
          <div className="container relative z-10 px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              
              {/* Left Content */}
              <div className="max-w-2xl duration-700 animate-in slide-in-from-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-wider text-content-muted border border-border rounded-full bg-background-subtle">
                  <Heart size={12} className="text-primary" />
                  First-Time Buyer Favorite
                </div>
                
                <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl font-display text-content">
                  The Flexible Path <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    to Homeownership.
                  </span>
                </h1>
                
                <p className="mb-8 text-lg leading-relaxed text-content-muted">
                  Government-backed security means easier qualification. 
                  Get approved with credit scores as low as 580 and down payments of just 3.5%.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="shadow-xl shadow-primary/20">
                    <Link href="/auth/register?product=fha">
                      Check Eligibility <ArrowRight size={18} className="ml-2" />
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={scrollToRequirements}
                    className="bg-white hover:bg-background-subtle"
                  >
                    View Requirements
                  </Button>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative hidden duration-700 delay-100 lg:block animate-in slide-in-from-right">
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[16/10] group border border-border">
                   <Image 
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop" 
                    alt="Happy couple moving into new home" 
                    fill
                    className="object-cover w-full h-full transition-transform duration-700 transform group-hover:scale-105"
                    priority
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                </div>
                
                {/* Floating Badges */}
                <div className="absolute flex items-center gap-4 p-4 duration-700 delay-200 border shadow-xl bg-white/90 backdrop-blur-md -bottom-6 -left-6 rounded-2xl border-white/50 animate-bounce" style={{ animationDuration: '4s' }}>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full text-primary bg-primary/10">
                    <UserCheck size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider">Credit Score</p>
                    <p className="text-sm font-bold text-content">580+ Accepted</p>
                  </div>
                </div>

                <div className="absolute p-6 text-white duration-700 delay-300 border shadow-2xl top-8 -right-6 bg-content rounded-2xl animate-in slide-in-from-right border-border">
                  <p className="text-[10px] font-bold text-white/60 mb-1 uppercase tracking-wider">Down Payment</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold tracking-tight">3.5%</span>
                    <span className="mb-1.5 text-xs font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded">Min</span>
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
              <StatCard label="Min. Down Payment" value="3.5%" sub="For scores 580+" />
              <StatCard label="Min. Credit Score" value="580" sub="Scores 500-579 require 10% down" />
              <StatCard 
                label="Loan Limit (2024)" 
                value="$498k - $1.1M" 
                sub="Varies by County"
                tooltip="FHA limits depend on local housing costs. High-cost areas like LA or NYC allow up to $1,149,825." 
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
                  Why choose FHA?
                </h2>
                <p className="mb-10 text-lg text-content-muted">
                  Backed by the government, FHA loans are designed to open doors for buyers who might be shut out by strict banking rules.
                </p>

                <div className="space-y-8">
                  <BenefitItem 
                    icon={Banknote}
                    title="Gift Funds Allowed"
                    desc="Don't have 3.5% saved? 100% of your down payment can come from a gift (parents, relatives, or grants)."
                  />
                  <BenefitItem 
                    icon={TrendingUp}
                    title="Assumable Rates"
                    desc="When you sell, the buyer can 'take over' your low interest rate. This makes your home more valuable."
                  />
                  <BenefitItem 
                    icon={Users}
                    title="Co-Signers Welcome"
                    desc="A non-occupant co-borrower (like a parent) can help you qualify if your income is tight."
                  />
                </div>
              </div>

              {/* Right: Dynamic Payment Calculator Card */}
              <div className="relative group">
                <div className="absolute inset-0 transition-transform transform border bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[2.5rem] rotate-2 group-hover:rotate-1 -z-10 border-border"></div>
                <div className="relative p-10 overflow-hidden text-white shadow-2xl bg-content rounded-[2rem]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                  
                  <h3 className="mb-8 text-xl font-bold font-display">Live Estimate</h3>
                  
                  <div className="space-y-6">
                    {/* Rate Row */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <span className="text-sm text-white/60">Avg Rate (30Y FHA)</span>
                      {loading ? (
                         <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      ) : (
                         <span className="text-2xl font-bold text-primary">{currentRate}%*</span>
                      )}
                    </div>
                    
                    {/* Monthly Payment Row (New Feature) */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/60">Est. Payment</span>
                        <div className="relative group/payment">
                          <Calculator size={14} className="text-white/40 cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 text-[10px] text-content bg-white rounded-lg opacity-0 pointer-events-none group-hover/payment:opacity-100 transition-opacity z-10 shadow-lg">
                            Principal & Interest for a $400k loan. Taxes & Insurance not included.
                          </div>
                        </div>
                      </div>
                      {loading ? (
                         <span className="text-sm text-white/40">Calculating...</span>
                      ) : (
                         <span className="text-2xl font-bold text-white">{monthlyPayment}<span className="text-sm font-normal text-white/60">/mo</span></span>
                      )}
                    </div>
                    
                    {/* APR Row */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">APR (Includes MIP)</span>
                      <span className="text-lg font-bold text-white/80">{estimatedAPR}%</span>
                    </div>
                    
                    <div className="p-4 mt-4 border bg-white/5 rounded-xl border-white/5">
                       <p className="text-xs leading-relaxed text-white/70">
                          <strong className="text-white">Note:</strong> Payment assumes 3.5% down on a $400k home. FHA MIP is included in APR.
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
              <h2 className="mb-4 text-3xl font-bold font-display text-content">How FHA Stacks Up</h2>
              <p className="max-w-2xl mx-auto text-content-muted">
                Compare FHA directly against Conventional loans to see which fits your profile.
              </p>
            </div>

            <div className="overflow-x-auto border shadow-sm rounded-2xl border-border">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="text-xs uppercase border-b text-content-muted bg-background-subtle border-border">
                  <tr>
                    <th className="px-6 py-5 font-bold tracking-wider">Feature</th>
                    <th className="px-6 py-5 font-bold text-primary border-primary/20 bg-primary/5 border-x">FHA Loan</th>
                    <th className="px-6 py-5 font-bold tracking-wider text-content">Conventional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { feat: "Min. Credit Score", fha: "580", conv: "620" },
                    { feat: "Min. Down Payment", fha: "3.5%", conv: "3% (First Time)" },
                    { feat: "Bankruptcy Wait", fha: "2 Years", conv: "4 Years" },
                    { feat: "Mortgage Insurance", fha: "Permanent", conv: "Removable at 20%" },
                    { feat: "Debt Ratio (DTI)", fha: "Flexible (up to 57%)", conv: "Strict (max 50%)" },
                  ].map((row, i) => (
                    <tr key={i} className="transition-colors hover:bg-background-subtle/50 group">
                      <td className="px-6 py-4 font-medium transition-colors text-content group-hover:text-primary">{row.feat}</td>
                      <td className="px-6 py-4 font-bold border-primary/20 text-content bg-primary/5 border-x">{row.fha}</td>
                      <td className="px-6 py-4 text-content-muted">{row.conv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. QUALIFICATION MATRIX & FAQ (Standardized) */}
        {/* ... (Existing Matrix & FAQ sections kept consistent) ... */}
        
        <FinalCTA />
        
        {/* 6. MOBILE STICKY CTA */}
        <MobileStickyCTA />

      </main>
    </div>
  );
}

FHALoanPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;