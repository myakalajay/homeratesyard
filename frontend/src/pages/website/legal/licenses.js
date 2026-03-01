import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
// Using standard stable icons
import { 
  FileBadge, Map, Scale, Shield, 
  AlertCircle, CheckCircle, ArrowRight, 
  ExternalLink, Building2, ChevronRight,
  FileText
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';

// --- Data: Navigation Links ---
const SECTIONS = [
  { id: 'nmls', label: '1. NMLS Information' },
  { id: 'states', label: '2. State Licenses' },
  { id: 'federal', label: '3. Federal Disclosures' },
  { id: 'equal', label: '4. Equal Housing Lender' },
  { id: 'complaints', label: '5. Consumer Complaints' },
];

// --- Data: Mock State Licenses ---
const STATE_LICENSES = [
  { state: "California", agency: "DFPI", license: "Financing Law License #60DBO-12345" },
  { state: "Texas", agency: "SML", license: "Mortgage Banker Registration" },
  { state: "Florida", agency: "OFR", license: "Mortgage Lender License #MLD1234" },
  { state: "New York", agency: "DFS", license: "Mortgage Banker License #B500123" },
  { state: "Virginia", agency: "BFI", license: "Lender License #MC-5555" },
  { state: "Colorado", agency: "DRE", license: "Mortgage Company Registration" },
];

export default function LicensesPage() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50">
      <Head>
        <title>Licenses & Disclosures | HomeRatesYard</title>
        <meta name="description" content="View HomeRatesYard's NMLS access information, state licensing details, and federal legal disclosures." />
      </Head>

      <main>
        
        {/* 1. HERO SECTION (Consistent Red/Orange Theme) */}
        <section className="relative h-[200px] md:h-[260px] flex items-center justify-center overflow-hidden bg-red-900">
          {/* Stock Image */}
          <img 
            src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1400&auto=format&fit=crop" 
            alt="Regulatory Compliance" 
            className="absolute inset-0 object-cover w-full h-full opacity-30 mix-blend-overlay"
          />
          {/* Brand Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-orange-600 opacity-90 mix-blend-multiply"></div>
          
          {/* Content */}
          <div className="relative z-10 px-4 mt-6 text-center">
            <h1 className="flex items-center justify-center gap-3 mb-2 text-3xl font-bold text-white font-display md:text-5xl drop-shadow-md">
              <FileBadge size={36} className="text-white/80" />
              Licenses & Disclosures
            </h1>
            <p className="max-w-2xl mx-auto text-lg font-regular text-white/90">
              Transparency is the law. Here are our credentials.
            </p>
            <p className="mt-4 text-xs font-bold tracking-widest text-orange-200 uppercase">
              NMLS Unique Identifier: #103920
            </p>
          </div>
        </section>

        {/* 2. MAIN CONTENT LAYOUT */}
        <div className="container px-4 py-12 mx-auto max-w-7xl md:py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            
            {/* LEFT: Sticky Table of Contents (Desktop) */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky p-6 bg-white border shadow-sm top-28 border-slate-200 rounded-2xl">
                <h4 className="flex items-center gap-2 mb-4 font-bold text-slate-900">
                  <FileText size={18} className="text-red-600" /> Contents
                </h4>
                <ul className="space-y-1">
                  {SECTIONS.map((section) => (
                    <li key={section.id}>
                      <button 
                        onClick={() => scrollToSection(section.id)}
                        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-left transition-colors rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700 group"
                      >
                        {section.label}
                        <ChevronRight size={14} className="text-red-400 transition-opacity opacity-0 group-hover:opacity-100" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="pt-6 mt-8 border-t border-slate-100">
                  <a 
                    href="https://www.nmlsconsumeraccess.org/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold transition-all text-slate-400 hover:gap-2 hover:text-red-600"
                  >
                    Verify at NMLS Consumer Access <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* RIGHT: Content */}
            <div className="space-y-16 lg:col-span-9">
              
              {/* Trust Summary Card */}
              <div className="p-8 text-white shadow-xl bg-slate-900 rounded-xl">
                <div className="flex flex-col items-start gap-8 md:flex-row">
                  <div className="flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-sm shrink-0">
                    <Scale size={32} className="text-orange-400" />
                  </div>
                  <div>
                    <h3 className="mb-3 text-xl font-bold text-orange-400">Authorized & Regulated</h3>
                    <p className="mb-6 leading-relaxed font-regular text-slate-300">
                      HomeRatesYard Inc. is a licensed mortgage lender approved by federal and state regulatory bodies. We operate in strict compliance with the Secure and Fair Enforcement for Mortgage Licensing Act (SAFE Act).
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm font-regular">
                      <span className="flex items-center gap-2 text-orange-400 bg-orange-400/10 px-3 py-1.5 rounded-full border border-orange-400/20">
                        <CheckCircle size={14} /> NMLS #103920
                      </span>
                      <span className="flex items-center gap-2 text-orange-400 bg-orange-400/10 px-3 py-1.5 rounded-full border border-orange-400/20">
                        <CheckCircle size={14} /> Equal Housing Lender
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 1: NMLS */}
              <div id="nmls" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">1</span>
                  NMLS Information
                </h2>
                <div className="p-8 bg-white border shadow-sm border-slate-200 rounded-2xl">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-slate-900">Verify Our License</h3>
                      <p className="max-w-lg text-sm leading-relaxed text-slate-600">
                        The Nationwide Multistate Licensing System (NMLS) is the official system for companies and individuals in the mortgage industry. You can verify our standing at any time.
                      </p>
                    </div>
                    <div className="shrink-0">
                      <a 
                        href="https://www.nmlsconsumeraccess.org/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 font-medium text-white transition-all bg-red-600 rounded-md hover:bg-red-700 hover:shadow-lg"
                      >
                        Visit Consumer Access <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <p className="text-sm font-bold text-slate-900">
                      Company NMLS ID: <span className="font-mono text-base text-slate-500">103920</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-slate-200"></div>

              {/* Section 2: State Licenses */}
              <div id="states" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">2</span>
                  State Licenses
                </h2>
                <p className="mb-6 text-slate-600">
                  HomeRatesYard Inc. is licensed to originate mortgages in the following jurisdictions. 
                  <span className="italic"> (This is a representative list for display purposes).</span>
                </p>
                
                <div className="overflow-hidden bg-white border border-slate-200 rounded-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-6 py-4 font-bold">State</th>
                          <th className="px-6 py-4 font-bold">Regulatory Agency</th>
                          <th className="px-6 py-4 font-bold text-right">License Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {STATE_LICENSES.map((lic, index) => (
                          <tr key={index} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-bold text-slate-900">
                              <span className="flex items-center gap-2">
                                <Map size={16} className="text-slate-400" /> {lic.state}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{lic.agency}</td>
                            <td className="px-6 py-4 font-mono text-xs text-right text-slate-500">{lic.license}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 text-xs font-medium text-center border-t bg-slate-50 border-slate-100 text-slate-400">
                    Rates and terms are subject to change based on state regulations.
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-slate-200"></div>

              {/* Section 3: Federal Disclosures */}
              <div id="federal" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">3</span>
                  Federal Disclosures
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                    <h4 className="flex items-center gap-2 mb-3 font-bold text-slate-900">
                      <Shield size={18} className="text-blue-600" /> USA Patriot Act
                    </h4>
                    <p className="text-sm leading-relaxed text-slate-600">
                      To help the government fight the funding of terrorism and money laundering activities, Federal law requires all financial institutions to obtain, verify, and record information that identifies each person who opens an account.
                    </p>
                  </div>
                  <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                    <h4 className="flex items-center gap-2 mb-3 font-bold text-slate-900">
                      <FileText size={18} className="text-orange-600" /> HMDA Disclosure
                    </h4>
                    <p className="text-sm leading-relaxed text-slate-600">
                      The Home Mortgage Disclosure Act (HMDA) data about our residential mortgage lending is available online for review. The data shows the distribution of loans by geography and other variables.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-slate-200"></div>

              {/* Section 4: Equal Housing */}
              <div id="equal" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">4</span>
                  Equal Housing Lender
                </h2>
                <div className="p-8 bg-white border border-slate-200 rounded-2xl">
                  <div className="flex flex-col gap-6 md:flex-row">
                    <div className="shrink-0">
                      <div className="flex items-center justify-center w-16 h-16 border-2 border-slate-900 rounded-xl">
                        <Building2 size={32} className="text-slate-900" />
                      </div>
                    </div>
                    <div>
                      <p className="mb-4 text-sm leading-relaxed text-slate-600">
                        We conduct business in accordance with the Federal Fair Housing Law (The Fair Housing Amendments Act of 1988). It is illegal to discriminate against any person because of race, color, religion, sex, handicap, familial status, or national origin.
                      </p>
                      <p className="text-sm leading-relaxed text-slate-600">
                        Anyone who feels they have been discriminated against may file a complaint of housing discrimination:
                        <br/>
                        1-800-669-9777 (Toll Free) | 1-800-927-9275 (TDD)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-slate-200"></div>

              {/* Section 5: Complaints */}
              <div id="complaints" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">5</span>
                  Consumer Complaints
                </h2>
                <div className="p-8 border bg-slate-50 border-slate-200 rounded-xl">
                  <div className="flex items-start gap-4">
                    <AlertCircle size={24} className="mt-1 text-slate-500 shrink-0" />
                    <div>
                      <p className="mb-4 text-sm text-slate-600">
                        If you have a problem with the services provided by HomeRatesYard, please contact us first so we can resolve the issue.
                      </p>
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="p-4 bg-white border border-slate-200 rounded-xl grow">
                          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Direct Support</p>
                          <p className="font-bold text-slate-900">complaints@homeratesyard.com</p>
                        </div>
                        <div className="p-4 bg-white border border-slate-200 rounded-xl grow">
                          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Toll Free</p>
                          <p className="font-bold text-slate-900">1-888-555-0199</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Texas Disclaimer (Common Requirement) */}
              <div className="p-6 text-xs leading-relaxed text-center text-slate-400">
                <p>
                  <strong>TEXAS CONSUMERS:</strong> COMPLAINTS REGARDING THE SERVICING OF YOUR MORTGAGE SHOULD BE SENT TO THE DEPARTMENT OF SAVINGS AND MORTGAGE LENDING, 2601 NORTH LAMAR, SUITE 201, AUSTIN, TEXAS 78705. A TOLL-FREE CONSUMER HOTLINE IS AVAILABLE AT 1-877-276-5550.
                </p>
              </div>

            </div>
          </div>
        </div>

        <FinalCTA />
      </main>
    </div>
  );
}

LicensesPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;