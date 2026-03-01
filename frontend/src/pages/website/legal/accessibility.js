import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
// Using standard stable icons
import { 
  Accessibility, Check, Keyboard, Eye, 
  Monitor, Mail, Phone, ExternalLink, 
  ChevronRight, ArrowRight, MousePointer
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';

// --- Data: Navigation Links ---
const SECTIONS = [
  { id: 'commitment', label: '1. Our Commitment' },
  { id: 'standards', label: '2. Standards & Guidelines' },
  { id: 'features', label: '3. Accessibility Features' },
  { id: 'feedback', label: '4. Feedback & Support' },
];

export default function AccessibilityPage() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50">
      <Head>
        <title>Accessibility Statement | HomeRatesYard</title>
        <meta name="description" content="Our commitment to making the HomeRatesYard website accessible and inclusive for everyone." />
      </Head>

      <main>
        
        {/* 1. HERO SECTION (Consistent Red/Orange Theme) */}
        <section className="relative h-[200px] md:h-[260px] flex items-center justify-center overflow-hidden bg-red-900">
          {/* Stock Image */}
          <img 
            src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1400&auto=format&fit=crop" 
            alt="Inclusive Technology" 
            className="absolute inset-0 object-cover w-full h-full opacity-30 mix-blend-overlay"
          />
          {/* Brand Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-orange-600 opacity-90 mix-blend-multiply"></div>
          
          {/* Content */}
          <div className="relative z-10 px-4 mt-6 text-center">
            <h1 className="flex items-center justify-center gap-3 mb-2 text-3xl font-bold text-white font-display md:text-5xl drop-shadow-md">
              <Accessibility size={36} className="text-white/80" />
              Accessibility
            </h1>
            <p className="max-w-2xl mx-auto text-lg font-regular text-white/90">
              Building a digital experience that works for everyone.
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
                  <MousePointer size={18} className="text-red-600" /> Contents
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
                    href="https://www.w3.org/WAI/standards-guidelines/wcag/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-bold transition-all text-slate-400 hover:gap-2 hover:text-red-600"
                  >
                    About WCAG Guidelines <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* RIGHT: Content */}
            <div className="space-y-16 lg:col-span-9">
              
              {/* Summary Card */}
              <div className="p-8 text-white shadow-xl bg-slate-900 rounded-xl">
                <div className="flex flex-col items-start gap-8 md:flex-row">
                  <div className="flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-sm shrink-0">
                    <Accessibility size={32} className="text-orange-400" />
                  </div>
                  <div>
                    <h3 className="mb-3 text-xl font-bold text-orange-400">Inclusive by Design</h3>
                    <p className="mb-6 leading-relaxed text-slate-300">
                      HomeRatesYard is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm font-regular">
                      <span className="flex items-center gap-2 text-orange-400 bg-orange-400/10 px-3 py-1.5 rounded-full border border-orange-400/20">
                        <Check size={14} /> WCAG 2.1 AA Target
                      </span>
                      <span className="flex items-center gap-2 text-orange-400 bg-orange-400/10 px-3 py-1.5 rounded-full border border-orange-400/20">
                        <Check size={14} /> Screen Reader Friendly
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 1: Commitment */}
              <div id="commitment" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">1</span>
                  Our Commitment
                </h2>
                <div className="p-8 bg-white border shadow-sm border-slate-200 rounded-2xl">
                  <p className="mb-4 text-lg font-medium text-slate-900">
                    We believe financial freedom should be accessible to everyone.
                  </p>
                  <p className="leading-relaxed text-slate-600">
                    Accessing mortgage information is a critical part of the homebuying process. We strive to ensure that our tools, calculators, and educational content are usable by individuals with visual, auditory, motor, and cognitive disabilities. We treat accessibility not as a checkbox, but as a core requirement of our user experience.
                  </p>
                </div>
              </div>

              <div className="w-full h-px bg-slate-200"></div>

              {/* Section 2: Standards */}
              <div id="standards" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">2</span>
                  Conformance Status
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                    <h4 className="flex items-center gap-2 mb-3 font-bold text-slate-900">
                      <Monitor size={18} className="text-blue-600" /> The Standard
                    </h4>
                    <p className="text-sm leading-relaxed text-slate-600">
                      The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA.
                    </p>
                  </div>
                  <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                    <h4 className="flex items-center gap-2 mb-3 font-bold text-slate-900">
                      <Check size={18} className="text-green-600" /> Our Status
                    </h4>
                    <p className="text-sm leading-relaxed text-slate-600">
                      HomeRatesYard is partially conformant with <strong>WCAG 2.1 level AA</strong>. Partially conformant means that some parts of the content may not yet fully conform to the accessibility standard, though we are actively working to remediate these areas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-slate-200"></div>

              {/* Section 3: Features */}
              <div id="features" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">3</span>
                  Accessibility Features
                </h2>
                <p className="mb-6 text-slate-600">
                  We have implemented specific technical measures to support assistive technologies:
                </p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  
                  <div className="p-6 transition-colors border bg-slate-50 border-slate-100 rounded-2xl hover:border-red-200">
                    <div className="flex items-center justify-center w-10 h-10 mb-4 bg-white rounded-full shadow-sm text-slate-700">
                      <Keyboard size={20} />
                    </div>
                    <h4 className="mb-2 font-bold text-slate-900">Keyboard Navigation</h4>
                    <p className="text-sm text-slate-500">
                      Interactive elements like calculators and forms are navigable using only a keyboard.
                    </p>
                  </div>

                  <div className="p-6 transition-colors border bg-slate-50 border-slate-100 rounded-2xl hover:border-red-200">
                    <div className="flex items-center justify-center w-10 h-10 mb-4 bg-white rounded-full shadow-sm text-slate-700">
                      <Eye size={20} />
                    </div>
                    <h4 className="mb-2 font-bold text-slate-900">Visual Contrast</h4>
                    <p className="text-sm text-slate-500">
                      We maintain high contrast ratios for text and UI elements to aid users with low vision.
                    </p>
                  </div>

                  <div className="p-6 transition-colors border bg-slate-50 border-slate-100 rounded-2xl hover:border-red-200">
                    <div className="flex items-center justify-center w-10 h-10 mb-4 bg-white rounded-full shadow-sm text-slate-700">
                      <Monitor size={20} />
                    </div>
                    <h4 className="mb-2 font-bold text-slate-900">Responsive Design</h4>
                    <p className="text-sm text-slate-500">
                      Content reflows and scales correctly up to 200% zoom without loss of information.
                    </p>
                  </div>

                </div>
              </div>

              <div className="w-full h-px bg-slate-200"></div>

              {/* Section 4: Feedback */}
              <div id="feedback" className="scroll-mt-28">
                <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-red-600 border border-red-100 rounded-full bg-red-50">4</span>
                  Feedback & Support
                </h2>
                <div className="p-8 border bg-slate-50 border-slate-200 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <Mail size={24} className="mt-1 text-slate-500 shrink-0" />
                    <div>
                      <p className="mb-6 text-sm leading-relaxed text-slate-600">
                        We welcome your feedback on the accessibility of HomeRatesYard. Please let us know if you encounter accessibility barriers on our site. We aim to respond to feedback within 2 business days.
                      </p>
                      
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <a href="mailto:accessibility@homeratesyard.com" className="flex items-center gap-3 p-4 transition-colors bg-white border border-slate-200 rounded-xl hover:border-red-200 group">
                          <div className="flex items-center justify-center w-8 h-8 text-red-600 transition-colors rounded-full bg-red-50 group-hover:bg-red-600 group-hover:text-white">
                            <Mail size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase text-slate-400">Email Us</p>
                            <p className="font-bold text-slate-900">accessibility@homeratesyard.com</p>
                          </div>
                        </a>

                        <a href="tel:+18885550199" className="flex items-center gap-3 p-4 transition-colors bg-white border border-slate-200 rounded-xl hover:border-red-200 group">
                          <div className="flex items-center justify-center w-8 h-8 text-red-600 transition-colors rounded-full bg-red-50 group-hover:bg-red-600 group-hover:text-white">
                            <Phone size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase text-slate-400">Call Us (Toll Free)</p>
                            <p className="font-bold text-slate-900">1-888-555-0199</p>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
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

AccessibilityPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;