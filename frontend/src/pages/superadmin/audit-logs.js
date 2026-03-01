'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Shield, Clock, Search, FileText, Download, 
  RefreshCw, Terminal, Fingerprint, 
  X, ArrowUpRight, ArrowLeft, ArrowRight 
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminService } from '@/services/admin.service';
import RouteGuard from '@/components/auth/RouteGuard';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';

// --- CSV EXPORT UTILITY ---
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

export default function SecurityAuditLogs() {
  const { addToast } = useToast();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); 
  const [selectedTrace, setSelectedTrace] = useState(null); 
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const syncLedger = useCallback(async (manual = false) => {
    if (manual) setLoading(true);
    try {
      const response = await adminService.getAuditLogs();
      const safeData = Array.isArray(response) ? response : (response?.data || []);
      setLogs(safeData);
      if (manual) addToast('Security traces synchronized', 'success');
    } catch (err) {
      addToast('Sync Interrupted: Trace database offline', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { 
    setMounted(true);
    syncLedger(); 
  }, [syncLedger]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateFilter]);

  const filteredLogs = useMemo(() => {
    let result = logs;

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(log => 
        (log.action || "").toLowerCase().includes(term) ||
        (log.admin?.name || "").toLowerCase().includes(term) ||
        (log.resource || "").toLowerCase().includes(term) ||
        (log.targetId || "").toLowerCase().includes(term)
      );
    }

    if (dateFilter === 'today') {
      const today = new Date().toDateString();
      result = result.filter(l => new Date(l.createdAt).toDateString() === today);
    } else if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7); 
      result = result.filter(l => new Date(l.createdAt) >= weekAgo);
    }

    return result;
  }, [logs, search, dateFilter]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE) || 1;
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  const handleExport = () => {
    if (filteredLogs.length === 0) return addToast('No data to export', 'warning');
    const csvData = filteredLogs.map(l => ({
      ID: l.id,
      Time: new Date(l.createdAt).toISOString(),
      Actor: l.admin?.name || 'System',
      Action: l.action,
      Resource: l.resource,
      Target: l.targetId,
      Payload: JSON.stringify(l.details || {})
    }));
    exportToCSV(csvData, `Audit_Trace_${new Date().getTime()}`);
    addToast('Report downloaded successfully', 'success');
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50/50" />;

  return (
    <>
      <Head><title>Security Ledger | HomeRatesYard Enterprise</title></Head>

      <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-12">
        
        {/* --- EXECUTIVE BANNER --- */}
        <div className="relative overflow-hidden bg-[#0A1128] rounded-[2rem] p-8 md:p-10 text-white shadow-xl mt-2">
           <div className="absolute inset-0 pointer-events-none opacity-5">
              <Terminal size={400} className="absolute text-white -right-10 -bottom-10 rotate-12" />
           </div>

           <div className="relative z-10 flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
              <div className="space-y-3">
                 <div className="flex items-center gap-2">
                    <Shield size={14} className="text-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Immutable Audit Protocol</span>
                 </div>
                 <h1 className="text-3xl font-bold tracking-tight text-white font-display sm:text-4xl">Security Ledger</h1>
                 <p className="max-w-md text-sm font-medium text-slate-400">
                    Administrative trace auditing, session overrides, and protocol state transitions.
                 </p>
              </div>

              <div className="flex items-center w-full gap-8 lg:w-auto">
                 <div className="hidden gap-8 pr-8 border-r sm:flex border-white/10">
                    <LogMetric label="Total Traces" value={logs.length} />
                    <LogMetric label="Critical Events" value={logs.filter(l => l.action?.includes('DELETE')).length} highlight />
                 </div>
                 <button 
                   onClick={() => syncLedger(true)} 
                   disabled={loading}
                   className="flex items-center justify-center flex-1 h-11 gap-2 px-6 text-sm font-bold transition-all bg-white shadow-lg lg:flex-none text-slate-950 rounded-xl hover:bg-slate-50 active:scale-[0.98] disabled:opacity-70"
                 >
                    <RefreshCw size={16} className={cn(loading && "animate-spin")} />
                    Sync Ledger
                 </button>
              </div>
           </div>
        </div>

        {/* --- 🟢 UX FIX: ALIGNED UTILITIES & FILTERS --- */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
           <div className="flex flex-col items-center w-full gap-3 sm:flex-row">
              
              {/* Search Bar - Fixed Height to h-11 */}
              <div className="relative w-full max-w-md group">
                 <Search className="absolute transition-colors -translate-y-1/2 left-3.5 top-1/2 text-slate-400 group-focus-within:text-red-500" size={16} />
                 <input 
                   type="text"
                   placeholder="Search actor, action, or node..."
                   className="w-full pl-10 pr-4 text-sm font-medium transition-all bg-white border shadow-sm outline-none h-11 border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                 />
              </div>
              
              {/* Segmented Filter Control - Fixed Height to h-11 */}
              <div className="flex items-center w-full p-1 border h-11 bg-slate-100/80 rounded-xl border-slate-200/60 sm:w-auto">
                 <FilterButton active={dateFilter === 'all'} label="All Time" onClick={() => setDateFilter('all')} />
                 <FilterButton active={dateFilter === 'today'} label="Today" onClick={() => setDateFilter('today')} />
                 <FilterButton active={dateFilter === 'week'} label="7 Days" onClick={() => setDateFilter('week')} />
              </div>
           </div>

           {/* Export Button - Fixed Height to h-11 */}
           <button 
             onClick={handleExport} 
             className="flex items-center justify-center w-full gap-2 px-6 h-11 text-[11px] font-bold tracking-widest uppercase transition-all bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm md:w-auto text-slate-700 active:scale-[0.98]"
           >
              <Download size={14} /> Export Report
           </button>
        </div>

        {/* --- HIGH-DENSITY DATA GRID --- */}
        <div className="flex flex-col overflow-hidden bg-white border shadow-sm border-slate-200 rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              {/* 🟢 UX FIX: Added background color to table header for contrast */}
              <thead className="border-b bg-slate-50 border-slate-200">
                <tr className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  <th className="px-6 py-4">Temporal Trace</th>
                  <th className="px-6 py-4">Administrative Actor</th>
                  <th className="px-6 py-4 text-center">Protocol Action</th>
                  <th className="px-6 py-4">Target Resource</th>
                  <th className="px-6 py-4 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="5" className="py-24 text-center"><RefreshCw className="mx-auto mb-4 animate-spin text-slate-300" size={32} /></td></tr>
                ) : paginatedLogs.length === 0 ? (
                  /* 🟢 UX FIX: Styled Empty State */
                  <tr>
                    <td colSpan="5" className="py-24 text-center bg-slate-50/50">
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center justify-center w-12 h-12 mb-4 bg-white border rounded-full shadow-sm border-slate-200 text-slate-400">
                           <Shield size={24} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">No Security Traces Found</h3>
                        <p className="mt-1 text-xs font-medium text-slate-500">Try adjusting your search criteria or date filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map(log => (
                    <tr key={log.id} className="transition-all cursor-pointer hover:bg-slate-50 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                          <Clock size={14} className="text-slate-400" />
                          <div>
                             <p className="leading-none text-slate-900">{new Date(log.createdAt).toLocaleDateString()}</p>
                             <p className="text-[9px] opacity-70 uppercase mt-1 leading-none">{new Date(log.createdAt).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 transition-colors rounded-lg bg-slate-100 text-slate-400 group-hover:bg-red-50 group-hover:text-red-600">
                             <Fingerprint size={16} strokeWidth={2} />
                          </div>
                          <div>
                            <p className="text-sm font-bold leading-none text-slate-900">{log.admin?.name || 'System Execution'}</p>
                            <p className="text-[10px] font-medium text-slate-400 mt-1 font-mono italic">{log.ipAddress || 'Internal_Node'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ActionBadge action={log.action} />
                      </td>
                      <td className="px-6 py-4">
                         <ResourceLink resource={log.resource} targetId={log.targetId} />
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => setSelectedTrace(log)}
                           className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-600 transition-colors border border-transparent hover:border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50"
                         >
                            <FileText size={14} /> View Trace
                         </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          {!loading && filteredLogs.length > 0 && (
             <div className="flex flex-col items-center justify-between gap-4 px-6 py-4 border-t bg-slate-50/50 border-slate-200 sm:flex-row">
                <p className="text-xs font-medium text-slate-500">
                  Showing <span className="font-bold text-slate-900">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)}</span> of <span className="font-bold text-slate-900">{filteredLogs.length}</span> traces
                </p>
                <div className="flex items-center gap-2">
                   <button 
                     disabled={currentPage === 1}
                     onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                     className="p-2 transition-colors bg-white border rounded-lg shadow-sm border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
                   >
                     <ArrowLeft size={16} />
                   </button>
                   <div className="px-3 text-xs font-bold text-slate-700">
                     Page {currentPage} of {totalPages}
                   </div>
                   <button 
                     disabled={currentPage === totalPages}
                     onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                     className="p-2 transition-colors bg-white border rounded-lg shadow-sm border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
                   >
                     <ArrowRight size={16} />
                   </button>
                </div>
             </div>
          )}
        </div>

        <TracePanel 
           isOpen={!!selectedTrace} 
           onClose={() => setSelectedTrace(null)} 
           trace={selectedTrace} 
        />

      </div>
    </>
  );
}

// ==========================================
// 🧱 REFINED ATOMS 
// ==========================================

const LogMetric = ({ label, value, highlight }) => (
  <div className="text-center">
    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={cn("text-2xl font-bold font-mono tracking-tight", highlight ? "text-red-500" : "text-white")}>{value}</p>
  </div>
);

// 🟢 UX FIX: Styled as a clean segmented control pill
const FilterButton = ({ active, label, onClick }) => (
  <button onClick={onClick} className={cn(
    "h-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
    active ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
  )}>
    {label}
  </button>
);

const ActionBadge = ({ action }) => {
  const normalized = action?.toUpperCase() || "";
  const getStyle = () => {
    if (normalized.includes('DELETE')) return "bg-red-50 text-red-700 border-red-100";
    if (normalized.includes('CREATE') || normalized.includes('VERIFY')) return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (normalized.includes('UPDATE')) return "bg-orange-50 text-orange-700 border-orange-100";
    if (normalized.includes('IMPERSONATE')) return "bg-purple-50 text-purple-700 border-purple-100 animate-pulse";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };
  return <span className={cn("px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest border rounded-md", getStyle())}>{action}</span>;
};

const ResourceLink = ({ resource, targetId }) => (
  <div className="space-y-1">
    <p className="text-[11px] font-bold text-slate-700 uppercase leading-none">{resource || 'SYSTEM'}</p>
    {targetId && (
      <Link href={resource?.toUpperCase().includes('USER') ? `/superadmin/users/${targetId}` : `/superadmin/loans/${targetId}`} className="text-[10px] font-medium text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-1 group w-fit">
        #{targetId.slice(0, 8)} <ArrowUpRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
      </Link>
    )}
  </div>
);

const TracePanel = ({ isOpen, onClose, trace }) => {
  const displayTrace = trace || {}; 

  return (
    <>
       <div 
         className={cn(
           "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] transition-opacity duration-300",
           isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
         )} 
         onClick={onClose}
       />
       
       <div className={cn(
         "fixed top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-2xl z-[250] border-l border-slate-200 transform transition-transform duration-300 ease-out flex flex-col",
         isOpen ? "translate-x-0" : "translate-x-full"
       )}>
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/80">
             <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-red-600 shadow-sm">
                   <Terminal size={18} />
                </div>
                <div>
                   <h3 className="text-sm font-bold tracking-wide uppercase text-slate-900">Trace Payload</h3>
                   <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {displayTrace.id?.slice(0,8)}</p>
                </div>
             </div>
             <button onClick={onClose} className="p-2 transition-all rounded-full text-slate-400 hover:text-slate-900 hover:bg-white"><X size={20}/></button>
          </div>
          
          <div className="flex-1 p-6 space-y-8 overflow-y-auto sm:p-8">
             <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">JSON Metadata</p>
                <div className="p-6 overflow-x-auto border shadow-inner bg-slate-950 rounded-2xl border-slate-800 custom-scrollbar">
                    <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(displayTrace.details || { "status": "No payload body attached to this trace." }, null, 2)}
                    </pre>
                </div>
             </div>
             
             <div className="pt-6 space-y-5 border-t border-slate-100">
                <TraceDetail label="Timestamp" value={displayTrace.createdAt ? new Date(displayTrace.createdAt).toLocaleString() : '-'} />
                <TraceDetail label="Actor IP" value={displayTrace.ipAddress || 'Internal Gateway'} />
                <TraceDetail label="Resource Node" value={displayTrace.resource} />
                <TraceDetail label="Protocol Action" value={displayTrace.action} />
             </div>
          </div>

          <div className="p-6 bg-white border-t border-slate-100">
             <button onClick={onClose} className="w-full py-3.5 text-xs font-bold tracking-widest uppercase transition-all text-slate-600 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl active:scale-[0.98]">
                Close Trace Panel
             </button>
          </div>
       </div>
    </>
  );
};

const TraceDetail = ({ label, value }) => (
  <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-100">
     <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
     <span className="font-mono text-xs font-semibold text-slate-900">{value}</span>
  </div>
);

SecurityAuditLogs.getLayout = (page) => (
  <RouteGuard allowedRoles={['superadmin', 'super_admin']}>
    <DashboardLayout>{page}</DashboardLayout>
  </RouteGuard>
);