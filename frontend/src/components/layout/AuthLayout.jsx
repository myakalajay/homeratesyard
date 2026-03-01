'use client'; 

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, Zap } from 'lucide-react';
import Logo from '@/components/navigation/shared/Logo'; 
import { cn } from '@/utils/utils';

/**
 * AuthLayout Component
 * @description Master wrapper for Login, Register, and Forgot Password screens.
 * Features a perfectly locked viewport where only the form side scrolls.
 */
const AuthLayout = ({ children, title, subtitle }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[100dvh] bg-white" />;
  }

  return (
    // 🟢 FIX 1: Locked to exactly 100dvh with hidden global overflow
    <div className="grid w-full h-[100dvh] overflow-hidden bg-white lg:grid-cols-2">
      
      {/* =========================================================
          LEFT SIDE: BRANDING & VISUALS (Fixed, never scrolls)
      ========================================================= */}
      <div className="relative flex-col justify-between hidden h-full p-12 overflow-hidden text-white lg:flex bg-slate-950">
        
        {/* 🎨 Premium Background Accents */}
        <div aria-hidden="true" className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div aria-hidden="true" className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        {/* Grainy Texture Overlay for high-end look */}
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.1] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

        {/* HEADER: Brand Identity */}
        <div className="relative z-10 transition-transform duration-500 hover:scale-[1.02]">
           <Logo variant="dark" className="w-auto h-10" /> 
        </div>

        {/* HERO CONTENT: Conversion Optimized */}
        <div className="relative z-10 max-w-lg mt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-semibold tracking-[0.2em] uppercase bg-red-600/20 text-red-400 rounded-lg border border-red-400/20">
             <Zap size={12} fill="currentColor" /> Next-Gen Lending
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight leading-[1.1] mb-6">
            Lending <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">reimagined</span> for the modern era.
          </h1>
          <p className="mb-10 text-lg leading-relaxed font-regular text-slate-400">
            Experience the fastest, most transparent mortgage process in the industry. From application to close in as little as 14 days.
          </p>

          {/* SOCIAL PROOF CARD */}
          <div className="flex items-center gap-5 p-4 pr-6 duration-700 border shadow-2xl rounded-2xl bg-white/5 border-white/10 backdrop-blur-md w-fit animate-in slide-in-from-bottom-4">
             <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="relative flex items-center justify-center w-10 h-10 overflow-hidden border-2 rounded-full border-slate-900 bg-slate-800 ring-2 ring-red-500/20">
                        <img 
                            src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${i+12}`} 
                            alt="Verified User"
                            className="object-cover w-full h-full" 
                        />
                    </div>
                ))}
             </div>
             <div className="flex flex-col">
                <div className="flex items-center gap-1 text-orange-400 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill="currentColor" />
                    ))}
                </div>
                <span className="text-[11px] font-bold text-slate-300 tracking-tight uppercase">
                    Trusted by <span className="text-white">10,000+</span> homeowners
                </span>
             </div>
          </div>
        </div>

        {/* FOOTER: Compliance & Trust */}
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center gap-6 text-xs font-bold tracking-widest uppercase text-slate-500">
            <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> SOC2 Compliant</span>
            <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> 256-bit Encryption</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest pt-6 border-t border-white/5">
             <span>© {new Date().getFullYear()} HomeRatesYard Inc.</span>
             <div className="flex gap-6">
               <Link href="/website/privacy" className="transition-colors hover:text-white">Privacy</Link>
               <Link href="/website/terms" className="transition-colors hover:text-white">Terms</Link>
             </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          RIGHT SIDE: FORM CONTENT (Scrolls Independently)
      ========================================================= */}
      {/* 🟢 FIX 2: h-full with overflow-y-auto isolates the scroll bar to this pane */}
      <div className="relative h-full overflow-y-auto bg-white custom-scrollbar">
        
        {/* Subtle Background Mark */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full pointer-events-none bg-slate-50" />

        {/* 🟢 FIX 3: Inner wrapper with min-h-full prevents scroll-clipping on tall forms */}
        <div className="flex flex-col items-center justify-center min-h-full p-6 py-12 lg:p-12">
          
          <div className="w-full max-w-[420px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Mobile Logo: Displayed only when the left branding side is hidden */}
              <div className="flex justify-center mb-8 lg:hidden">
                 <Logo variant="default" className="w-auto h-8" />
              </div>

              {/* Form Header: Clear and Concise */}
              <div className="space-y-2 text-center lg:text-left">
                 <h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
                 {subtitle && <p className="text-base font-medium leading-relaxed text-slate-500">{subtitle}</p>}
              </div>

              {/* Rendered Form Component */}
              <div className="relative">
                {children}
              </div>
              
              {/* Mobile-only Legal Footer */}
              <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest lg:hidden pt-8">
                Secured by HomeRatesYard 256-bit SSL
              </p>
          </div>
          
        </div>
      </div>

    </div>
  );
};

export default AuthLayout;