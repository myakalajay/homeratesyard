import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image'; 
import Link from 'next/link';
import { 
  CheckCircle2, Shield, ArrowRight, 
  XCircle, HelpCircle, AlertCircle, ChevronDown, ChevronUp,
  Home, TrendingUp, Loader2 
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';
import { Button } from '@/components/ui/primitives/Button';
import { useMarketEngine } from '@/hooks/useMarketEngine'; 

// --- Local Helper Components ---
const StatCard = ({ label, value, sub }) => (
  <div className="p-6 transition-all bg-white border shadow-sm rounded-2xl border-border hover:shadow-md hover:-translate-y-1 group">
    <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider mb-3 group-hover:text-primary transition-colors">
      {label}
    </p>
    <p className="mb-1 text-3xl font-bold font-display text-content tabular-nums">
      {value}
    </p>
    <p className="text-xs font-medium text-content-muted">
      {sub}
    </p>
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
        <div className="pl-8 ml-2 border-l-2 border-primary/20">
          {answer}
        </div>
      </div>
    </div>
  );
};

export default function ConventionalLoanPage() {
  const { rates, loading } = useMarketEngine(); 
  
  // SAFE ACCESS: Prevent crash if rates are undefined
  const currentRate = rates?.['30Y'] || '6.125'; 

  const scrollToRequirements = (e) => {
    e.preventDefault();
    document.getElementById('requirements')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen font-sans bg-background">
      <Head>
        <title>Conventional Loans | HomeRatesYard</title>
        <meta name="description" content="Low rates and flexible terms for borrowers with good credit. See if you qualify for a conventional loan today." />
        <meta property="og:title" content="Conventional Loans | HomeRatesYard" />
        <meta property="og:description" content="Secure the lowest long-term rates. Ideal for borrowers with 620+ credit." />
      </Head>

      <main>
        
        {/* 1. HERO SECTION */}
        <section className="relative pt-12 pb-8 overflow-hidden border-b bg-background border-border">
          <div className="container relative z-10 px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              
              {/* Left: Content */}
              <div className="max-w-2xl duration-700 animate-in slide-in-from-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 rounded-full bg-primary/5">
                  <Shield size={12} />
                  Most Popular Option
                </div>
                
                <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl font-display text-content">
                  The Gold Standard <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    for Stability.
                  </span>
                </h1>
                
                <p className="mb-8 text-lg leading-relaxed text-content-muted">
                  Secure the lowest long-term rates with a Conventional Loan. 
                  Ideal for borrowers with strong credit who want to avoid hidden government fees.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  {/* CONTEXTUAL LINK: Passes 'conventional' to the register page */}
                  <Button asChild size="lg" className="shadow-xl shadow-primary/20">
                    <Link href="/auth/register?product=conventional">
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

              {/* Right: Visuals */}
              <div className="relative hidden duration-700 delay-100 lg:block animate-in slide-in-from-right">
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[16/10] group border border-border">
                   <Image 
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop" 
                    alt="Modern Home Interior" 
                    fill
                    className="object-cover w-full h-full transition-transform duration-700 transform group-hover:scale-105"
                    priority
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>

                {/* Floating "Approved" Badge */}
                <div className="absolute flex items-center gap-4 p-4 duration-700 delay-200 border shadow-xl bg-white/90 backdrop-blur-md -bottom-6 -left-6 rounded-2xl border-white/50 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full text-success bg-success-subtle">
                    <Home size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider">Property Type</p>
                    <p className="text-sm font-bold text-content">Primary Residence</p>
                  </div>
                </div>

                {/* Floating Rate Badge */}
                <div className="absolute p-6 text-white duration-700 delay-300 border shadow-2xl top-8 -right-6 bg-content rounded-2xl animate-in slide-in-from-right border-border">
                  <p className="text-[10px] font-bold text-white/60 mb-1 uppercase tracking-wider">Today's Avg</p>
                  <div className="flex items-end gap-2">
                    {loading ? (
                       <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    ) : (
                       <span className="text-4xl font-bold tracking-tight">{currentRate}%</span>
                    )}
                    <span className="mb-1.5 text-xs font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded">30Y Fixed</span>
                  </div>
                  <div className="mt-2 text-[10px] flex items-center gap-1 text-white/40">
                    <TrendingUp size={10} className="text-success" /> Trending lower
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
              <StatCard label="Min. Down Payment" value="3%" sub="For first-time homebuyers" />
              <StatCard label="Min. Credit Score" value="620+" sub="740+ recommended for best rates" />
              <StatCard label="Loan Limit (2024)" value="$766,550" sub="Conforming limit in most areas" />
            </div>
          </div>
        </section>

        {/* 3. COMPARISON TABLE */}
        <section className="py-24 bg-background">
          <div className="container max-w-6xl px-4 mx-auto">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold font-display text-content">How it stacks up</h2>
              <p className="max-w-2xl mx-auto text-content-muted">
                See how Conventional loans compare to government-backed alternatives like FHA and VA loans.
              </p>
            </div>

            {/* RESPONSIVE TABLE WRAPPER: overflow-x-auto handles small screens */}
            <div className="overflow-x-auto border shadow-sm rounded-2xl border-border">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="text-xs uppercase border-b text-content-muted bg-background-subtle border-border">
                  <tr>
                    <th className="px-6 py-5 font-bold tracking-wider">Feature</th>
                    <th className="px-6 py-5 font-bold text-primary border-primary/20 bg-primary/5 border-x">Conventional</th>
                    <th className="px-6 py-5 font-bold tracking-wider text-content">FHA Loan</th>
                    <th className="px-6 py-5 font-bold tracking-wider text-content">VA Loan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { feat: "Min. Credit Score", conv: "620", fha: "580", va: "580" },
                    { feat: "Min. Down Payment", conv: "3%", fha: "3.5%", va: "0%" },
                    { feat: "Mortgage Insurance", conv: "Removable at 20%", fha: "Permanent (Life)", va: "None (One-time Fee)" },
                    { feat: "Property Usage", conv: "Primary, Second, Rental", fha: "Primary Only", va: "Primary Only" },
                    { feat: "Appraisal Standards", conv: "Standard", fha: "Strict Safety", va: "Strict Safety" },
                  ].map((row, i) => (
                    <tr key={i} className="transition-colors hover:bg-background-subtle/50 group">
                      <td className="px-6 py-4 font-medium transition-colors text-content group-hover:text-primary">{row.feat}</td>
                      <td className="px-6 py-4 font-bold border-primary/20 text-content bg-primary/5 border-x">{row.conv}</td>
                      <td className="px-6 py-4 text-content-muted">{row.fha}</td>
                      <td className="px-6 py-4 text-content-muted">{row.va}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4. QUALIFICATION MATRIX (Inverted/Dark Section) */}
        <section id="requirements" className="relative py-24 overflow-hidden text-white bg-content scroll-mt-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="container relative z-10 max-w-5xl px-4 mx-auto">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl font-display">Do you qualify?</h2>
              <p className="max-w-2xl mx-auto text-white/60">
                Conventional loans have stricter requirements. Review the checklist below to see if you are a match.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Green Flags */}
              <div className="relative p-8 overflow-hidden transition-colors border bg-white/5 backdrop-blur-sm border-success/20 rounded-3xl group hover:border-success/40">
                <div className="absolute top-0 left-0 w-full h-1 bg-success"></div>
                <h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-white">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/20 text-success">
                    <CheckCircle2 size={18} strokeWidth={3} />
                  </div>
                  Green Flags
                </h3>
                <ul className="space-y-4">
                  {[
                    { label: "Credit Score 620+", sub: "Ideally 740+ for best rates." },
                    { label: "Down Payment Flexibility", sub: "3% First-Time, 5% Repeat." },
                    { label: "Stable Income", sub: "2-year employment history." },
                    { label: "Debt-to-Income (DTI)", sub: "Total debts < 45% of income." },
                    { label: "Property Type", sub: "Primary, Second Home, or Rental." }
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-success mt-0.5 shrink-0" />
                      <div>
                        <span className="block text-sm font-bold text-white">{item.label}</span>
                        <span className="text-xs text-white/50">{item.sub}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Red Flags */}
              <div className="relative p-8 overflow-hidden transition-colors border bg-white/5 backdrop-blur-sm border-danger/20 rounded-3xl group hover:border-danger/40">
                <div className="absolute top-0 left-0 w-full h-1 bg-danger"></div>
                <h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-white">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full text-danger bg-danger/20">
                    <AlertCircle size={18} strokeWidth={3} />
                  </div>
                  When to switch to FHA
                </h3>
                <ul className="space-y-4">
                  {[
                    { label: "Credit Score < 620", sub: "FHA allows scores down to 580." },
                    { label: "Recent Bankruptcy", sub: "FHA waiting period is shorter (2 yrs)." },
                    { label: "High Debt Ratio", sub: "FHA allows DTI up to 57%." }
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <XCircle size={18} className="text-danger mt-0.5 shrink-0" />
                      <div>
                        <span className="block text-sm font-bold text-white">{item.label}</span>
                        <span className="text-xs text-white/50">{item.sub}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="pt-6 mt-8 border-t border-white/10">
                    <p className="mb-4 text-xs font-bold tracking-wider uppercase text-white/40">Recommended Alternative</p>
                    <Link href="/loans/fha" className="block">
                      <Button variant="outline" className="w-full text-white bg-white/5 border-white/10 hover:bg-white/10">
                        View FHA Requirements <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. INTERACTIVE FAQ */}
        <section className="py-24 bg-background-subtle">
          <div className="container max-w-3xl px-4 mx-auto">
            <h2 className="mb-10 text-3xl font-bold text-center text-content">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <FaqItem question="Is a 20% down payment required?" answer="No. First-time homebuyers can put down as little as 3%. Repeat buyers usually need 5%. However, putting down 20% does avoid PMI immediately." />
              <FaqItem question="What is PMI and can I remove it?" answer="Private Mortgage Insurance protects the lender if you stop making payments. On conventional loans, it automatically terminates once you reach 22% equity in your home, unlike FHA loans where it stays for the life of the loan." />
              <FaqItem question="Can I use this for an investment property?" answer="Yes! Conventional loans are the standard for financing rental properties. Expect to need a higher down payment (typically 15-25%) compared to a primary residence." />
              <FaqItem question="How long does the approval process take?" answer="With HomeRatesYard's AI engine, you can get a Verified Approval Letter in as little as 14 minutes. Closing typically takes 14-21 days, compared to the industry average of 45 days." />
            </div>
          </div>
        </section>

        {/* 6. FINAL CTA */}
        <FinalCTA />

      </main>
    </div>
  );
}

ConventionalLoanPage.getLayout = function getLayout(page) {
  return <PublicLayout>{page}</PublicLayout>;
};