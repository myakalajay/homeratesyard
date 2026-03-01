'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  Users, DollarSign, Activity, 
  ShieldAlert, ArrowUpRight, Download,
  AlertTriangle, FileText, RefreshCw, Clock
} from 'lucide-react';

import { useAuthContext } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/primitives/Button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { adminService } from '@/services/admin.service';
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

export default function SuperAdminDashboard() {
  const { user } = useAuthContext();
  const router = useRouter();
  const { addToast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);

  // --- REAL LIVE DATA FETCHING ---
  const fetchDashboardData = useCallback(async (manual = false) => {
    if (manual) setLoading(true);
    try {
      const [statsData, logsData] = await Promise.all([
        adminService.getStats(),
        adminService.getAuditLogs()
      ]);
      
      setStats(statsData);
      setRecentLogs(Array.isArray(logsData) ? logsData.slice(0, 5) : []);
      
      if (manual) addToast('Platform metrics synchronized', 'success');
    } catch (error) {
      addToast('Failed to load platform metrics', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(false), 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleExport = () => {
    if (!stats) return addToast("No data available to export", "warning");
    const exportData = [{
      "Metric": "Total Users", "Value": stats.totalUsers || 0,
      "Metric": "Total Lenders", "Value": stats.lenders || 0,
      "Metric": "Total Borrowers", "Value": stats.borrowers || 0,
      "Metric": "Pending Verifications", "Value": stats.pendingVerifications || stats.pendingLenders || 0,
      "Metric": "Total Loan Volume", "Value": `$${(stats.totalVolume || 0).toLocaleString()}`,
      "Metric": "Active Loans", "Value": stats.totalLoans || 0
    }];
    exportToCSV(exportData, `Platform_Metrics_${new Date().toISOString().split('T')[0]}`);
    addToast("Metrics exported successfully", "success");
  };

  const platformStats = [
    { 
      label: 'Total Origination Volume', 
      value: `$${(stats?.totalVolume || 0).toLocaleString()}`, 
      trend: 'All Time', 
      icon: DollarSign, 
      iconStyle: 'bg-emerald-50 text-emerald-600', 
      trendStyle: 'text-emerald-700 bg-emerald-50',
      action: () => router.push('/superadmin/loans')
    },
    { 
      label: 'Total Active Users', 
      value: (stats?.totalUsers || 0).toLocaleString(), 
      trend: `${stats?.borrowers || 0} Borrowers`, 
      icon: Users, 
      iconStyle: 'bg-blue-50 text-blue-600', 
      trendStyle: 'text-blue-700 bg-blue-50',
      action: () => router.push('/superadmin/users')
    },
    { 
      label: 'Active Loan Files', 
      value: (stats?.totalLoans || 0).toLocaleString(), 
      trend: 'In Pipeline', 
      icon: FileText, 
      iconStyle: 'bg-slate-50 text-slate-600', 
      trendStyle: 'text-slate-700 bg-slate-100',
      action: () => router.push('/superadmin/loans')
    },
    { 
      label: 'Pending Verifications', 
      value: (stats?.pendingVerifications || stats?.pendingLenders || 0).toLocaleString(), 
      trend: (stats?.pendingVerifications || stats?.pendingLenders) > 0 ? 'Needs Review' : 'All Clear', 
      icon: ShieldAlert, 
      iconStyle: (stats?.pendingVerifications || stats?.pendingLenders) > 0 ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600', 
      trendStyle: (stats?.pendingVerifications || stats?.pendingLenders) > 0 ? 'text-orange-700 bg-orange-50 animate-pulse' : 'text-emerald-700 bg-emerald-50',
      action: () => router.push('/superadmin/users?verified=false')
    },
  ];

  const funnelMetrics = useMemo(() => {
    if (!stats?.funnel) return [];
    const totalFunnel = Object.values(stats.funnel).reduce((a, b) => a + b, 0);
    // Prevents division-by-zero crashes
    if (totalFunnel === 0) return []; 
    
    return [
      { key: 'draft', label: 'Drafts', val: stats.funnel.draft || 0, color: 'bg-slate-300' },
      { key: 'submitted', label: 'Submitted', val: stats.funnel.submitted || 0, color: 'bg-blue-400' },
      { key: 'under_review', label: 'Review', val: stats.funnel.under_review || 0, color: 'bg-orange-400' },
      { key: 'approved', label: 'Approved', val: stats.funnel.approved || 0, color: 'bg-emerald-400' },
      { key: 'funded', label: 'Funded', val: stats.funnel.funded || 0, color: 'bg-emerald-600' },
    ].map(item => ({ ...item, pct: ((item.val / totalFunnel) * 100).toFixed(1) }));
  }, [stats]);

  if (!mounted) return <div className="min-h-screen bg-slate-50/50" />;

  // 🟢 FIX: Consistent RouteGuard and DashboardLayout Wrapping 
  return (
    <RouteGuard allowedRoles={['superadmin', 'super_admin']}>
      <DashboardLayout role="superadmin">
        <Head>
          <title>System Overview | Admin</title>
        </Head>

        <div className="max-w-[1200px] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out px-4 sm:px-6 lg:px-8 pb-12 pt-8">
          
          {/* --- 1. MODERN HEADER --- */}
          <div className="flex flex-col items-start justify-between gap-6 mb-8 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                System Overview
              </h1>
              <p className="mt-2 text-base font-medium text-slate-500">
                Platform health is optimal. Welcome back, <strong className="text-slate-900">{user?.name?.split(' ')[0] || 'Admin'}</strong>.
              </p>
            </div>
            
            <div className="flex flex-col w-full gap-3 sm:flex-row md:w-auto">
              <Button 
                onClick={handleExport}
                variant="outline" 
                className="flex-1 px-6 font-semibold transition-all bg-white shadow-sm h-11 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl md:flex-none active:scale-[0.98]"
              >
                <Download size={16} className="mr-2 text-slate-400" />
                Export Metrics
              </Button>
              <Button 
                onClick={() => fetchDashboardData(true)}
                disabled={loading}
                className="flex-1 px-6 font-bold text-white transition-all bg-red-600 border-none shadow-lg h-11 hover:bg-red-700 shadow-red-600/20 rounded-xl md:flex-none active:scale-[0.98]"
              >
                <RefreshCw size={16} className={cn("mr-2", loading && "animate-spin")} />
                Sync Data
              </Button>
            </div>
          </div>

          {/* --- 2. GLOBAL LIVE STATS GRID --- */}
          <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
            {platformStats.map((stat, idx) => (
              <div 
                key={idx} 
                onClick={stat.action}
                className="p-6 transition-all duration-300 bg-white border shadow-sm cursor-pointer border-slate-200 rounded-3xl hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 group"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={cn("w-12 h-12 flex items-center justify-center rounded-2xl transition-colors", stat.iconStyle)}>
                    <stat.icon size={22} strokeWidth={2.5} />
                  </div>
                  <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider", stat.trendStyle)}>
                    {stat.trend}
                  </span>
                </div>
                <p className="mb-1.5 text-xs font-semibold tracking-widest uppercase text-slate-500 group-hover:text-slate-700 transition-colors">{stat.label}</p>
                
                {loading && !stats ? (
                   <div className="w-1/2 h-8 mt-1 rounded-md bg-slate-100 animate-pulse" />
                ) : (
                   <p className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                      {stat.value}
                   </p>
                )}
              </div>
            ))}
          </div>

          {/* --- 3. MAIN WORKSPACE --- */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            
            {/* LEFT: Charts / Regional Data (8 cols) */}
            <div className="space-y-6 lg:col-span-8">
              <div className="p-8 bg-white border shadow-sm border-slate-200 rounded-3xl flex flex-col min-h-[280px]">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Application Funnel</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Real-time status distribution</p>
                  </div>
                </div>

                {loading && !stats ? (
                   <div className="flex flex-col items-center justify-center flex-1 space-y-4">
                      <div className="w-full h-8 rounded-full bg-slate-100 animate-pulse" />
                      <div className="flex justify-between w-full gap-4 px-4">
                         {[1,2,3,4,5].map(i => <div key={i} className="w-12 h-4 rounded bg-slate-100 animate-pulse" />)}
                      </div>
                   </div>
                ) : funnelMetrics.length === 0 ? (
                   <div className="flex flex-col items-center justify-center flex-1 py-6 text-center">
                      <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-slate-50 text-slate-400">
                         <Activity size={24} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">No Pipeline Data</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Loan applications will appear here once submitted.</p>
                   </div>
                ) : (
                   <div className="flex flex-col justify-center flex-1 space-y-8">
                      {/* The Stacked Bar */}
                      <div className="flex w-full h-10 overflow-hidden rounded-full shadow-inner bg-slate-50">
                         {funnelMetrics.map(item => (
                           <div 
                             key={item.key} 
                             style={{ width: `${item.pct}%` }} 
                             className={cn(
                               "h-full transition-all duration-1000 border-r border-white/20 last:border-r-0 hover:opacity-90 cursor-pointer relative group", 
                               item.color
                             )} 
                           >
                              {/* Hover Tooltip */}
                              <div className="absolute left-1/2 -top-10 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                 {item.label}: {item.val} ({item.pct}%)
                              </div>
                           </div>
                         ))}
                      </div>
                      {/* Legend */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-50">
                         {funnelMetrics.map(item => (
                           <div key={item.key} className="flex items-center gap-2.5">
                              <div className={cn("w-3.5 h-3.5 rounded-full shadow-sm", item.color)} />
                              <div className="flex flex-col">
                                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-tight">{item.label}</span>
                                 <span className="text-sm font-bold leading-tight text-slate-900">{item.val}</span>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                )}
              </div>

              {/* Quick Management Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div 
                  onClick={() => router.push('/superadmin/users')}
                  className="p-6 transition-all duration-300 bg-white border shadow-sm cursor-pointer border-slate-200 rounded-3xl hover:shadow-md hover:-translate-y-1 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 text-blue-600 transition-colors rounded-2xl bg-blue-50 group-hover:bg-blue-100">
                      <Users size={22} strokeWidth={2.5}/>
                    </div>
                    <ArrowUpRight size={20} className="transition-colors text-slate-300 group-hover:text-blue-600" />
                  </div>
                  <h4 className="mb-1.5 text-base font-bold text-slate-900">User Management</h4>
                  <p className="text-sm font-normal leading-relaxed text-slate-500">
                    Approve lenders, manage borrower access, and review identity verifications.
                  </p>
                </div>

                <div 
                  onClick={() => router.push('/superadmin/audit-logs')}
                  className="p-6 transition-all duration-300 bg-white border shadow-sm cursor-pointer border-slate-200 rounded-3xl hover:shadow-md hover:-translate-y-1 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 transition-colors rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100">
                      <FileText size={22} strokeWidth={2.5}/>
                    </div>
                    <ArrowUpRight size={20} className="transition-colors text-slate-300 group-hover:text-emerald-600" />
                  </div>
                  <h4 className="mb-1.5 text-base font-bold text-slate-900">Compliance Logs</h4>
                  <p className="text-sm font-normal leading-relaxed text-slate-500">
                    Review security traces, secure document trails, and audit histories.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT: Global Activity Ledger (4 cols) */}
            <div className="lg:col-span-4">
              <div className="flex flex-col h-full min-h-[500px] bg-white border shadow-sm border-slate-200 rounded-3xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                    <Activity size={18} className="text-slate-400"/>
                    Global Event Stream
                  </h3>
                </div>
                
                <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                  {loading && recentLogs.length === 0 ? (
                    <div className="space-y-6">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="flex gap-4">
                           <div className="w-10 h-10 rounded-full shrink-0 bg-slate-100 animate-pulse" />
                           <div className="flex-1 space-y-2 py-1.5">
                              <div className="w-3/4 h-3 rounded bg-slate-100 animate-pulse" />
                              <div className="w-1/2 h-2.5 rounded bg-slate-50 animate-pulse" />
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : recentLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
                      <ShieldAlert size={32} className="mb-3 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">No recent security events.</p>
                    </div>
                  ) : (
                    recentLogs.map((log) => {
                      const isAlert = log.action?.includes('DELETE') || log.action?.includes('IMPERSONATE');
                      return (
                        <div key={log.id} className="flex items-start gap-4 transition-transform cursor-pointer group hover:translate-x-1">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors", 
                            isAlert ? "bg-red-50 text-red-600 group-hover:bg-red-100" : "bg-slate-50 text-slate-600 group-hover:bg-slate-100"
                          )}>
                            {isAlert ? <AlertTriangle size={18} strokeWidth={2.5} /> : <Activity size={18} strokeWidth={2.5} />}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className={cn("text-sm font-bold truncate transition-colors", isAlert ? "text-red-600" : "text-slate-900")}>
                              {log.action}
                            </p>
                            <p className="mt-0.5 text-xs font-medium leading-relaxed text-slate-500 truncate">
                              By: {log.admin?.name || 'System'}
                            </p>
                            <p className="mt-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
                
                <div 
                  onClick={() => router.push('/superadmin/audit-logs')}
                  className="p-4 transition-colors border-t cursor-pointer border-slate-100 bg-slate-50/50 rounded-b-3xl hover:bg-slate-50 group shrink-0"
                >
                  <button className="flex items-center justify-center w-full gap-1 text-[11px] font-bold tracking-widest text-slate-500 uppercase transition-colors group-hover:text-slate-900">
                    View Full Audit Ledger <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}