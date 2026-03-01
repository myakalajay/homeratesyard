'use client';

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { 
  Users, Briefcase, CheckCircle, AlertTriangle, 
  Shield, Activity, TrendingUp, MessageSquare, 
  ArrowUpRight, ArrowDownRight, Zap, Target,
  FileText, Globe, AlertCircle, RefreshCw
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout'; 
import { useToast } from '@/context/ToastContext';
import { adminService } from '@/services/admin.service';
import RouteGuard from '@/components/auth/RouteGuard';
import { cn } from '@/utils/utils';

// --- DICTIONARY FOR DYNAMIC AUDIT LOGS ---
const AUDIT_CONFIG = {
  verification: { icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  pdf_generation: { icon: FileText, color: 'text-red-600', bg: 'bg-red-50' },
  system_sync: { icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-50' },
  ai_chat: { icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
  default: { icon: Globe, color: 'text-slate-600', bg: 'bg-slate-100' }
};

export default function AdminDashboard() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastSync, setLastSync] = useState('');
  
  // 🟢 STRICT DEFAULTS: Prevents crashes & ensures structural integrity
  const [stats, setStats] = useState({
    totalUsers: 0,
    borrowers: 0,
    lenders: 0,
    pendingLenders: 0,
    aiInteractions: 0,
    chartData: [],
    recentActivity: []
  });

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await adminService.getStats();
      const data = response?.data || response;
      
      // 🟢 100% DYNAMIC HYDRATION: No mock fallbacks. 
      setStats({
        totalUsers: Number(data?.totalUsers ?? 0),
        borrowers: Number(data?.borrowers ?? 0),
        lenders: Number(data?.lenders ?? 0),
        pendingLenders: Number(data?.pendingLenders ?? 0),
        aiInteractions: Number(data?.aiInteractions ?? 0),
        chartData: Array.isArray(data?.chartData) ? data.chartData : [],
        recentActivity: Array.isArray(data?.recentActivity) ? data.recentActivity : []
      });
      
      updateSyncTime();
    } catch (err) {
      console.error("Dashboard Sync Failed:", err);
      setError(true);
      addToast("Failed to synchronize live platform data.", "error");
      // Reset to 0s to avoid stale data on error
      setStats({
        totalUsers: 0, borrowers: 0, lenders: 0, pendingLenders: 0, aiInteractions: 0, chartData: [], recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSyncTime = () => {
    const now = new Date();
    setLastSync(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  // Dynamic Chart Math: Find the absolute maximum value to calculate accurate percentages
  const maxChartValue = Math.max(
    ...stats.chartData.flatMap(d => [Number(d.leads || 0), Number(d.ai || 0)]),
    1 // Fallback to 1 to prevent division by zero
  );

  return (
    <RouteGuard allowedRoles={['admin', 'superadmin', 'super_admin']}>
      <DashboardLayout role="admin">
        <Head>
          <title>Executive Overview | HRY Enterprise</title>
        </Head>

        <div className="flex flex-col min-h-screen bg-[#F4F7FA] px-4 sm:px-8 pt-8 pb-12 font-sans">
          
          {/* --- 1. CORPORATE HEADER --- */}
          <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 mb-2">
                
                <h1 className="text-3xl font-bold text-[#0A1128] tracking-tight">Executive Overview</h1>
              </div>
              <p className="text-sm font-medium text-slate-500">
                Live platform metrics and AI intelligence routing. <span className="hidden sm:inline">Last synced: {lastSync || '--:--'}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {error ? (
                <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-red-700 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                  <AlertCircle size={12} /> Sync Failed
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg shadow-sm">
                  <span className="relative flex w-2 h-2">
                    <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-emerald-500"></span>
                    <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-600"></span>
                  </span>
                  Engine Online
                </div>
              )}
              
              <button 
                onClick={fetchStats}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold transition-all bg-white border shadow-sm border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 active:scale-95 text-[#0A1128] disabled:opacity-70"
              >
                <RefreshCw size={14} className={loading ? "animate-spin text-red-600" : "text-slate-400"} />
                {loading ? "Syncing..." : "Refresh Data"}
              </button>
            </div>
          </div>

          {/* --- 2. PREMIUM KPI METRICS --- */}
          <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            <CorporateStatCard 
              title="Total Platform Users" 
              value={(stats.totalUsers || 0).toLocaleString()} 
              trend="+12.5%"
              trendUp={true}
              icon={<Users className="text-[#0A1128]" />} 
              loading={loading}
            />
            <CorporateStatCard 
              title="Verified Lenders" 
              value={(stats.lenders || 0).toLocaleString()} 
              trend="+4.2%"
              trendUp={true}
              icon={<Briefcase className="text-[#0A1128]" />} 
              loading={loading}
            />
            <CorporateStatCard 
              title="Pending KYC Checks" 
              value={(stats.pendingLenders || 0).toLocaleString()} 
              trend={stats.pendingLenders > 0 ? "Action Required" : "Cleared"}
              trendUp={stats.pendingLenders === 0}
              icon={<AlertTriangle className={stats.pendingLenders > 0 ? "text-amber-600" : "text-emerald-600"} />} 
              alert={stats.pendingLenders > 0}
              loading={loading}
            />
            <CorporateStatCard 
              title="Sarah AI Interactions" 
              value={(stats.aiInteractions || 0).toLocaleString()} 
              trend="Real-Time"
              trendUp={true}
              icon={<Zap className="text-red-600" />} 
              highlight={true}
              loading={loading}
            />
          </div>

          {/* --- 3. DATA VISUALIZATION & AUDIT TRAIL --- */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            {/* Visual Analytics Column */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              <div className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-base font-bold text-[#0A1128]">Lead Generation Trajectory</h3>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">Trailing 7-day borrower acquisition vs AI engagement.</p>
                  </div>
                  <button className="text-[11px] font-bold text-slate-500 hover:text-[#0A1128] border border-slate-200 px-3 py-1.5 rounded-md transition-colors active:scale-95">
                    Export CSV
                  </button>
                </div>
                
                {/* DYNAMIC CHART RENDERER */}
                <div className="flex items-end h-48 gap-2 mt-4 sm:gap-4">
                  {stats.chartData.length > 0 ? (
                    stats.chartData.map((dataObj, idx) => (
                      <DynamicBarColumn 
                        key={idx}
                        day={dataObj.day} 
                        leadValue={Number(dataObj.leads || 0)}
                        aiValue={Number(dataObj.ai || 0)}
                        maxVal={maxChartValue}
                        active={dataObj.active} 
                      />
                    ))
                  ) : (
                    <div className="flex items-center justify-center w-full h-full border-2 border-dashed rounded-xl border-slate-100 bg-slate-50">
                      <p className="text-xs font-bold tracking-widest uppercase text-slate-400">
                        {loading ? "Aggregating Data..." : "Insufficient Data For Chart"}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-100 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#0A1128] rounded-sm"></span> Human Leads</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-sm"></span> Sarah AI Touches</div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Timeline Column */}
            <div className="flex flex-col gap-6">
              
              <div className="p-6 bg-gradient-to-br from-[#0A1128] to-[#14224A] border shadow-lg rounded-2xl border-[#0A1128] text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-red-500 rounded-full pointer-events-none opacity-20 blur-3xl mix-blend-screen" />
                 <h3 className="flex items-center gap-2 mb-2 text-base font-bold">
                   <Target size={18} className="text-red-400" /> Command Center
                 </h3>
                 <p className="mb-6 text-xs font-medium text-slate-300">Execute high-level administrative tasks.</p>
                 
                 <div className="relative z-10 flex flex-col gap-3">
                   <button 
                      disabled={stats.pendingLenders === 0}
                      className="flex items-center justify-between p-3.5 transition-all bg-white/10 border border-white/5 rounded-xl hover:bg-white/20 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                     <span className="text-sm font-bold text-white group-hover:text-white">
                       Review {(stats.pendingLenders || 0).toLocaleString()} KYC Profiles
                     </span>
                     <ArrowUpRight size={16} className="transition-colors text-slate-400 group-hover:text-white" />
                   </button>
                   <button className="flex items-center justify-between p-3.5 transition-all bg-white/10 border border-white/5 rounded-xl hover:bg-white/20 active:scale-95 group">
                     <span className="text-sm font-bold text-white group-hover:text-white">Broadcast System Notice</span>
                     <MessageSquare size={16} className="transition-colors text-slate-400 group-hover:text-white" />
                   </button>
                 </div>
              </div>

              {/* DYNAMIC AUDIT TRAIL */}
              <div className="flex-1 p-6 bg-white border shadow-sm rounded-2xl border-slate-200">
                <h3 className="mb-6 text-base font-bold text-[#0A1128]">Live Audit Trail</h3>
                
                <div className="relative ml-3 space-y-8 border-l-2 border-slate-100">
                  {stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((log) => {
                      const config = AUDIT_CONFIG[log.type] || AUDIT_CONFIG.default;
                      return (
                        <TimelineItem 
                          key={log.id}
                          icon={config.icon} 
                          title={log.title} 
                          desc={log.description} 
                          time={log.timestamp} 
                          color={config.color}
                          bg={config.bg}
                        />
                      );
                    })
                  ) : (
                    <p className="py-2 ml-4 text-xs font-bold tracking-widest uppercase text-slate-400">
                      {loading ? "Loading logs..." : "No recent activity"}
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}

// --- PURE CSS CORPORATE COMPONENTS ---

function CorporateStatCard({ title, value, trend, trendUp, icon, alert, highlight, loading }) {
  return (
    <div className={cn(
      "p-5 rounded-2xl border shadow-sm transition-all group relative overflow-hidden",
      highlight ? "bg-red-50 border-red-100" : "bg-white border-slate-200 hover:shadow-md hover:border-slate-300"
    )}>
      {highlight && <div className="absolute top-0 right-0 w-24 h-24 bg-red-500 rounded-full opacity-10 blur-2xl" />}
      
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl",
          highlight ? "bg-red-100" : "bg-slate-50 border border-slate-100"
        )}>
          {icon}
        </div>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-md",
          trendUp ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"
        )}>
          {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </div>
      </div>
      
      <div className="relative z-10">
        <p className={cn("text-[11px] font-bold uppercase tracking-widest mb-1", highlight ? "text-red-800" : "text-slate-400")}>
          {title}
        </p>
        {loading ? (
          <div className="w-24 h-8 mt-1 rounded-md bg-slate-100 animate-pulse"></div>
        ) : (
          <h4 className={cn("text-3xl font-bold tracking-tighter", alert ? "text-amber-600" : "text-[#0A1128]")}>
            {value}
          </h4>
        )}
      </div>
    </div>
  );
}

function DynamicBarColumn({ day, leadValue, aiValue, maxVal, active }) {
  // Pure mathematical percentages for inline styling (Tailwind cannot compile dynamic height classes)
  const leadPercent = Math.max((leadValue / maxVal) * 100, 4); // 4% minimum to ensure the bar is visible
  const aiPercent = Math.max((aiValue / maxVal) * 100, 4);

  return (
    <div className="flex flex-col items-center justify-end flex-1 h-full gap-2 group cursor-crosshair">
      <div className="relative flex items-end justify-center w-full h-full gap-1 sm:gap-2">
        {/* Hover Tooltip rendering real data */}
        <div className="absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0A1128] text-white text-[10px] px-2 py-1 rounded font-bold -translate-y-8 z-10 whitespace-nowrap shadow-xl">
          Leads: {leadValue} | AI: {aiValue}
        </div>
        
        {/* Mathematical Inline Styling */}
        <div 
          className={cn("w-full max-w-[16px] sm:max-w-[24px] rounded-t-sm transition-all duration-700", active ? "bg-[#0A1128]" : "bg-slate-200 group-hover:bg-slate-300")}
          style={{ height: `${leadPercent}%` }}
        ></div>
        <div 
          className={cn("w-full max-w-[16px] sm:max-w-[24px] rounded-t-sm transition-all duration-700", active ? "bg-red-500" : "bg-red-200 group-hover:bg-red-300")}
          style={{ height: `${aiPercent}%` }}
        ></div>
      </div>
      <span className={cn("text-[10px] font-bold uppercase tracking-wider", active ? "text-[#0A1128]" : "text-slate-400")}>{day}</span>
    </div>
  );
}

function TimelineItem({ icon: Icon, title, desc, time, color, bg }) {
  return (
    <div className="relative pl-6">
      <span className={cn("absolute left-[-17px] top-1 flex items-center justify-center w-8 h-8 rounded-full border-4 border-white", bg)}>
        <Icon size={12} className={color} />
      </span>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h4 className="text-sm font-bold text-[#0A1128]">{title}</h4>
          <p className="text-xs font-medium text-slate-500 mt-0.5">{desc}</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0 mt-1 sm:mt-0">
          {time}
        </span>
      </div>
    </div>
  );
}