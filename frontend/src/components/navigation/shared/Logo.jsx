'use client'; 

import React from 'react';
import Link from 'next/link';
import { Home, Percent } from 'lucide-react';
import { cn } from '@/utils/utils';

/**
 * @component Logo
 * @description Standardized branding component for HomeRatesYard.
 * 🟢 FIX: Added 'link' prop logic to prevent nested <a> tag errors (Hydration Error).
 */
const Logo = ({ 
  className, 
  href = "/", 
  collapsed = false, 
  onClick,
  link = false, // 🟢 New Prop: Default to false to avoid nesting errors
  variant = 'default' 
}) => {
  
  const isDark = variant === 'dark';

  // The core visual structure
  const LogoContent = (
    <div className={cn("flex items-center gap-2.5 group transition-opacity hover:opacity-90 cursor-pointer", className)}>
      <div className="relative transition-transform duration-300 group-hover:scale-105 group-active:scale-95 shrink-0">
        
        {/* BRAND ICON */}
        <div className="flex items-center justify-center w-8 h-8 text-white shadow-lg md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 shadow-orange-500/20">
          <Home className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.2} />
        </div>

        {/* PERCENT BADGE */}
        <div className={cn(
          "absolute -top-1.5 -right-1.5 rounded-full p-[2px] border-[1px] shadow-sm flex items-center justify-center",
          isDark 
            ? "bg-slate-900 border-slate-900 text-white" 
            : "bg-white border-white text-red-600"       
        )}>
           <Percent size={10} strokeWidth={4} className="w-2.5 h-2.5 md:w-3 md:h-3" />
        </div>
      </div>
      
      {/* LOGO TEXT */}
      {!collapsed && (
        <div className="flex flex-col justify-center">
          <span className={cn(
            "text-lg md:text-xl font-bold tracking-tight leading-none transition-colors",
            isDark ? "text-white" : "text-slate-900"
          )}>
            HomeRates<span className={isDark ? "text-red-400" : "text-red-600"}>Yard</span>
          </span>
        </div>
      )}
    </div>
  );

  // 🟢 If 'link' is true, wrap in Link; otherwise, return the div
  if (link) {
    return (
      <Link href={href} onClick={onClick} aria-label="HomeRatesYard Logo">
        {LogoContent}
      </Link>
    );
  }

  return LogoContent;
};

export default Logo;