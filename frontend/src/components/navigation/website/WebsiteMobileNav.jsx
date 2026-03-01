'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  X, LogOut, ChevronRight, ChevronDown, MapPin, 
  Loader2, TrendingDown, LayoutDashboard, 
  Phone, HelpCircle
} from 'lucide-react';
import { cn } from '@/utils/utils';

// Primitives & Shared
import { Button } from '@/components/ui/primitives/Button';
import { Avatar } from '@/components/ui/primitives/Avatar';
import Logo from '@/components/navigation/shared/Logo';

/**
 * @component WebsiteMobileNav
 * @description Highly interactive mobile navigation drawer.
 * Includes scroll-locking, accordion sub-menus, and live market pulse.
 */
const WebsiteMobileNav = ({ 
  isOpen, 
  onClose, 
  menuItems = [], 
  user, 
  onLogout,
  location, 
  rates, 
  ratesLoading 
}) => {
  const [activeAccordion, setActiveAccordion] = useState(null);

  // 🟢 SCROLL LOCK: Prevents background body from scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleAccordion = (label) => {
    setActiveAccordion(activeAccordion === label ? null : label);
  };

  const getLocationString = () => {
    if (!location?.city || location.city === 'Detecting...') return 'Detecting Location...';
    return location.state ? `${location.city}, ${location.state}` : location.city;
  };

  return (
    // 🟢 Z-INDEX: Set to 200 to ensure it covers all TopBars and Navbars
    <div className="fixed inset-0 z-[200] lg:hidden">
      
      {/* --- BACKDROP --- */}
      <div 
        className="absolute inset-0 duration-500 bg-slate-950/60 backdrop-blur-md animate-in fade-in" 
        onClick={onClose}
      />
      
      {/* --- DRAWER --- */}
      <div className="absolute inset-y-0 right-0 flex flex-col w-full max-w-[340px] bg-white shadow-2xl animate-in slide-in-from-right duration-500 ease-out">
        
        {/* 1. HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 bg-white border-b border-slate-100">
          <Logo variant="default" className="w-auto h-7" link={false} />
          <button 
            onClick={onClose}
            className="p-2 -mr-2 transition-all rounded-full text-slate-400 hover:bg-slate-100 active:scale-90"
            aria-label="Close Menu"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* 2. SCROLLABLE CONTENT */}
        <div className="flex-1 px-5 py-6 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* PROFILE / AUTH SECTION */}
          {user ? (
            <div className="p-4 border shadow-sm rounded-2xl bg-slate-50 border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <Avatar 
                  src={user.image} 
                  initials={user.name?.charAt(0) || 'U'} 
                  size="md" 
                  className="shadow-sm ring-2 ring-white"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-slate-900">{user.name}</p>
                  <p className="text-xs font-medium truncate text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link href={user.role === 'lender' ? '/lender/dashboard' : '/borrower/dashboard'} onClick={onClose}>
                  <Button size="sm" className="w-full h-10 font-bold bg-slate-900 rounded-xl">
                    <LayoutDashboard size={14} className="mr-2" /> Portal
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { onLogout(); onClose(); }} 
                  className="h-10 font-bold border-slate-200 text-slate-600 rounded-xl"
                >
                  <LogOut size={14} className="mr-2" /> Exit
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link href="/auth/login" onClick={onClose}>
                <Button variant="outline" className="w-full h-12 font-semibold rounded-full border-slate-200 text-slate-700">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register" onClick={onClose}>
                <Button className="w-full h-12 font-semibold text-white bg-red-600 rounded-full shadow-lg shadow-red-600/20">
                  Join Now
                </Button>
              </Link>
            </div>
          )}

          {/* MAIN NAVIGATION */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isExpanded = activeAccordion === item.label;
              
              return (
                <div key={item.label} className="border-b border-slate-50 last:border-0">
                  {item.type === 'link' ? (
                    <Link 
                      href={item.href} 
                      onClick={onClose}
                      className="flex items-center justify-between py-4 text-base font-semibold transition-all text-slate-900 active:text-red-600 active:translate-x-1"
                    >
                      {item.label}
                      <ChevronRight size={18} className="text-slate-300" />
                    </Link>
                  ) : (
                    <div className="py-2">
                      <button 
                        onClick={() => toggleAccordion(item.label)}
                        className={cn(
                          "flex items-center justify-between w-full py-2 text-base font-semibold transition-all",
                          isExpanded ? "text-red-600" : "text-slate-900"
                        )}
                      >
                        {item.label}
                        <ChevronDown size={18} className={cn("transition-transform duration-300 text-slate-300", isExpanded && "rotate-180 text-red-600")} />
                      </button>
                      
                      {/* ACCORDION CONTENT */}
                      <div className={cn(
                        "overflow-hidden transition-all duration-500 ease-in-out",
                        isExpanded ? "max-h-[1000px] opacity-100 mt-4 mb-2" : "max-h-0 opacity-0"
                      )}>
                        <div className="pl-4 ml-1 space-y-8 border-l-2 border-slate-100">
                          {item.columns?.map((col, idx) => (
                            <div key={idx} className="space-y-4">
                              <h5 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                {col.title}
                              </h5>
                              <ul className="space-y-5">
                                {col.items.map((subItem) => (
                                  <li key={subItem.label}>
                                    <Link
                                      href={subItem.href}
                                      onClick={onClose}
                                      className="flex items-center gap-4 text-sm font-semibold transition-all text-slate-600 active:text-red-600 active:translate-x-1"
                                    >
                                      <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
                                        {subItem.icon && <subItem.icon size={16} />}
                                      </div>
                                      {subItem.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* SUPPORT CARDS */}
          <div className="space-y-3">
             <a href="tel:+18005550123" className="flex items-center gap-4 p-4 transition-all bg-white border shadow-sm rounded-2xl border-slate-100 active:scale-95">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-600/10">
                   <Phone size={20} />
                </div>
                <div>
                   <p className="text-xs font-bold text-slate-900">1-800-HOMERATES</p>
                   <p className="text-[10px] text-slate-500 font-medium">Expert advice, Mon-Fri</p>
                </div>
             </a>
             <Link href="/website/contact" onClick={onClose} className="flex items-center gap-4 p-4 transition-all bg-white border shadow-sm rounded-2xl border-slate-100 active:scale-95">
                <div className="p-2.5 text-blue-600 rounded-xl bg-blue-50 shadow-sm shadow-blue-600/10">
                   <HelpCircle size={20} />
                </div>
                <div>
                   <p className="text-xs font-bold text-slate-900">Help Center</p>
                   <p className="text-[10px] text-slate-500 font-medium">Guides & Support Tickets</p>
                </div>
             </Link>
          </div>
        </div>

        {/* 3. STICKY MARKET FOOTER */}
        <div className="p-5 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between p-4 mb-4 border bg-slate-50/50 border-slate-100 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 shadow-sm rounded-xl shadow-red-600/10">
                <TrendingDown size={16} className="text-red-600" />
              </div>
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-400">Rate Pulse</span>
                <span className="text-[11px] font-bold text-slate-600">30Y Fixed</span>
              </div>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              {ratesLoading ? <Loader2 size={16} className="animate-spin text-slate-300" /> : `${rates?.['30Y'] || '6.50'}%`}
            </span>
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin size={14} className="text-red-600" />
              <span className="text-xs font-bold text-slate-700">
                {getLocationString()}
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.1em]">
              v2.0.4
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WebsiteMobileNav;