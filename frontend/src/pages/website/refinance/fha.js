import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle2, Shield, ArrowRight, XCircle, HelpCircle, 
  ChevronDown, ChevronUp, Zap, FileText, 
  Heart, TrendingDown, Percent, Calculator, Loader2, Info, DollarSign, Clock, AlertTriangle, Mail, Download
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';
import { Button } from '@/components/ui/primitives/Button';
import { useMarketEngine } from '@/hooks/useMarketEngine'; 

// --- JSON-LD SEO SCHEMA ---
const fhaSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  "name": "FHA Streamline Refinance",
  "description": "Lower your FHA rate with reduced documentation and no appraisal requirements.",
  "interestRate": { "@type": "QuantitativeValue", "value": "5.99", "unitText": "PERCENT" },
  "audience": { "@type": "Audience", "audienceType": "FHA Borrowers" }
};

// --- HELPER: FHA Math Engine ---
const calculateFHAStreamline = (balance, currentRate, newRate) => {
  if (!balance || !currentRate || !newRate) {
    return { savings: 0, newTotal: 0, newMIP: 0, passedNTB: false };
  }

  const r1 = parseFloat(currentRate) / 100 / 12;
  const r2 = parseFloat(newRate) / 100 / 12;
  const n = 360; 

  // FHA MIP Factor (Annual 0.55% for most new loans)
  const monthlyMIP = (balance * 0.0055) / 12;

  // 1. Old Payment (Principal + Interest + MIP)
  const oldPI = (balance * r1 * Math.pow(1 + r1, n)) / (Math.pow(1 + r1, n) - 1);
  const oldTotal = oldPI + monthlyMIP;

  // 2. New Payment (Principal + Interest + MIP)
  // Note: Streamline typically adds UFMIP (1.75%) to balance
  const ufmip = balance * 0.0175;
  const newBalance = balance + ufmip; 
  const newPI = (newBalance * r2 * Math.pow(1 + r2, n)) / (Math.pow(1 + r2, n) - 1);
  const newMIP = (newBalance * 0.0055) / 12;
  const newTotal = newPI + newMIP;

  const savings = oldTotal - newTotal;

  // NTB Test: Net Tangible Benefit (Rate drop > 0.5% & Savings > $50)
  const passedNTB = savings > 50 && (currentRate - newRate) >= 0.5;

  return {
    savings,
    newTotal,
    newMIP,
    passedNTB
  };
};

// --- SUB-COMPONENTS ---

