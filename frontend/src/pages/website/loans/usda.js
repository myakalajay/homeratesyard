import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle2, ArrowRight, XCircle, HelpCircle, 
  ChevronDown, ChevronUp, Leaf, MapPin, 
  Banknote, Percent, Home, Loader2, Info, Calculator, ExternalLink, Wallet 
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';
import { Button } from '@/components/ui/primitives/Button';
import { useMarketEngine } from '@/hooks/useMarketEngine'; 

// --- JSON-LD SEO SCHEMA ---
const usdaSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  "name": "USDA Rural Development Loan",
  "description": "0% down payment mortgage for eligible rural and suburban homes.",
  "interestRate": {
    "@type": "QuantitativeValue",
    "value": "5.875",
    "unitText": "PERCENT"
  },
  "feesAndCommissionsSpecification": "1% Upfront Guarantee Fee, 0.35% Annual Fee"
};

// --- HELPER: Monthly Payment Calculator ---
const calculatePayment = (rate, loanAmount = 350000) => {
  if (!rate) return 0;
  const r = parseFloat(rate) / 100 / 12;
  const n = 360; 
  return (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

// --- COMPONENTS ---

const MobileStickyCTA = () => (
  <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-border md:hidden animate-in slide-in-from-bottom">
    <Link href="/auth/register?product=usda" className="block w-full">
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
          <div className="absolute right-0 z-10 w-56 p-3 mb-2 text-xs leading-relaxed text-white transition-opacity rounded-lg shadow-xl opacity-0 pointer-events-none bottom-full bg-slate-900 group-hover/tooltip:opacity-100">
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
    {/* RESTORED BRAND COLOR: Using Primary (Red/Orange) tones */}
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

export default function USDALoanPage() {
  const { rates, loading } = useMarketEngine();
  
  // USDA proxy rates (FHA)
  const currentRate = rates?.['FHA'] || '5.875'; 
  // USDA Fee Logic: 1% Upfront (rolled in) + 0.35% Annual
  const estimatedAPR = (parseFloat(currentRate) + 0.45).toFixed(3);
  const monthlyPayment = calculatePayment(currentRate, 350000).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  const scrollToRequirements = (e) => {
    e.preventDefault();
    document.getElementById('requirements')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-20 font-sans bg-background md:pb-0">
      <Head>
        <title>USDA Loans | HomeRatesYard</title>
        <meta name="description" content="0% down payment loans for homes in eligible rural and suburban areas. Check your USDA eligibility today." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(usdaSchema) }} />
      </Head>

      <main>
        
        {/* 1. HERO SECTION */}
        <section className="relative pt-12 pb-8 overflow-hidden border-b bg-background border-border">
          <div className="container relative z-10 px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              
              {/* Left Content */}
              <div className="max-w-2xl duration-700 animate-in slide-in-from-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-wider text-content-muted border border-border rounded-full bg-background-subtle">
                  <Leaf size={12} className="text-emerald-600" /> {/* Kept Leaf Green as it is semantic */}
                  Rural Development Program
                </div>
                
                <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl font-display text-content">
                  Country Living with <br/>
                  {/* RESTORED BRAND GRADIENT: Red to Orange */}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    $0 Down Payment.
                  </span>
                </h1>
                
                <p className="mb-8 text-lg leading-relaxed text-content-muted">
                  You don't have to be a farmer. USDA loans offer 100% financing for buyers in eligible suburban and rural areas with competitive fixed rates.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="shadow-xl shadow-primary/20">
                    <Link href="/auth/register?product=usda">
                      Check Eligibility <ArrowRight size={18} className="ml-2" />
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={scrollToRequirements}
                    className="bg-white hover:bg-background-subtle"
                  >
                    View Map & Income
                  </Button>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative hidden duration-700 delay-100 lg:block animate-in slide-in-from-right">
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[16/10] group border border-border">
                   <Image 
                    src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1000&auto=format&fit=crop" 
                    alt="Suburban home with large yard" 
                    fill
                    className="object-cover w-full h-full transition-transform duration-700 transform group-hover:scale-105"
                    priority
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Floating Badge 1 */}
                <div className="absolute flex items-center gap-4 p-4 duration-700 delay-200 border shadow-xl bg-white/90 backdrop-blur-md -bottom-6 -left-6 rounded-2xl border-white/50 animate-bounce" style={{ animationDuration: '4s' }}>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full text-primary bg-primary/10">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider">Location</p>
                    <p className="text-sm font-bold text-content">97% of US Land</p>
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
              <StatCard label="Min. Down Payment" value="0%" sub="100% Financing Available" />
              <StatCard label="Credit Score" value="640+" sub="Preferred, flexible to 600" />
              <StatCard 
                label="Income Limit" 
                value="Moderate" 
                sub="Household Max Applies" 
                tooltip="Your total household income must be below 115% of the area median. For a family of 4, this is often over $110,000."
              />
            </div>
          </div>
        </section>

        {/* 3. BENEFITS GRID */}
        <section className="py-24 bg-background">
          <div className="container px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-16 lg:grid-cols-2">
              
              {/* Left: Content */}
              <div>
                <h2 className="mb-6 text-3xl font-bold md:text-4xl font-display text-content">
                  Why choose USDA?
                </h2>
                <div className="space-y-8">
                  <BenefitItem 
                    icon={Banknote} title="Zero Down Payment"
                    desc="One of the last true 100% financing programs left in America. Keep your savings in your pocket."
                  />
                  <BenefitItem 
                    icon={Percent} title="Cheaper Insurance"
                    desc="USDA mortgage insurance fees are significantly lower than FHA loans (0.35% vs 0.55%), saving you money monthly."
                  />
                  <BenefitItem 
                    icon={Home} title="Seller Can Pay Costs"
                    desc="Sellers are allowed to pay up to 6% of your closing costs, potentially making your move-in cost $0."
                  />
                </div>
              </div>

              {/* Right: Dynamic Payment Calculator Card */}
              <div className="relative group">
                <div className="absolute inset-0 transition-transform transform border bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[2.5rem] rotate-2 group-hover:rotate-1 -z-10 border-border"></div>
                
                <div className="relative p-10 overflow-hidden text-white shadow-2xl bg-content rounded-[2rem]">
                  
                  <h3 className="mb-8 text-xl font-bold font-display">USDA Estimate</h3>
                  
                  <div className="space-y-6">
                    {/* Rate Row */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <span className="text-sm text-white/60">Avg Rate (30Y Fixed)</span>
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
                            Principal & Interest for a $350k loan.
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
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/60">APR</span>
                        <div className="relative group/apr">
                          <Info size={14} className="text-white/40 cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 text-[10px] text-content bg-white rounded-lg opacity-0 pointer-events-none group-hover/apr:opacity-100 transition-opacity z-10 shadow-lg">
                            Includes 1% Upfront Guarantee Fee and 0.35% Annual Fee.
                          </div>
                        </div>
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
              <h2 className="mb-4 text-3xl font-bold font-display text-content">How USDA Stacks Up</h2>
              <p className="max-w-2xl mx-auto text-content-muted">
                See how USDA compares to other low-down-payment options.
              </p>
            </div>

            <div className="overflow-x-auto border shadow-sm rounded-2xl border-border">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="text-xs uppercase border-b text-content-muted bg-background-subtle border-border">
                  <tr>
                    <th className="px-6 py-5 font-bold tracking-wider">Feature</th>
                    <th className="px-6 py-5 font-bold text-primary border-primary/20 bg-primary/5 border-x">USDA Loan</th>
                    <th className="px-6 py-5 font-bold tracking-wider text-content">FHA Loan</th>
                    <th className="px-6 py-5 font-bold tracking-wider text-content">Conventional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { feat: "Min. Down Payment", usda: "0%", fha: "3.5%", conv: "3%" },
                    { feat: "Monthly MI Rate", usda: "0.35% (Cheaper)", fha: "0.55%", conv: "Varies (Higher)" },
                    { feat: "Location Limit", usda: "Rural/Suburban", fha: "None", conv: "None" },
                    { feat: "Income Limit", usda: "Yes (115% AMI)", fha: "None", conv: "None" },
                    { feat: "Closing Costs", usda: "Can Roll In", fha: "Standard", conv: "Standard" },
                  ].map((row, i) => (
                    <tr key={i} className="transition-colors hover:bg-background-subtle/50 group">
                      <td className="px-6 py-4 font-medium transition-colors text-content group-hover:text-primary">{row.feat}</td>
                      <td className="px-6 py-4 font-bold border-primary/20 text-content bg-primary/5 border-x">{row.usda}</td>
                      <td className="px-6 py-4 text-content-muted">{row.fha}</td>
                      <td className="px-6 py-4 text-content-muted">{row.conv}</td>
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
              <h2 className="mb-4 text-3xl font-bold md:text-4xl font-display">Do you qualify?</h2>
              <p className="max-w-2xl mx-auto text-white/60">USDA has specific rules about "Where" you buy and "How Much" you earn.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              
              {/* GREEN FLAGS (Kept Green as it is Semantic "Go") */}
              <div className="relative p-8 overflow-hidden transition-colors border bg-white/5 backdrop-blur-sm border-success/20 rounded-3xl group hover:border-success/40">
                <div className="absolute top-0 left-0 w-full h-1 bg-success"></div>
                <h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-white">
                  <CheckCircle2 size={18} strokeWidth={3} className="text-success" /> USDA Green Flags
                </h3>
                <ul className="space-y-4">
                  {[
                    { l: "Eligible Location", s: "Property is in a USDA-designated rural area." },
                    { l: "Income Limits", s: "Household income is below the local limit (~$110k+)." },
                    { l: "Credit Score 640+", s: "Standard requirement for automated approval." },
                    { l: "Primary Residence", s: "You plan to live in the home (no rentals)." }
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
                
                {/* External Links */}
                <div className="grid grid-cols-1 gap-3 pt-6 mt-8 border-t border-white/10 sm:grid-cols-2">
                    <a href="https://eligibility.sc.egov.usda.gov/eligibility/welcomeAction.do?pageAction=sfp" target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="outline" className="w-full text-xs text-white bg-white/5 border-white/10 hover:bg-white/10">
                        Check Property Map <ExternalLink size={14} className="ml-2" />
                      </Button>
                    </a>
                    <a href="https://eligibility.sc.egov.usda.gov/eligibility/incomeEligibilityAction.do?pageAction=state" target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="outline" className="w-full text-xs text-white bg-white/5 border-white/10 hover:bg-white/10">
                        Check Income Limit <Wallet size={14} className="ml-2" />
                      </Button>
                    </a>
                </div>
              </div>

              {/* RED FLAGS */}
              <div className="relative p-8 overflow-hidden transition-colors border bg-white/5 backdrop-blur-sm border-danger/20 rounded-3xl group hover:border-danger/40">
                <div className="absolute top-0 left-0 w-full h-1 bg-danger"></div>
                <h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-white">
                  <XCircle size={18} strokeWidth={3} className="text-danger" /> Not Eligible?
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-white/60">
                  If you earn too much money or want to buy in a major metro city center (like downtown Chicago or Seattle), you cannot use USDA.
                </p>
                <div className="mt-auto">
                    <Link href="/loans/fha" className="block">
                      <Button variant="outline" className="w-full text-white bg-white/10 hover:bg-white/20 border-white/10">
                        Check FHA Options <ArrowRight size={16} className="ml-2" />
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
                question="What counts as 'Rural'?" 
                answer="It's broader than you think. Small towns, suburbs, and areas with populations under 35,000 often qualify. 97% of the U.S. land mass is eligible." 
              />
              <FaqItem 
                question="Is there a loan limit?" 
                answer="Unlike FHA or Conventional loans, USDA has NO set loan limit. Instead, the limit is determined by your ability to repay the loan based on your income and debts (DTI)." 
              />
              <FaqItem 
                question="Are closing costs included?" 
                answer="Sometimes. If the home appraises for more than the purchase price, you can roll closing costs into the loan. Sellers can also pay up to 6% of your costs." 
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

USDALoanPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;