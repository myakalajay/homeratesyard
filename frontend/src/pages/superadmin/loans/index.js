'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Globe, Search, RefreshCw, Download, 
  FileText, ArrowUpRight, ArrowLeft, ArrowRight, 
  Clock, Activity, Wallet, Copy, Check, Filter
} from 'lucide-react'; 

import DashboardLayout from '@/components/layout/DashboardLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';

// --- INLINE CSV EXPORT UTILITY ---
const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => `"${String(value || '').replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  const csvContent = `${headers}\n${rows}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Standard Currency Formatter
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
};

export default function GlobalPipeline() {
  const { addToast } = useToast();
  
  // State Management
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 🟢 NEW: 'all' | 'active' | 'funded' | 'review'
  
  // Interaction States
  const [copiedId, setCopiedId] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // --- 1. DATA SYNCHRONIZATION ---
  const loadPipeline = useCallback(async (manual = false) => {
    if (manual) setLoading(true);
    try {
      const response = await adminService.getAllLoans();
      const safeData = Array.isArray(response) ? response : (response?.data || response?.loans || []);
      setLoans(safeData);
      if (manual) addToast('Pipeline telemetry synchronized', 'success');
    } catch (error) {
      console.error("[PIPELINE ERROR]:", error);
      addToast('Sync Error: Asset database unreachable', 'error');
      setLoans([]);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { 
    setMounted(true);
    loadPipeline(); 
  }, [loadPipeline]);

  // Reset pagination on filter change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  // --- 2. ANALYTICS SUMMARY ---
  const stats = useMemo(() => {
    const totalVolume = loans.reduce((acc, l) => acc + (Number(l.amount) || 0), 0);
    return {
      count: loans.length,
      volume: formatCurrency(totalVolume),
      active: loans.filter(l => ['submitted', 'under_review', 'approved'].includes(l.status?.toLowerCase())).length
    };
  }, [loans]);

  // --- 3. 🟢 ADVANCED FILTER & PAGINATION ENGINE ---
  const filteredLoans = useMemo(() => {
    let result = loans;

    // Status Segment Filter
    if (statusFilter === 'active') {
      result = result.filter(l => ['submitted', 'under_review', 'approved'].includes(l.status?.toLowerCase()));
    } else if (statusFilter === 'funded') {
      result = result.filter(l => l.status?.toLowerCase() === 'funded');
    } else if (statusFilter === 'review') {
      result = result.filter(l => l.status?.toLowerCase() === 'under_review');
    }

    // Keyword Search
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      result = result.filter(loan => 
        (loan.borrower?.name || "").toLowerCase().includes(term) ||
        (loan.borrower?.email || "").toLowerCase().includes(term) ||
        (loan.id || "").toLowerCase().includes(term) ||
        (loan.status || "").toLowerCase().includes(term)
      );
    }
    return result;
  }, [loans, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredLoans.length / ITEMS_PER_PAGE) || 1;
  const paginatedLoans = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLoans.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLoans, currentPage]);

  // --- 4. EXPORT LOGIC ---
  const handleExport = () => {
    if (filteredLoans.length === 0) return addToast('No data to export', 'warning');
    const reportData = filteredLoans.map(l => ({
      AssetID: l.id,
      Borrower: l.borrower?.name || 'Unknown',
      Email: l.borrower?.email || 'N/A',
      Principal: l.amount || 0,
      Product: l.loanType || 'Standard',
      Status: l.status?.toUpperCase() || 'UNKNOWN',
      Created: l.createdAt ? new Date(l.createdAt).toISOString() : 'N/A'
    }));
    exportToCSV(reportData, `Global_Pipeline_Extract_${new Date().getTime()}`);
    addToast('Asset report generated successfully', 'success');
  };

  // 🟢 NEW: Enterprise Quick-Copy Utility
  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    addToast('Asset ID copied to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50/50" />;

  return (
    <>
      <Head><title>Asset Pipeline | HomeRatesYard Enterprise</title></Head>
      
      <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
        
        {/* --- EXECUTIVE COMMAND BANNER --- */}
        <div className="relative overflow-hidden bg-[#0A1128] rounded-3xl p-8 md:p-10 text-white shadow-xl border border-slate-800 mt-2">
           {/* Global Map Visualization Background */}
           <div className="absolute inset-0 pointer-events-none opacity-[0.07]">
              <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                 <path d="M0 50 Q 50 20 100 50 T 200 50" fill="none" stroke="white" strokeWidth="0.5" className="animate-pulse" />
                 <circle cx="50" cy="35" r="1" fill="white" className="animate-ping" />
                 <circle cx="150" cy="65" r="1" fill="white" />
              </svg>
           </div>

           <div className="relative z-10 flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
              <div className="space-y-3">
                 <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                    <Globe size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Global Asset Oversight</span>
                 </div>
                 <h1 className="text-3xl font-bold tracking-tight text-white font-display sm:text-4xl">Asset Pipeline</h1>
                 <p className="max-w-md text-sm font-medium leading-relaxed text-slate-400">
                    System-wide audit of active loan applications, capital distribution, and underwriting status.
                 </p>
              </div>

              <div className="flex items-center w-full gap-6 sm:w-auto">
                 <div className="hidden gap-8 pr-8 border-r sm:flex border-white/10">
                    <BannerMetric label="Total Assets" value={stats.count} icon={FileText} />
                    <BannerMetric label="Pipeline Value" value={stats.volume} icon={Wallet} highlight />
                 </div>
                 <button 
                   onClick={() => loadPipeline(true)}
                   disabled={loading}
                   className="flex items-center justify-center flex-1 gap-3 px-8 text-sm font-bold transition-all bg-white shadow-lg sm:flex-none h-12 text-slate-950 rounded-xl hover:bg-slate-50 active:scale-[0.98] disabled:opacity-70"
                 >
                    <RefreshCw size={16} className={cn(loading && "animate-spin")} />
                    Sync Data
                 </button>
              </div>
           </div>
        </div>

        {/* --- 🟢 UPGRADED: SEARCH & UTILITIES --- */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
           
           <div className="flex flex-col w-full gap-3 sm:flex-row md:w-auto">
              {/* Search Bar */}
              <div className="relative w-full max-w-sm group">
                 <Search className="absolute transition-colors -translate-y-1/2 left-3.5 top-1/2 text-slate-400 group-focus-within:text-red-500" size={16} />
                 <input 
                     type="text" 
                     placeholder="Search by Asset ID, Identity..." 
                     className="w-full pl-10 pr-4 text-sm font-medium transition-all bg-white border shadow-sm outline-none h-11 rounded-xl border-slate-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>

              {/* Status Filter Segmented Control */}
              <div className="flex items-center w-full p-1 bg-white border shadow-sm h-11 rounded-xl border-slate-200 sm:w-auto">
                 <FilterButton active={statusFilter === 'all'} label="All Assets" onClick={() => setStatusFilter('all')} />
                 <FilterButton active={statusFilter === 'active'} label="Active" onClick={() => setStatusFilter('active')} />
                 <FilterButton active={statusFilter === 'review'} label="Needs Review" onClick={() => setStatusFilter('review')} />
                 <FilterButton active={statusFilter === 'funded'} label="Funded" onClick={() => setStatusFilter('funded')} />
              </div>
           </div>

           <div className="flex items-center justify-between w-full gap-4 md:w-auto">
              <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">
                 <Clock size={14} /> Last Synced: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              <button 
                onClick={handleExport}
                disabled={filteredLoans.length === 0}
                className="flex items-center justify-center flex-1 gap-2 px-6 h-11 text-[11px] font-bold uppercase tracking-widest text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 active:scale-[0.98] md:flex-none"
              >
                 <Download size={14} /> Export CSV
              </button>
           </div>
        </div>

        {/* --- HIGH-DENSITY DATA GRID --- */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="border-b bg-slate-50 border-slate-200">
                  <tr className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                     <th className="px-6 py-4">Asset Identity</th>
                     <th className="px-6 py-4">Product Class</th>
                     <th className="px-6 py-4">Principal Value</th>
                     <th className="px-6 py-4">Submission Date</th>
                     <th className="px-6 py-4 text-center">Underwriting Status</th>
                     <th className="px-6 py-4 text-right">Audit Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                     <LoadingSkeletons count={6} />
                  ) : filteredLoans.length === 0 ? (
                     <EmptyState isSearch={searchTerm !== '' || statusFilter !== 'all'} onClear={() => { setSearchTerm(''); setStatusFilter('all'); }} />
                  ) : (
                     paginatedLoans.map(loan => (
                       <tr key={loan.id} className="transition-colors cursor-pointer group hover:bg-slate-50">
                          <td className="px-6 py-4">
                             {/* 🟢 FIX: Added Asset ID display and Quick Copy */}
                             <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs font-bold text-slate-900">
                                  #{String(loan.id).substring(0, 8).toUpperCase()}
                                </span>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleCopyId(loan.id); }}
                                  className="p-1 transition-colors rounded text-slate-300 hover:text-red-600 hover:bg-red-50"
                                  title="Copy Full Asset ID"
                                >
                                  {copiedId === loan.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                </button>
                             </div>
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-600 truncate max-w-[150px]">{loan.borrower?.name || 'Unknown Entity'}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-widest border border-slate-200 shadow-sm transition-colors group-hover:border-slate-300">
                                {loan.loanType?.replace('_', ' ') || 'STANDARD'}
                             </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-sm font-bold text-slate-900">
                             {formatCurrency(loan.amount)}
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                             {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                          </td>
                          <td className="px-6 py-4 text-center">
                             <StatusBadge status={loan.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                             <Link 
                               href={`/superadmin/loans/${loan.id}`} 
                               className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white border border-slate-200 rounded-xl hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all active:scale-95 shadow-sm opacity-60 group-hover:opacity-100"
                             >
                                <ArrowUpRight size={14} /> Audit Trace
                             </Link>
                          </td>
                       </tr>
                     ))
                  )}
                </tbody>
             </table>
          </div>

          {/* 🟢 PAGINATION: Brand Aligned */}
          {!loading && filteredLoans.length > 0 && (
             <div className="flex flex-col items-center justify-between gap-4 px-6 py-4 mt-auto border-t bg-slate-50/50 border-slate-200 sm:flex-row">
                <p className="text-xs font-medium text-slate-500">
                  Showing <span className="font-bold text-slate-900">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredLoans.length)}</span> of <span className="font-bold text-slate-900">{filteredLoans.length}</span> assets
                </p>
                <div className="flex items-center gap-2">
                   <button 
                     disabled={currentPage === 1} 
                     onClick={() => setCurrentPage(p => p - 1)} 
                     className="p-2 transition-colors bg-white border rounded-lg shadow-sm border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
                   >
                      <ArrowLeft size={16} />
                   </button>
                   <div className="px-4 py-1.5 text-xs font-bold text-slate-700">
                      Page {currentPage} of {totalPages}
                   </div>
                   <button 
                     disabled={currentPage === totalPages} 
                     onClick={() => setCurrentPage(p => p + 1)} 
                     className="p-2 transition-colors bg-white border rounded-lg shadow-sm border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
                   >
                      <ArrowRight size={16} />
                   </button>
                </div>
             </div>
          )}
        </div>

      </div>
    </>
  );
}

