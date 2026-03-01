import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowUp, Accessibility, Eye, Type, X, LineChart, TrendingDown, Home as HomeIcon } from 'lucide-react';

// Layout & Critical Above-the-Fold Content
import PublicLayout from '@/components/layout/PublicLayout';
import HeroEngine from '@/components/marketing/hero/HeroEngine'; // Keep Static for LCP

// ⚡ PERFORMANCE: Lazy Load Below-the-Fold Components
const TrustStream = dynamic(() => import('@/components/marketing/truststream'), { ssr: false });
const FeatureShowcase = dynamic(() => import('@/components/marketing/feature'));
const ProcessTimeline = dynamic(() => import('@/components/marketing/process'));
const SavingsSimulator = dynamic(() => import('@/components/marketing/calculator'), { ssr: false });
const ComparisonTable = dynamic(() => import('@/components/marketing/comparison'));
const SuccessStories = dynamic(() => import('@/components/marketing/stories'));
const FinalCTA = dynamic(() => import('@/components/marketing/cta'));

export default function LandingPage() {
  // Accessibility States (Persisted)
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);

  // 💾 Load Preferences on Mount
  useEffect(() => {
    const savedContrast = localStorage.getItem('acc_contrast') === 'true';
    const savedText = localStorage.getItem('acc_text') === 'true';
    setHighContrast(savedContrast);
    setLargeText(savedText);
  }, []);

  const toggleContrast = () => {
    const newVal = !highContrast;
    setHighContrast(newVal);
    localStorage.setItem('acc_contrast', newVal);
  };

  const toggleText = () => {
    const newVal = !largeText;
    setLargeText(newVal);
    localStorage.setItem('acc_text', newVal);
  };

  return (
    <div 
      className={`
        min-h-screen font-sans transition-colors duration-300
        ${highContrast ? 'bg-black text-yellow-400 grayscale' : 'bg-slate-50 text-slate-900'}
        ${largeText ? 'text-lg' : ''}
      `}
    >
      <Head>
        <title>HomeRatesYard | Enterprise Mortgage Platform</title>
        <meta name="description" content="AI-Powered Mortgage Origination. Verified Approvals in 14 minutes." />
        
        {/* 🌐 OpenGraph / Social Sharing */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="HomeRatesYard - The Future of Lending" />
        <meta property="og:description" content="Secure, fast, and transparent mortgage origination for the modern era." />
        <meta property="og:image" content="https://homeratesyard.com/og-image.jpg" />
      </Head>

      <FloatingUtilities 
        toggleContrast={toggleContrast} 
        toggleText={toggleText}
        isContrast={highContrast}
        isLarge={largeText}
      />

      <main>
        {/* 1. HERO (Critical LCP Element) */}
        <div className="relative z-20 bg-slate-50">
          <HeroEngine />
        </div>
        
        {/* 2. Social Proof */}
        <div className="relative z-10 bg-white border-y border-slate-100">
          <TrustStream />
        </div>
        
        {/* 3. Features */}
        <div className="relative z-10 bg-white">
          <FeatureShowcase />
        </div>
        
        {/* 4. How it works */}
        <div className="relative z-10 border-y border-slate-100 bg-slate-50">
          <ProcessTimeline />
        </div>
        
        {/* 5. Interactive Tool (Dark Mode Area) */}
        <div className="relative z-20 text-white bg-slate-900">
          <SavingsSimulator />
        </div>
        
        {/* 6. Comparison */}
        <div className="relative z-10 bg-white">
          <ComparisonTable />
        </div>
        
        {/* 7. Testimonials */}
        <div className="relative z-10 border-t border-slate-100 bg-slate-50">
          <SuccessStories />
        </div>
 
        {/* 8. Final CTA */}
        <div className="relative z-20 text-white bg-slate-900">
          <FinalCTA />
        </div>
      </main>

    </div>
  );
}

// Layout Wrapper
LandingPage.getLayout = function getLayout(page) {
  return <PublicLayout>{page}</PublicLayout>;
};

// --- SUB-COMPONENT: Tool Card ---
const ToolCard = ({ href, icon: Icon, title, description }) => (
  <Link href={href} className="block group">
    <div className="h-full p-8 transition-all duration-300 border shadow-sm bg-slate-50 rounded-3xl border-slate-200 hover:-translate-y-1 hover:shadow-xl hover:border-red-200 hover:bg-white">
      <div className="flex items-center justify-center w-12 h-12 mb-6 text-red-600 transition-colors bg-red-100 rounded-2xl group-hover:bg-red-600 group-hover:text-white">
        <Icon size={24} />
      </div>
      <h3 className="mb-3 text-xl font-bold transition-colors text-slate-900 group-hover:text-red-600">{title}</h3>
      <p className="text-sm font-medium leading-relaxed text-slate-500">{description}</p>
    </div>
  </Link>
);

// --- SUB-COMPONENT: Floating Utilities ---
function FloatingUtilities({ toggleContrast, toggleText, isContrast, isLarge }) {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
        if (window.scrollY > 400) setShowTopBtn(true);
        else setShowTopBtn(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="fixed left-6 bottom-6 z-[90] flex flex-col gap-3 items-start pointer-events-none">
      
      {/* Scroll Top Button */}
      <button
        onClick={scrollToTop}
        className={`
          pointer-events-auto
          p-3 rounded-full shadow-lg border border-slate-200 transition-all duration-300
          ${showTopBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
          bg-white text-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600
        `}
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} />
      </button>

      {/* Accessibility Menu */}
      <div className="relative pointer-events-auto">
        {menuOpen && (
          <div className="absolute left-0 w-56 p-3 mb-2 duration-200 bg-white border shadow-2xl bottom-14 border-slate-200 rounded-xl animate-in slide-in-from-left-5 fade-in">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Accessibility</span>
              <button onClick={() => setMenuOpen(false)} className="p-1 rounded hover:bg-slate-100">
                <X size={14} className="text-slate-400" />
              </button>
            </div>
            
            <button 
              onClick={toggleContrast}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors ${
                isContrast 
                  ? 'bg-yellow-100 text-black font-bold border-2 border-black' 
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Eye size={16} /> High Contrast
            </button>
            
            <button 
              onClick={toggleText}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isLarge 
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' 
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Type size={16} /> Larger Text
            </button>
          </div>
        )}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`
            pointer-events-auto
            p-3 rounded-full shadow-lg border transition-all duration-200
            ${menuOpen 
              ? 'bg-slate-900 text-white border-slate-900 rotate-90' 
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}
          `}
          aria-label="Accessibility options"
        >
          <Accessibility size={22} />
        </button>
      </div>

    </div>
  );
}