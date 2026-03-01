import React from 'react';
import { cn } from '@/utils/utils';

// Navigation Components
import WebsiteNavbar from '@/components/navigation/website/WebsiteNavbar';
import WebsiteFooter from '@/components/navigation/website/WebsiteFooter';

/**
 * @layout PublicLayout
 * @description The primary wrapper for all marketing and public-facing pages.
 * Handles the fixed navbar offset, global typography, and background theme.
 */
export default function PublicLayout({ children, className }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-red-100 selection:text-red-900">
      
      {/* 1. GLOBAL NAVIGATION */}
      {/* Fixed z-[100] in the component itself */}
      <WebsiteNavbar />

      {/* 2. MAIN CONTENT AREA 
          - pt-32: Accounts for TopBar (40px) + Main Navbar (80px) + Buffer.
          - animate-in: Provides a smooth entry for every public page.
      */}
      <main className={cn(
        "flex-grow pt-28 md:pt-32 animate-in fade-in duration-700 ease-out", 
        "flex flex-col",
        className
      )}>
        {children}
      </main>

      {/* 3. GLOBAL FOOTER */}
      <WebsiteFooter />
      
      {/* 🟢 NOTE: ChatWidget & SideStickyWidget are now managed 
        globally in _app.js to prevent duplication during page transitions.
      */}
    </div>
  );
}