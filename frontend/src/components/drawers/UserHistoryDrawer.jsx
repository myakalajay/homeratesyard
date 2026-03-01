'use client';

import React, { useEffect, useState } from 'react';
import { X, Clock, Shield, AlertCircle } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { cn } from '@/utils/utils';

export default function UserHistoryDrawer({ user, isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // 🟢 UX FIX 1: Lock background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // 🟢 UX FIX 2: Close drawer gracefully using the Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (isOpen && user?.id) {
      const fetchUserHistory = async () => {
        setLoading(true);
        setError(false);
        try {
          // 🟢 DB FIX 1: Pass the userId to the backend to prevent fetching millions of irrelevant logs
          const response = await adminService.getAuditLogs({ userId: user.id });
          
          // 🟢 DB FIX 2: Deep hydration to prevent crashes regardless of API wrapper formatting
          const payload = response?.data?.data || response?.data || response || [];
          const fetchedLogs = Array.isArray(payload) ? payload : [];

          // Fallback client-side filter just in case the backend ignores the parameter
          const userLogs = fetchedLogs.filter(log => 
            log.targetId === user.id || log.userId === user.id
          );

          setLogs(userLogs.length > 0 ? userLogs : fetchedLogs);
        } catch (err) {
          console.error("History fetch failed:", err);
          setError(true);
        } finally {
          setLoading(false);
        }
      };
      fetchUserHistory();
    } else if (!isOpen) {
      // Clear logs after the exit animation finishes to prevent flashing old data on next open
      setTimeout(() => setLogs([]), 300); 
    }
  }, [isOpen, user]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[300] transition-opacity duration-300", 
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )} 
        onClick={onClose} 
      />
      
      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-white z-[310] shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col", 
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold font-display text-slate-900">
              <Shield size={18} className="text-[#0A1128]" />
              Security Audit
            </h3>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">
              History for: {user?.email || 'Unknown Identity'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 transition-colors border border-transparent rounded-lg hover:bg-white hover:border-slate-200 text-slate-400 hover:text-slate-700 active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse shrink-0" />
                  <div className="w-full space-y-2">
                    <div className="w-3/4 h-4 rounded bg-slate-100 animate-pulse" />
                    <div className="w-1/2 h-3 rounded bg-slate-50 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <AlertCircle size={40} className="mb-4 text-red-300" />
              <p className="text-sm font-bold text-slate-700">Audit Sync Failed</p>
              <p className="mt-1 text-xs text-slate-500">Could not retrieve security logs from the server.</p>
            </div>
          ) : logs.length > 0 ? (
            <div className="relative pb-6 ml-4 space-y-8 border-l-2 border-slate-100">
              {logs.map((log, index) => {
                // Formatting fallbacks to catch differences between Node and Python backends
                const actionText = (log.action || log.action_type || 'System Event').replace(/_/g, ' ');
                const adminName = log.admin?.name || log.performed_by || 'System';
                const ipText = log.ipAddress || log.ip_address ? ` via IP ${log.ipAddress || log.ip_address}` : '';
                const timestamp = log.createdAt || log.timestamp ? new Date(log.createdAt || log.timestamp).toLocaleString() : 'Unknown Date';

                return (
                  <div key={log.id || index} className="relative pl-6 group">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-slate-200 group-hover:border-[#0A1128] transition-colors" />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-bold capitalize text-slate-900">{actionText}</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                        Performed by <span className="font-bold text-slate-700">{adminName}</span>{ipText}.
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                        <Clock size={10} />
                        {timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
              <Shield size={40} className="mb-4 opacity-20" />
              <p className="text-sm font-bold text-slate-600">Clean Record</p>
              <p className="mt-1 text-xs">No administrative actions found for this identity.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}