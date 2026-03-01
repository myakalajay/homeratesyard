'use client'; 

import React, { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { 
  X, ChevronLeft, ChevronRight, ShieldCheck, Briefcase, User, Home, Zap
} from 'lucide-react';
import { cn } from '@/utils/utils';

import { useAuthContext } from '@/components/providers/AuthProvider';
import { ROLE_MENUS, SHARED_MENUS } from '@/config/dashboardMenus';
import Logo from '@/components/navigation/shared/Logo';
import { Button } from '@/components/ui/primitives/Button';

// Configuration for portal branding based on role
const ROLE_CONFIG = {
  superadmin: { label: 'System Controller', color: 'text-purple-600' },
  super_admin: { label: 'System Controller', color: 'text-purple-600' }, 
  admin: { label: 'Administrator', color: 'text-blue-600' },
  lender: { label: 'Lender Portal', color: 'text-emerald-700' },
  borrower: { label: 'Borrower Portal', color: 'text-slate-500' },
  default: { label: 'User Portal', color: 'text-slate-400' }
};

const DashboardSidebar = ({ isOpen, onClose, isCollapsed, setIsCollapsed }) => {
  const router = useRouter();
  const { user } = useAuthContext();

  const normalizedRole = String(user?.role || '').toLowerCase().trim();

  const navItems = useMemo(() => {
    if (!normalizedRole || !ROLE_MENUS) return [];
    return [...(ROLE_MENUS[normalizedRole] || []), ...(SHARED_MENUS || [])];
  }, [normalizedRole]);

  const isActive = useCallback((href) => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    if (!currentPath) return false;
    
    if (href === `/${normalizedRole}` || href === `/admin` || href === `/superadmin` || href === `/borrower`) {
      return currentPath === href;
    }
    
    return currentPath === href || currentPath.startsWith(`${href}/`);
  }, [normalizedRole]);

  const roleInfo = ROLE_CONFIG[normalizedRole] || ROLE_CONFIG.default;
  const showSubscription = normalizedRole === 'lender' || normalizedRole === 'borrower';

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isOpen && window.innerWidth < 1024) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}

      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:shrink-0 relative group/sidebar",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
          isCollapsed ? "w-[88px]" : "w-[280px]"
        )}
      >
        {/* Floating Collapse Trigger */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute z-50 items-center justify-center hidden w-6 h-6 transition-colors bg-white border rounded-full shadow-sm opacity-0 lg:flex border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 -right-3 top-8 group-hover/sidebar:opacity-100"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* HEADER AREA */}
        <div className={cn("flex flex-col px-6 py-8 transition-all duration-300 shrink-0", isCollapsed && "items-center px-4")}>
          <div className="flex items-start justify-between w-full">
            {isCollapsed ? (
              <Link href="/" className="relative flex justify-center w-full group">
                <div className="flex items-center justify-center w-12 h-12 transition-all bg-white border shadow-sm rounded-2xl border-slate-200 text-slate-400 group-hover:bg-red-50 group-hover:text-red-600 group-hover:border-red-100">
                  <Home size={20} strokeWidth={2.5} />
                </div>
              </Link>
            ) : (
              <div className="flex flex-col items-start">
                 <Link href="/" className="relative z-10 transition-opacity duration-300 w-36 hover:opacity-80">
                   <Logo />
                 </Link>
                 
                 {/* 🟢 NEW: Integrated Brand Lockup (Snug beneath logo text) */}
                 <span className={cn(
                   "text-[8px] font-bold uppercase tracking-[0.20em] ml-[50px] -mt-1 opacity-80 animate-in fade-in duration-500", 
                   roleInfo.color
                 )}>
                   {roleInfo.label}
                 </span>
              </div>
            )}
            
            <button 
              onClick={onClose} 
              className="p-2 -mr-3 transition-colors rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={cn(
                  "group relative flex items-center gap-3 px-3.5 py-3.5 text-sm font-semibold rounded-md transition-all duration-200 outline-none",
                  active 
                    ? "bg-[#0A1128] text-white shadow-lg shadow-slate-900/10" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <item.icon 
                  size={active ? 20 : 18} 
                  strokeWidth={active ? 2.5 : 2.5}
                  className={cn("shrink-0 transition-colors", active ? "text-red-500" : "text-slate-400 group-hover:text-red-500")} 
                />
                
                {!isCollapsed && <span className="tracking-tight">{item.label}</span>}

                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-[72px] z-50 px-3 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl opacity-0 invisible -translate-x-2 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shadow-xl whitespace-nowrap pointer-events-none">
                    {item.label}
                    <div className="absolute w-2 h-2 rotate-45 -translate-y-1/2 -left-1 top-1/2 bg-slate-900" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM SECTION */}
        <div className="p-5 shrink-0">
          {showSubscription && !isCollapsed && (
            <div className="p-5 duration-500 border shadow-lg bg-gradient-to-br from-slate-900 to-[#0A1128] border-slate-800 rounded-2xl animate-in fade-in">
              <div className="flex items-center gap-2 mb-3 text-orange-400">
                <Zap size={16} className="animate-pulse" />
                <span className="text-[10px] font-black tracking-[0.2em] uppercase">Pro Features</span>
              </div>
              <p className="mb-4 text-xs font-medium leading-relaxed text-slate-300">
                {normalizedRole === 'lender' ? 'Unlock real-time lead routing and CRM tools.' : 'Get priority underwriting and lower rates.'}
              </p>
              <Button size="sm" className="w-full text-xs font-bold transition-colors bg-white rounded-xl text-slate-900 hover:bg-slate-50">
                Upgrade Now
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;