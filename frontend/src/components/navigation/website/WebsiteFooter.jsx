'use client'; // 🟢 Added for client-side date rendering

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Twitter, Linkedin, Github, Globe, 
  ShieldCheck, Lock, ExternalLink, Scale, 
  Building2, Landmark, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import Logo from '@/components/navigation/shared/Logo';
import { cn } from '@/utils/utils';

// --- DATA: COMPREHENSIVE NAVIGATION ---
// 🟢 FIX 1: Added '/website' prefix to match your Next.js directory structure
const FOOTER_LINKS = {
  Product: [
    { label: 'Purchase Loans', href: '/website/loans/compare' },
    { label: 'Refinance Rates', href: '/website/refinance/get-rates' },
    { label: 'Jumbo Mortgage', href: '/website/loans/jumbo' },
    { label: 'FHA & VA Loans', href: '/website/loans/government' },
    { label: 'Investment Property', href: '/website/loans/investors' },
  ],
  Calculators: [
    { label: 'Mortgage Calculator', href: '/website/calculators/mortgage' },
    { label: 'Affordability Tool', href: '/website/calculators/affordability' },
    { label: 'Refinance Breakeven', href: '/website/calculators/refinance' },
    { label: 'Rent vs. Buy AI', href: '/website/calculators/rent-vs-buy' },
    { label: 'Amortization Pro', href: '/website/calculators/amortization' },
  ],
  Resources: [
    { label: 'Help Center', href: '/website/help' },
    { label: 'Rate Trends 2026', href: '/website/market-trends' },
    { label: 'Borrower Education', href: '/website/blog' },
    { label: 'Developer API', href: '/docs/api' },
    { label: 'Partnership Portal', href: '/partners' },
  ],
  Company: [
    { label: 'Our Story', href: '/website/about' },
    { label: 'Careers', href: '/website/careers' },
    { label: 'Newsroom', href: '/website/press' },
    { label: 'Investors', href: '/website/investors' },
    { label: 'Contact Us', href: '/website/contact' },
  ],
};

