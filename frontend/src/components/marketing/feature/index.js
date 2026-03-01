import React from 'react';
import Link from 'next/link';
import { Timer, Wallet, Cpu, CheckCircle2, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button'; 

// --- CONFIGURATION ---
const FEATURES = [
  {
    title: "45 Days → 14 Days",
    desc: "AI extracts and verifies income in milliseconds, cutting closing times by 65%.",
    icon: Timer,
  },
  {
    title: "Zero Lender Fees",
    desc: "We automated the back-office. No underwriting or processing fees. You save ~$3,200.",
    icon: Wallet,
  },
  {
    title: "Bias-Free Intelligence",
    desc: "Algorithms analyze data, not demographics. Pure financial health assessment.",
    icon: Cpu,
  }
];

export default function FeatureShowcase() {
  const scrollToComparison = (e) => {
    e.preventDefault();
    const element = document.getElementById('comparison');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 overflow-hidden bg-background">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="grid items-center grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
          
          {/* --- LEFT COLUMN: CONTENT & VALUE PROPOSITION --- */}
          <div className="flex flex-col items-start space-y-8 duration-700 animate-in slide-in-from-left fade-in">
            
            {/* Header Group */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-bold tracking-wider uppercase border rounded-full text-primary border-primary-subtle bg-primary-subtle">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                The New Standard
              </div>
              
              <h2 className="mb-6 text-4xl font-bold leading-tight md:text-5xl font-display text-content">
                Power in your hands. <br />
                <span className="text-content-muted">Complexity handled by AI.</span>
              </h2>
              
              <p className="max-w-lg text-lg leading-relaxed text-content-muted">
                We stripped away the paperwork, the waiting, and the bias. What's left is the fastest, fairest lending experience ever built.
              </p>
            </div>

            {/* Feature List */}
            <div className="w-full space-y-8">
              {FEATURES.map((feat, i) => (
                <div key={i} className="flex gap-5 transition-all duration-300 cursor-default group hover:translate-x-2">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 transition-transform rounded-xl bg-primary-subtle text-primary group-hover:scale-110 group-hover:shadow-md">
                    <feat.icon size={24} />
                  </div>
                  <div>
                    <h4 className="mb-1 text-lg font-bold transition-colors text-content group-hover:text-primary">
                      {feat.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-content-muted">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Action - FIXED: Scrolls to Comparison Table */}
            <div className="pt-4">
              <Button 
                asChild 
                variant="link" 
                className="p-0 text-lg font-bold cursor-pointer text-primary hover:no-underline group"
                onClick={scrollToComparison}
              >
                <Link href="#comparison">
                  See full comparison 
                  <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* --- RIGHT COLUMN: VISUALIZATION (Person + Laptop) --- */}
          <div className="relative flex items-center justify-center duration-700 delay-100 animate-in slide-in-from-right fade-in group/image">
            
            {/* 1. Background Decor (Rotated Card) */}
            <div className="absolute inset-0 transform rotate-3 scale-105 rounded-[2.5rem] bg-background-subtle -z-10 border border-border transition-transform group-hover/image:rotate-6"></div>
            
            {/* 2. Main Image Container */}
            <div className="relative z-10 w-full max-w-md mx-auto aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white light:border-content-subtle">
               <img 
                 src="https://images.unsplash.com/photo-1664575602276-acd073f104c1?q=80&w=1000&auto=format&fit=crop" 
                 alt="User getting approved on laptop" 
                 className="object-cover w-full h-full transition-transform duration-700 transform hover:scale-105"
                 loading="lazy"
               />
               <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* 3. Floating "Glass" Cards */}
            
            {/* Card A: Approval Badge */}
            <div className="absolute z-20 top-12 -right-4 lg:-right-10 animate-bounce" style={{ animationDuration: '4s' }}>
               <div className="flex items-center gap-3 p-4 border shadow-xl bg-white/90 rounded-2xl border-white/50 backdrop-blur-md light:bg-content/90 light:border-content-subtle">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full text-success bg-success-subtle">
                    <CheckCircle2 size={20} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-content-muted tracking-wide">Status</p>
                    <p className="text-sm font-bold text-content">Pre-Approved</p>
                  </div>
               </div>
            </div>

            {/* Card B: Rate Lock Badge */}
            <div className="absolute z-20 bottom-16 -left-4 lg:-left-10 animate-bounce" style={{ animationDuration: '5s' }}>
               <div className="flex items-center gap-3 p-4 border shadow-xl bg-white/90 rounded-2xl border-white/50 backdrop-blur-md light:bg-content/90 light:border-content-subtle">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full text-primary bg-primary-subtle">
                    <Lock size={20} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-content-muted tracking-wide">Rate Locked</p>
                    <p className="text-sm font-bold text-content">5.99% Fixed</p>
                  </div>
               </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}