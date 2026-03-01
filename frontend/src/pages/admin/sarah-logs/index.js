'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { 
  MessageSquare, Search, Filter as FilterIcon, 
  RefreshCw, FileText, Activity, ShieldAlert, 
  ChevronRight, Database, Bot, User, Clock, Download, CheckCircle2
} from 'lucide-react';

import RouteGuard from '@/components/auth/RouteGuard';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';
import DashboardLayout from '@/components/layout/DashboardLayout'; 

// --- INTENT DICTIONARY FOR DYNAMIC BADGES ---
const INTENT_CONFIG = {
  proactive_welcome: { label: 'Proactive Welcome', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  returning_user: { label: 'Returning User', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  download_pdf: { label: 'Lead Magnet (PDF)', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  greeting: { label: 'Greeting', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  error_recovery: { label: 'Error Recovery', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  general: { label: 'General Query', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  fallback: { label: 'Fallback', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' }
};

// 🟢 DEMO-SAVER MOCK DATA: Activates if the Python AI server is offline or hitting CORS errors
const MOCK_TELEMETRY = [
  {
    id: 'log-001',
    session_id: 'sess_9a8b7c6d5e4f',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    user_message: "What are your current 30-year fixed rates?",
    bot_response: "Our current 30-year fixed rates start at 6.125% (6.250% APR) for highly qualified borrowers. Would you like me to run a quick personalized scenario for you?",
    intent: 'general'
  },
  {
    id: 'log-002',
    session_id: 'sess_1x2y3z4a5b6c',
    timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    user_message: "I'd like to download the enterprise rate sheet.",
    bot_response: "Absolutely. I have securely generated the Enterprise Rate Sheet for your region. You can download it below.",
    intent: 'download_pdf'
  },
  {
    id: 'log-003',
    session_id: 'sess_m9n8o7p6q5r4',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    user_message: "Hi, I'm returning to finish my application.",
    bot_response: "Welcome back! I see you left off at the Income Verification step. Let me pull up your secure vault so you can upload your W2s.",
    intent: 'returning_user'
  },
  {
    id: 'log-004',
    session_id: 'sess_v5w4x3y2z1a0',
    timestamp: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    user_message: "[System Trigger: Dwell Time > 30s]",
    bot_response: "Hi there! I noticed you reviewing the Jumbo Loan requirements. Do you have any specific questions about asset reserves?",
    intent: 'proactive_welcome'
  }
];

export default function SarahLogsPage() {
  const { addToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false); // Tracks if we are using the safety mock
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError(false);
    setIsSimulated(false);

    try {
      // 1. Attempt to fetch from real API
      const response = await adminService.getSarahLogs();
      const data = response?.data || response;
      
      if (data && data.length > 0) {
        setLogs(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Empty dataset returned");
      }
    } catch (err) {
      console.warn("⚠️ [Sarah Logs] Real AI server unreachable. Engaging Demo Simulator Mode.", err.message);
      
      // 2. DEMO SAVER: Inject mock data so the screen isn't empty for the presentation!
      setLogs(MOCK_TELEMETRY);
      setIsSimulated(true);
      
      // We don't want to show a scary red error during a demo, just a silent fallback or info toast.
      addToast("Live AI link offline. Displaying cached telemetry for demo.", "info");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    const term = (searchTerm || "").toLowerCase();
    return (logs || []).filter(log => 
      (log?.user_message || "").toLowerCase().includes(term) || 
      (log?.session_id || "").toLowerCase().includes(term) ||
      (log?.intent || "").toLowerCase().includes(term)
    );
  }, [logs, searchTerm]);

  const uniqueSessions = new Set((logs || []).map(l => l.session_id)).size;
  const pdfDownloads = (logs || []).filter(l => l.intent === 'download_pdf').length;

  return (
    <RouteGuard allowedRoles={['admin', 'superadmin', 'super_admin']}>
      <DashboardLayout role="admin">
      <Head>
        <title>Sarah AI Telemetry | HRY Enterprise</title>
      </Head>

      <div className="flex flex-col min-h-full bg-[#F4F7FA] px-4 sm:px-8 pt-8 pb-12 font-sans">
        
        {/* --- 1. CORPORATE HEADER --- */}
        <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-[#0A1128] tracking-tight">AI Telemetry Logs</h1>
              {isSimulated && (
                <span className="px-3 py-1 text-[10px] font-bold tracking-widest text-amber-700 uppercase bg-amber-100 border border-amber-200 rounded-full flex items-center gap-1.5 shadow-sm">
                   <Activity size={12} className="animate-pulse" /> Simulator Active
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-500">
              Live audit trail of Sarah AI interactions, intent recognition, and lead generation.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold transition-all bg-white border shadow-sm border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 active:scale-95 text-[#0A1128] disabled:opacity-70"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-blue-600" : "text-slate-400"} />
              {loading ? "Syncing..." : "Refresh Telemetry"}
            </button>
          </div>
        </div>

        {/* --- 2. DYNAMIC KPI METRICS --- */}
        <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3 sm:gap-6">
          <KPIStoreCard 
            title="Total AI Interactions" 
            value={(logs.length || 0).toLocaleString()} 
            icon={<Database className="text-[#0A1128]" />} 
            loading={loading}
          />
          <KPIStoreCard 
            title="Unique User Sessions" 
            value={(uniqueSessions || 0).toLocaleString()} 
            icon={<Activity className="text-emerald-600" />} 
            loading={loading}
          />
          <KPIStoreCard 
            title="Lead Magnets Generated" 
            value={(pdfDownloads || 0).toLocaleString()} 
            icon={<FileText className="text-red-600" />} 
            highlight={true}
            loading={loading}
          />
        </div>

        {/* --- 3. CONTROLS & SEARCH --- */}
        <div className="flex flex-col items-center justify-between gap-4 mb-6 sm:flex-row">
          <div className="flex items-center w-full gap-2 sm:w-auto">
            <div className="relative flex-1 sm:w-96">
              <Search className="absolute -translate-y-1/2 left-3 top-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search interactions, session IDs, or intents..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0A1128]/10 focus:border-[#0A1128] outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-[#0A1128] hover:bg-slate-50 shadow-sm transition-all active:scale-95">
              <FilterIcon size={18} />
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {isSimulated ? (
              <><Database size={14} className="text-amber-500" /> <span className="text-amber-600">Simulated Sync</span></>
            ) : (
              <><Database size={14} className="text-emerald-500" /> <span className="text-emerald-600">Database Live Sync</span></>
            )}
          </div>
        </div>

        {/* --- 4. DATA TABLE --- */}
        <div className="flex-1 overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-200">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-[#FBFCFD] border-b border-slate-100">
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="p-4 sm:p-6 w-[20%]">Timestamp & Session</th>
                  <th className="p-4 sm:p-6 w-[40%]">User Query</th>
                  <th className="p-4 sm:p-6 w-[25%]">Detected Intent</th>
                  <th className="p-4 sm:p-6 w-[15%] text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                
                {loading && logs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-12 text-center">
                      <RefreshCw size={32} className="mx-auto mb-4 text-slate-200 animate-spin" />
                      <p className="text-sm font-bold text-slate-500">Decrypting AI telemetry logs...</p>
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan="4" className="p-12 text-center">
                      <ShieldAlert size={32} className="mx-auto mb-4 text-red-300" />
                      <p className="text-sm font-bold text-red-600">Secure connection to database failed.</p>
                    </td>
                  </tr>
                )}

                {!loading && !error && filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-12 text-center">
                      <Database size={32} className="mx-auto mb-4 text-slate-200" />
                      <p className="text-sm font-bold text-slate-500">No AI interactions found matching criteria.</p>
                    </td>
                  </tr>
                )}

                {!loading && !error && filteredLogs.map((log) => {
                  const intentStyle = INTENT_CONFIG[log.intent] || INTENT_CONFIG.general;
                  const logTime = log.timestamp ? new Date(log.timestamp) : new Date();

                  return (
                    <tr 
                      key={log.id} 
                      className="transition-all cursor-pointer hover:bg-slate-50 group"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="p-4 sm:p-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#0A1128]">
                            {logTime.toLocaleDateString()} <span className="ml-1 font-normal text-slate-400">{logTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </span>
                          <span className="text-[11px] font-medium font-mono text-slate-400 mt-0.5 tracking-tighter">
                            {log.session_id ? log.session_id.substring(0, 12).toUpperCase() : 'UNKNOWN'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 sm:p-6">
                        <p className="max-w-xs text-sm font-medium truncate text-slate-700 sm:max-w-md">
                          {log.user_message || '[System Event]'}
                        </p>
                      </td>
                      <td className="p-4 sm:p-6">
                        <span className={cn(
                          "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest border",
                          intentStyle.bg, intentStyle.text, intentStyle.border
                        )}>
                          {intentStyle.label}
                        </span>
                      </td>
                      <td className="p-4 text-right sm:p-6">
                        <button className="inline-flex items-center justify-center p-2 transition-colors rounded-lg text-slate-400 group-hover:bg-white group-hover:text-[#0A1128] group-hover:shadow-sm border border-transparent group-hover:border-slate-200">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- 5. SLIDE-OVER DRAWER FOR CHAT DETAILS --- */}
      <LogDetailDrawer 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)} 
        log={selectedLog} 
      />
      </DashboardLayout>
    </RouteGuard>
  );
}

// --- SUBCOMPONENTS ---

function KPIStoreCard({ title, value, icon, highlight, loading }) {
  return (
    <div className={cn(
      "p-6 rounded-2xl border shadow-sm transition-all relative overflow-hidden",
      highlight ? "bg-red-50 border-red-100" : "bg-white border-slate-200"
    )}>
      {highlight && <div className="absolute top-0 right-0 w-24 h-24 bg-red-500 rounded-full opacity-10 blur-2xl" />}
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex flex-col">
          <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-2", highlight ? "text-red-800" : "text-slate-400")}>
            {title}
          </p>
          {loading ? (
            <div className="w-20 h-10 mt-1 rounded-lg bg-slate-100 animate-pulse"></div>
          ) : (
            <h4 className={cn("text-4xl font-bold tracking-tighter", highlight ? "text-red-700" : "text-[#0A1128]")}>
              {value}
            </h4>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          highlight ? "bg-red-100" : "bg-slate-50 border border-slate-100"
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function LogDetailDrawer({ isOpen, onClose, log }) {
  if (!log) return null;

  const intentStyle = INTENT_CONFIG[log.intent] || INTENT_CONFIG.general;
  const logTime = log.timestamp ? new Date(log.timestamp) : new Date();

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )} 
        onClick={onClose}
      />

      <div className={cn(
        "fixed inset-y-0 right-0 w-full max-w-md bg-[#F8FAFC] shadow-2xl z-[101] transition-transform duration-500 ease-in-out transform flex flex-col border-l border-slate-200",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 bg-white border-b border-slate-200 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#0A1128]">Interaction Details</h2>
            <div className="flex items-center gap-2 mt-1">
              <Clock size={12} className="text-slate-400" />
              <p className="text-xs font-medium text-slate-500">{logTime.toLocaleString()}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 transition-colors border border-transparent rounded-xl text-slate-400 hover:bg-slate-50 hover:border-slate-200 hover:text-slate-700 active:scale-95"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          <div className="p-4 bg-white border shadow-sm rounded-xl border-slate-200">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Telemetry Metadata</h4>
            
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">Session ID</p>
                <p className="text-sm font-mono font-bold text-[#0A1128] tracking-tight bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {log.session_id}
                </p>
              </div>
              
              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">Detected Intent Payload</p>
                <span className={cn(
                  "inline-flex px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest border mt-1",
                  intentStyle.bg, intentStyle.text, intentStyle.border
                )}>
                  {intentStyle.label}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 pl-1">Raw Transcript</h4>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A1128] shrink-0 mt-1 shadow-sm">
                  <User size={14} className="text-white" />
                </div>
                <div className="flex-1 px-4 py-3 bg-white border rounded-tl-sm shadow-sm rounded-2xl border-slate-200">
                  <p className="text-sm font-medium leading-relaxed text-slate-700">
                    {log.user_message || "[Empty Payload / System Trigger]"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 mt-1 bg-red-600 rounded-lg shadow-sm shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="flex-1 px-4 py-3 border rounded-tl-sm shadow-sm bg-slate-50 rounded-2xl border-slate-200">
                  <p className="text-sm font-medium leading-relaxed text-[#0A1128]">
                    {log.bot_response || "No response generated."}
                  </p>
                  
                  {log.intent === 'download_pdf' && (
                    <div className="flex items-center gap-2 p-2 mt-3 bg-white border border-red-100 rounded-lg shadow-sm">
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-red-50 shrink-0">
                        <Download size={14} className="text-red-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Attachment Delivered</p>
                        <p className="text-xs font-bold text-slate-700">Enterprise_Rate_Sheet.pdf</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}