import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; 
import { useAuthContext } from '@/components/providers/AuthProvider';
import { ShieldAlert, LogOut, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';
import api from '@/services/api'; 
import { useToast } from '@/context/ToastContext';

// 🌐 Publicly accessible paths that bypass authentication
const PUBLIC_PREFIXES = ['/website', '/auth', '/loans', '/refinance', '/calculators', '/about', '/contact', '/404'];
const EXACT_PUBLIC_PATHS = ['/'];

const isPublicPath = (path) => {
  if (!path) return false;
  if (EXACT_PUBLIC_PATHS.includes(path)) return true;
  return PUBLIC_PREFIXES.some(prefix => path.startsWith(prefix));
};

/**
 * @component RouteGuard
 * @description Enterprise Security Checkpoint. Handles role-based routing, 
 * unverified user locking, and mandatory compliance (Terms of Service) blocking.
 */
export default function RouteGuard({ children, allowedRoles = [] }) {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuthContext();
  const { addToast } = useToast();
  
  const [authorized, setAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Compliance & Terms States
  const [isAcceptingTerms, setIsAcceptingTerms] = useState(false);
  const [hasLocallyAccepted, setHasLocallyAccepted] = useState(false);

  // Serialize array for useEffect dependency array to prevent infinite re-renders
  const rolesKey = allowedRoles.join(',');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!router.isReady || !mounted) return;

    const pathname = router.pathname; 
    
    // 🟢 Normalizing role string to prevent case-sensitive backend mismatches
    const normalizedRole = String(user?.role || '').toLowerCase().trim();

    // 🟢 UPDATED: Routing maps point directly to index routes (e.g., /borrower)
    const dashboardMap = {
      'superadmin': '/superadmin', 
      'super_admin': '/superadmin', // Catch-all for legacy DB entries
      'admin': '/admin',
      'lender': '/lender', 
      'borrower': '/borrower'
    };
    
    // Ultimate safety fallback
    const targetDashboard = dashboardMap[normalizedRole] || '/borrower';

    // SCENARIO 1: Authenticated user trying to view login/register pages
    if (isAuthenticated && pathname.startsWith('/auth')) {
      setAuthorized(false);
      router.replace(targetDashboard); 
      return;
    }

    // SCENARIO 2: Public marketing/utility paths
    if (isPublicPath(pathname)) {
      setAuthorized(true);
      return;
    }

    // SCENARIO 3: Awaiting Backend Resolution
    if (loading) {
      setAuthorized(false);
      return;
    }

    // SCENARIO 4: Unauthenticated Request -> Kick to Auth
    if (!isAuthenticated) {
      setAuthorized(false);
      router.replace({
        pathname: '/auth/login',
        query: { returnUrl: router.asPath } // Preserve intended destination
      });
      return;
    }

    // SCENARIO 5: Authenticated, but insufficient role privileges
    if (allowedRoles.length > 0 && !allowedRoles.includes(normalizedRole) && !allowedRoles.includes(user?.role)) {
      setAuthorized(false);
      if (pathname !== targetDashboard) {
        router.replace(targetDashboard);
      }
      return;
    }

    // ✅ Passed all checks
    setAuthorized(true);

  }, [router.isReady, router.pathname, router.asPath, isAuthenticated, loading, user, rolesKey, mounted]);

  // ==========================================
  // 📜 COMPLIANCE ACTION LOGIC
  // ==========================================
  const handleAcceptTerms = async () => {
    setIsAcceptingTerms(true);
    try {
      await api.put(`/users/${user.id}/terms`, { accepted: true });
      setHasLocallyAccepted(true);
      addToast("Security agreements accepted.", "success");
    } catch (err) {
      addToast("Failed to record acceptance. Please try again.", "error");
    } finally {
      setIsAcceptingTerms(false);
    }
  };

  // ==========================================
  // 🛡️ VIEW RENDER ENGINE
  // ==========================================

  // Fast-track public paths
  if (router.pathname && isPublicPath(router.pathname) && !(isAuthenticated && router.pathname.startsWith('/auth'))) {
    return <>{children}</>;
  }

  // Prevent SSR Hydration Mismatches
  if (!mounted) return <div className="min-h-screen bg-slate-50/50" />;

  // Loading Overlay
  if (loading || !authorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/80 backdrop-blur-sm">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 rounded-full border-slate-200 border-t-red-600 animate-spin"></div>
        </div>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-slate-600 animate-pulse">Verifying Access</p>
      </div>
    );
  }

  if (isAuthenticated && !user && !isPublicPath(router.pathname)) return null; 

  // 🛑 SECURITY GATE 1: MANDATORY APPROVAL SCREEN
  if (isAuthenticated && user && !user.isVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
        <div className="w-full max-w-md p-8 text-center bg-white border shadow-2xl border-slate-200 rounded-3xl animate-in zoom-in-95">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-amber-50 text-amber-500">
            <ShieldAlert size={40} />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900 font-display">Account Under Review</h2>
          <p className="mb-8 leading-relaxed text-slate-500">
            Your registration was successful, but your account requires administrative approval before you can access the platform. We will notify you once verified.
          </p>
          <Button variant="outline" className="w-full gap-2 font-bold h-11" onClick={logout}>
            <LogOut size={18} /> Sign Out Securely
          </Button>
        </div>
      </div>
    );
  }

  // 🛑 SECURITY GATE 2: MANDATORY TERMS AND CONDITIONS POPUP
  const needsToAcceptTerms = user && user.termsAccepted === false && !hasLocallyAccepted;

  return (
    <>
      {children}

      {needsToAcceptTerms && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
          <div className="w-full max-w-2xl overflow-hidden bg-white border shadow-2xl border-slate-200 rounded-2xl animate-in zoom-in-95">
            <div className="p-6 border-b bg-slate-50 border-slate-100">
              <div className="flex items-center gap-3">
                <FileText className="text-red-600" size={24} />
                <h2 className="text-xl font-bold text-slate-900">Mandatory Security & Service Agreement</h2>
              </div>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto text-sm h-72 custom-scrollbar bg-slate-50/30 text-slate-600">
              <p><strong>1. Data Privacy & Handling</strong><br/>By accessing this platform, you agree to handle all sensitive financial data and Personally Identifiable Information (PII) in strict accordance with federal regulations (GLBA, CCPA, etc.).</p>
              <p><strong>2. Authorized Use</strong><br/>This system is strictly for authorized mortgage processing. Any unauthorized scraping, distribution, or misuse of applicant data will result in immediate termination and potential legal action.</p>
              <p><strong>3. Audit Logging</strong><br/>All actions taken within this platform, including file accesses, status changes, and communications, are securely logged and audited for compliance purposes.</p>
              <p><em>Please scroll and review carefully. By clicking "I Agree", you legally bind yourself to these terms.</em></p>
            </div>

            <div className="flex gap-4 p-6 bg-white border-t border-slate-100">
              <Button variant="outline" className="flex-1 h-12 font-bold" onClick={logout} disabled={isAcceptingTerms}>
                Decline & Sign Out
              </Button>
              <Button 
                variant="primary" 
                className="flex-[2] font-bold h-12 bg-red-600 text-white gap-2" 
                onClick={handleAcceptTerms} 
                disabled={isAcceptingTerms}
              >
                {isAcceptingTerms ? <div className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" /> : <CheckCircle size={18} />}
                I Agree & Continue to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}