'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router'; 
import { 
  Calculator, 
  MessageSquare, 
  Zap, 
  TrendingUp, 
  ChevronUp, // 🟢 FIX: Used ChevronUp instead of ArrowUp for cleaner UI
  ShieldCheck 
} from 'lucide-react';
import { cn } from '@/utils/utils';

// --- COMPONENT: Tooltip (Modernized with better contrast) ---
const WidgetTooltip = ({ text, sub, show }) => (
  <div 
    className={cn(
      "absolute left-full top-1/2 ml-3 -translate-y-1/2 px-3 py-2 text-xs text-white bg-slate-900 rounded-xl shadow-2xl whitespace-nowrap z-[100] transition-all duration-300 pointer-events-none border border-slate-700/50 backdrop-blur-md",
      show ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
    )}
  >
    <div className="flex flex-col gap-0.5">
      <p className="font-bold leading-none tracking-tight">{text}</p>
      {sub && <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest">{sub}</p>}
    </div>
    
    {/* Arrow Tip */}
    <div className="absolute -translate-y-1/2 border-[5px] border-transparent top-1/2 right-full border-r-slate-900"></div>
  </div>
);

export default function SideStickyWidget() {
  const router = useRouter();
  const pathname = router.pathname;
  
  const [hoveredId, setHoveredId] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // --- Scroll Logic: Show/Hide Top Button ---
  useEffect(() => {
    const handleScroll = () => {
      // Show button after 400px of scrolling
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // 🟢 Guard: Prevent widget from appearing on internal Dashboards or Auth flows
  // This prevents UI clutter where a sidebar already exists.
  if (!mounted) return null;
  const isInternalRoute = ['/borrower', '/lender', '/admin', '/super-admin', '/auth'].some(path => 
    pathname?.startsWith(path)
  );
  if (isInternalRoute) return null;

  const MENU_ITEMS = [
    { 
      id: 'rates', 
      label: "Live Rates", 
      sub: "Market Data", 
      icon: TrendingUp, 
      color: "text-blue-600", 
      activeBg: "bg-blue-50 border-blue-200",
      link: "/rates" 
    },
    { 
      id: 'calcs', 
      label: "Calculators", 
      sub: "Mortgage Math", 
      icon: Calculator, 
      color: "text-emerald-600", 
      activeBg: "bg-emerald-50 border-emerald-200",
      link: "/calculators" 
    },
    { 
      id: 'help', 
      label: "Expert Help", 
      sub: "Direct Support", 
      icon: MessageSquare, 
      color: "text-orange-600", 
      activeBg: "bg-orange-50 border-orange-200",
      link: "/support" 
    }
  ];

  const isActive = (link) => pathname === link || (link !== '/' && pathname?.startsWith(link));

  return (
    <div className="fixed z-[90] flex-col hidden gap-4 -translate-y-1/2 left-4 top-1/2 lg:flex animate-in fade-in slide-in-from-left-8 duration-700">
      
      {/* 1. MAIN NAVIGATION DOCK */}
      <div className="flex flex-col items-center p-2 bg-white/80 border shadow-2xl border-slate-200/60 rounded-[20px] backdrop-blur-xl ring-1 ring-black/[0.03]">
        
        <div className="flex flex-col gap-1.5">
          {MENU_ITEMS.map((item) => {
            const active = isActive(item.link);
            return (
              <Link key={item.id} href={item.link} className="relative">
                <div 
                  className={cn(
                    "relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 border border-transparent group cursor-pointer",
                    active 
                      ? `${item.activeBg} shadow-sm` 
                      : "hover:bg-white hover:border-slate-200 hover:shadow-md hover:-translate-y-0.5 active:scale-90"
                  )}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <item.icon 
                    size={20} 
                    strokeWidth={active ? 2.5 : 2}
                    className={cn(
                      "transition-all duration-300", 
                      active ? item.color : "text-slate-400 group-hover:text-slate-900"
                    )} 
                  />
                  
                  {/* Indicator Dot for Active State */}
                  {active && (
                    <span className={cn("absolute -left-1 w-1 h-4 rounded-full", item.color.replace('text', 'bg'))} />
                  )}

                  <WidgetTooltip text={item.label} sub={item.sub} show={hoveredId === item.id} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-8 h-px my-3 bg-slate-100"></div>

        {/* 2. PRIMARY CALL TO ACTION (PULSING) */}
        <Link href="/auth/register" className="relative">
          <div 
            className="relative flex items-center justify-center text-white transition-all bg-[#B91C1C] shadow-lg shadow-red-200 w-12 h-12 rounded-2xl hover:bg-red-800 hover:scale-110 hover:shadow-red-300 group cursor-pointer overflow-hidden"
            onMouseEnter={() => setHoveredId('cta')}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Glossy Overlay Effect */}
            <div className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-tr from-white/20 to-transparent group-hover:opacity-100" />
            
            <Zap size={20} className="fill-current animate-pulse" />
            <WidgetTooltip text="Apply Now" sub="Instant Pre-Approval" show={hoveredId === 'cta'} />
          </div>
        </Link>
      </div>

      {/* 3. DYNAMIC SCROLL-TO-TOP BUTTON */}
      {/* This detaches and hides when at the top of the page */}
      <div className="relative w-12 h-12">
        <button
          onClick={scrollToTop}
          onMouseEnter={() => setHoveredId('scroll-top')}
          onMouseLeave={() => setHoveredId(null)}
          className={cn(
            "absolute inset-0 flex items-center justify-center w-full h-full text-slate-500 bg-white border border-slate-200 shadow-xl rounded-2xl transition-all duration-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 hover:scale-110 active:scale-90",
            showScrollTop 
              ? "opacity-100 translate-y-0 scale-100 rotate-0" 
              : "opacity-0 translate-y-8 scale-50 rotate-180 pointer-events-none"
          )}
          aria-label="Back to top"
        >
          <ChevronUp size={22} strokeWidth={3} />
          <WidgetTooltip text="Back to Top" show={hoveredId === 'scroll-top'} />
        </button>
      </div>

    </div>
  );
}