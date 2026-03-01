'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { 
  Menu, Bell, ChevronDown, User as UserIcon, 
  LogOut, Settings, Search, Command, X, ShieldAlert 
} from 'lucide-react';

import { cn } from '@/utils/utils';
import { useAuthContext } from '@/components/providers/AuthProvider';

export default function DashboardTopBar({ onMenuClick }) {
  const { user, logout } = useAuthContext();
  const router = useRouter();
  
  // States
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2); // Simulated notifications
  
  // Refs
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const searchInputRef = useRef(null);

  // --- KEYBOARD SHORTCUTS (CMD+K) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- OUTSIDE CLICK HANDLERS ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(e.target)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- SEARCH FOCUS MANAGEMENT ---
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      const timer = setTimeout(() => searchInputRef.current.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  // --- SECURE LOGOUT ---
  const handleLogout = useCallback(async () => {
    setProfileOpen(false);
    setIsLoggingOut(true);
    await logout();
    router.push('/auth/login');
  }, [logout, router]);

  // --- DYNAMIC DATA COMPUTATION ---
  const basePath = useMemo(() => {
    if (!user?.role) return '/borrower';
    const rawRole = String(user.role).toLowerCase().trim();
    if (rawRole === 'super_admin' || rawRole === 'superadmin') return '/superadmin';
    return `/${rawRole}`;
  }, [user?.role]);

  const safeInitials = useMemo(() => {
    if (!user?.name) return 'U';
    const parts = user.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [user?.name]);

  // 🟢 FIX: Extract Image URL safely (Base64 or external URL)
  const profileImage = user?.image || user?.avatarUrl || user?.profileImage;

  const userRoleDisplay = useMemo(() => {
    if (isLoggingOut) return '...'; 
    if (!user?.role) return 'USER';
    return String(user.role).replace(/_/g, ' ').toUpperCase();
  }, [user?.role, isLoggingOut]);

  const isImpersonating = typeof window !== 'undefined' && localStorage.getItem('admin_token_backup') !== null;

  return (
    <>
      {/* 🟢 GLOBAL SEARCH MODAL (CMD+K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-[300] flex items-start justify-center p-4 sm:pt-[15vh]">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" 
            onClick={() => setSearchOpen(false)} 
          />
          <div className="relative w-full max-w-2xl overflow-hidden duration-200 bg-white border shadow-2xl border-slate-200 rounded-2xl animate-in zoom-in-95">
            <div className="flex items-center px-5 py-4 border-b border-slate-100">
              <Search size={20} className="mr-3 text-slate-400" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search loans, users, or help..."
                className="flex-1 text-base bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-300"
              />
              <button onClick={() => setSearchOpen(false)} className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                 <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Quick Actions</p>
                 <kbd className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 border border-slate-200 rounded shadow-sm">ESC</kbd>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button 
                  onClick={() => { setSearchOpen(false); router.push(`${basePath}/loans/new`); }}
                  className="flex items-center gap-3 p-3 text-sm font-semibold text-left transition-all bg-white border border-slate-200 text-slate-700 rounded-xl hover:border-red-200 hover:bg-red-50/50 group"
                >
                  <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-red-100 group-hover:text-red-500 transition-colors">
                     <Command size={14} />
                  </div>
                  Start New Application
                </button>
                <button 
                  onClick={() => { setSearchOpen(false); router.push(`${basePath}/settings`); }}
                  className="flex items-center gap-3 p-3 text-sm font-semibold text-left transition-all bg-white border border-slate-200 text-slate-700 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 group"
                >
                  <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500 transition-colors">
                     <Settings size={14} />
                  </div>
                  Platform Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 THE TOP BAR UI */}
      <header className="flex items-center justify-between h-[72px] px-4 bg-white border-b sm:px-8 border-slate-200 shrink-0 sticky top-0 z-[50]">
        
        {/* LEFT: Menu Toggle & Search Bar */}
        <div className="flex items-center flex-1 gap-4 mr-6">
          <button 
            className="p-2 -ml-2 transition-colors rounded-xl text-slate-500 lg:hidden hover:bg-slate-50 hover:text-red-600" 
            onClick={onMenuClick}
            aria-label="Toggle Sidebar"
          >
            <Menu size={22} />
          </button>

          <div 
            onClick={() => setSearchOpen(true)}
            className="items-center hidden w-full max-w-md px-4 transition-all border cursor-pointer h-11 bg-slate-50/80 border-slate-200 sm:flex text-slate-400 rounded-2xl hover:bg-white hover:border-slate-300 hover:shadow-sm group"
          >
            <Search size={18} className="mr-3 transition-colors group-hover:text-red-500" />
            <span className="flex-1 text-sm font-medium">Search the platform...</span>
            <kbd className="hidden lg:flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-white border border-slate-200 text-slate-400 rounded-lg shadow-sm group-hover:text-slate-600">
              <Command size={12} /> K
            </kbd>
          </div>
        </div>

        {/* RIGHT: Utilities & Profile */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          
          <button 
            onClick={() => setSearchOpen(true)}
            className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-slate-50 rounded-xl transition-all sm:hidden"
          >
            <Search size={20} />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2.5 text-slate-500 hover:text-red-600 hover:bg-slate-50 rounded-xl transition-all active:scale-95 group"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-600 border-2 border-white rounded-full group-hover:border-slate-50 transition-colors" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 z-[60] mt-3 overflow-hidden duration-200 bg-white border shadow-2xl w-80 rounded-2xl border-slate-100 animate-in fade-in slide-in-from-top-2">
                 <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Alerts</h3>
                    <button onClick={() => setUnreadCount(0)} className="text-[10px] font-bold text-red-600 hover:underline">Clear all</button>
                 </div>
                 <div className="p-6 text-center bg-white">
                    {unreadCount > 0 ? (
                       <div className="space-y-3">
                          <div className="p-3 text-left border border-orange-100 rounded-xl bg-orange-50">
                             <p className="text-xs font-bold text-orange-900">New Lender Applied</p>
                             <p className="text-[10px] text-orange-700 mt-0.5">Dwight Schrute is awaiting verification.</p>
                          </div>
                       </div>
                    ) : (
                       <>
                         <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-slate-50">
                           <ShieldAlert size={20} className="text-slate-300" />
                         </div>
                         <p className="text-sm font-bold text-slate-900">All Clear</p>
                         <p className="mt-1 text-xs text-slate-500">No actionable alerts at this time.</p>
                       </>
                    )}
                 </div>
              </div>
            )}
          </div>

          <div className="hidden w-px h-8 mx-1 sm:block bg-slate-200" />

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setProfileOpen(!profileOpen)} 
              className={cn(
                "flex items-center gap-2 p-1 group rounded-full outline-none transition-all",
                profileOpen && "ring-4 ring-red-500/10"
              )}
            >
              {/* 🟢 UPGRADED: Dynamic Avatar rendering identical to WebsiteNavbar */}
              <div className="relative">
                <div className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm transition-all duration-300 ring-2 ring-offset-2 overflow-hidden",
                  profileOpen ? "ring-red-600 shadow-md" : "ring-transparent group-hover:ring-slate-200",
                  profileImage ? "bg-transparent text-transparent" : "bg-slate-900 text-white",
                  isImpersonating && !profileOpen ? "ring-red-600 shadow-red-200/50" : ""
                )}>
                  {profileImage ? (
                     <img src={profileImage} alt={user?.name || "Profile"} className="object-cover w-full h-full" />
                  ) : (
                     safeInitials
                  )}
                </div>

                {isImpersonating && (
                  <span className="absolute z-10 flex w-3 h-3 -top-1 -right-1">
                    <span className="absolute inline-flex w-full h-full bg-red-400 rounded-full opacity-75 animate-ping"></span>
                    <span className="relative inline-flex w-3 h-3 bg-red-500 border border-white rounded-full"></span>
                  </span>
                )}
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 z-[60] w-64 py-2 mt-3 bg-white border shadow-2xl border-slate-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-5 py-3 mb-2 border-b border-slate-50">
                  <p className="text-sm font-bold truncate text-slate-900">{isLoggingOut ? 'Signing out...' : (user?.name || 'Authorized User')}</p>
                  <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest mt-0.5">{userRoleDisplay}</p>
                </div>
                
                <div className="px-2 space-y-1">
                  <Link 
                    href={`${basePath}/profile`} 
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <UserIcon size={16} className="text-slate-400" /> Security Profile
                  </Link>
                  <Link 
                    href={`${basePath}/settings`} 
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <Settings size={16} className="text-slate-400" /> Platform Config
                  </Link>
                </div>
                
                <div className="h-px mx-2 my-2 bg-slate-100" />
                
                <div className="px-2">
                  <button 
                    onClick={handleLogout} 
                    disabled={isLoggingOut}
                    className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 transition-colors group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut size={16} className="transition-transform group-hover:-translate-x-1" />
                      <span>{isImpersonating ? 'End Proxy Session' : 'Sign Out'}</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}