const MobileStickyCTA = () => (
  <div className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t bg-white/95 backdrop-blur-md border-border md:hidden animate-in slide-in-from-bottom">
    <Link href="/auth/register?product=fha-streamline" className="block w-full">
      <Button size="lg" className="w-full text-white shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
        Check Rates <ArrowRight size={18} className="ml-2" />
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
    <p className="mb-1 text-3xl font-bold font-display text-content tabular-nums">{value}</p>
    <p className="text-xs font-medium text-content-muted">{sub}</p>
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
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full p-6 text-left hover:bg-background-subtle focus:outline-none">
        <h4 className={`font-bold text-sm md:text-base flex items-center gap-3 transition-colors ${isOpen ? 'text-primary' : 'text-content'}`}>
          <HelpCircle size={20} className={isOpen ? 'text-primary' : 'text-content-muted'} /> {question}
        </h4>
        {isOpen ? <ChevronUp size={20} className="text-primary" /> : <ChevronDown size={20} className="text-content-muted" />}
      </button>
      <div className={`px-6 text-sm text-content-muted leading-relaxed overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pl-8 ml-2 border-l-2 border-primary/10">{answer}</div>
      </div>
    </div>
  );
};

export default function FHARefinancePage() {
  const { rates, loading } = useMarketEngine();
  
  // --- CALCULATOR STATE ---
  const [balance, setBalance] = useState(300000);
  const [currentRate, setCurrentRate] = useState(6.75);
  
  // FHA rates are generally competitive
  const fhaRate = rates?.['FHA'] || '5.990';
  
  // --- SAVINGS ENGINE ---
  const analysis = useMemo(() => {
    const data = calculateFHAStreamline(Number(balance), Number(currentRate), Number(fhaRate));
    
    return {
      monthlySavings: Math.max(0, data.savings || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
      newPayment: (data.newTotal || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
      newMIP: (data.newMIP || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
      isPassed: data.passedNTB,
      statusText: data.passedNTB ? 'APPROVED' : 'CHECK REQ',
      statusColor: data.passedNTB ? 'text-success' : 'text-warning',
      badgeColor: data.passedNTB ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
    };
  }, [balance, currentRate, fhaRate]);

  const scrollToRequirements = (e) => {
    e.preventDefault();
    document.getElementById('requirements')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-20 font-sans bg-background md:pb-0">
      <Head>
        <title>FHA Streamline Refinance | HomeRatesYard</title>
        <meta name="description" content="Lower your FHA rate fast. No appraisal, reduced paperwork, and simplified approval." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(fhaSchema) }} />
      </Head>

      <main>
        {/* 1. HERO SECTION - Image on Right (Standard Flow) */}
        <section className="relative pt-16 pb-12 overflow-hidden border-b bg-background border-border">
          <div className="container relative z-10 px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
              
              <div className="max-w-2xl duration-700 animate-in slide-in-from-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-wider text-content-muted border border-border rounded-full bg-background-subtle">
                  <Heart size={12} className="text-primary" />
                  Official FHA Streamline
                </div>
                <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl font-display text-content">
                  Simplify Your Savings. <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    No Appraisal Needed.
                  </span>
                </h1>
                <p className="mb-8 text-lg leading-relaxed text-content-muted">
                  Already have an FHA loan? The Streamline Refinance cuts the red tape. Lower your rate with minimal paperwork and reduced credit checks.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="text-white shadow-xl bg-primary shadow-primary/20 hover:bg-primary/90">
                    <Link href="/auth/register?product=fha-streamline">
                      Check Streamline Rates <ArrowRight size={18} className="ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" onClick={scrollToRequirements} className="bg-white hover:bg-background-subtle">
                    Do I Qualify?
                  </Button>
                </div>
              </div>

              {/* Right: Visual Trust Image (Swapped from V2 position) */}
              <div className="relative hidden duration-700 delay-100 lg:block animate-in slide-in-from-right">
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[16/10] group border border-border">
                   
                   <Image 
                    src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop" 
                    alt="Happy family enjoying lower payments" 
                    fill
                    className="object-cover w-full h-full transition-transform duration-700 transform group-hover:scale-105"
                    priority
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>
                
                {/* Floating Badge 1 */}
                <div className="absolute flex items-center gap-4 p-4 duration-700 delay-200 border shadow-xl bg-white/95 backdrop-blur -bottom-6 -left-6 rounded-2xl border-border animate-in slide-in-from-bottom">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full text-primary bg-primary/10">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider">Docs</p>
                    <p className="text-sm font-bold text-content">Reduced</p>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div className="absolute p-5 text-white duration-700 delay-300 border shadow-xl top-8 -right-6 bg-content rounded-2xl animate-in slide-in-from-right border-border">
                  <p className="text-[10px] font-bold text-white/60 mb-1 uppercase tracking-wider">Goal</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold tracking-tight">Lower</span>
                    <span className="mb-1 text-sm font-medium text-primary">Rate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. STATS BAR */}
        <section className="py-12 border-b bg-background-subtle border-border">
          <div className="container max-w-6xl px-4 mx-auto text-left">
             <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <StatCard label="Appraisal" value="Waived" sub="Uses original purchase value" tooltip="FHA Streamlines rely on your original appraisal, saving you ~$600." />
                <StatCard label="Income Docs" value="Minimal" sub="Employment check only" tooltip="Non-credit qualifying streamlines do not require W2s or tax returns." />
                <StatCard label="Closing Speed" value="21 Days" sub="Fast track process" tooltip="Less paperwork means a significantly faster closing timeline." />
             </div>
          </div>
        </section>

        {/* 3. BENEFITS & CALCULATOR (Swapped) */}
        <section className="py-24 bg-background">
          <div className="container px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-16 lg:grid-cols-2">
              
              {/* Left: Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 rounded-full bg-primary/5">
                  <Zap size={12} />
                  Speed Lane
                </div>
                <h2 className="mb-6 text-3xl font-bold leading-tight md:text-5xl font-display text-content">
                  Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Streamline?</span>
                </h2>
                <p className="mb-10 text-lg text-content-muted">
                  The FHA Streamline is a "benefit" of already being an FHA borrower. If you've made your last 6 payments on time, you're 90% of the way there.
                </p>
                <div className="mt-10 space-y-8">
                  <BenefitItem icon={Zap} title="Lightning Fast Process" desc="Skip the appraisal, home inspection, and complex income verification. It's the fastest way to a lower payment." />
                  <BenefitItem icon={TrendingDown} title="Net Tangible Benefit" desc="FHA rules require the new loan to actually help you. We verify the math to ensure you save money." />
                  <BenefitItem icon={Shield} title="MIP Refund Potential" desc="If you refinance within 3 years of your original loan, you may get a pro-rated refund on your Upfront MIP." />
                </div>
              </div>

              {/* Right: INTERACTIVE FHA SAVINGS ENGINE */}
              <div className="relative group">
                <div className="absolute inset-0 transition-transform transform border bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[2.5rem] rotate-2 group-hover:rotate-1 -z-10 border-border"></div>
                <div className="relative p-10 overflow-hidden text-white shadow-2xl bg-content rounded-[2.5rem] border border-border">
                  <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/20 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                  
                  <h3 className="flex items-center gap-2 mb-8 text-xl font-bold font-display">
                    <Calculator size={20} className="text-primary" /> FHA Savings Engine
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-white/40">Loan Balance</label>
                        <div className="flex items-center gap-2 px-3 py-2 transition-all border rounded-lg bg-white/5 border-white/10 focus-within:ring-1 focus-within:ring-primary">
                           <span className="text-xs text-white/40">$</span>
                           <input type="number" value={balance} onChange={(e) => setBalance(Number(e.target.value))} className="w-full bg-transparent border-none outline-none font-bold text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-white/40">Current Rate</label>
                        <div className="flex items-center gap-2 px-3 py-2 transition-all border rounded-lg bg-white/5 border-white/10 focus-within:ring-1 focus-within:ring-primary">
                           <input type="number" value={currentRate} onChange={(e) => setCurrentRate(Number(e.target.value))} className="w-full bg-transparent border-none outline-none font-bold text-sm text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none" />
                           <span className="text-xs text-white/40">%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                        <span className="text-sm text-white/60">New Streamline Rate</span>
                        {loading ? <Loader2 size={16} className="animate-spin text-primary" /> : <span className="text-xl font-bold text-primary">{fhaRate}%</span>}
                    </div>

                    <div className="p-5 border rounded-2xl bg-primary/5 border-primary/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white/80">Monthly Savings</span>
                        <span className={`text-3xl font-bold ${analysis.statusColor}`}>{analysis.monthlySavings}</span>
                      </div>
                      
                      <div className="mt-3 flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider">
                        <span className="text-white/40">FHA Check:</span>
                        <span className={`px-2 py-0.5 rounded ${analysis.badgeColor}`}>
                            {analysis.statusText}
                        </span>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-[10px] text-white/50">
                        <span>Includes Est. MIP: {analysis.newMIP}/mo</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm" className="w-full text-white bg-white/5 border-white/10 hover:bg-white/10 group">
                        <Mail size={14} className="mr-2 transition-colors group-hover:text-primary" /> Email Quote
                      </Button>
                      <Button variant="outline" size="sm" className="w-full text-white bg-white/5 border-white/10 hover:bg-white/10 group">
                        <Download size={14} className="mr-2 transition-colors group-hover:text-primary" /> Save PDF
                      </Button>
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
              <h2 className="mb-4 text-3xl font-bold font-display text-content">Compare Refinance Types</h2>
              <p className="max-w-2xl mx-auto text-content-muted">FHA Streamline vs. Switching to Conventional.</p>
            </div>
            <div className="overflow-x-auto bg-white border shadow-sm rounded-3xl border-border">
              <table className="w-full text-sm text-left min-w-[800px]">
                <thead className="text-xs uppercase border-b text-content-muted bg-background-subtle">
                  <tr>
                    <th className="px-6 py-5 font-bold tracking-wider">Feature</th>
                    <th className="px-6 py-5 font-bold text-primary border-primary/20 bg-primary/5 border-x">FHA Streamline</th>
                    <th className="px-6 py-5 font-bold tracking-wider text-content">Conventional Refi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { feat: "Appraisal Required?", fha: "No", conv: "Usually Yes" },
                    { feat: "Income Verification", fha: "Minimal", conv: "Full Docs (W2/Paystubs)" },
                    { feat: "Credit Check", fha: "Mortgage History Only", conv: "Full Credit Report" },
                    { feat: "MIP Requirement", fha: "Yes (0.55%)", conv: "None (if >20% Equity)" },
                    { feat: "Cash Out Option", fha: "No", conv: "Yes" },
                  ].map((row, i) => (
                    <tr key={i} className="transition-colors hover:bg-background-subtle/50 group">
                      <td className="px-6 py-5 font-medium text-content">{row.feat}</td>
                      <td className="px-6 py-5 font-bold border-primary/10 text-content bg-primary/5 border-x">{row.fha}</td>
                      <td className="px-6 py-5 text-content-muted">{row.conv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. QUALIFICATION MATRIX */}
        <section id="requirements" className="relative py-24 overflow-hidden text-white bg-content scroll-mt-20">
          <div className="container relative z-10 max-w-5xl px-4 mx-auto">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="relative p-8 overflow-hidden border bg-white/5 backdrop-blur-sm border-success/20 rounded-3xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-success"></div>
                <h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-white">
                  <CheckCircle2 size={24} className="text-success" /> Green Flags
                </h3>
                <ul className="space-y-4 text-sm text-white/80">
                  <li className="flex items-start gap-3"><CheckCircle2 size={16} className="mt-1 text-success shrink-0" /><div><span className="block font-bold text-white">Current FHA Loan</span><span>You must already be in an FHA loan.</span></div></li>
                  <li className="flex items-start gap-3"><CheckCircle2 size={16} className="mt-1 text-success shrink-0" /><div><span className="block font-bold text-white">Perfect Payment History</span><span>No 30-day lates in the last 12 months.</span></div></li>
                  <li className="flex items-start gap-3"><CheckCircle2 size={16} className="mt-1 text-success shrink-0" /><div><span className="block font-bold text-white">Net Tangible Benefit</span><span>Rate must drop by ~0.5% to qualify.</span></div></li>
                </ul>
              </div>

              <div className="relative p-8 overflow-hidden border bg-white/5 backdrop-blur-sm border-danger/20 rounded-3xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-danger"></div>
                <h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-white">
                  <XCircle size={24} className="text-danger" /> Disqualifiers
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-white/60">
                  You cannot take cash out with a Streamline. Also, if you have late payments recently, you'll need to wait until your history is clean.
                </p>
                <Link href="/website/refinance/cash-out">
                    <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10">Need Cash? See Cash-Out <ArrowRight size={16} className="ml-2" /></Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FAQ */}
        <section className="py-24 bg-background-subtle">
          <div className="container max-w-3xl px-4 mx-auto">
            <h2 className="mb-10 text-3xl font-bold text-center text-content">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <FaqItem question="Do I have to pay closing costs?" answer="Technically yes, but in a 'No Cost Streamline', we can often slightly adjust the rate to cover all costs for you." />
              <FaqItem question="Will my loan term reset?" answer="Yes, typically to a new 30-year term. However, you can choose a 15-year term if you want to pay off the home faster." />
              <FaqItem question="Does this remove Mortgage Insurance?" answer="No. The Streamline only lowers your rate. To remove MIP, you would need to refinance into a Conventional loan once you have 20% equity." />
            </div>
          </div>
        </section>

        <FinalCTA />
        <MobileStickyCTA />
      </main>
    </div>
  );
}

FHARefinancePage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;