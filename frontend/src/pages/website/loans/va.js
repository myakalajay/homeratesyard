import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShieldCheck, ArrowRight, XCircle, HelpCircle, 
  ChevronDown, ChevronUp, Flag, Heart, Percent, 
  Banknote, Users, TrendingUp, Loader2, Info, Calculator, Check, CheckCircle2 
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';
import { Button } from '@/components/ui/primitives/Button';
import { useMarketEngine } from '@/hooks/useMarketEngine'; 

// --- JSON-LD SEO SCHEMA ---
const vaSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  "name": "VA Loan",
  "description": "0% down payment mortgage for Veterans and active duty military.",
  "interestRate": {
    "@type": "QuantitativeValue",
    "value": "5.75",
    "unitText": "PERCENT"
  },
  "audience": {
    "@type": "Audience",
    "audienceType": "Veterans"
  },
  "feesAndCommissionsSpecification": "VA Funding Fee (Waived for Disability)"
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
    <Link href="/auth/register?product=va" className="block w-full">
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
          <div className="absolute right-0 z-10 w-48 p-2 mb-2 text-xs text-white transition-opacity rounded-lg shadow-xl opacity-0 pointer-events-none bottom-full bg-slate-900 group-hover/tooltip:opacity-100">
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

export default function VALoanPage() {
  const { rates, loading } = useMarketEngine();
  const [isDisabledVet, setIsDisabledVet] = useState(false); 
  
  // Safe Access with Enterprise Fallback
  const currentRate = rates?.['VA'] || '5.750'; 
  
  // Logic: VA Funding fee adds ~0.28% to APR. If disabled (fee waived), APR is closer to Rate.
  const aprBuffer = isDisabledVet ? 0.05 : 0.28; 
  const estimatedAPR = (parseFloat(currentRate) + aprBuffer).toFixed(3);
  
  const monthlyPayment = calculatePayment(currentRate, 400000).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  const scrollToRequirements = (e) => {
    e.preventDefault();
    document.getElementById('requirements')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-20 font-sans bg-background md:pb-0">
      <Head>
        <title>VA Loans | HomeRatesYard</title>
        <meta name="description" content="0% down payment mortgage for Veterans. No PMI, competitive rates, and lifetime benefit." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(vaSchema) }} />
      </Head>

      <main>
        
        {/* 1. HERO SECTION */}
        <section className="relative pt-12 pb-8 overflow-hidden border-b bg-background border-border">
          <div className="container relative z-10 px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              
              {/* Left Content */}
              <div className="max-w-2xl duration-700 animate-in slide-in-from-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-wider text-content-muted border border-border rounded-full bg-background-subtle">
                  <Flag size={12} className="text-primary" />
                  Exclusive Military Benefit
                </div>
                
                <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl font-display text-content">
                  Honoring Service with <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    $0 Down Payment.
                  </span>
                </h1>
                
                <p className="mb-8 text-lg leading-relaxed text-content-muted">
                  VA Loans offer the best terms in the industry: No down payment, no private mortgage insurance (PMI), and competitive interest rates for those who served.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="shadow-xl shadow-primary/20">
                    <Link href="/auth/register?product=va">
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

              {/* Right Image - UPGRADED STOCK PHOTO */}
              <div className="relative hidden duration-700 delay-100 lg:block animate-in slide-in-from-right">
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[16/10] group border border-border">
                   <Image 
                    src="https://images.unsplash.com/photo-1579781354199-1ffd36bd7d30?q=80&w=1000&auto=format&fit=crop" 
                    alt="American Flag on modern home porch" 
                    fill
                    className="object-cover w-full h-full transition-transform duration-700 transform group-hover:scale-105"
                    priority
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                </div>
                
                {/* Floating Badge 1 */}
                <div className="absolute flex items-center gap-4 p-4 duration-700 delay-200 border shadow-xl bg-white/90 backdrop-blur-md -bottom-6 -left-6 rounded-2xl border-white/50 animate-bounce" style={{ animationDuration: '4s' }}>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full text-primary bg-primary/10">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider">Benefit Status</p>
                    <p className="text-sm font-bold text-content">Active & Veteran</p>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div className="absolute p-6 text-white duration-700 delay-300 border shadow-2xl top-8 -right-6 bg-content rounded-2xl animate-in slide-in-from-right border-border">
                  <p className="text-[10px] font-bold text-white/60 mb-1 uppercase tracking-wider">Down Payment</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold tracking-tight">0%</span>
                    <span className="mb-1.5 text-xs font-bold text-success px-1.5 py-0.5 bg-success/10 rounded">Required</span>
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
              <StatCard label="Min. Down Payment" value="0%" sub="Exclusive to Veterans & Military" />
              <StatCard label="Monthly PMI" value="$0" sub="Never pay mortgage insurance" />
              <StatCard 
                label="Credit Flexibility" 
                value="580+" 
                sub="No official min, but 580 recommended" 
                tooltip="While the VA has no minimum score, most lenders (including us) look for 580+ for the best terms."
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
                  Why choose VA?
                </h2>
                <div className="space-y-8">
                  <BenefitItem 
                    icon={Banknote} title="No Down Payment"
                    desc="Buy a home with $0 down. Keep your savings in the bank for moving costs, furniture, or emergencies."
                  />
                  <BenefitItem 
                    icon={Heart} title="No Mortgage Insurance (PMI)"
                    desc="Conventional loans require PMI if you put down less than 20%. VA loans never require monthly PMI, saving you hundreds."
                  />
                  <BenefitItem 
                    icon={Percent} title="Competitive Interest Rates"
                    desc="Because the government backs the loan, lenders can offer lower interest rates to Veterans than standard borrowers."
                  />
                </div>
              </div>

              {/* Right: Dynamic Payment Calculator Card */}
              <div className="relative group">
                <div className="absolute inset-0 transition-transform transform border bg-gradient-to-tr from-slate-200 to-red-50 rounded-3xl rotate-2 group-hover:rotate-1 -z-10 border-border"></div>
                <div className="relative p-10 overflow-hidden text-white shadow-2xl bg-content rounded-[2rem]">
                  
                  <h3 className="mb-8 text-xl font-bold font-display">VA Estimate</h3>
                  
                  <div className="space-y-6">
                    {/* Rate Row */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <span className="text-sm text-white/60">Avg Rate (30Y VA)</span>
                      {loading ? (
                         <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      ) : (
                         <span className="text-2xl font-bold text-primary">{currentRate}%*</span>
                      )}
                    </div>
                    
                    {/* Payment Row */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/60">Est. Payment ($0 Down)</span>
                        <div className="relative group/payment">
                          <Calculator size={14} className="text-white/40 cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 text-[10px] text-content bg-white rounded-lg opacity-0 pointer-events-none group-hover/payment:opacity-100 transition-opacity z-10 shadow-lg">
                            Principal & Interest for a $400k loan with $0 down.
                          </div>
                        </div>
                      </div>
                      {loading ? (
                         <span className="text-sm text-white/40">Calculating...</span>
                      ) : (
                         <span className="text-2xl font-bold text-white">{monthlyPayment}<span className="text-sm font-normal text-white/60">/mo</span></span>
                      )}
                    </div>
                    
                    {/* Disability Waiver Toggle */}
                    <div className="flex items-center justify-between p-3 transition-colors border rounded-lg bg-white/5 border-white/10 hover:bg-white/10">
                      <div className="flex items-center gap-2">
                        <Heart size={16} className={isDisabledVet ? "text-primary" : "text-white/40"} />
                        <span className="text-xs font-medium text-white/80">Service-Connected Disability?</span>
                      </div>
                      <button 
                        onClick={() => setIsDisabledVet(!isDisabledVet)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${isDisabledVet ? 'bg-primary' : 'bg-white/20'}`}
                        aria-label="Toggle Disability Waiver"
                      >
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${isDisabledVet ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* APR Row - Reacts to Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/60">APR</span>
                        {isDisabledVet && <span className="text-[10px] text-success bg-success/10 px-2 py-0.5 rounded animate-in fade-in">Funding Fee Waived</span>}
                      </div>
                      <span className="text-2xl font-bold text-white">{estimatedAPR}%*</span>
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
              <h2 className="mb-4 text-3xl font-bold font-display text-content">How VA Stacks Up</h2>
              <p className="max-w-xl mx-auto text-content-muted">See why the VA loan is unbeatable for eligible borrowers.</p>
            </div>
            <div className="overflow-x-auto border shadow-sm rounded-2xl border-border">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="text-xs uppercase border-b text-content-muted bg-background-subtle border-border">
                  <tr>
                    <th className="px-6 py-5 font-bold tracking-wider">Feature</th>
                    <th className="px-6 py-5 font-bold text-primary border-primary/20 bg-primary/5 border-x">VA Loan</th>
                    <th className="px-6 py-5 font-bold tracking-wider text-content">Conventional</th>
                    <th className="px-6 py-5 font-bold tracking-wider text-content">FHA Loan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { feat: "Min. Down Payment", va: "0%", conv: "3-5%", fha: "3.5%" },
                    { feat: "Mortgage Insurance (PMI)", va: "None ($0/mo)", conv: "Required < 20%", fha: "Permanent" },
                    { feat: "Min. Credit Score", va: "580+ (Flexible)", conv: "620+", fha: "580+" },
                    { feat: "Funding Fee", va: "Yes (Waived for Disability)", conv: "No", fha: "Yes (UFMIP)" },
                  ].map((row, i) => (
                    <tr key={i} className="transition-colors hover:bg-background-subtle/50 group">
                      <td className="px-6 py-4 font-medium transition-colors text-content group-hover:text-primary">{row.feat}</td>
                      <td className="px-6 py-4 font-bold border-primary/20 text-content bg-primary/5 border-x">{row.va}</td>
                      <td className="px-6 py-4 text-content-muted">{row.conv}</td>
                      <td className="px-6 py-4 text-content-muted">{row.fha}</td>
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
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl font-display">Service Requirements</h2>
              <p className="text-white/60">You must meet one of the following to qualify.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Green Flags */}
              <div className="relative p-8 overflow-hidden transition-colors border bg-white/5 border-success/20 rounded-3xl group hover:border-success/40">
                <div className="absolute top-0 left-0 w-full h-1 bg-success"></div>
                <h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-white">
                  <CheckCircle2 className="text-success"/> Eligible Status
                </h3>
                <ul className="space-y-4">
                  {[
                    { l: "90 Days Active Duty", s: "During wartime periods." },
                    { l: "181 Days Active Duty", s: "During peacetime periods." },
                    { l: "6 Years Service", s: "Reserves or National Guard." },
                    { l: "Surviving Spouse", s: "Unremarried spouses of fallen heroes." }
                  ].map((item,i)=>(
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="mt-1 text-success shrink-0" />
                      <div><span className="block text-sm font-bold text-white">{item.l}</span><span className="text-xs text-white/50">{item.s}</span></div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Red Flags */}
              <div className="relative p-8 overflow-hidden transition-colors border bg-white/5 border-danger/20 rounded-3xl group hover:border-danger/40">
                <div className="absolute top-0 left-0 w-full h-1 bg-danger"></div>
                <h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-white">
                  <XCircle className="text-danger"/> Not Eligible?
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-white/60">
                  If you are a civilian, have a dishonorable discharge, or served less than the minimum time requirements, you cannot use a VA loan.
                </p>
                <div className="mt-auto">
                    <Link href="/loans/fha" className="block">
                      <Button variant="outline" className="w-full text-white bg-white/10 hover:bg-white/20 border-white/10">
                        See FHA Options <ArrowRight size={16} className="ml-2" />
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
              <FaqItem question="What is the VA Funding Fee?" answer="While VA loans have no PMI, there is a one-time Funding Fee (1.25% - 3.3%) which helps keep the program running. This can be rolled into the loan amount. Borrowers with a service-connected disability are exempt." />
              <FaqItem question="Are there loan limits?" answer="As of 2020, there are no loan limits for Veterans with full entitlement. You can borrow as much as a lender approves you for without a down payment." />
              <FaqItem question="Can I use a VA loan more than once?" answer="Yes! VA entitlement is a lifetime benefit. You can use it multiple times, as long as you pay off the previous loan or have remaining entitlement." />
            </div>
          </div>
        </section>

        <FinalCTA />
        <MobileStickyCTA />
      </main>
    </div>
  );
}

VALoanPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;