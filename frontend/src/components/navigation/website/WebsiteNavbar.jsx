'use client'; 

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { 
  Menu, X, ChevronDown, TrendingDown, Home, 
  Calculator, PieChart, Shield, Globe, FileText, 
  CalendarClock, Landmark, Wallet, 
  ChevronRight, Loader2, Bell, Search,
  LayoutDashboard, LogOut, Settings
} from 'lucide-react';

import { cn } from '@/utils/utils';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { useLocation } from '@/context/LocationContext'; 
import { useMarketEngine } from '@/hooks/useMarketEngine'; 

import { Button } from '@/components/ui/primitives/Button';
// NOTE: Make sure your Avatar primitive can safely handle raw image URLs via `src`
import { Avatar } from '@/components/ui/primitives/Avatar';
import Logo from '@/components/navigation/shared/Logo';
import WebsiteTopBar from './WebsiteTopBar';
import WebsiteMobileNav from './WebsiteMobileNav';

const MENU_ITEMS = [
  { label: 'Home', href: '/', type: 'link' },
  { 
    label: 'Loan Products', 
    type: 'mega',
    basePath: '/website/loans', 
    featured: {
      title: 'Find Your Perfect Loan',
      desc: 'Compare rates across 50+ lenders instantly.',
      href: '/website/loans/compare',
      cta: 'Start Comparing',
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop"
    },
    columns: [
      {
        title: "Standard Loans",
        items: [
          { label: 'Conventional Loans', href: '/website/loans/conventional', icon: FileText },
          { label: 'FHA Loans', href: '/website/loans/fha', icon: Shield },
          { label: 'VA Loans', href: '/website/loans/va', icon: Globe },
          { label: 'USDA Loans', href: '/website/loans/usda', icon: Home },
        ]
      },
      {
        title: "Specialty Loans",
        items: [
          { label: 'ARM Loans', href: '/website/loans/arm', icon: PieChart },
          { label: 'Investors Loans', href: '/website/loans/investors', icon: TrendingDown },
          { label: 'Non-QM Loans', href: '/website/loans/non-qm', icon: Calculator },
        ]
      }
    ]
  },
  { 
    label: 'Refinance', 
    type: 'mega',
    basePath: '/website/refinance',
    featured: {
      title: 'Unlock Your Equity',
      desc: 'Cash-out or lower your monthly payments today.',
      href: '/website/refinance/get-rates',
      cta: 'Get Rates',
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop"
    },
    columns: [
      {
        title: "Refinance Options",
        items: [
          { label: 'Home-Refinance Loans', href: '/website/refinance/home', icon: Home },
          { label: 'Cash-out Refinance', href: '/website/refinance/cash-out', icon: TrendingDown },
          { label: 'Home Equity Loans', href: '/website/refinance/equity', icon: PieChart },
        ]
      },
      {
        title: "Government Programs",
        items: [
          { label: 'VA Refinancing', href: '/website/refinance/va', icon: Shield },
          { label: 'FHA Refinancing', href: '/website/refinance/fha', icon: FileText },
        ]
      }
    ]
  },
  { 
    label: 'Calculators', 
    type: 'mega',
    basePath: '/website/calculators',
    featured: {
      title: 'Plan Your Future',
      desc: 'Estimate payments and affordability with our AI tools.',
      href: '/website/calculators', 
      cta: 'View All Tools',
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop"
    },
    columns: [
      {
        title: "Payment Tools",
        items: [
          { label: 'Mortgage Calculator', href: '/website/calculators/mortgage', icon: Calculator },
          { label: 'Affordability Calculator', href: '/website/calculators/affordability', icon: Wallet },
          { label: 'Amortization Schedule', href: '/website/calculators/amortization', icon: CalendarClock },
        ]
      },
      {
        title: "Analysis Tools",
        items: [
          { label: 'Refinance Breakeven', href: '/website/calculators/refinance', icon: TrendingDown },
          { label: 'Rent vs. Buy', href: '/website/calculators/rent-vs-buy', icon: Landmark },
        ]
      }
    ]
  },
];