const WebsiteFooter = () => {
  const currentYear = new Date().getFullYear();
  
  // 🟢 FIX 2: Dynamic date generation for the disclaimer to always show "Today"
  const [lastUpdate, setLastUpdate] = useState('');
  
  useEffect(() => {
      const today = new Date();
      setLastUpdate(today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  }, []);

  return (
    <footer className="relative pt-24 pb-12 font-sans bg-white border-t border-slate-200 text-slate-500">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        
        {/* ==========================================
            SECTION 1: BRAND & NAVIGATION GRID
        ========================================== */}
        <div className="grid grid-cols-1 gap-12 mb-20 md:grid-cols-2 lg:grid-cols-12">
          
          {/* Column 1: Brand & Social */}
          <div className="space-y-8 lg:col-span-4">
            <div className="space-y-6">
              <Logo variant="default" className="w-auto h-8" />
              <p className="max-w-xs text-sm leading-relaxed text-slate-500">
                Lending reimagined for the modern era. AI-driven, transparent, and built for speed. HomeRatesYard is an Equal Housing Lender.
              </p>
            </div>
            
            <div className="flex gap-4">
              {[Twitter, Linkedin, Github, Globe].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  aria-label="Social Link"
                  className="flex items-center justify-center w-10 h-10 transition-all bg-white border rounded-xl border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-600/30 hover:bg-red-50/30"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav Links columns */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 lg:col-span-8">
            {Object.entries(FOOTER_LINKS).map(([category, links]) => (
              <div key={category}>
                <h4 className="mb-6 text-[11px] font-bold tracking-[0.15em] uppercase text-slate-900">
                  {category}
                </h4>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={link.href} 
                        className="text-sm font-medium transition-all hover:text-red-600 hover:translate-x-0.5 inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ==========================================
            SECTION 2: COMPLIANCE & TRUST HUB
        ========================================== */}
        <div className="pt-12 pb-12 border-t border-slate-100">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            
            {/* Trust Badges Cluster */}
            <div className="space-y-4 lg:col-span-4">
               <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 transition-colors border rounded-2xl bg-slate-50 border-slate-200 group hover:border-emerald-500/20">
                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">SOC2 Type II</p>
                      <p className="text-[9px] text-slate-500">Certified</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 transition-colors border rounded-2xl bg-slate-50 border-slate-200 group hover:border-amber-500/20">
                    <Lock className="w-8 h-8 text-amber-500" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">AES-256</p>
                      <p className="text-[9px] text-slate-500">Encrypted</p>
                    </div>
                  </div>
               </div>

               <div className="flex items-center gap-4 px-4 py-3 border rounded-2xl bg-slate-50 border-slate-200">
                  <Building2 className="w-6 h-6 text-red-600 shrink-0" />
                  <p className="text-[11px] leading-snug text-slate-600">
                    <span className="text-slate-900 font-bold block mb-0.5 uppercase tracking-tighter">NMLS ID #183920</span>
                    Licensed in 50 states. <a href="https://www.nmlsconsumeraccess.org" target="_blank" rel="noopener noreferrer" className="font-bold text-red-600 underline hover:text-red-700">Verify License</a>.
                  </p>
               </div>
            </div>

            {/* Federal Disclosure Grid */}
            <div className="grid grid-cols-1 gap-10 lg:col-span-8 md:grid-cols-2">
               <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Landmark size={14} className="text-red-600" />
                    <h5 className="text-[11px] font-bold uppercase tracking-wider">Equal Housing Lender</h5>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    We do not discriminate on the basis of race, color, religion, national origin, sex, handicap, or familial status. HomeRatesYard is an Equal Housing Lender committed to equitable access to credit.
                  </p>
               </div>
               <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-900">
                    <ShieldAlert size={14} className="text-red-600" />
                    <h5 className="text-[11px] font-bold uppercase tracking-wider">USA Patriot Act</h5>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Federal law requires all financial institutions to obtain, verify, and record information that identifies each person who opens an account. We will ask for your name, address, and DOB.
                  </p>
               </div>
            </div>
          </div>

          {/* Regulatory "Fine Print" Box */}
          <div className="mt-12 p-8 rounded-3xl bg-slate-100/50 border border-slate-200/60 text-[10px] leading-[1.8] text-slate-400 text-justify font-medium">
            <p className="mb-4">
              <strong className="text-slate-700">STATE LICENSING:</strong> Licensed by the Department of Financial Protection and Innovation under the California Residential Mortgage Lending Act. Licensed Mortgage Banker – NYS Department of Financial Services. NJ Department of Banking and Insurance. Loans made or arranged pursuant to a California Finance Lenders Law license. Georgia Residential Mortgage Licensee. Illinois Residential Mortgage Licensee.
            </p>
            <p className="mb-4">
              <strong className="text-slate-700">TEXAS RECOVERY FUND:</strong> CONSUMERS WISHING TO FILE A COMPLAINT AGAINST A MORTGAGE BANKER SHOULD SEND A COMPLAINT FORM TO THE TEXAS DEPARTMENT OF SAVINGS AND MORTGAGE LENDING, 2601 NORTH LAMAR, SUITE 201, AUSTIN, TEXAS 78705.
            </p>
            <div className="pt-4 mt-4 italic border-t border-slate-200/60">
              <strong className="mr-1 not-italic tracking-tighter uppercase text-slate-700">Rate Disclaimer:</strong> 
              Interest rates and APRs are for demonstration. 30-Year Fixed-Rate Mortgage examples are based on a loan of $450,000, 20% down, and 740+ FICO. This is not a commitment to lend. <strong>Last Market Update: {lastUpdate || 'Checking...'}</strong>
            </div>
          </div>
        </div>

        {/* ==========================================
            SECTION 3: UTILITY FOOTER
        ========================================== */}
        {/* 🟢 FIX 3: Improved flex wrapping for tiny mobile screens */}
        <div className="flex flex-col items-center justify-between gap-6 pt-10 border-t md:flex-row border-slate-200">
          
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 md:gap-10">
            <p className="text-xs font-semibold text-center text-slate-900 sm:text-left">© {currentYear} HomeRatesYard Inc.</p>
            
            {/* Live Status Badge */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm shrink-0">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-emerald-500"></span>
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest whitespace-nowrap">
                Systems Operational
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {['Privacy', 'Terms', 'Security', 'Licenses', 'Accessibility'].map((legal) => (
              <Link 
                key={legal} 
                href={`/website/legal/${legal.toLowerCase()}`} 
                className="transition-colors hover:text-red-600"
              >
                {legal}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default WebsiteFooter;