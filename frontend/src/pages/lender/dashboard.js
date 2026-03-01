'use client';

import React, { useState } from 'react';
import Head from 'next/head';
import { 
  DollarSign, FileCheck, TrendingUp, 
  Plus, ArrowUpRight, Search, Clock, Activity,
  FileText, CheckCircle2, XCircle, ChevronRight, Inbox
} from 'lucide-react';

import { useAuthContext } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/primitives/Button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SideDrawer from '@/components/ui/SideDrawer';
import { cn } from '@/utils/utils';

export default function LenderDashboard() {
  const { user } = useAuthContext();
  
  // State for the Contextual "New App" Drawer
  const [isNewAppDrawerOpen, setIsNewAppDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 🟢 FIX: Used explicit Tailwind class strings to prevent PurgeCSS from stripping colors in production
  const pipelineStats = [
    { label: 'Active Pipeline', value: '$1.2M', trend: '+12%', icon: TrendingUp, iconStyle: 'bg-emerald-50 text-emerald-600', trendStyle: 'text-emerald-700 bg-emerald-50' },
    { label: 'Pending Docs', value: '4', trend: 'Urgent', icon: Clock, iconStyle: 'bg-orange-50 text-orange-600', trendStyle: 'text-orange-700 bg-orange-50 animate-pulse' },
    { label: 'Funded (MTD)', value: '$850K', trend: '+5%', icon: FileCheck, iconStyle: 'bg-red-50 text-red-600', trendStyle: 'text-emerald-700 bg-emerald-50' },
    { label: 'Commission Wallet', value: '$25,000', trend: 'Available', icon: DollarSign, iconStyle: 'bg-slate-50 text-slate-600', trendStyle: 'text-slate-600 bg-slate-100' },
  ];

  const recentApps = [
    { id: 'APP-9921', name: 'Pam Beesly', amount: '$310,000', type: 'FHA 30-Year', status: 'In Review', date: 'Today, 9:41 AM' },
    { id: 'APP-9920', name: 'Jim Halpert', amount: '$850,000', type: 'Jumbo Refi', status: 'Rejected', date: 'Yesterday' },
    { id: 'APP-9899', name: 'Michael Scott', amount: '$425,000', type: 'Conventional', status: 'Funded', date: 'Oct 1, 2025' },
    { id: 'APP-9898', name: 'Dwight Schrute', amount: '$620,000', type: 'Conventional', status: 'In Review', date: 'Sep 28, 2025' },
  ];

  const filteredApps = recentApps.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Lender Pipeline | HomeRatesYard</title>
      </Head>

      {/* 🟢 Smooth entry animation mapping the Borrower Dashboard */}
      <div className="mx-auto max-w-[1200px] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-12">
        
        {/* --- 1. MODERN HEADER --- */}
        <div className="flex flex-col items-start justify-between gap-6 mt-2 mb-8 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Pipeline Overview
            </h1>
            <p className="mt-2 text-base font-medium text-slate-500">
              You have <strong className="text-slate-900">4</strong> active applications requiring attention today.
            </p>
          </div>
          
          <div className="flex w-full md:w-auto">
            <Button 
              onClick={() => setIsNewAppDrawerOpen(true)}
              className="flex-1 h-11 px-8 font-bold text-white transition-all bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/10 rounded-xl md:flex-none active:scale-[0.98]"
            >
              <Plus size={18} className="mr-2" />
              New Application
            </Button>
          </div>
        </div>

        {/* --- 2. STATS GRID (Soft UI, high data density) --- */}
        <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          {pipelineStats.map((stat, idx) => (
            <div key={idx} className="p-6 transition-all duration-300 bg-white border shadow-sm cursor-pointer border-slate-200 rounded-3xl hover:shadow-lg hover:-translate-y-1 group">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-12 h-12 flex items-center justify-center rounded-2xl transition-colors", stat.iconStyle)}>
                  <stat.icon size={22} strokeWidth={2.5} />
                </div>
                <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider", stat.trendStyle)}>
                  {stat.trend}
                </span>
              </div>
              <p className="mb-1 text-xs font-semibold tracking-widest uppercase text-slate-400">{stat.label}</p>
              <p className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* --- 3. PIPELINE TABLE (Airy, highly scannable) --- */}
        <div className="overflow-hidden bg-white border shadow-sm border-slate-200 rounded-3xl">
          <div className="flex flex-col items-start justify-between gap-4 p-6 border-b sm:flex-row sm:items-center border-slate-100 bg-slate-50/50">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Activity size={18} className="text-slate-400"/>
              Active Deal Flow
            </h3>
            <div className="relative w-full group sm:w-auto">
              <Search className="absolute transition-colors -translate-y-1/2 left-3 top-1/2 text-slate-400 group-focus-within:text-red-600" size={16} />
              <input 
                type="text" 
                placeholder="Search borrower or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2.5 pr-4 text-sm font-medium transition-all border-none outline-none pl-9 bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-red-600/20 sm:w-72"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Borrower / ID</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Loan Details</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Stage</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-right text-slate-400 uppercase tracking-widest border-b border-slate-100">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredApps.length > 0 ? (
                  filteredApps.map((app, idx) => (
                    <tr key={idx} className="transition-colors cursor-pointer hover:bg-slate-50 group">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold transition-colors text-slate-900 group-hover:text-red-600">{app.name}</div>
                        <div className="text-[11px] text-slate-500 font-medium tracking-wider mt-0.5">{app.id} • {app.date}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 tabular-nums">{app.amount}</div>
                        <div className="text-xs font-medium text-slate-500 mt-0.5">{app.type}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-widest",
                          app.status === 'Funded' && 'bg-emerald-50 text-emerald-700',
                          app.status === 'Rejected' && 'bg-red-50 text-red-700',
                          app.status === 'In Review' && 'bg-orange-50 text-orange-700'
                        )}>
                          {app.status === 'Funded' && <CheckCircle2 size={12} />}
                          {app.status === 'Rejected' && <XCircle size={12} />}
                          {app.status === 'In Review' && <Clock size={12} />}
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2.5 transition-all rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50">
                          <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-slate-50 text-slate-400">
                          <Inbox size={24} />
                        </div>
                        <p className="text-sm font-bold text-slate-900">No applications found</p>
                        <p className="text-xs text-slate-500 mt-0.5">Try adjusting your search terms.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 transition-colors border-t cursor-pointer border-slate-100 bg-slate-50/50 hover:bg-slate-50">
            <button className="flex items-center justify-center w-full gap-1 text-[11px] font-bold tracking-widest text-slate-500 uppercase transition-colors hover:text-slate-900">
              View All Applications <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* --- 4. CONTEXTUAL DRAWER: NEW APPLICATION --- */}
      <SideDrawer 
        isOpen={isNewAppDrawerOpen} 
        onClose={() => setIsNewAppDrawerOpen(false)}
        title="Start New Application"
        subtitle="Generate a unique invite link or enter borrower details manually."
      >
        <div className="mt-2 space-y-6">
          
          {/* Option 1: Quick Link */}
          <div className="p-5 bg-white border shadow-sm border-slate-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 text-red-600 rounded-lg bg-red-50">
                <FileText size={16} />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Send Invite Link</h4>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-slate-500">
              Send an encrypted registration link directly to your client. They will be automatically mapped to your pipeline.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="borrower@email.com" 
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
              <Button size="sm" className="text-white bg-slate-900 hover:bg-slate-800 rounded-xl">Send</Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Option 2: Manual Entry Placeholder */}
          <div className="p-5 transition-colors border cursor-pointer border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 group">
             <h4 className="mb-1 text-sm font-bold transition-colors text-slate-900 group-hover:text-red-600">Manual Application Entry</h4>
             <p className="mb-4 text-xs leading-relaxed text-slate-500">
               Fill out the 1003 loan application manually on behalf of your client.
             </p>
             <Button variant="outline" size="sm" className="w-full font-bold bg-white rounded-xl">Start 1003 Form</Button>
          </div>

        </div>
      </SideDrawer>
    </>
  );
}

// 🟢 FIX: Delegate layout strictly to the component level
LenderDashboard.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};