const WebsiteNavbar = () => {
  const { user, logout, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const navRef = useRef(null);

  const { location } = useLocation() || {};
  const { rates, loading: ratesLoading } = useMarketEngine({ initialZip: location?.zip }) || {};

  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Dynamic Dashboard Routing
  const dashboardRoute = useMemo(() => {
    if (!user?.role) return '/borrower';
    const rawRole = String(user.role).toLowerCase().trim();
    if (rawRole === 'super_admin' || rawRole === 'superadmin') return '/superadmin';
    if (rawRole === 'admin') return '/admin';
    return `/${rawRole}`;
  }, [user?.role]);

  // 🟢 FIX: Safe Avatar Extractor logic imported from Dashboard layout
  const safeInitials = useMemo(() => {
    if (!user?.name) return 'U';
    const parts = user.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [user?.name]);

  // 🟢 FIX: Extract Image URL safely
  const profileImage = user?.image || user?.avatarUrl || user?.profileImage;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  const handleClickOutside = useCallback((e) => {
    if (navRef.current && !navRef.current.contains(e.target)) {
      setActiveMenu(null);
      setShowSearch(false);
      setShowProfile(false);
      setShowNotifications(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const toggleDropdown = (dropdown) => {
    const states = { search: setShowSearch, profile: setShowProfile, notifications: setShowNotifications };
    Object.keys(states).forEach(key => {
      if (key === dropdown) states[key](prev => !prev);
      else states[key](false);
    });
    setActiveMenu(null);
  };

  const isMenuActive = (item) => {
    return false; // Implement advanced active state mapping here if needed.
  };

  // Secure Logout Handler
  const handleLogout = async () => {
    setShowProfile(false);
    setIsLoggingOut(true);
    await logout();
    router.push('/auth/login');
  };

  return (
    <header 
      ref={navRef}
      className={cn(
        "fixed top-0 left-0 w-full z-[100] transition-all duration-500",
        isScrolled || activeMenu || showProfile || showNotifications || showSearch
          ? "bg-white border-b border-slate-200 shadow-lg shadow-slate-200/20" 
          : "bg-white/95 backdrop-blur-md border-b border-transparent"
      )}
      onMouseLeave={() => {
        if (!showProfile && !showNotifications && !showSearch) setActiveMenu(null);
      }}
    >
      <WebsiteTopBar />
      
      <div className="flex items-center justify-between h-20 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        
        {/* LOGO */}
        <div className="flex-shrink-0">
          <Link href="/" className="block transition-transform active:scale-95">
            <Logo variant="default" className="w-auto h-8" />
          </Link>
        </div>

        {/* DESKTOP NAV */}
        <nav className="items-center hidden h-full gap-1 lg:flex">
          {MENU_ITEMS.map((item) => (
            <div 
              key={item.label}
              className="flex items-center h-full"
              onMouseEnter={() => {
                if (!showProfile && !showNotifications && !showSearch) setActiveMenu(item.label);
              }}
            >
              <div className="relative flex items-center h-full">
                {item.type === 'mega' ? (
                  <button 
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-full transition-all duration-300",
                      activeMenu === item.label 
                        ? "text-red-600 bg-red-50/80" 
                        : isMenuActive(item) 
                          ? "text-red-600" 
                          : "text-slate-600 hover:text-red-600 hover:bg-slate-50"
                    )}
                  >
                    {item.label}
                    <ChevronDown size={14} className={cn("transition-transform duration-300", activeMenu === item.label && "rotate-180")} />
                  </button>
                ) : (
                  <Link 
                    href={item.href} 
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 text-[13px] font-semibold transition-all rounded-full",
                        isMenuActive(item) ? "text-red-600 bg-red-50/80" : "text-slate-600 hover:text-red-600 hover:bg-slate-50"
                    )}
                  >
                    {item.label}
                  </Link>
                )}
              </div>

              {/* MEGA DROPDOWN */}
              {item.type === 'mega' && activeMenu === item.label && (
                <div className="absolute left-0 w-full bg-white border-b border-t shadow-2xl top-[100%] border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300 z-[110]">
                  <div className="px-8 py-4 mx-auto max-w-7xl">
                    <div className="grid grid-cols-12 gap-12">
                      <div className="grid grid-cols-2 col-span-8 gap-10 pr-12 border-r border-slate-100">
                        {item.columns.map((col, idx) => (
                          <div key={idx}>
                            <h4 className="mb-4 text-[10px] font-bold tracking-[0.25em] text-red-600 uppercase">
                              {col.title}
                            </h4>
                            <div className="space-y-1">
                              {col.items.map((subItem) => (
                                <Link 
                                  key={subItem.label} 
                                  href={subItem.href}
                                  className="flex items-center justify-between p-3 -ml-3 text-[13px] font-semibold transition-all rounded-2xl group text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                >
                                  <span className="flex items-center gap-4">
                                    <div className="p-2 transition-all rounded-xl bg-slate-50 group-hover:bg-white group-hover:shadow-md group-hover:text-red-600">
                                        {subItem.icon && <subItem.icon size={18} />}
                                    </div>
                                    {subItem.label}
                                  </span>
                                  <ChevronRight size={14} className="text-red-600 transition-all -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="col-span-4 pl-4">
                        <Link href={item.featured.href} className="relative block group aspect-[16/10] overflow-hidden rounded-3xl shadow-2xl">
                            <img src={item.featured.image} alt={item.featured.title} className="absolute inset-0 object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-8 text-white">
                              <h4 className="mb-2 text-xl font-bold">{item.featured.title}</h4>
                              <p className="mb-4 text-[13px] text-slate-200 leading-relaxed line-clamp-2 font-medium">{item.featured.desc}</p>
                              <span className="inline-flex items-center text-[10px] font-bold tracking-[0.2em] uppercase text-red-400 group-hover:text-red-300">
                                {item.featured.cta} <ChevronRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
                              </span>
                            </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* RIGHT SIDE TOOLS */}
        <div className="flex items-center gap-2 lg:gap-4">
          
          <button 
            onClick={() => toggleDropdown('search')}
            className={cn(
                "p-3 transition-all rounded-full hover:bg-slate-100 active:scale-90",
                showSearch ? "text-red-600 bg-red-50" : "text-slate-500"
            )}
            title="Search Site"
          >
            <Search size={20} strokeWidth={2.5} />
          </button>

          <div className="items-center hidden gap-3 px-4 py-2 transition-all border rounded-full sm:flex bg-slate-50/80 border-slate-100 hover:bg-white hover:shadow-sm">
            <span className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest">30Y Fixed</span>
            <span className="text-sm font-bold text-slate-900">
              {ratesLoading ? <Loader2 size={12} className="text-red-500 animate-spin" /> : `${rates?.['30Y'] || '6.50'}%`}
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>

          <div className="hidden w-px h-6 mx-1 bg-slate-200 lg:block" />

          {/* PROFILE / AUTH */}
          {mounted ? (
            isAuthenticated ? (
              <div className="relative flex items-center gap-2">
                
                <button 
                  onClick={() => toggleDropdown('notifications')}
                  className={cn(
                    "relative p-2.5 transition-all rounded-full hover:bg-slate-100 active:scale-95",
                    showNotifications ? "bg-slate-100 text-slate-900" : "text-slate-500"
                  )}
                >
                   <Bell size={22} strokeWidth={2} />
                   <span className="absolute w-2.5 h-2.5 bg-red-600 border-2 border-white rounded-full top-2 right-2 animate-bounce" />
                </button>

                {/* 🟢 UPGRADED: Profile Avatar Button */}
                <button 
                  onClick={() => toggleDropdown('profile')}
                  className="transition-transform rounded-full focus:outline-none active:scale-95"
                >
                  {/* Custom handling if Avatar component doesn't inherently support 'src' */}
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 ring-2 ring-offset-2 overflow-hidden",
                    showProfile ? "ring-red-600 shadow-md" : "ring-transparent hover:ring-red-600/50",
                    profileImage ? "bg-transparent text-transparent" : "bg-slate-900 text-white"
                  )}>
                    {profileImage ? (
                       <img src={profileImage} alt={user?.name || "Profile"} className="object-cover w-full h-full" />
                    ) : (
                       safeInitials
                    )}
                  </div>
                </button>

                {/* Profile Dropdown */}
                {showProfile && (
                  <div className="absolute right-0 top-full mt-4 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-[120]">
                    <div className="px-3 py-3 mb-2 border-b border-slate-100">
                      <p className="text-sm font-bold truncate text-slate-900">
                        {isLoggingOut ? 'Signing out...' : (user?.name || 'Authorized User')}
                      </p>
                      <p className="text-xs font-medium truncate text-slate-500">{user?.email}</p>
                    </div>
                    <div className="space-y-1">
                      <Link 
                        href={dashboardRoute} 
                        onClick={() => setShowProfile(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <LayoutDashboard size={18} className="text-slate-400" />
                        <span>Command Center</span>
                      </Link>
                      <Link 
                        href={`${dashboardRoute}/profile`} 
                        onClick={() => setShowProfile(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <Settings size={18} className="text-slate-400" />
                        <span>Account Settings</span>
                      </Link>
                    </div>
                    <div className="h-px my-2 bg-slate-100" />
                    <button 
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-black tracking-wide text-red-600 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <LogOut size={18} />
                      <span>SECURE SIGN OUT</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="items-center hidden gap-2 lg:flex">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="font-semibold text-slate-600 hover:text-red-600">Log in</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="px-6 font-semibold text-white transition-transform bg-red-600 rounded-full shadow-lg hover:bg-red-700 hover:scale-105">Sign Up</Button>
                </Link>
              </div>
            )
          ) : (
            <div className="w-32 h-10 rounded-full bg-slate-100 animate-pulse" />
          )}

          <button 
            className="p-3 transition-all rounded-2xl lg:hidden text-slate-600 hover:bg-slate-100 active:scale-95"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* SEARCH OVERLAY */}
      {showSearch && (
        <div className="absolute left-0 w-full p-4 bg-white border-b border-slate-200 animate-in slide-in-from-top-4 z-[90] shadow-2xl">
           <div className="relative max-w-3xl mx-auto">
              <Search className="absolute -translate-y-1/2 left-5 top-1/2 text-slate-400" size={22} />
              <input 
                autoFocus
                type="text" 
                placeholder="Search mortgage rates, tools, and guides..."
                className="w-full py-5 pr-6 text-base font-medium transition-all border border-none outline-none pl-14 bg-slate-50 rounded-2xl focus:ring-4 focus:ring-red-600/10 focus:bg-white focus:border-red-200"
              />
           </div>
        </div>
      )}

      <WebsiteMobileNav 
        isOpen={isMobileOpen} 
        onClose={() => setIsMobileOpen(false)} 
        menuItems={MENU_ITEMS}
        user={user}
        onLogout={handleLogout}
        location={location}
        rates={rates}
        ratesLoading={ratesLoading}
      />
    </header>
  );
};

export default WebsiteNavbar;