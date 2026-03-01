import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  CheckCircle2, HelpCircle, ChevronDown, ChevronUp, 
  ArrowRight, Scale, Shield, Globe, Home, Briefcase, 
  UserCheck, DollarSign, Flag, Star, Loader2 
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';
import { Button } from '@/components/ui/primitives/Button';
import { useMarketEngine } from '@/hooks/useMarketEngine'; 

// --- JSON-LD SEO SCHEMA ---
const comparisonSchema = {
  "@context": "https://schema.org",
  "@type": "Table",
  "about": "Mortgage Loan Comparison",
  "name": "Live Loan Comparison Matrix"
};

// --- COMPONENTS ---

const MobileStickyCTA = () => (
  <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-border md:hidden animate-in slide-in-from-bottom">
    <Link href="/auth/register" className="block w-full">
      <Button size="lg" className="w-full shadow-lg shadow-primary/20">
        Check My Eligibility <ArrowRight size={18} className="ml-2" />
      </Button>
    </Link>
  </div>
);

const ComparisonRow = ({ feature, conv, fha, va, usda, isHighlight }) => (
  <tr className={`transition-colors border-b border-border hover:bg-background-subtle group ${isHighlight ? 'bg-primary/5' : ''}`}>
    <td className={`sticky left-0 z-10 px-6 py-5 font-bold bg-background text-content min-w-[160px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] flex items-center gap-2 ${isHighlight ? 'bg-primary/5' : ''}`}>
      {feature}
      {isHighlight && <Star size={14} className="text-primary fill-primary animate-pulse" />}
    </td>
    <td className={`px-6 py-5 text-center ${isHighlight ? 'font-bold text-primary' : 'text-content-muted'}`}>{conv}</td>
    <td className={`px-6 py-5 font-medium text-center border-x border-primary/10 ${isHighlight ? 'text-blue-700 font-bold' : 'text-blue-600'}`}>{fha}</td>
    <td className={`px-6 py-5 font-medium text-center border-r border-border ${isHighlight ? 'text-red-700 font-bold' : 'text-red-600'}`}>{va}</td>
    <td className={`px-6 py-5 font-medium text-center ${isHighlight ? 'text-emerald-700 font-bold' : 'text-emerald-600'}`}>{usda}</td>
  </tr>
);

const ScenarioCard = ({ title, icon: Icon, desc, recommendation, link, accentColor, badge }) => {
  const colorMap = {
    red: "bg-red-50 text-red-600 border-red-100 hover:border-red-300",
    blue: "bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300",
    violet: "bg-violet-50 text-violet-600 border-violet-100 hover:border-violet-300",
    orange: "bg-orange-50 text-orange-600 border-orange-100 hover:border-orange-300",
  };

  const activeStyle = colorMap[accentColor] || colorMap.red;

  return (
    <div className={`relative p-6 rounded-2xl border bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full group ${activeStyle.split(' ').pop()}`}>
      {badge && (
        <div className="absolute top-0 right-0 px-3 py-1 text-[10px] font-bold text-white transform translate-x-2 -translate-y-2 bg-primary rounded-full shadow-lg">
          {badge}
        </div>
      )}
      
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${activeStyle.split(' ').slice(0, 2).join(' ')}`}>
          <Icon size={28} strokeWidth={2} />
        </div>
        <h3 className="text-lg font-bold font-display text-content">{title}</h3>
      </div>
      
      <p className="mb-8 text-sm leading-relaxed text-content-muted min-h-[60px] flex-grow">
        {desc}
      </p>
      
      <div className="pt-6 mt-auto border-t border-dashed border-border">
        <p className="mb-2 text-[10px] font-bold tracking-widest uppercase text-content-muted/60">Recommended Path</p>
        <Link href={link} className="flex items-center justify-between group/link">
          <span className={`text-lg font-bold ${activeStyle.split(' ')[1].replace('text-', 'text-')}`}>
            {recommendation}
          </span>
          <div className={`p-2 rounded-full transition-all group-hover/link:translate-x-1 ${activeStyle.split(' ')[0]}`}>
            <ArrowRight size={16} className={activeStyle.split(' ')[1]} />
          </div>
        </Link>
      </div>
    </div>
  );
};

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="overflow-hidden transition-all duration-300 bg-white border shadow-sm rounded-2xl border-border hover:shadow-md">
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

export default function CompareLoansPage() {
  const { rates, loading } = useMarketEngine();

  const scrollToTable = (e) => {
    e.preventDefault();
    document.getElementById('comparison-table')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper to render rate or loader
  const renderRate = (key) => {
    if (loading) return <Loader2 size={16} className="mx-auto animate-spin text-primary/50" />;
    
    // Fallback logic if specific key missing
    if (key === 'USDA' && !rates['USDA']) return rates['FHA'] + '%*'; // USDA often tracks FHA
    
    return rates[key] ? `${rates[key]}%` : '---';
  };

  return (
    <div className="min-h-screen pb-20 font-sans bg-background md:pb-0">
      <Head>
        <title>Compare Loans | HomeRatesYard</title>
        <meta name="description" content="Side-by-side comparison of Conventional, FHA, VA, USDA, and Jumbo loans. Find the right mortgage for your credit score and down payment." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(comparisonSchema) }} />
      </Head>

      <main>
        
        {/* 1. HERO SECTION */}
        <section className="relative pt-16 pb-12 overflow-hidden border-b bg-background border-border">
          <div className="container relative z-10 px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
              
              {/* Left Content */}
              <div className="max-w-2xl duration-700 animate-in slide-in-from-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-wider text-content-muted border border-border rounded-full bg-background-subtle">
                  <Scale size={12} className="text-primary" />
                  Unbiased Comparison
                </div>
                
                <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl font-display text-content">
                  Find Your Perfect <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    Financial Fit.
                  </span>
                </h1>
                
                <p className="mb-8 text-lg leading-relaxed text-content-muted">
                  Not all mortgages are created equal. Compare interest rates, down payments, and credit requirements side-by-side to make the smartest choice.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="shadow-xl shadow-primary/20">
                    <Link href="/auth/register">
                      Check My Eligibility <ArrowRight size={18} className="ml-2" />
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={scrollToTable}
                    className="bg-white hover:bg-background-subtle"
                  >
                    View Full Matrix
                  </Button>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative hidden duration-700 delay-100 lg:block animate-in slide-in-from-right">
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[16/10] group border border-border">
                   <img 
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1000&auto=format&fit=crop" 
                    alt="Comparing financial options" 
                    className="object-cover w-full h-full transition-transform duration-700 transform group-hover:scale-105"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>
                
                {/* Floating Badge */}
                <div className="absolute flex items-center gap-4 p-4 duration-700 delay-200 border shadow-xl bg-white/90 backdrop-blur-md -bottom-8 -left-8 rounded-2xl border-white/50 animate-bounce" style={{ animationDuration: '4s' }}>
                  <div className="flex items-center justify-center text-white shadow-lg w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-primary/30">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider">Programs</p>
                    <p className="text-lg font-bold text-content">6+ Analyzed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SCENARIO SELECTOR */}
        <section className="py-24 border-b bg-background-subtle border-border">
          <div className="container px-4 mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold font-display text-content">What sounds like you?</h2>
              <p className="max-w-2xl mx-auto text-content-muted">
                Select the scenario that best matches your situation to see our recommendation.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              
              <ScenarioCard 
                title="First-Time Buyer"
                icon={UserCheck}
                desc="I have decent credit (620+) but not a huge down payment. I want a standard loan with low costs."
                recommendation="Conventional 97"
                link="/loans/conventional"
                accentColor="red"
                badge="Most Popular"
              />

              <ScenarioCard 
                title="Credit Rebuilder"
                icon={Shield}
                desc="My credit score is a bit low (580-619) or I have high monthly debts. I need flexibility."
                recommendation="FHA Loan"
                link="/loans/fha"
                accentColor="orange"
              />

              <ScenarioCard 
                title="Service Member"
                icon={Flag}
                desc="I am an active duty military member, veteran, or surviving spouse. I earned this benefit."
                recommendation="VA Loan"
                link="/loans/va"
                accentColor="blue"
                badge="Best Terms"
              />

              <ScenarioCard 
                title="Rural Living"
                icon={Globe}
                desc="I want to buy a home away from the city/suburbs and have $0 for a down payment."
                recommendation="USDA Loan"
                link="/loans/usda"
                accentColor="emerald"
              />

              <ScenarioCard 
                title="Self-Employed"
                icon={Briefcase}
                desc="I write off a lot of expenses, so my tax returns don't show my real income. I have cash flow."
                recommendation="Non-QM (Bank Stmt)"
                link="/loans/non-qm"
                accentColor="violet"
              />

              <ScenarioCard 
                title="Luxury Buyer"
                icon={DollarSign}
                desc="I'm looking for a high-value property over $800k and have excellent credit/assets."
                recommendation="Jumbo Loan"
                link="/loans/jumbo"
                accentColor="orange"
              />

            </div>
          </div>
        </section>

        {/* 3. MASTER COMPARISON TABLE */}
        <section id="comparison-table" className="py-24 bg-background scroll-mt-20">
          <div className="container px-4 mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold font-display text-content">The Master Matrix</h2>
              <p className="max-w-2xl mx-auto text-content-muted">
                A transparent look at the core requirements for the most popular loan programs.
              </p>
            </div>

            <div className="overflow-x-auto bg-white border shadow-sm rounded-2xl border-border">
              <table className="w-full text-sm text-left min-w-[900px]">
                <thead className="text-xs uppercase border-b bg-background-subtle border-border text-content-muted">
                  <tr>
                    <th className="sticky left-0 z-20 px-6 py-5 font-bold tracking-wider w-[200px] bg-background-subtle shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Feature</th>
                    <th className="px-6 py-5 font-bold text-center text-content">Conventional</th>
                    <th className="px-6 py-5 font-bold text-center text-primary bg-primary/5 border-x border-primary/10">FHA Loan</th>
                    <th className="px-6 py-5 font-bold text-center text-blue-600">VA Loan</th>
                    <th className="px-6 py-5 font-bold text-center text-emerald-600">USDA Loan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {/* NEW: Dynamic Rate Row */}
                  <ComparisonRow 
                    feature="Today's Avg Rate" 
                    conv={renderRate('30Y')} 
                    fha={renderRate('FHA')} 
                    va={renderRate('VA')} 
                    usda={renderRate('USDA')}
                    isHighlight={true}
                  />
                  <ComparisonRow feature="Min. Credit Score" conv="620+" fha="580+" va="580+ (Flexible)" usda="640+" />
                  <ComparisonRow feature="Min. Down Payment" conv="3% (First Time)" fha="3.5%" va="0%" usda="0%" />
                  <ComparisonRow feature="Mortgage Insurance" conv="PMI (Removable)" fha="MIP (Permanent)" va="None" usda="Guarantee Fee" />
                  <ComparisonRow feature="Bankruptcy Wait" conv="4 Years" fha="2 Years" va="2 Years" usda="3 Years" />
                  <ComparisonRow feature="Loan Limit (2024)" conv="$766,550" fha="$498,257+" va="None (Full Ent.)" usda="Income Based" />
                  <ComparisonRow feature="Property Condition" conv="As-Is / Flexible" fha="Strict Safety" va="Strict Safety" usda="Strict Safety" />
                  <ComparisonRow feature="Best For..." conv="Good Credit" fha="Low Credit / Debt" va="Veterans" usda="Rural Buyers" />
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-xs italic text-content-muted">
                *Rates update daily via MarketEngine™. Requirements are subject to change. 
                <Link href="/disclaimer" className="ml-1 underline transition-colors hover:text-primary">View legal disclaimers.</Link>
              </p>
            </div>
          </div>
        </section>

        {/* 4. FAQ */}
        <section className="py-24 border-t bg-background-subtle border-border">
          <div className="container max-w-4xl px-4 mx-auto">
            <h2 className="mb-10 text-3xl font-bold text-center text-content">Comparison FAQs</h2>
            <div className="space-y-4">
              <FaqItem 
                question="Which loan has the lowest interest rate?" 
                answer="Typically, VA loans offer the lowest rates, followed closely by FHA and Conventional. However, FHA loans have expensive mortgage insurance that increases the APR." 
              />
              <FaqItem 
                question="Can I switch loan types later?" 
                answer="Yes! It is very common to start with an FHA loan (easier to qualify) and refinance into a Conventional loan later once your credit improves and you have 20% equity to remove PMI." 
              />
              <FaqItem 
                question="Why would anyone choose Conventional over FHA?" 
                answer="Conventional loans allow you to remove PMI without refinancing once you reach 20% equity. FHA mortgage insurance is permanent for the life of the loan (unless you put 10% down originally)." 
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

CompareLoansPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;