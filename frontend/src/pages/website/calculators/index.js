'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Calculator, Wallet, RefreshCw, CalendarClock, 
  Scale, Zap, ArrowRight, PieChart, TrendingUp,
  Filter, MapPin, Activity
} from 'lucide-react';
import { cn } from '@/utils/utils';

// --- CORE SERVICES ---
import { useLocation } from '@/context/LocationContext';
import { useMarketEngine } from '@/hooks/useMarketEngine';

// --- COMPONENTS ---
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';

// --- JSON-LD SCHEMA ---
const hubSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Mortgage Calculators & Financial Tools",
  "description": "Suite of real-time mortgage calculators for home buying, refinancing, and amortization.",
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "url": "https://homeratesyard.com/calculators/mortgage" },
      { "@type": "ListItem", "position": 2, "url": "https://homeratesyard.com/calculators/affordability" },
      { "@type": "ListItem", "position": 3, "url": "https://homeratesyard.com/calculators/rent-vs-buy" }
    ]
  }
};

// --- DATA CONFIG ---
const TOOLS_DATA = [
  {
    id: 'mortgage',
    category: 'buying',
    title: "Mortgage Calculator",
    desc: "Calculate monthly P&I, taxes, insurance, and HOA fees with real-time rates.",
    icon: Calculator,
    href: "/website/calculators/mortgage",
    badge: "Most Popular",
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    id: 'affordability',
    category: 'buying',
    title: "Affordability Intelligence",
    desc: "Input your income and debts to find your maximum home buying power and LTV limits.",
    icon: Wallet,
    href: "/website/calculators/affordability",
    color: "text-red-600",
    bg: "bg-red-50"
  },
  {
    id: 'rent-vs-buy',
    category: 'planning',
    title: "Rent vs. Buy Analysis",
    desc: "Compare the total cost of renting vs. buying to find your financial break-even horizon.",
    icon: Scale,
    href: "/website/calculators/rent-vs-buy",
    color: "text-orange-600",
    bg: "bg-orange-50"
  },
  {
    id: 'refinance',
    category: 'refi',
    title: "Refinance Breakeven",
    desc: "Calculate months to recover closing costs with a new lower rate and check cash-out limits.",
    icon: RefreshCw,
    href: "/website/calculators/refinance",
    showRate: true, 
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  {
    id: 'amortization',
    category: 'planning',
    title: "Amortization Schedule",
    desc: "Visualize your principal vs. interest payment breakdown over the life of your loan.",
    icon: CalendarClock,
    href: "/website/calculators/amortization",
    color: "text-indigo-600",
    bg: "bg-indigo-50"
  },
  {
    id: 'extra',
    category: 'planning',
    title: "Payoff Acceleration",
    desc: "See how bi-weekly payments and extra cash can shave years off your mortgage.",
    icon: Zap,
    href: "/website/calculators/extra-payments",
    color: "text-amber-500",
    bg: "bg-amber-50"
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Tools' },
  { id: 'buying', label: 'Home Buying' },
  { id: 'refi', label: 'Refinancing' },
  { id: 'planning', label: 'Financial Planning' }
];

export default function AllCalculators() {
  const { location } = useLocation();
  const { rates } = useMarketEngine(location?.zip);
  const [activeCat, setActiveCat] = useState('all');

  // Filter Logic
  const visibleTools = activeCat === 'all' 
    ? TOOLS_DATA 
    : TOOLS_DATA.filter(t => t.category === activeCat);

  return (
    <div className="relative min-h-screen font-sans bg-slate-50 selection:bg-red-50 selection:text-red-600">
      <Head>
        <title>Mortgage Intelligence Suite | HomeRatesYard</title>
        <meta name="description" content="Access our suite of free mortgage calculators. Powered by real-time market data." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hubSchema) }} />
      </Head>

      <PublicLayout>
        
        {/* 1. HERO SECTION */}
        <section className="relative px-6 pt-24 pb-24 overflow-hidden text-center bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ef444415,_transparent_70%)]" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold tracking-widest text-red-400 uppercase bg-red-500/10 border border-red-500/20 rounded-full">
               <PieChart size={12} /> Financial Toolkit
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
               Mortgage <span className="text-red-500">Intelligence</span> Suite
            </h1>
            <p className="max-w-2xl mx-auto text-lg font-normal leading-relaxed text-slate-400">
               Precision tools powered by real-time market data for <strong className="text-white">{location?.city || 'your area'}</strong>. Stop guessing and start strategizing.
            </p>
          </div>
        </section>

        {/* 2. FLOATING FILTER BAR */}
        <section className="sticky z-30 flex justify-center px-4 -mt-8 top-24">
            <div className="flex items-center gap-2 px-2 py-2 overflow-x-auto bg-white border rounded-full shadow-xl min-w-max border-slate-200 shadow-slate-200/50">
                <div className="flex items-center justify-center pl-3 pr-2 text-slate-400">
                    <Filter size={16} />
                </div>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCat(cat.id)}
                        className={cn(
                          "px-5 py-2.5 text-[13px] font-medium rounded-full transition-all duration-300 whitespace-nowrap",
                          activeCat === cat.id 
                            ? "bg-slate-900 text-white shadow-md" 
                            : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        )}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
        </section>

        {/* 3. TOOLS GRID */}
        <section className="pt-16 pb-24 bg-slate-50">
          <div className="container px-4 mx-auto max-w-7xl">
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {visibleTools.map((tool) => (
                <Link key={tool.id} href={tool.href} className="h-full group">
                  <div className="relative flex flex-col h-full p-8 overflow-hidden transition-all duration-500 bg-white border shadow-sm rounded-[1rem] border-slate-200 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 hover:border-slate-300">
                    
                    {/* Highlight Badge */}
                    {tool.badge && (
                        <div className="absolute top-0 right-0 px-4 py-1.5 text-[10px] tracking-widest uppercase font-bold text-white bg-slate-900 rounded-bl-2xl">
                            {tool.badge}
                        </div>
                    )}

                    {/* Live Rate Badge (Dynamic) */}
                    {tool.showRate && rates?.['30Y'] && (
                        <div className="absolute flex flex-col items-end top-6 right-6">
                            <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                               <Activity size={10} className="text-emerald-500 animate-pulse" /> Live Rate
                            </span>
                            <span className="text-lg font-black tracking-tighter text-slate-900">{rates['30Y']}%</span>
                        </div>
                    )}
                    
                    {/* Icon */}
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 shadow-inner", tool.bg, tool.color)}>
                      <tool.icon size={28} />
                    </div>

                    {/* Text */}
                    <h3 className="mb-3 text-xl font-bold transition-colors text-slate-900 group-hover:text-red-600">
                      {tool.title}
                    </h3>
                    <p className="flex-grow mb-10 text-sm font-medium leading-relaxed text-slate-500">
                      {tool.desc}
                    </p>

                    {/* Button */}
                    <div className="flex items-center gap-2 mt-auto text-sm font-bold transition-colors text-slate-900 group-hover:text-red-600">
                      Launch Tool <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </div>

                  </div>
                </Link>
              ))}
            </div>

          </div>
        </section>

        {/* 4. SEO / CONTEXT SECTION */}
        <section className="py-24 bg-white border-t border-slate-200">
          <div className="container max-w-4xl px-4 mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-[10px] font-bold tracking-widest uppercase border rounded-full text-slate-500 border-slate-200 bg-slate-50">
              <TrendingUp size={14} className="text-red-500" />
              Empower Yourself
            </div>
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Why use our Intelligence Suite?
            </h2>
            <p className="mb-12 font-normal leading-relaxed text-md text-slate-500">
              Buying a home is the biggest financial decision of your life. Relying on "back of the napkin" math can cost you tens of thousands of dollars. Our tools use <strong>real-time, hyper-local data</strong> and industry-standard lending formulas to give you absolute clarity before you ever speak to a loan officer.
            </p>
          </div>
        </section>

        <FinalCTA />
      </PublicLayout>
    </div>
  );
}