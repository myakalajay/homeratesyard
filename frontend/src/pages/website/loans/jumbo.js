import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  CheckCircle2, ArrowRight, HelpCircle, 
  ChevronDown, ChevronUp, Gem, ShieldAlert
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';

const StatCard = ({ label, value, sub }) => (
    <div className="p-5 transition-all bg-white border shadow-sm rounded-2xl border-slate-100 hover:shadow-md hover:-translate-y-1 group">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-purple-600 transition-colors">{label}</p>
      <p className="mb-1 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-[10px] text-slate-500">{sub}</p>
    </div>
);

const FaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="overflow-hidden transition-all duration-300 bg-white border shadow-sm rounded-2xl border-slate-200">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full p-6 text-left transition-colors focus:outline-none hover:bg-slate-50"
        >
          <h4 className={`font-bold text-sm md:text-base flex items-center gap-3 ${isOpen ? 'text-purple-600' : 'text-slate-900'}`}>
            <HelpCircle size={18} className={`shrink-0 ${isOpen ? 'text-purple-600' : 'text-slate-400'}`} /> 
            {question}
          </h4>
          {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </button>
        <div className={`px-6 text-sm text-slate-600 leading-relaxed overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="pl-8 ml-1 border-l-2 border-purple-100">{answer}</div>
        </div>
      </div>
    );
};

export default function JumboLoanPage() {
  const scrollToRequirements = (e) => {
    e.preventDefault();
    document.getElementById('requirements')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50">
      <Head>
        <title>Jumbo Loans | HomeRatesYard</title>
        <meta name="description" content="Premium financing for luxury properties exceeding conforming loan limits. Borrow up to $3M." />
      </Head>

      <main>
        {/* 1. HERO (Compact) */}
        <section className="pt-12 pb-8 overflow-hidden bg-white border-b border-slate-100">
          <div className="container px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-[10px] font-bold uppercase tracking-wider text-purple-600 border border-purple-200 rounded-full bg-purple-50">
                  <Gem size={12} />
                  Premium Financing
                </div>
                <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl font-display text-slate-900">
                  Loans without <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600">
                    Limits.
                  </span>
                </h1>
                <p className="mb-6 text-lg leading-relaxed text-slate-500">
                  For dream homes that exceed standard loan limits. Borrow up to $3M with competitive interest rates and tailored underwriting for complex incomes.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Link href="/auth/register">
                        <button className="flex items-center gap-2 px-8 py-3 font-bold text-white transition-all transform bg-purple-900 shadow-lg rounded-xl hover:bg-purple-800 active:scale-95">
                        View Rates <ArrowRight size={18} />
                        </button>
                    </Link>
                    <a href="#requirements" onClick={scrollToRequirements}>
                        <button className="px-8 py-3 font-bold transition-all bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50">
                        Requirements
                        </button>
                    </a>
                </div>
              </div>
              <div className="relative hidden lg:block">
                 <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[16/9] group border border-slate-100">
                    <img 
                    src="https://images.unsplash.com/photo-1600596542815-e328700336f4?q=80&w=1000&auto=format&fit=crop" 
                    alt="Luxury Estate" 
                    className="object-cover w-full h-full transition-transform duration-700 transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. STATS */}
        <section className="py-8 border-b bg-slate-50 border-slate-200">
            <div className="container max-w-6xl px-4 mx-auto">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <StatCard label="Loan Amount" value="$3M Max" sub="For properties > $766k" />
                    <StatCard label="Min. Down Payment" value="10-20%" sub="Depending on loan size" />
                    <StatCard label="Credit Score" value="700+" sub="Stricter credit requirements" />
                </div>
            </div>
        </section>

        {/* 3. QUALIFICATION MATRIX (Dark) */}
        <section id="requirements" className="py-24 text-white bg-slate-900 scroll-mt-10">
            <div className="container max-w-5xl px-4 mx-auto">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl font-display">Luxury Requirements</h2>
                    <p className="text-slate-400">Jumbo loans carry higher risk for lenders, so qualification is stricter.</p>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* GREEN FLAGS */}
                    <div className="relative p-8 overflow-hidden transition-colors border bg-white/5 border-purple-500/20 rounded-3xl group hover:border-purple-500/40">
                        <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
                        <h3 className="flex items-center gap-3 mb-6 text-xl font-bold"><CheckCircle2 className="text-purple-400"/> Green Flags</h3>
                        <ul className="space-y-4">
                            {[
                              { l: "Credit Score 700+", s: "Excellent credit history required." },
                              { l: "10-20% Down Payment", s: "Skin in the game lowers lender risk." },
                              { l: "Cash Reserves", s: "6-12 months of payments in the bank." },
                              { l: "DTI under 43%", s: "Strict debt-to-income ratio limits." }
                            ].map((item,i)=>(
                                <li key={i} className="flex items-start gap-3">
                                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"/>
                                  <div>
                                    <span className="block text-sm font-bold text-white">{item.l}</span>
                                    <span className="text-xs text-slate-400">{item.s}</span>
                                  </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                     {/* RED FLAG */}
                     <div className="relative p-8 overflow-hidden transition-colors border bg-white/5 border-red-500/20 rounded-3xl group hover:border-red-500/40">
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                        <h3 className="flex items-center gap-3 mb-6 text-xl font-bold"><ShieldAlert className="text-red-400"/> Loan Too Small?</h3>
                        <p className="mb-6 text-sm leading-relaxed text-slate-400">
                          If your loan amount is under $766,550 (in most counties), you don't need a Jumbo loan. A Conventional loan offers lower rates and easier qualification.
                        </p>
                        <Link href="/loans/conventional">
                            <button className="flex items-center justify-center w-full gap-2 py-3 font-bold border rounded-xl bg-white/10 hover:bg-white/20 border-white/10">
                              Check Conventional Limits <ArrowRight size={16} />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>

        {/* 4. FAQ */}
        <section className="py-24 bg-slate-50">
          <div className="container max-w-3xl px-4 mx-auto">
            <h2 className="mb-10 text-3xl font-bold text-center text-slate-900">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <FaqItem question="Are Jumbo rates higher than Conventional?" answer="Historically, yes. However, market conditions vary. Sometimes Jumbo rates can be competitive, especially for borrowers with pristine credit profiles and large assets." />
              <FaqItem question="Do I need two appraisals?" answer="Often, yes. For loan amounts over $1.5M or $2M, many lenders require a second appraisal to verify the property's value in the luxury market." />
              <FaqItem question="What counts as 'Cash Reserves'?" answer="Reserves are liquid assets (savings, stocks, retirement accounts) remaining after you pay the down payment and closing costs. Lenders want to ensure you can pay the mortgage even if your income pauses." />
            </div>
          </div>
        </section>

        <FinalCTA />
      </main>
    </div>
  );
}
JumboLoanPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;