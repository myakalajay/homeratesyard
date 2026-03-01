import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ShieldAlert, LogOut, Loader2, UserCheck } from 'lucide-react';
import { cn } from '@/utils/utils'; // Adjust this import based on your utility folder

export default function ImpersonationBanner({ 
  // If you use a global auth context, you can pass these as props, 
  // or the component will attempt to read them from localStorage as a fallback.
  isImpersonatingProp = false, 
  impersonatedEmailProp = "", 
  onStopImpersonating 
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(isImpersonatingProp);
  const [email, setEmail] = useState(impersonatedEmailProp);

  // 🟢 DEMO/FALLBACK LOGIC: Check local storage if props aren't provided
  useEffect(() => {
    if (!isImpersonatingProp) {
      const storedImpersonationFlag = localStorage.getItem('is_impersonating') === 'true';
      const storedEmail = localStorage.getItem('impersonated_user_email');
      
      if (storedImpersonationFlag) {
        setIsImpersonating(true);
        setEmail(storedEmail || "User");
      }
    } else {
      setIsImpersonating(isImpersonatingProp);
      setEmail(impersonatedEmailProp);
    }
  }, [isImpersonatingProp, impersonatedEmailProp]);

  // Hide the banner if not impersonating
  if (!isImpersonating) return null;

  const handleStopImpersonating = async () => {
    setIsLoading(true);
    try {
      if (onStopImpersonating) {
        // Use the function passed from your AuthContext or API hook
        await onStopImpersonating();
      } else {
        // Fallback: Clear the impersonation tokens manually
        localStorage.removeItem('is_impersonating');
        localStorage.removeItem('impersonated_user_email');
        localStorage.removeItem('impersonation_token'); // Or however your token is named
        
        // Force a hard reload to clear any cached user states and return to the dashboard
        window.location.href = '/superadmin/dashboard';
      }
    } catch (error) {
      console.error("Failed to stop impersonation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full z-[9999] animate-in slide-in-from-top-full duration-500">
      <div className="flex items-center justify-between px-4 py-2.5 shadow-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 sm:px-6 lg:px-8">
        
        {/* Left Side: Warning Message */}
        <div className="flex items-center gap-3 text-white">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm shrink-0">
            <ShieldAlert size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <p className="text-[13px] sm:text-sm font-bold leading-tight flex items-center gap-1.5">
              <span className="hidden sm:inline">SECURITY WARNING:</span> You are currently impersonating
              <span className="px-2 py-0.5 ml-1 text-xs font-black text-amber-900 bg-white rounded-md shadow-sm">
                {email}
              </span>
            </p>
            <p className="text-[11px] font-medium text-amber-100 mt-0.5">
              All actions taken right now will be permanently logged under this user's account.
            </p>
          </div>
        </div>

        {/* Right Side: Action Button */}
        <button
          onClick={handleStopImpersonating}
          disabled={isLoading}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-600 transition-all bg-white rounded-full shadow-sm shrink-0",
            isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-amber-50 hover:scale-105 active:scale-95 hover:shadow-md"
          )}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <LogOut size={16} />
          )}
          <span className="hidden sm:inline">
            {isLoading ? "Reverting..." : "Stop Impersonating"}
          </span>
        </button>

      </div>
    </div>
  );
}