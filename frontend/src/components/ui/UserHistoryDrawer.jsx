import React from 'react';
import { X, Clock, activity, Shield, Globe, Monitor } from 'lucide-react';
import { cn } from '@/utils/utils';

export default function UserHistoryDrawer({ isOpen, onClose, user }) {
  if (!user) return null;

  // Mock History Data - In a real app, you'd fetch this via the user.id
  const historyLogs = [
    { id: 1, event: 'Logged In', time: '2 mins ago', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 2, event: 'Updated Interest Rate', time: '1 hour ago', icon: Shield, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 3, event: 'Generated Rate Sheet', time: '3 hours ago', icon: Monitor, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 4, event: 'Changed Password', time: 'Yesterday', icon: Clock, color: 'text-slate-500', bg: 'bg-slate-50' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )} 
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className={cn(
        "fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[101] transition-transform duration-500 ease-in-out transform",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">User Activity Audit</h2>
              <p className="text-sm text-slate-500">{user.name} • {user.email}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 transition-colors rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Activity List */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-8">
              {historyLogs.map((log, idx) => (
                <div key={log.id} className="relative flex gap-4">
                  {/* Vertical Line */}
                  {idx !== historyLogs.length - 1 && (
                    <span className="absolute left-[19px] top-10 w-0.5 h-10 bg-slate-100" />
                  )}
                  
                  <div className={cn("flex items-center justify-center w-10 h-10 rounded-full shrink-0", log.bg)}>
                    <log.icon size={18} className={log.color} />
                  </div>
                  
                  <div className="pt-1">
                    <p className="text-sm font-bold text-slate-800">{log.event}</p>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State Fallback */}
            {historyLogs.length === 0 && (
              <div className="py-20 text-center">
                <Clock size={40} className="mx-auto mb-4 text-slate-200" />
                <p className="text-sm font-medium text-slate-500">No activity logs found for this user.</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <button 
              onClick={onClose}
              className="w-full py-3 text-sm font-bold transition-all bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 active:scale-95"
            >
              Close Audit Trail
            </button>
          </div>
        </div>
      </div>
    </>
  );
}