import React, { useEffect, useState } from 'react';
// 🟢 FIX: Replaced the invalid 'ShieldInfo' with the standard 'Shield' icon
import { X, Clock, Shield } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { cn } from '@/utils/utils';

export default function UserHistoryDrawer({ user, isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      const fetchUserHistory = async () => {
        setLoading(true);
        try {
          const allLogs = await adminService.getAuditLogs();
          // Filter logs where this user was the target
          const userLogs = allLogs.filter(log => log.targetId === user.id);
          setLogs(userLogs);
        } catch (err) {
          console.error("History fetch failed");
        } finally {
          setLoading(false);
        }
      };
      fetchUserHistory();
    }
  }, [isOpen, user]);

  return (
    <>
      {/* Backdrop */}
      <div className={cn("fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[300] transition-opacity", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={onClose} />
      
      {/* Drawer */}
      <div className={cn("fixed top-0 right-0 h-full w-full max-w-md bg-white z-[310] shadow-2xl transition-transform duration-300 ease-in-out transform", isOpen ? "translate-x-0" : "translate-x-full")}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-bold font-display text-slate-900">Security Audit</h3>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">History for: {user?.email}</p>
          </div>
          <button onClick={onClose} className="p-2 transition-colors rounded-lg hover:bg-white"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto h-[calc(100vh-100px)]">
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />)}
            </div>
          ) : logs.length > 0 ? (
            <div className="relative ml-3 space-y-8 border-l-2 border-slate-100">
              {logs.map((log, index) => (
                <div key={index} className="relative pl-8">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-primary" />
                  <p className="mb-1 text-xs font-bold text-slate-900">{log.action.replace('_', ' ')}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Performed by <span className="font-bold text-slate-700">{log.admin?.name || 'System'}</span> via IP {log.ipAddress}.
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tight">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-col py-20 flex-center text-slate-400">
              {/* 🟢 FIX: Rendering the valid Shield component here */}
              <Shield size={40} className="mb-4 opacity-20" />
              <p className="text-sm italic">No administrative actions found for this user.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}