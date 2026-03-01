import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
// Standard stable icons
import { 
  Gavel, FileText, Shield, AlertTriangle, 
  CheckCircle, XCircle, ArrowRight, Globe, 
  ChevronRight, Scale, Lock, Ban
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';

// --- Data: Navigation Links ---
const SECTIONS = [
  { id: 'acceptance', label: '1. Acceptance of Terms' },
  { id: 'eligibility', label: '2. Eligibility & Accounts' },
  { id: 'usage', label: '3. Acceptable Use' },
  { id: 'intellectual', label: '4. Intellectual Property' },
  { id: 'liability', label: '5. Limitation of Liability' },
  { id: 'dispute', label: '6. Dispute Resolution' },
  { id: 'changes', label: '7. Changes to Terms' },
];

export default function TermsOfService() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50">
      <Head>
        <title>Terms of Service | HomeRatesYard</title>
        <meta name="description" content="Terms and conditions governing the use of the HomeRatesYard platform and services." />
      </Head>

      <main>
        
        {/* 1. HERO SECTION (Consistent Red/Orange Theme) */}
        <section className="relative h-[200px] md:h-[260px] flex items-center justify-center overflow-hidden bg-red-900">
          {/* Stock Image */}
          <img 
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1400&auto=format&fit=crop" 
            alt="Legal Contract" 
            className="absolute inset-0 object-cover w-full h-full opacity-30 mix-blend-overlay"
          />
          {/* Brand Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-orange-600 opacity-90 mix-blend-multiply"></div>
          
          {/* Content */}
          <div className="relative z-10 px-4 mt-6 text-center">
            <h1 className="flex items-center justify-center gap-3 mb-2 text-3xl font-bold text-white font-display md:text-5xl drop-shadow-md">
              <Gavel size={36} className="text-white/80" />
              Terms of Service
            </h1>
            <p className="max-w-2xl mx-auto text-lg font-regular text-white/90">
              The rules of the road for using our platform.
            </p>
            <p className="mt-4 text-xs font-bold tracking-widest text-orange-200 uppercase">
              Effective Date: October 24, 2025
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
                    Legal questions? <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT: Policy Content */}
            <div className="space-y-16 lg:col-span-9">
              
              {/* Summary Card */}
              <div className="p-8 text-white shadow-xl bg-slate-900 rounded-xl">
                <div className="flex flex-col items-start gap-8 md:flex-row">
                  <div className="flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-sm shrink-0">
                    <Scale size={32} className="text-orange-400" />
                  </div>
                  <div>
                    <h3 className="mb-3 text-xl font-bold text-white">Agreement Overview</h3>
                    <p className="mb-6 leading-relaxed text-slate-300">
                      By accessing HomeRatesYard, you agree to these terms. We provide mortgage information and connection services. We are a lender, but specific loan terms depend on your qualifications and verification.
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm font-medium">
                      <span className="flex items-center gap-2 text-orange-400 bg-orange-400/10 px-3 py-1.5 rounded-full border border-orange-400/20">
                        <CheckCircle size={14} /> Binding Contract
                      </span>
                      <span className="flex items-center gap-2 text-orange-400 bg-orange-400/10 px-3 py-1.5 rounded-full border border-orange-400/20">
                        <CheckCircle size={14} /> US Residents Only
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 1: Acceptance */}
              <div id="acceptance" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">1</span>
                  Acceptance of Terms
                </h2>
                <div className="prose max-w-none text-slate-600 prose-slate">
                  <p>
                    These Terms of Service ("Terms") constitute a legally binding agreement between you ("User") and HomeRatesYard Inc. ("Company," "we," "us"). By accessing or using our website, mobile applications, or services (collectively, the "Services"), you acknowledge that you have read, understood, and agree to be bound by these Terms.
                  </p>
                  <p className="p-4 mt-4 text-sm text-red-800 border-l-4 border-red-500 rounded-r-lg bg-red-50">
                    <strong>Important:</strong> If you do not agree to these Terms, you must strictly stop using our Services immediately.
                  </p>
                </div>
              </div>

              <div className="w-full h-px bg-slate-200"></div>

              {/* Section 2: Eligibility */}
              <div id="eligibility" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">2</span>
                  Eligibility & Accounts
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                    <h4 className="flex items-center gap-2 mb-4 font-bold text-slate-900">
                      <CheckCircle size={18} className="text-green-600" /> Requirements
                    </h4>
                    <ul className="space-y-3 text-sm text-slate-600">
                      <li>• You must be at least 18 years old.</li>
                      <li>• You must be a legal resident of the United States.</li>
                      <li>• You must have the capacity to form a binding contract.</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                    <h4 className="flex items-center gap-2 mb-4 font-bold text-slate-900">
                      <Lock size={18} className="text-blue-600" /> Account Security
                    </h4>
                    <p className="text-sm leading-relaxed text-slate-600">
                      You are responsible for maintaining the confidentiality of your login credentials. You agree to notify us immediately of any unauthorized access to your account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-slate-200"></div>

              {/* Section 3: Usage */}
              <div id="usage" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">3</span>
                  Acceptable Use
                </h2>
                <p className="mb-6 text-slate-600">
                  You agree to use our Services only for lawful purposes. You are strictly prohibited from:
                </p>
                <div className="p-6 border border-red-100 bg-red-50/50 rounded-2xl">
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[
                      "Using automated bots or scrapers to access data.",
                      "Reverse engineering our pricing algorithms.",
                      "Submitting false or misleading financial information.",
                      "Interfering with the security features of the site.",
                      "Reselling our data or services to third parties.",
                      "Harassing our employees or other users."
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Ban size={18} className="mt-0.5 text-red-500 shrink-0" />
                        <span className="text-sm font-medium text-red-900">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="w-full h-px bg-slate-200"></div>

              {/* Section 4: IP */}
              <div id="intellectual" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">4</span>
                  Intellectual Property
                </h2>
                <div className="flex gap-6 p-6 bg-white border border-slate-200 rounded-2xl">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-600">
                      <Shield size={24} />
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 text-lg font-bold text-slate-900">Ownership</h4>
                    <p className="mb-4 text-sm leading-relaxed text-slate-600">
                      The content, visual interfaces, interactive features, information, graphics, design, computer code, and all other elements of the Services are protected by copyright, trade dress, patent, and trademark laws. All materials are the property of HomeRatesYard or our licensors.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-slate-200"></div>

              {/* Section 5: Liability */}
              <div id="liability" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">5</span>
                  Limitation of Liability
                </h2>
                <div className="p-8 border bg-slate-100 border-slate-200 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <AlertTriangle size={24} className="mt-1 text-slate-500 shrink-0" />
                    <div className="text-sm leading-relaxed uppercase text-slate-600">
                      <p className="mb-4">
                        <strong>To the fullest extent permitted by law:</strong>
                      </p>
                      <p className="mb-4">
                        (A) HomeRatesYard shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
                      </p>
                      <p>
                        (B) Rates provided are estimates until locked. We do not guarantee that you will qualify for the rates displayed until a full underwriting review is complete.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-slate-200"></div>

              {/* Section 6: Dispute */}
              <div id="dispute" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">6</span>
                  Dispute Resolution
                </h2>
                <p className="mb-6 text-slate-600">
                  Any dispute arising from these Terms or your use of the Services will be settled by binding arbitration in the state of <strong>Delaware</strong>, rather than in court. You are giving up the right to litigate (or participate in as a party or class member) all disputes in court before a judge or jury.
                </p>
              </div>

              <div className="w-full h-px bg-slate-200"></div>

              {/* Section 7: Changes */}
              <div id="changes" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">7</span>
                  Changes to Terms
                </h2>
                <p className="text-slate-600">
                  We reserve the right to modify these Terms at any time. We will provide notice of significant changes by updating the "Effective Date" at the top of this page or by sending you an email. Your continued use of the Services after such changes constitutes your acceptance of the new Terms.
                </p>
              </div>

              {/* Contact Footer */}
              <div className="p-8 text-center border bg-slate-50 rounded-xl border-slate-200">
                <h3 className="mb-2 text-lg font-bold text-slate-900">Questions about these Terms?</h3>
                <p className="mb-6 text-sm text-slate-500">Our legal team is available to clarify any points of confusion.</p>
                <div className="flex justify-center gap-4">
                  <a href="mailto:legal@homeratesyard.com" className="inline-flex items-center gap-2 px-6 py-3 font-medium transition-colors bg-white border rounded-md shadow-sm border-slate-200 text-slate-700 hover:border-red-200 hover:text-red-600">
                    <Globe size={16} /> legal@homeratesyard.com
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

TermsOfService.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;