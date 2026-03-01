'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Home, Plus, Bell, RefreshCw, TrendingDown, 
  Wallet, ArrowRight, Activity, Building, 
  Edit, Trash2, ChevronRight, Calculator
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';
import { Button } from '@/components/ui/primitives/Button';

// --- UTILITIES ---
const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
const formatRate = (value) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export default function BorrowerDashboard() {
  const { user } = useAuthContext();
  const { addToast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRefreshingNW, setIsRefreshingNW] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  // --- DATA HYDRATION ---
  useEffect(() => {
    setMounted(true);
    const fetchDashboard = async () => {
      try {
        // Mocking API call - Ready to be replaced by borrower.service.js
        await new Promise(resolve => setTimeout(resolve, 800)); 
        setDashboardData({
          netWorth: 503519,
          homesCount: 2,
          loanAmount: { total: 500000, current: 350000 },
          refiTracker: { property: 'PINE RETREAT', currentRate: 7.25, todayRate: 5.85 },
          properties: [
            { id: 1, type: 'SINGLE FAMILY', name: 'Pine Retreat', value: 500000, loan: 350000, track: true, zipCode: '77002' },
            { id: 2, type: 'TOWNHOUSE', name: 'Oak Avenue', value: 350000, loan: 200000, track: false, zipCode: '78701' },
            { id: 3, type: 'CONDO', name: 'Downtown Loft', value: 450000, loan: 300000, track: true, zipCode: '77004' },
            { id: 4, type: 'MULTI FAMILY', name: 'River View', value: 850000, loan: 600000, track: true, zipCode: '78704' }
          ],
          notifications: [
            { id: 1, message: "Market rates dropped below 6% today.", time: "2H AGO", read: false }
          ]
        });
      } catch (error) {
        addToast("Dashboard Sync Failed", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [addToast]);

  const firstName = useMemo(() => user?.name?.split(' ')[0] || 'Borrower', [user]);

  // --- HANDLERS ---
  const handleRefreshNetWorth = async () => {
    setIsRefreshingNW(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDashboardData(prev => ({ ...prev, netWorth: prev.netWorth + (Math.random() * 2000 - 500) }));
    addToast('Portfolio valuation synchronized with market data.', 'success');
    setIsRefreshingNW(false);
  };

  const handleDeleteProperty = (id, name) => {
    if (window.confirm(`Remove ${name} from your portfolio?`)) {
      setDashboardData(prev => {
        const updatedProperties = prev.properties.filter(p => p.id !== id);
        
        // 🟢 FIX: Prevent Ghost Pages (Recalculate pagination immediately)
        const newTotalPages = Math.ceil(updatedProperties.length / ITEMS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        } else if (updatedProperties.length === 0) {
          setCurrentPage(1);
        }

        return {
          ...prev,
          properties: updatedProperties,
          homesCount: updatedProperties.length
        };
      });
      addToast(`${name} removed successfully.`, 'info');
    }
  };

  // 🟢 FIX: Safe hydration return
  if (!mounted) return null;

  return (
    <RouteGuard allowedRoles={['borrower']}>
      <DashboardLayout role="borrower">
        <Head><title>My Dashboard | HomeRatesYard</title></Head>

        <div className="max-w-full px-4 pt-8 pb-12 space-y-8 duration-700 animate-in fade-in slide-in-from-bottom-4 sm:px-6 lg:px-8">
          
          <DashboardHeader firstName={firstName} />

          {loading || !dashboardData ? (
            <DashboardSkeleton />
          ) : (
            <>
              {/* --- TOP ROW WIDGETS --- */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                 <NetWorthWidget 
                   netWorth={dashboardData.netWorth} 
                   isRefreshing={isRefreshingNW} 
                   onRefresh={handleRefreshNetWorth} 
                 />
                 <MarketUpdateWidget />
                 <QuickStatsWidget homesCount={dashboardData.homesCount} />
              </div>

              {/* --- MIDDLE ROW WIDGETS --- */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <RefinanceTrackerWidget data={dashboardData.refiTracker} />
                 <LoanBalanceWidget data={dashboardData.loanAmount} />
                 <InboxAlertsWidget notifications={dashboardData.notifications} />
              </div>

              {/* --- DATA TABLE SECTION --- */}
              <PropertiesTable 
                properties={dashboardData.properties}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                onDelete={handleDeleteProperty}
                onEdit={() => addToast('Edit feature coming soon.', 'info')}
              />
            </>
          )}
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}

// ==========================================
// 🧱 DASHBOARD WIDGET COMPONENTS 
// ==========================================

const DashboardHeader = ({ firstName }) => (
  <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back, {firstName}</h1>
      <p className="mt-1 text-sm font-medium text-slate-500">Here is your daily homeownership and portfolio summary.</p>
    </div>
    <div className="flex flex-col items-center w-full gap-3 sm:flex-row sm:w-auto">
       <Link href="/borrower/properties" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full gap-2 rounded-xl h-11 border-slate-200 text-slate-700 hover:bg-slate-50">
            <Home size={16} className="text-slate-500" /> Add Property
          </Button>
       </Link>
       <Link href="/borrower/explore" className="w-full sm:w-auto">
          <Button className="w-full gap-2 bg-red-600 shadow-md rounded-xl h-11 hover:bg-red-700 shadow-red-200">
            <Plus size={16} /> New Loan
          </Button>
       </Link>
    </div>
  </div>
);

const NetWorthWidget = ({ netWorth, isRefreshing, onRefresh }) => (
  <div className="flex flex-col justify-between p-7 text-white shadow-md lg:col-span-4 bg-[#B91C1C] rounded-[24px] relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-6 transition-transform duration-700 opacity-20 group-hover:scale-110">
       <Wallet size={120} className="-mt-8 -mr-8" strokeWidth={1} />
    </div>
    <div className="relative z-10">
       <p className="text-[11px] font-bold tracking-widest text-red-100 uppercase">Total Net Worth</p>
       <h2 className="mt-1 text-[40px] font-black tracking-tight">{formatCurrency(netWorth)}</h2>
    </div>
    <button 
      onClick={onRefresh}
      disabled={isRefreshing}
      className="relative z-10 flex items-center justify-center gap-2 px-5 py-2.5 mt-8 text-xs font-bold text-red-700 transition-all bg-white rounded-full w-fit hover:bg-slate-50 active:scale-95 disabled:opacity-80 shadow-sm"
    >
       <RefreshCw size={14} className={cn(isRefreshing && "animate-spin")} /> 
       {isRefreshing ? 'Syncing...' : 'Refresh Valuation'}
    </button>
  </div>
);

const MarketUpdateWidget = () => (
  <div className="flex flex-col justify-between p-7 text-white shadow-md lg:col-span-6 bg-[#0A1128] rounded-[24px] relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-6 transition-transform duration-700 opacity-10 group-hover:scale-110">
       <Activity size={140} className="-mt-4 -mr-4" strokeWidth={1} />
    </div>
    <div className="relative z-10">
       <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 border rounded-full bg-blue-900/50 border-blue-800/50">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-400">Market Update</span>
       </div>
       <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">Rates have shifted.</h3>
       <p className="max-w-sm mt-2 text-sm leading-relaxed text-slate-300">Empower your homeownership decisions with personalized loan options and technology you can trust.</p>
    </div>
    <Link href="/borrower/explore" className="relative z-10 w-full mt-6 sm:w-fit">
       <Button className="w-full gap-2 rounded-full bg-[#2563EB] hover:bg-blue-600">
         Check Today's Rates <ArrowRight size={16} />
       </Button>
    </Link>
  </div>
);

const QuickStatsWidget = ({ homesCount }) => (
  <div className="flex flex-col gap-6 lg:col-span-2">
    <div className="flex flex-col items-center justify-center p-6 bg-white border shadow-sm border-slate-200 rounded-[24px] flex-1">
       <div className="p-3 mb-4 text-red-500 bg-red-50 rounded-2xl"><Building size={24} /></div>
       <span className="text-4xl font-black text-slate-900">{homesCount}</span>
       <p className="mt-1 text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400">My Homes</p>
    </div>
  </div>
);

const RefinanceTrackerWidget = ({ data }) => {
  const maxRate = Math.max(data.currentRate, data.todayRate) + 1;
  const isLower = data.todayRate < data.currentRate;

  return (
    <div className="flex flex-col p-6 bg-white border shadow-sm border-slate-200 rounded-[24px]">
      <div className="flex items-center justify-between mb-8">
         <h3 className="text-base font-bold text-slate-900">Refinance Tracker</h3>
         <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase truncate max-w-[120px]">{data.property}</span>
      </div>
      
      <div className="flex items-end justify-center flex-1 gap-8 mb-6">
         <div className="flex flex-col items-center gap-3">
            <span className="text-sm font-bold text-slate-600">{formatRate(data.currentRate)}%</span>
            <div className="w-16 h-1.5 bg-slate-200 rounded-full" />
            <span className="text-[10px] font-bold text-slate-400">Your Rate</span>
         </div>
         <div className="flex flex-col items-center gap-3">
            <span className="text-sm font-bold text-emerald-500">{formatRate(data.todayRate)}%</span>
            <div className="w-16 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            <span className="text-[10px] font-bold text-slate-400">Today</span>
         </div>
      </div>
      
      {isLower ? (
        <Link href="/borrower/explore" className="mt-auto flex items-center justify-between w-full text-xs font-bold text-emerald-700 bg-[#ECFDF5] px-4 py-3.5 rounded-xl transition-all hover:bg-emerald-100 group">
           <span className="flex items-center gap-2"><TrendingDown size={16} /> Save {formatRate(data.currentRate - data.todayRate)}%</span>
           <span className="flex items-center gap-1 transition-transform group-hover:translate-x-1">Lock Now <ChevronRight size={14} /></span>
        </Link>
      ) : (
        <div className="mt-auto text-center text-[10px] font-semibold text-slate-400 uppercase tracking-widest py-3 bg-slate-50 rounded-xl">
           Hold steady. Rates are high.
        </div>
      )}
    </div>
  );
};

const LoanBalanceWidget = ({ data }) => {
  const equityPercent = Math.round(100 - ((data.current / data.total) * 100));
  return (
    <div className="flex flex-col p-6 bg-white border shadow-sm border-slate-200 rounded-[24px]">
      <div className="flex items-center justify-between mb-4">
         <h3 className="text-base font-bold text-slate-900">Total Loan Balance</h3>
         <div className="p-2 border rounded-lg text-slate-400 bg-slate-50 border-slate-100"><Calculator size={16} /></div>
      </div>
      <h4 className="text-[32px] font-black tracking-tight text-slate-900">{formatCurrency(data.current)}</h4>
      <p className="mt-1 text-xs font-semibold text-slate-500">Original: {formatCurrency(data.total)}</p>
      
      <div className="pt-8 mt-auto space-y-3">
         <div className="w-full h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-[#B91C1C] rounded-full transition-all duration-1000" style={{ width: `${(data.current / data.total) * 100}%` }} />
         </div>
         <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.05em]">
            <span className="text-slate-500">Balance Remaining</span>
            <span className="text-emerald-600">{equityPercent}% Equity Built</span>
         </div>
      </div>
    </div>
  );
};

const InboxAlertsWidget = ({ notifications }) => (
  <div className="flex flex-col p-6 bg-white border shadow-sm border-slate-200 rounded-[24px] relative">
    <div className="flex items-center justify-between mb-6">
       <h3 className="flex items-center gap-2 text-base font-bold text-slate-900"><Bell size={18} className="text-slate-400" /> Inbox Alerts</h3>
       {notifications.some(n => !n.read) && <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />}
    </div>
    
    <div className="flex-1">
       {notifications.length === 0 ? (
         <p className="text-sm text-slate-400">No new alerts.</p>
       ) : (
         notifications.map(note => (
           <div key={note.id} className="mb-3 cursor-pointer group">
             <p className="text-sm font-semibold leading-snug transition-colors text-slate-700 group-hover:text-slate-900">{note.message}</p>
             <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{note.time}</p>
           </div>
         ))
       )}
    </div>

    <div className="pt-4 mt-auto border-t border-slate-100">
      <Link href="/borrower/support" className="text-xs font-bold text-[#B91C1C] uppercase tracking-widest hover:underline">
        View All Messages
      </Link>
    </div>
  </div>
);

const PropertiesTable = ({ properties, currentPage, setCurrentPage, itemsPerPage, onDelete, onEdit }) => {
  const paginatedData = properties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(properties.length / itemsPerPage);

  return (
    <div className="bg-white border shadow-sm border-slate-200 rounded-[24px] overflow-hidden flex flex-col">
       <div className="px-6 py-5 bg-white border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">My Properties</h3>
       </div>
       
       <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
             <thead className="bg-[#0A1128] text-white">
                <tr className="text-[10px] font-bold uppercase tracking-[0.15em]">
                   <th className="px-6 py-4 rounded-tl-lg">Property Type</th>
                   <th className="px-6 py-4">Property Name</th>
                   <th className="hidden px-6 py-4 sm:table-cell">Purchase Value</th>
                   <th className="px-6 py-4">Loan Amount</th>
                   <th className="hidden px-6 py-4 md:table-cell">Tracking</th>
                   <th className="hidden px-6 py-4 lg:table-cell">Zip Code</th>
                   <th className="px-6 py-4 text-right rounded-tr-lg">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {paginatedData.length === 0 ? (
                   <tr>
                      <td colSpan="7" className="py-16 text-center">
                         <Building className="mx-auto mb-3 text-slate-200" size={32} />
                         <p className="text-sm font-semibold text-slate-500">No properties in your portfolio.</p>
                      </td>
                   </tr>
                ) : (
                   paginatedData.map((prop) => (
                      <tr key={prop.id} className="transition-colors hover:bg-slate-50 group">
                         <td className="px-6 py-5 text-xs font-bold tracking-wider text-slate-400">{prop.type}</td>
                         <td className="px-6 py-5 text-sm font-bold text-slate-900">{prop.name}</td>
                         <td className="hidden px-6 py-5 font-mono text-sm font-semibold text-slate-700 sm:table-cell">{formatCurrency(prop.value)}</td>
                         <td className="px-6 py-5 font-mono text-sm font-semibold text-slate-700">{formatCurrency(prop.loan)}</td>
                         <td className="hidden px-6 py-5 text-xs font-bold md:table-cell">
                            {prop.track ? <span className="text-emerald-500">ACTIVE</span> : <span className="text-slate-400">PAUSED</span>}
                         </td>
                         <td className="hidden px-6 py-5 font-mono text-sm text-slate-500 lg:table-cell">{prop.zipCode}</td>
                         <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-3 transition-opacity md:opacity-60 md:group-hover:opacity-100">
                               <button onClick={onEdit} className="transition-colors text-slate-400 hover:text-slate-900"><Edit size={16} /></button>
                               <button onClick={() => onDelete(prop.id, prop.name)} className="transition-colors text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                            </div>
                         </td>
                      </tr>
                   ))
                )}
             </tbody>
          </table>
       </div>
       
       {totalPages > 0 && (
         <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500">
               Showing <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, properties.length)}</span> of <span className="font-bold text-slate-900">{properties.length}</span>
            </p>
            <div className="flex items-center gap-1">
               <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-colors">
                 &lsaquo;
               </button>
               <div className="w-7 h-7 text-xs font-bold text-white bg-[#B91C1C] rounded flex items-center justify-center shadow-sm">
                 {currentPage}
               </div>
               <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-colors">
                 &rsaquo;
               </button>
            </div>
         </div>
       )}
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="h-48 bg-slate-200 rounded-[24px] lg:col-span-4" />
      <div className="h-48 bg-slate-200 rounded-[24px] lg:col-span-6" />
      <div className="h-48 bg-slate-200 rounded-[24px] lg:col-span-2" />
    </div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="h-56 bg-slate-200 rounded-[24px]" />
      <div className="h-56 bg-slate-200 rounded-[24px]" />
      <div className="h-56 bg-slate-200 rounded-[24px]" />
    </div>
    <div className="h-64 bg-slate-200 rounded-[24px]" />
  </div>
);