'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { 
  Activity, Server, Database, Cpu, Wifi, 
  AlertTriangle, RefreshCw, Terminal
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { adminService } from '@/services/admin.service'; 
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';

// Safe initial state to prevent SSR Hydration errors and handle loading phases
const initialMetrics = {
  api_latency: '--',
  db_connections: '--',
  error_rate: '--',
  cpu_load: 0,
  memory_usage: 0,
  uptime: '99.99%',
  nodes: {
    primary_api: 0,
    secondary_api: 0,
    db_writer: 0,
    db_reader: 0,
    redis_cache: 0
  }
};

export default function InfrastructureHealth() {
  const { addToast } = useToast();
  
  // Real Backend State
  const [metrics, setMetrics] = useState(initialMetrics);
  const [logs, setLogs] = useState([]);
  
  // UI State
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isError, setIsError] = useState(false);

  // --- REAL END-TO-END TELEMETRY FETCH ---
  const refreshTelemetry = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    
    try {
      const response = await adminService.getSystemHealth(); 
      
      if (response && response.metrics) {
        // Deep merge to ensure no missing keys crash the UI if the backend changes
        setMetrics(prev => ({
          ...prev,
          ...response.metrics,
          nodes: { ...prev.nodes, ...(response.metrics.nodes || {}) }
        }));
        setLogs(response.logs || []);
        setIsError(false);
        setLastUpdated(new Date());
        
        if (manual) addToast('Telemetry synchronized with live nodes', 'success');
      } else {
        throw new Error("Invalid payload structure");
      }
    } catch (error) {
      console.error("Telemetry Sync Failed:", error);
      setIsError(true);
      if (manual) addToast(error.message || 'Failed to reach telemetry nodes', 'error');
    } finally {
      if (manual) setRefreshing(false);
    }
  }, [addToast]);

  // Trigger initial load and set up polling
  useEffect(() => {
    setMounted(true);
    refreshTelemetry();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => refreshTelemetry(), 30000);
    return () => clearInterval(interval);
  }, [refreshTelemetry]);

  // Prevent rendering raw dates until client is ready
  if (!mounted) return <div className="min-h-screen bg-slate-50/50" />;

  // 🟢 FIX: Standardized RouteGuard and DashboardLayout Wrapping
  return (
    <RouteGuard allowedRoles={['superadmin', 'super_admin']}>
      <DashboardLayout role="superadmin">
        <Head>
          <title>System Status | HomeRatesYard Enterprise</title>
        </Head>

        {/* 🟢 FIX: Added responsive padding (px-4 sm:px-6 lg:px-8) and pt-8 to match other pages */}
        <div className="mx-auto max-w-[1200px] space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-12 px-4 sm:px-6 lg:px-8 pt-8">
          
          {/* --- 1. SRE COMMAND BANNER --- */}
          <div className="relative p-8 overflow-hidden text-white border shadow-2xl bg-slate-950 rounded-3xl md:p-10 border-slate-900">
             <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                <Activity size={400} className="absolute -right-20 -bottom-20 text-emerald-500" />
             </div>

             <div className="relative z-10 flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
                <div className="space-y-4">
                   <div className={cn(
                      "inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border shadow-inner",
                      isError ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20"
                   )}>
                      <span className="relative flex w-2 h-2">
                        <span className={cn("absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping", isError ? "bg-red-400" : "bg-emerald-400")}></span>
                        <span className={cn("relative inline-flex w-2 h-2 rounded-full", isError ? "bg-red-500" : "bg-emerald-500")}></span>
                      </span>
                      <span className={cn(
                          "text-[10px] font-bold tracking-[0.2em] uppercase",
                          isError ? "text-red-400" : "text-emerald-400"
                      )}>
                          Operational Status: {isError ? 'Degraded / Offline' : 'Nominal'}
                      </span>
                   </div>
                   <h1 className="text-3xl font-bold tracking-tight text-white font-display sm:text-4xl">Infrastructure Health</h1>
                   <p className="max-w-lg text-sm font-medium leading-relaxed text-slate-400">
                      Real-time telemetry of API gateways, database clusters, and computational nodes.
                   </p>
                </div>

                <div className="flex items-center w-full gap-6 lg:w-auto">
                   <div className="hidden pr-6 text-right border-r sm:block border-slate-800">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Global Uptime</p>
                      <p className={cn("font-mono text-2xl font-bold tracking-tight", isError ? "text-red-500" : "text-emerald-500")}>
                          {metrics.uptime}
                      </p>
                   </div>
                   <button 
                     onClick={() => refreshTelemetry(true)}
                     disabled={refreshing}
                     className="flex items-center justify-center flex-1 gap-3 px-8 text-sm font-bold transition-all bg-white shadow-lg lg:flex-none h-12 text-slate-950 rounded-xl hover:bg-slate-100 active:scale-[0.98] disabled:opacity-70"
                   >
                      <RefreshCw size={16} className={cn(refreshing && "animate-spin")} />
                      Ping Nodes
                   </button>
                </div>
             </div>
          </div>

          {/* --- 2. CRITICAL METRICS GRID --- */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
             <HealthCard 
                label="API Latency" 
                value={metrics.api_latency !== '--' ? `${metrics.api_latency}ms` : '--'} 
                icon={Wifi} 
                status={isError ? "critical" : (metrics.api_latency < 100 ? "healthy" : "warning")}
                subtext="Global Gateway"
             />
             <HealthCard 
                label="Database Load" 
                value={`${metrics.db_connections}`} 
                icon={Database} 
                status={isError ? "critical" : "healthy"}
                subtext="Active Connections"
             />
             <HealthCard 
                label="Error Rate" 
                value={metrics.error_rate !== '--' ? `${metrics.error_rate}%` : '--'} 
                icon={AlertTriangle} 
                status={isError ? "critical" : (metrics.error_rate < 1 ? "healthy" : "warning")}
                subtext="HTTP 5xx / 4xx"
             />
             <HealthCard 
                label="Compute Load" 
                value={`${metrics.cpu_load}%`} 
                icon={Cpu} 
                status={isError ? "critical" : (metrics.cpu_load < 80 ? "healthy" : "warning")}
                subtext="vCPU Utilization"
             />
          </div>

          {/* --- 3. INFRASTRUCTURE VISUALIZATION & LOGS --- */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
             
             {/* Visual Load Monitors */}
             <section className="flex flex-col overflow-hidden bg-white border shadow-sm lg:col-span-7 xl:col-span-8 border-slate-200 rounded-3xl">
                <div className="flex flex-col justify-between gap-4 px-8 py-6 border-b sm:flex-row sm:items-center border-slate-100 bg-slate-50/50">
                   <div className="flex items-center gap-3">
                      <Server size={18} className={isError ? "text-red-400" : "text-slate-400"} />
                      <h3 className="text-sm font-bold text-slate-900">Cluster Performance</h3>
                   </div>
                   <div className="text-[11px] font-mono font-bold text-slate-400 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm inline-block w-fit">
                      Last Pulse: {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}
                   </div>
                </div>
                
                <div className="flex-1 p-8 space-y-8">
                   <LoadBar label="Primary API Node (US-EAST-1)" percentage={metrics.nodes?.primary_api || 0} color={isError ? "bg-red-500" : "bg-blue-500"} />
                   <LoadBar label="Secondary API Node (US-WEST-2)" percentage={metrics.nodes?.secondary_api || 0} color={isError ? "bg-red-400" : "bg-blue-400"} />
                   <LoadBar label="Database Writer (Primary)" percentage={metrics.nodes?.db_writer || 0} color={isError ? "bg-red-500" : "bg-emerald-500"} />
                   <LoadBar label="Database Reader (Replica)" percentage={metrics.nodes?.db_reader || 0} color={isError ? "bg-red-400" : "bg-emerald-400"} />
                   <LoadBar label="Redis Cache Layer" percentage={metrics.nodes?.redis_cache || 0} color={isError ? "bg-red-500" : "bg-orange-400"} />
                </div>
             </section>

             {/* Live Event Terminal */}
             <aside className="flex flex-col overflow-hidden text-white border shadow-xl lg:col-span-5 xl:col-span-4 bg-slate-900 rounded-3xl border-slate-800 min-h-[400px]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/80">
                   <div className="flex items-center gap-2">
                      <Terminal size={14} className={isError ? "text-red-500" : "text-emerald-500"} />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Logs</span>
                   </div>
                   <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                   </div>
                </div>
                
                <div className="flex-1 p-6 space-y-6 font-mono text-[11px] overflow-y-auto custom-scrollbar">
                   {logs.length > 0 ? (
                      logs.map((log, index) => (
                        <LogEntry 
                          key={index} 
                          time={log.time} 
                          level={log.level} 
                          msg={log.msg} 
                          highlight={log.level === 'WARN' || log.level === 'ERROR' || log.level === 'CRITICAL'} 
                        />
                      ))
                   ) : (
                      <div className="flex items-center justify-center h-full text-slate-600">
                        {isError ? "Failed to retrieve logs." : "Awaiting telemetry streams..."}
                      </div>
                   )}
                </div>
             </aside>
          </div>

        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}

// ==========================================
// 🧱 HARDENED ATOMS 
// ==========================================

const HealthCard = ({ label, value, icon: Icon, status, subtext }) => {
  const statusColors = {
    healthy: "text-emerald-600 bg-emerald-50 border-emerald-100",
    warning: "text-orange-600 bg-orange-50 border-orange-100",
    critical: "text-red-600 bg-red-50 border-red-100"
  };

  return (
    <div className="p-6 transition-all duration-300 bg-white border shadow-sm border-slate-200 rounded-3xl hover:shadow-md hover:-translate-y-1 group">
       <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</span>
          <div className={cn("p-2.5 rounded-xl transition-colors", statusColors[status])}>
             <Icon size={18} strokeWidth={2.5} />
          </div>
       </div>
       <div className="space-y-1">
          <h3 className="font-mono text-3xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{subtext}</p>
       </div>
    </div>
  );
};

const LoadBar = ({ label, percentage, color }) => (
  <div className="group">
     <div className="flex justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
        <span className="text-[11px] font-mono font-bold text-slate-700">{percentage}%</span>
     </div>
     <div className="w-full h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div 
          className={cn("h-full transition-all duration-1000 ease-out rounded-full", color)} 
          style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }} // Secure bounds (0-100)
        />
     </div>
  </div>
);

const LogEntry = ({ time, level, msg, highlight }) => (
  <div className={cn(
    "flex gap-4 items-start border-l-2 pl-4 transition-opacity hover:opacity-100 opacity-80",
    highlight ? "border-orange-500 text-orange-200" : "border-slate-700 text-slate-300"
  )}>
     <div className="min-w-[55px] text-slate-500 mt-0.5 whitespace-nowrap">{time}</div>
     <div className="flex-1 space-y-1.5">
        <span className={cn(
           "px-2 py-0.5 rounded text-[9px] font-bold tracking-widest", 
           (level === 'WARN' || level === 'ERROR' || level === 'CRITICAL') 
             ? "bg-orange-500/20 text-orange-400" 
             : "bg-emerald-500/20 text-emerald-400"
        )}>
           {level}
        </span>
        <p className="leading-relaxed text-slate-200">{msg}</p>
     </div>
  </div>
);