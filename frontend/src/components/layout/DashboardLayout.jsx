'use client';

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/providers/AuthProvider';

import DashboardSidebar from './dashboard/Sidebar'; 
import DashboardTopBar from './dashboard/TopBar'; // 🟢 INJECTED THE NEW COMPONENT
import ImpersonationBanner from '@/components/ImpersonationBanner';

export default function DashboardLayout({ children }) {
  const { loading } = useAuthContext();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Handle Hydration Loading State
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
           <div className="w-10 h-10 border-4 rounded-full border-slate-200 border-t-red-600 animate-spin" />
           <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 animate-pulse">Initializing Interface</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-slate-50">
      
      {/* 1. TOP-LEVEL IMPERSONATION ALERT */}
      <ImpersonationBanner />

      <div className="flex flex-1 overflow-hidden">
        
        {/* 2. SIDEBAR */}
        <DashboardSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* 3. MAIN CONTENT AREA */}
        <div className="flex flex-col flex-1 min-w-0">
          
          {/* 4. INJECTED SEGREGATED TOPBAR */}
          <DashboardTopBar onMenuClick={() => setSidebarOpen(true)} />

          {/* 5. PAGE CONTENT RENDERER */}
          <main className="flex-1 overflow-y-auto bg-slate-50/50 scroll-smooth custom-scrollbar">
            <div className="duration-500 max-w-7xl animate-in fade-in slide-in-from-bottom-2">
              {children}
            </div>
          </main>
          
        </div>
      </div>
    </div>
  );
}