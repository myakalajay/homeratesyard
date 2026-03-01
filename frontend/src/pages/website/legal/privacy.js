import React from 'react';
import Head from 'next/head';
import Link from 'next/link'; // This is the Next.js Link component
import { 
  Shield, Lock, FileText, CheckCircle, 
  HelpCircle, XCircle, Server, Globe, 
  ChevronRight, Cookie, Scale, Clock, 
  ArrowRight // Used for icons instead of 'Link' icon to avoid conflict
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';

// --- Data: Navigation Links ---
const SECTIONS = [
  { id: 'collection', label: '1. Data Collection' },
  { id: 'usage', label: '2. How We Use Data' },
  { id: 'sharing', label: '3. Data Sharing' },
  { id: 'cookies', label: '4. Cookies & Tracking' },
  { id: 'security', label: '5. Security Protocols' },
  { id: 'retention', label: '6. Data Retention' },
  { id: 'rights', label: '7. Your Rights (CCPA)' },
];

export default function PrivacyPolicy() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50">
      <Head>
        <title>Privacy Policy | HomeRatesYard</title>
        <meta name="description" content="How HomeRatesYard collects, uses, and protects your personal financial information." />
      </Head>

      <main>
        
        {/* 1. HERO SECTION (Consistent Red/Orange Theme) */}
        <section className="relative h-[200px] md:h-[260px] flex items-center justify-center overflow-hidden bg-red-900">
          {/* Stock Image */}
          <img 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1400&auto=format&fit=crop" 
            alt="Cybersecurity and Trust" 
            className="absolute inset-0 object-cover w-full h-full opacity-30 mix-blend-overlay"
          />
          {/* Brand Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-orange-600 opacity-90 mix-blend-multiply"></div>
          
          {/* Content */}
          <div className="relative z-10 px-4 mt-6 text-center">
            <h1 className="flex items-center justify-center gap-3 mb-2 text-3xl font-bold text-white font-display md:text-5xl drop-shadow-md">
              <Lock size={36} className="text-white/80" />
              Privacy Policy
            </h1>
            <p className="max-w-2xl mx-auto text-lg font-medium text-white/90">
              Your trust is our currency. Here is how we protect it.
            </p>
            <p className="mt-4 text-xs font-bold tracking-widest text-orange-200 uppercase">
              Last Updated: October 24, 2023
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
                  <Link href="/contact" className="flex items-center gap-1 text-xs font-bold transition-all text-slate-400 hover:gap-2 hover:text-red-600">
                    Have questions? <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT: Policy Content */}
            <div className="space-y-16 lg:col-span-9">
              
              {/* Trust Summary Card */}
              <div className="p-8 text-white shadow-xl bg-slate-900 rounded-xl">
                <div className="flex flex-col items-start gap-8 md:flex-row">
                  <div className="flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-sm shrink-0">
                    <Shield size={32} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="mb-3 text-xl font-bold text-white">Our Promise to You</h3>
                    <p className="mb-6 leading-relaxed text-slate-300">
                      HomeRatesYard is built on trust. We collect only what is necessary to secure your loan, we encrypt everything, and we <strong>never</strong> sell your personal information to third-party ad networks.
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm font-bold">
                      <span className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
                        <CheckCircle size={14} /> No Data Selling
                      </span>
                      <span className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
                        <CheckCircle size={14} /> 256-bit AES Security
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 1: Collection */}
              <div id="collection" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">1</span>
                  Information We Collect
                </h2>
                <p className="mb-6 leading-relaxed text-slate-600">
                  To provide accurate mortgage quotes and comply with federal lending laws, we must collect specific data points. We categorize these into two buckets:
                </p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                    <h4 className="flex items-center gap-2 mb-4 font-bold text-slate-900">
                      <FileText size={18} className="text-blue-600" /> You Provide
                    </h4>
                    <ul className="space-y-3 text-sm text-slate-600">
                      <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5"></div>Identity (Name, SSN for credit check)</li>
                      <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5"></div>Contact (Email, Phone, Current Address)</li>
                      <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5"></div>Financials (Income, Assets, Employment)</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                    <h4 className="flex items-center gap-2 mb-4 font-bold text-slate-900">
                      <Server size={18} className="text-orange-600" /> Automated Collection
                    </h4>
                    <ul className="space-y-3 text-sm text-slate-600">
                      <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5"></div>Device Info (IP Address, Browser Type)</li>
                      <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5"></div>Usage Data (Pages visited, Time on site)</li>
                      <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5"></div>Cookies (Session management)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-slate-200"></div>

              {/* Section 2: Usage */}
              <div id="usage" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">2</span>
                  How We Use It
                </h2>
                <div className="prose max-w-none text-slate-600 prose-slate">
                  <p>
                    We are in the business of lending, not advertising. Your data is used exclusively to:
                  </p>
                  <ul className="grid grid-cols-1 gap-4 pl-0 mt-4 list-none md:grid-cols-2">
                    {[
                      "Generate custom rate quotes based on credit profile.",
                      "Verify identity to prevent fraud (Patriot Act).",
                      "Underwrite your loan application.",
                      "Service your loan after closing."
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50 border-slate-100">
                        <CheckCircle size={16} className="text-green-500 shrink-0" />
                        <span className="text-sm font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="w-full h-px bg-slate-200"></div>

              {/* Section 3: Sharing */}
              <div id="sharing" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">3</span>
                  Sharing & Disclosure
                </h2>
                <p className="mb-6 text-slate-600">
                  We categorize sharing into "Essential for Loan" and "Never Allowed."
                </p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  
                  {/* DO Share */}
                  <div className="p-6 border bg-emerald-50/50 border-emerald-100 rounded-2xl">
                    <h4 className="flex items-center gap-2 mb-4 font-bold text-emerald-800">
                      <CheckCircle size={18} /> Necessary Partners
                    </h4>
                    <p className="mb-4 text-sm text-emerald-700/80">We must share data with these parties to close your loan:</p>
                    <ul className="space-y-2 text-sm font-medium text-emerald-900">
                      <li>• Credit Bureaus (TransUnion, Equifax, Experian)</li>
                      <li>• Title & Escrow Companies</li>
                      <li>• Property Appraisers</li>
                      <li>• Government Agencies (FHA, VA, Fannie Mae)</li>
                    </ul>
                  </div>

                  {/* DON'T Share */}
                  <div className="p-6 border border-red-100 bg-red-50/50 rounded-2xl">
                    <h4 className="flex items-center gap-2 mb-4 font-bold text-red-800">
                      <XCircle size={18} /> Strictly Prohibited
                    </h4>
                    <p className="mb-4 text-sm text-red-700/80">We will never share your data with:</p>
                    <ul className="space-y-2 text-sm font-medium text-red-900">
                      <li>• Third-party marketing agencies</li>
                      <li>• Data brokers</li>
                      <li>• Unrelated affiliates for cross-selling</li>
                      <li>• Public databases</li>
                    </ul>
                  </div>

                </div>
              </div>

              <div className="w-full h-px bg-slate-200"></div>

              {/* Section 4: Cookies */}
              <div id="cookies" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">4</span>
                  Cookies & Tracking
                </h2>
                <div className="flex gap-6 p-6 bg-white border border-slate-200 rounded-2xl">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 text-orange-500 rounded-full bg-orange-50">
                      <Cookie size={24} />
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 text-lg font-bold text-slate-900">How we use cookies</h4>
                    <p className="mb-4 text-sm leading-relaxed text-slate-600">
                      We use cookies to maintain your session (so you don't have to log in on every page) and to analyze site performance. You can disable cookies in your browser, but some mortgage application features may not function correctly.
                    </p>
                    <Link href="/cookies" className="text-sm font-bold text-red-600 hover:text-red-700">
                      View Cookie Policy &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-slate-200"></div>

              {/* Section 5: Security */}
              <div id="security" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">5</span>
                  Security Protocols
                </h2>
                <div className="p-8 bg-white border shadow-sm border-slate-200 rounded-2xl">
                  <div className="flex flex-col items-center gap-8 md:flex-row">
                    <div className="flex items-center justify-center w-24 h-24 text-blue-600 rounded-full bg-blue-50 shrink-0">
                      <Lock size={40} />
                    </div>
                    <div>
                      <h4 className="mb-2 text-lg font-bold text-slate-900">Defense in Depth</h4>
                      <p className="mb-4 text-sm leading-relaxed text-slate-600">
                        Our security infrastructure is designed by experts from top financial institutions. We employ multiple layers of defense:
                      </p>
                      <div className="grid grid-cols-1 text-sm font-bold gap-x-8 gap-y-2 text-slate-700 sm:grid-cols-2">
                        <span className="flex items-center gap-2"><CheckCircle size={14} className="text-blue-500"/> AES-256 Data Encryption</span>
                        <span className="flex items-center gap-2"><CheckCircle size={14} className="text-blue-500"/> SOC 2 Type II Compliant</span>
                        <span className="flex items-center gap-2"><CheckCircle size={14} className="text-blue-500"/> TLS 1.3 for Transit</span>
                        <span className="flex items-center gap-2"><CheckCircle size={14} className="text-blue-500"/> Biometric Access Control</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-slate-200"></div>

              {/* Section 6: Retention */}
              <div id="retention" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">6</span>
                  Data Retention
                </h2>
                <div className="flex gap-4">
                  <Clock size={24} className="mt-1 text-slate-400 shrink-0" />
                  <p className="text-slate-600">
                    We retain personal data only as long as necessary to fulfill the purposes for which it was collected, including satisfying any legal, accounting, or reporting requirements. For mortgage applications, federal law typically requires us to retain records for a minimum of <strong>3 to 7 years</strong>.
                  </p>
                </div>
              </div>

              <div className="w-full h-px bg-slate-200"></div>

              {/* Section 7: CCPA / Rights */}
              <div id="rights" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">7</span>
                  Your Rights (CCPA/GDPR)
                </h2>
                <div className="p-6 border bg-slate-50 border-slate-200 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <Scale size={24} className="mt-1 text-slate-500" />
                    <div>
                      <h4 className="mb-2 text-lg font-bold text-slate-900">California Privacy Rights</h4>
                      <p className="mb-4 text-sm text-slate-600">
                        If you are a California resident, the CCPA grants you specific rights regarding your personal information:
                      </p>
                      <ul className="space-y-2 text-sm list-disc list-inside text-slate-700">
                        <li><strong>Right to Know:</strong> Request details about the categories of data we collect.</li>
                        <li><strong>Right to Delete:</strong> Request deletion of your personal info (subject to federal retention laws).</li>
                        <li><strong>Right to Opt-Out:</strong> We do not sell data, but you can opt-out of optional sharing.</li>
                        <li><strong>Non-Discrimination:</strong> We will not deny services for exercising these rights.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Footer */}
              <div className="p-8 text-center border bg-slate-50 rounded-2xl border-slate-200">
                <h3 className="mb-2 text-lg font-bold text-slate-900">Still have privacy concerns?</h3>
                <p className="mb-6 text-sm text-slate-500">Our Data Protection Officer is available to answer specific questions regarding your data.</p>
                <div className="flex justify-center gap-4">
                  <a href="mailto:privacy@homeratesyard.com" className="inline-flex items-center gap-2 px-6 py-3 font-medium transition-colors bg-white border rounded-md shadow-sm border-slate-200 text-slate-700 hover:border-red-200 hover:text-red-600">
                    <Globe size={16} /> privacy@homeratesyard.com
                  </a>
                  <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 font-medium text-white transition-all transform rounded-md bg-slate-900 hover:bg-red-600 hover:shadow-lg">
                    Contact Support
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>

        <FinalCTA />
      </main>
    </div>
  );
}

PrivacyPolicy.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;