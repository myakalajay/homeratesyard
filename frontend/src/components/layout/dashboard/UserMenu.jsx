'use client'; // 🟢 FIX 1: Required for interactive state and hooks in App Router

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { LogOut, Settings, User as UserIcon, ChevronDown, ShieldCheck } from 'lucide-react';
// 🟢 FIX 2: Standardized Auth Hook
import { useAuthContext } from '@/components/providers/AuthProvider'; 
import UserAvatar from '@/components/navigation/shared/UserAvatar';
import { cn } from '@/utils/utils';

/**
 * UserMenu Component - Executive Identity Controller
 * Handles account navigation and session termination with premium interactions.
 */
const UserMenu = () => {
  // 🟢 FIX 3: Replaced useAuth with useAuthContext
  const { user, logout } = useAuthContext(); 
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef(null);

  // 🟢 FIX 4: Hydration safety check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Optimized dropdown closer
  const closeMenu = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeMenu]);

  // Derived Role Badge Config
  const roleDisplay = useMemo(() => {
    const role = user?.role?.replace('_', ' ').toUpperCase() || 'SYSTEM USER';
    const isSuper = user?.role === 'super_admin';
    return {
      label: role,
      className: isSuper ? "text-red-600 bg-red-50 border-red-100" : "text-slate-500 bg-slate-50 border-slate-100"
    };
  }, [user?.role]);

  // Prevent hydration mismatch and null crashes
  if (!mounted || !user) return null;

  return (
    <div className="relative" ref={menuRef}>
      
      {/* --- TRIGGER INTERFACE --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={cn(
          "flex items-center gap-3 p-1.5 transition-all duration-300 rounded-2xl border outline-none group active:scale-[0.98]",
          isOpen 
            ? "bg-white border-red-200 shadow-lg ring-4 ring-red-500/5" 
            : "border-transparent hover:bg-slate-50"
        )}
      >
        <div className="relative">
          <UserAvatar user={user} className="border shadow-sm w-9 h-9 border-slate-200" />
          {/* Active status pulse for executive presence */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
        </div>

        <div className="hidden text-left lg:block">
          <p className="text-sm font-bold tracking-tight transition-colors text-slate-900 group-hover:text-red-600">
            {user.name || 'Authorized Admin'}
          </p>
          <div className={cn(
            "mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-black tracking-widest border inline-block",
            roleDisplay.className
          )}>
            {roleDisplay.label}
          </div>
        </div>

        <ChevronDown 
          size={16} 
          className={cn(
            "hidden text-slate-400 lg:block transition-transform duration-300 ease-premium",
            isOpen && "rotate-180 text-red-500"
          )} 
        />
      </button>

      {/* --- PREMIUM DROPDOWN OVERLAY --- */}
      <div 
        className={cn(
          "absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/60 transition-all duration-300 origin-top-right z-[100] overflow-hidden",
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        )}
      >
        {/* Profile Header Block */}
        <div className="px-5 py-4 border-b bg-slate-50/50 border-slate-100">
          <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-400 mb-1">Session Identity</p>
          <p className="text-sm font-bold truncate text-slate-900">{user.name}</p>
          <p className="text-xs font-medium truncate text-slate-500">{user.email}</p>
        </div>

        {/* Action Links */}
        <div className="p-2 space-y-1">
          <MenuLink 
            href="/dashboard/profile" 
            icon={UserIcon} 
            label="Security Profile" 
            onClick={closeMenu} 
          />
          <MenuLink 
            href="/dashboard/settings" 
            icon={Settings} 
            label="Platform Config" 
            onClick={closeMenu} 
          />
        </div>

        {/* Termination Block */}
        <div className="p-2 border-t border-slate-100 bg-red-50/20">
          <button 
            onClick={() => { closeMenu(); logout(); }}
            className="flex items-center w-full gap-3 px-4 py-3 text-sm font-black text-red-600 transition-all rounded-xl hover:bg-red-600 hover:text-white group"
          >
            <LogOut size={18} className="transition-transform group-hover:-translate-x-1" /> 
            <span>TERMINATE SESSION</span>
          </button>
        </div>
      </div>

    </div>
  );
};

/**
 * Internal Link Sub-component for consistent UI
 */
const MenuLink = ({ href, icon: Icon, label, onClick }) => (
  <Link 
    href={href}
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all text-slate-600 rounded-xl hover:bg-slate-100 hover:text-slate-900 group"
  >
    <Icon size={18} className="transition-colors text-slate-400 group-hover:text-red-500" />
    <span>{label}</span>
  </Link>
);

export default UserMenu;