// ==========================================
// 🧱 HARDENED ATOMS
// ==========================================

const BannerMetric = ({ label, value, highlight, icon: Icon }) => (
  <div className="flex flex-col items-start min-w-[120px]">
    <div className="flex items-center gap-1.5 mb-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
      <Icon size={12} /> {label}
    </div>
    <p className={cn("text-2xl font-bold font-mono tracking-tight", highlight ? "text-emerald-400" : "text-white")}>{value}</p>
  </div>
);

const FilterButton = ({ active, label, onClick }) => (
  <button onClick={onClick} className={cn(
    "flex-1 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
    active ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
  )}>
    {label}
  </button>
);

const StatusBadge = ({ status }) => {
  const normalized = status?.toLowerCase() || 'draft';
  
  const styles = {
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    funded: "bg-slate-900 text-white border-slate-950 shadow-md", 
    rejected: "bg-red-50 text-red-700 border-red-200",
    submitted: "bg-orange-50 text-orange-700 border-orange-200",
    under_review: "bg-blue-50 text-blue-700 border-blue-200 animate-pulse",
    draft: "bg-slate-50 text-slate-500 border-slate-200"
  };

  return (
    <span className={cn(
      "px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest border rounded-md shadow-sm inline-block min-w-[90px]",
      styles[normalized] || styles.draft
    )}>
      {status?.replace('_', ' ')}
    </span>
  );
};

