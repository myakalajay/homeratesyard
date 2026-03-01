import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowUpRight } from 'lucide-react';

// --- CONSTANTS ---
const PARTNERS = [
  { name: "Chase", domain: "chase.com" },
  { name: "Wells Fargo", domain: "wellsfargo.com" },
  { name: "Rocket", domain: "rocketmortgage.com" },
  { name: "UWM", domain: "uwm.com" },
  { name: "Citi", domain: "citi.com" },
  { name: "Bank of America", domain: "bankofamerica.com" },
  { name: "US Bank", domain: "usbank.com" },
  { name: "PennyMac", domain: "pennymac.com" },
  { name: "LoanDepot", domain: "loandepot.com" },
  { name: "Guild", domain: "guildmortgage.com" }
];

const RECENT_LOCKS = [
  { loc: "Austin, TX", rate: "5.99%", type: "30Y Fixed", save: "$450/mo", time: "2m ago" },
  { loc: "Miami, FL", rate: "5.85%", type: "VA Loan", save: "$320/mo", time: "5m ago" },
  { loc: "Denver, CO", rate: "6.12%", type: "FHA", save: "$210/mo", time: "8m ago" },
  { loc: "Seattle, WA", rate: "6.05%", type: "Conventional", save: "$550/mo", time: "12m ago" },
  { loc: "Boston, MA", rate: "6.25%", type: "Jumbo", save: "$890/mo", time: "15m ago" },
];

export default function TrustStream() {
  const [index, setIndex] = useState(0);

  // Rotate Live Feed logic
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % RECENT_LOCKS.length);
    }, 4000); 
    return () => clearInterval(timer);
  }, []);

  // Interaction: Scroll to Hero to "Beat this rate"
  const handleTickerClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Optional: Focus the zip input if we had a ref to it, 
    // but scrolling to top is sufficient for the user to see the "Get Started" area.
  };

  if (!RECENT_LOCKS.length || !PARTNERS.length) return null;

  return (
    <section className="relative z-30 w-full overflow-hidden border-y border-border bg-background">
      <div className="container px-4 mx-auto max-w-7xl">
        
        <div className="grid grid-cols-1 divide-y lg:grid-cols-12 lg:divide-y-0 lg:divide-x divide-border">
          
          {/* 1. Live Activity Ticker (Interactive) */}
          <div 
            onClick={handleTickerClick}
            className="relative flex items-center justify-between gap-4 py-3 pr-4 transition-colors cursor-pointer lg:col-span-4 group hover:bg-background-subtle/50"
            role="button"
            aria-label="Scroll to top to check rates"
          >
            
            {/* Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background-subtle border rounded-full shadow-sm border-border z-10 shrink-0">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-success"></span>
                <span className="relative inline-flex w-2 h-2 rounded-full bg-success"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted">
                Live Feed
              </span>
            </div>
            
            {/* Animated Text Feed */}
            <div className="relative flex-1 h-8 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center w-full"
                >
                  <div className="flex items-center gap-2 text-xs font-medium truncate transition-colors text-content group-hover:text-primary">
                    <Lock size={12} className="text-primary shrink-0" />
                    <span className="font-bold whitespace-nowrap">
                      {RECENT_LOCKS[index].type}
                    </span>
                    <span className="hidden text-content-muted sm:inline group-hover:text-primary/70">
                      locked at
                    </span>
                    <span className="font-bold text-success">
                      {RECENT_LOCKS[index].rate}
                    </span>
                    
                    {/* Hover Call to Action */}
                    <span className="hidden group-hover:inline-flex items-center gap-1 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded ml-auto animate-in fade-in zoom-in">
                      Beat this <ArrowUpRight size={10} />
                    </span>

                    <span className="ml-auto truncate text-content-muted group-hover:hidden">
                      {RECENT_LOCKS[index].time}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* 2. Partner Marquee (Real Logos) */}
          <div className="relative flex items-center py-3 pl-4 overflow-hidden lg:col-span-8 group bg-background">
            {/* Fade Gradients */}
            <div className="absolute top-0 bottom-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent"></div>
            <div className="absolute top-0 bottom-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent"></div>
            
            <div className="flex items-center gap-12 animate-scroll-left whitespace-nowrap hover:paused w-max">
              {/* Repeater for 4K Safety (4x Loop) */}
              {Array(4).fill(PARTNERS).flat().map((partner, i) => (
                <div 
                  key={`p-${i}`} 
                  className="relative flex items-center justify-center h-8 transition-all duration-300 cursor-pointer grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:scale-105"
                  title={partner.name}
                >
                  <img 
                    src={`https://logo.clearbit.com/${partner.domain}?size=60&greyscale=true`}
                    alt={partner.name}
                    className="h-full w-auto object-contain max-w-[100px]"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  {/* Fallback Text */}
                  <span className="hidden text-sm font-bold text-content-muted font-display">
                    {partner.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}