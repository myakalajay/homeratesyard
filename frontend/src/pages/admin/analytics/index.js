'use client';

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { 
  LineChart, TrendingUp, Users, DollarSign, 
  RefreshCw, Activity, ShieldAlert, Target, 
  Calendar, Award, ArrowUpRight, ArrowDownRight,
  ChevronDown, Database
} from 'lucide-react';

import RouteGuard from '@/components/auth/RouteGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';

export default function AnalyticsPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [timeframe, setTimeframe] = useState('30d');
  
  // 🟢 STRICT DEFAULTS: Baseline structural integrity
  const [data, setData] = useState({
    kpis: {
      conversionRate: 0,
      avgTimeToClose: 0,
      totalVolume: 0,
      activeLenders: 0
    },
    funnel: {
      draft: 0,
      under_review: 0,
      approved: 0,
      funded: 0
    },
    topLenders: []
  });

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await adminService.getStats({ timeframe }); 
      const apiData = response?.data || response;
      
      // 🟢 100% DYNAMIC HYDRATION: No mock data fallbacks.
      // If the API returns missing fields, we mathematically enforce 0 to prevent UI crashes.
      setData({
        kpis: {
          conversionRate: Number(apiData?.kpis?.conversionRate ?? 0),
          avgTimeToClose: Number(apiData?.kpis?.avgTimeToClose ?? 0),
          totalVolume: Number(apiData?.totalVolume ?? 0),
          activeLenders: Number(apiData?.lenders ?? 0)
        },
        funnel: {
          draft: Number(apiData?.funnel?.draft ?? 0),
          under_review: Number(apiData?.funnel?.under_review ?? 0),
          approved: Number(apiData?.funnel?.approved ?? 0),
          funded: Number(apiData?.funnel?.funded ?? 0)
        },
        topLenders: Array.isArray(apiData?.topLenders) ? apiData.topLenders : []
      });

    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError(true);
      addToast("Failed to synchronize BI telemetry.", "error");
      // Explicitly zero out data on error to prevent displaying stale metrics
      setData({
        kpis: { conversionRate: 0, avgTimeToClose: 0, totalVolume: 0, activeLenders: 0 },
        funnel: { draft: 0, under_review: 0, approved: 0, funded: 0 },
        topLenders: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Funnel Math for pure CSS visualization
  const maxFunnelValue = Math.max(data.funnel.draft, 1); // Baseline is 100%

  return (
    
      <RouteGuard allowedRoles={['admin', 'superadmin', 'super_admin']}>
      <DashboardLayout role="admin">      
      <Head>
        <title>Business Intelligence | HRY Enterprise</title>
      </Head>

      <div className="flex flex-col min-h-full bg-[#F4F7FA] px-4 sm:px-8 pt-8 pb-12 font-sans">
        
        {/* --- 1. CORPORATE HEADER --- */}
        <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 mb-2">

              <h1 className="text-3xl font-bold text-[#0A1128] tracking-tight">Platform Analytics</h1>
            </div>
            <p className="text-sm font-medium text-slate-500">
              Business intelligence, conversion funnels, and performance metrics.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Timeframe Selector */}
            <div className="relative">
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#0A1128] hover:bg-slate-50 transition-all shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#0A1128]/10"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last Quarter</option>
                <option value="ytd">Year to Date</option>
              </select>
              <Calendar size={14} className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2 text-slate-400" />
              <ChevronDown size={14} className="absolute -translate-y-1/2 pointer-events-none right-3 top-1/2 text-slate-400" />
            </div>

            <button 
              onClick={fetchAnalytics}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold transition-all bg-white border shadow-sm border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 active:scale-95 text-[#0A1128] disabled:opacity-70"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-red-600" : "text-slate-400"} />
              {loading ? "Syncing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* --- 2. EXECUTIVE KPI ROW --- */}
        <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          <BIStatCard 
            title="Avg. Conversion Rate" 
            value={`${(data.kpis.conversionRate || 0).toFixed(1)}%`} 
            trend={data.kpis.conversionRate > 0 ? "Active" : "Pending"}
            trendUp={true}
            icon={<Target className="text-blue-600" />} 
            loading={loading}
          />
          <BIStatCard 
            title="Avg. Days to Close" 
            value={data.kpis.avgTimeToClose || 0} 
            trend={data.kpis.avgTimeToClose > 0 ? "Tracking" : "Pending"}
            trendUp={true} 
            icon={<Activity className="text-emerald-600" />} 
            loading={loading}
          />
          <BIStatCard 
            title="Total Funded Volume" 
            value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(data.kpis.totalVolume || 0)} 
            trend="Volume"
            trendUp={true}
            icon={<DollarSign className="text-amber-600" />} 
            highlight={true}
            loading={loading}
          />
          <BIStatCard 
            title="Active MLOs" 
            value={(data.kpis.activeLenders || 0).toLocaleString()} 
            trend="Network"
            trendUp={true}
            icon={<Users className="text-purple-600" />} 
            loading={loading}
          />
        </div>

        {/* --- 3. DATA VISUALIZATION SECTION --- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* A. CONVERSION FUNNEL (Pure CSS) */}
          <div className="flex flex-col p-6 bg-white border shadow-sm rounded-2xl border-slate-200 lg:col-span-1 min-h-[400px]">
            <h3 className="mb-1 text-base font-bold text-[#0A1128]">Application Funnel</h3>
            <p className="mb-8 text-xs font-medium text-slate-400">Drop-off rates across loan stages.</p>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center flex-1 w-full gap-3 border-2 border-dashed rounded-xl border-slate-100 bg-slate-50">
                <RefreshCw size={24} className="text-slate-300 animate-spin" />
                <p className="text-xs font-bold tracking-widest uppercase text-slate-400">Aggregating Funnel</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center flex-1 w-full gap-3 border-2 border-red-100 border-dashed rounded-xl bg-red-50">
                <ShieldAlert size={24} className="text-red-300" />
                <p className="text-xs font-bold tracking-widest text-red-500 uppercase">Sync Failure</p>
              </div>
            ) : data.funnel.draft === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 w-full gap-3 border-2 border-dashed rounded-xl border-slate-100 bg-slate-50">
                <Database size={24} className="text-slate-300" />
                <p className="text-xs font-bold tracking-widest uppercase text-slate-400">Insufficient Data</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 w-full gap-2">
                <FunnelLayer 
                  label="1. Draft / Intent" 
                  value={data.funnel.draft} 
                  percent={100} 
                  color="bg-[#0A1128]" 
                  width="w-full"
                />
                <FunnelLayer 
                  label="2. Under Review" 
                  value={data.funnel.under_review} 
                  percent={Math.round((data.funnel.under_review / maxFunnelValue) * 100) || 0} 
                  color="bg-[#1A2C5B]" 
                  width="w-[85%]"
                />
                <FunnelLayer 
                  label="3. AUS Approved" 
                  value={data.funnel.approved} 
                  percent={Math.round((data.funnel.approved / maxFunnelValue) * 100) || 0} 
                  color="bg-[#2A4385]" 
                  width="w-[65%]"
                />
                <FunnelLayer 
                  label="4. Clear to Close" 
                  value={data.funnel.funded} 
                  percent={Math.round((data.funnel.funded / maxFunnelValue) * 100) || 0} 
                  color="bg-emerald-600" 
                  width="w-[45%]"
                />
              </div>
            )}
          </div>

          {/* B. LENDER LEADERBOARD */}
          <div className="flex flex-col p-6 bg-white border shadow-sm rounded-2xl border-slate-200 lg:col-span-2 min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-[#0A1128] flex items-center gap-2">
                  <Award size={18} className="text-amber-500" /> Top Performing Lenders
                </h3>
                <p className="text-xs font-medium text-slate-400 mt-0.5">Ranked by total funded volume.</p>
              </div>
              <button className="text-[11px] font-bold text-slate-500 hover:text-[#0A1128] border border-slate-200 px-3 py-1.5 rounded-md transition-colors active:scale-95">
                View Full Report
              </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-slate-50/50 border-y border-slate-100">
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <th className="py-4 pl-4 pr-6 w-[40%]">Rank & Identity</th>
                    <th className="px-6 py-4 w-[25%]">Funded Volume</th>
                    <th className="px-6 py-4 w-[15%]">Total Loans</th>
                    <th className="py-4 pl-6 pr-4 text-right w-[20%]">App-to-Close Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  
                  {loading && data.topLenders.length === 0 && (
                     <tr>
                       <td colSpan="4" className="py-16 text-center">
                         <RefreshCw size={24} className="mx-auto mb-3 text-slate-300 animate-spin" />
                         <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Aggregating Leaderboard...</span>
                       </td>
                     </tr>
                  )}

                  {!loading && data.topLenders.length === 0 && (
                     <tr>
                       <td colSpan="4" className="py-16 text-center">
                         <Award size={24} className="mx-auto mb-3 text-slate-300" />
                         <span className="text-xs font-bold tracking-widest uppercase text-slate-400">No Lender Data Available</span>
                       </td>
                     </tr>
                  )}

                  {!loading && data.topLenders.map((lender, idx) => (
                    <tr key={lender.id || idx} className="transition-all hover:bg-slate-50 group">
                      <td className="py-4 pl-4 pr-6">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs shadow-sm shrink-0",
                            idx === 0 ? "bg-amber-100 text-amber-700" : 
                            idx === 1 ? "bg-slate-200 text-slate-700" : 
                            idx === 2 ? "bg-orange-100 text-orange-800" : "bg-slate-50 text-slate-500 border border-slate-200"
                          )}>
                            #{idx + 1}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#0A1128]">{lender.name || "Unknown MLO"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-700">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(lender.volume || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold text-[#0A1128] bg-slate-100 rounded-md">
                          {lender.loans || 0} Files
                        </span>
                      </td>
                      <td className="py-4 pl-6 pr-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full transition-all duration-1000", (lender.conversion || 0) > 60 ? "bg-emerald-500" : "bg-amber-500")}
                              style={{ width: `${lender.conversion || 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-right text-slate-700 w-9">{lender.conversion || 0}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
      </DashboardLayout>
    </RouteGuard>
  );
}

// --- PURE CSS CORPORATE COMPONENTS ---

function BIStatCard({ title, value, trend, trendUp, icon, highlight, loading }) {
  return (
    <div className={cn(
      "p-5 rounded-2xl border shadow-sm transition-all group relative overflow-hidden",
      highlight ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"
    )}>
      {highlight && <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-amber-500 opacity-10 blur-2xl" />}
      
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl",
          highlight ? "bg-amber-100" : "bg-slate-50 border border-slate-100"
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
        <p className={cn("text-[11px] font-bold uppercase tracking-widest mb-1", highlight ? "text-amber-800" : "text-slate-400")}>
          {title}
        </p>
        {loading ? (
          <div className="w-24 h-8 mt-1 rounded-md bg-slate-100 animate-pulse"></div>
        ) : (
          <h4 className={cn("text-3xl font-bold tracking-tighter", highlight ? "text-amber-700" : "text-[#0A1128]")}>
            {value}
          </h4>
        )}
      </div>
    </div>
  );
}

function FunnelLayer({ label, value, percent, color, width }) {
  return (
    <div className="flex flex-col items-center w-full group">
      <div className={cn("h-10 sm:h-12 flex items-center justify-between px-4 text-white shadow-sm transition-all duration-700 ease-out hover:opacity-90 clip-path-funnel", color, width)} style={{ clipPath: 'polygon(5% 0, 95% 0, 100% 100%, 0% 100%)', borderRadius: '4px' }}>
         <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{label}</span>
         <span className="text-sm font-bold sm:text-base">{(value || 0).toLocaleString()}</span>
      </div>
      <div className="relative flex items-center justify-center h-6 mt-1 mb-2 border-l-2 border-dashed border-slate-200">
         <span className="absolute px-2 text-[10px] font-bold text-slate-400 bg-white">
           {percent || 0}% Retained
         </span>
      </div>
    </div>
  );
}