const LoadingSkeletons = ({ count }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <tr key={i} className="animate-pulse">
          <td className="px-6 py-4 space-y-2"><div className="w-24 h-4 rounded bg-slate-100"/><div className="w-32 h-3 rounded bg-slate-50"/></td>
          <td className="px-6 py-4"><div className="w-20 h-6 rounded-lg bg-slate-100"/></td>
          <td className="px-6 py-4"><div className="w-24 h-5 rounded bg-slate-100"/></td>
          <td className="px-6 py-4"><div className="w-24 h-4 rounded bg-slate-50"/></td>
          <td className="px-6 py-4"><div className="w-24 h-6 mx-auto rounded-md bg-slate-100"/></td>
          <td className="px-6 py-4"><div className="w-24 h-8 ml-auto bg-slate-50 rounded-xl"/></td>
      </tr>
    ))}
  </>
);

const EmptyState = ({ isSearch, onClear }) => (
  <tr>
      <td colSpan="6" className="py-24 text-center bg-slate-50/50">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-white border rounded-full shadow-sm border-slate-200">
             {isSearch ? <Filter size={24} className="text-slate-400" /> : <Activity size={24} className="text-slate-400" />}
          </div>
          <p className="text-sm font-bold text-slate-900">
             {isSearch ? "No matching assets found" : "Pipeline is empty"}
          </p>
          <p className="mt-1 mb-5 text-xs font-medium text-slate-500">
             {isSearch ? "Try adjusting your search criteria or status filters." : "No loan applications have been submitted to the platform yet."}
          </p>
          {isSearch && (
             <button onClick={onClear} className="text-[11px] font-bold tracking-widest text-red-600 uppercase hover:text-red-700 transition-colors bg-red-50 px-4 py-2 rounded-lg border border-red-100 hover:border-red-200">
                Clear All Filters
             </button>
          )}
      </td>
  </tr>
);

// 🟢 ROUTING: Locked down securely to Super Admins
GlobalPipeline.getLayout = (page) => (
  <RouteGuard allowedRoles={['superadmin', 'super_admin']}>
    <DashboardLayout>{page}</DashboardLayout>
  </RouteGuard>
);