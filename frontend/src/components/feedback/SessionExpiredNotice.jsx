import React from 'react';
import { useRouter } from 'next/router'; // 🟢 FIX: Consistent Router Hook
import { LogOut, ShieldAlert, Lock } from 'lucide-react';
import { cn } from '@/utils/utils';

// Assuming a generic Modal component exists, but for a critical security overlay, 
// we often build a dedicated backdrop to ensure it covers EVERYTHING.
const SessionExpiredNotice = ({ isOpen, onLogout }) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLoginRedirect = () => {
    if (onLogout) onLogout(); 
    // Redirect to login with return URL so they come back to where they were
    router.push(`/auth/login?returnUrl=${encodeURIComponent(router.asPath)}&reason=timeout`);
  };

  return (
    // 🛡️ SECURITY OVERLAY: Z-Index 9999 to cover all other UI
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm transition-opacity animate-in fade-in duration-300">
      
      <div className="w-full max-w-sm overflow-hidden duration-200 transform scale-100 bg-white border shadow-2xl rounded-xl border-slate-200 animate-in zoom-in-95">
        
        {/* Header Visual */}
        <div className="flex justify-center p-6 border-b bg-amber-50 border-amber-100">
          <div className="relative">
            <div className="absolute inset-0 rounded-full opacity-50 bg-amber-200 blur-lg"></div>
            <div className="relative p-3 bg-white rounded-full shadow-sm">
                <ShieldAlert className="w-8 h-8 text-amber-500" />
            </div>
            {/* Lock Icon Badge */}
            <div className="absolute p-1 border-2 border-white rounded-full -bottom-1 -right-1 bg-amber-600">
                <Lock className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Session Timed Out
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              For your security, we have locked your session due to inactivity. Please sign in again to resume exactly where you left off.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleLoginRedirect}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 
                         bg-slate-900 text-white font-medium text-sm rounded-lg
                         hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 
                         transition-all shadow-lg hover:shadow-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign In Again
            </button>
            
            <p className="mt-4 text-xs text-slate-400">
              Reference: SEC-TIMEOUT-401
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredNotice;