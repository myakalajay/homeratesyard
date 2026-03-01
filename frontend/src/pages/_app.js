import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router'; 
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ErrorBoundary } from 'react-error-boundary';
import NProgress from 'nprogress';

// Providers & Context
import { AuthProvider } from '@/components/providers/AuthProvider';
import { LocationProvider } from '@/context/LocationContext';
import { ToastProvider } from '@/context/ToastContext';
import RouteGuard from '@/components/auth/RouteGuard';
import FullScreenError from '@/components/ui/FullScreenError'; 

// Global UI Components
import ChatWidget from '@/components/widgets/ChatWidget';
// 🟢 FIX: Completely removed SideStickyWidget import to reduce bundle size
import { cn } from '@/utils/utils';

// Styles
import 'nprogress/nprogress.css';
import '@/styles/globals.css';

// Font Configuration
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans', 
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'] 
});

const jetbrains_mono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono', 
  display: 'swap' 
});

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // --- NPROGRESS CONFIGURATION ---
  useEffect(() => {
    NProgress.configure({ 
      showSpinner: false, 
      trickleSpeed: 200,
      minimum: 0.08 
    });

    const handleStart = (url) => {
      // Prevent loader from firing on shallow routing or hash changes
      if (url !== router.asPath) {
        NProgress.start();
      }
    };
    const handleStop = () => NProgress.done();

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [router]);

  // --- ERROR BOUNDARY HANDLERS ---
  const handleError = (error, errorInfo) => {
    // Enterprise Telemetry Hook: Send to Sentry, Datadog, or LogRocket here
    console.error('Global Application Crash:', error, errorInfo);
  };

  const handleResetError = () => {
    // Deep Clean: Wipe all storages to break out of corrupted state loops
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/auth/login';
    }
  };

  // --- ROUTING & LAYOUT LOGIC ---
  const getLayout = Component.getLayout || ((page) => page);
  
  // Determines if the page explicitly bypasses the login check
  const isPublicPage = Component.authGuard === false;

  // 🟢 FIX: Updated '/super-admin' to '/superadmin' to match the actual folder structure.
  // This ensures the ChatWidget is successfully hidden inside the superadmin dashboard.
  const isDashboardRoute = ['/superadmin', '/admin', '/lender', '/borrower', '/auth'].some(path => 
    router.pathname.startsWith(path)
  );

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="theme-color" content="#0A1128" /> {/* Tints mobile browser header bars */}
        <meta name="description" content="HomeRatesYard is a modern, enterprise-grade mortgage origination platform." />
        <title>HomeRatesYard | Enterprise Mortgage Platform</title>
        
        {/* Favicon Suite */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="mask-icon" href="/favicon.svg" color="#B91C1C" />
        
        {/* NProgress Brand Customization */}
        <style>{`
          #nprogress { pointer-events: none; }
          #nprogress .bar { background: #B91C1C !important; height: 4px !important; z-index: 99999 !important; }
          #nprogress .peg { box-shadow: 0 0 10px #B91C1C, 0 0 5px #B91C1C !important; }
        `}</style>
      </Head>

      <ErrorBoundary 
        FallbackComponent={FullScreenError} 
        onError={handleError}
        onReset={handleResetError}
      >
        <ToastProvider>
          <AuthProvider>
            <LocationProvider>
              
              {/* Accessibility: Skip to Content link for keyboard/screen reader users */}
              <a 
                href="#main-content" 
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100000] focus:px-5 focus:py-3 focus:bg-[#0A1128] focus:text-white focus:rounded-xl focus:font-bold focus:shadow-2xl outline-none ring-4 ring-blue-500/50"
              >
                Skip to main content
              </a>

              <main 
                id="main-content" 
                className={cn(
                  inter.variable, 
                  jetbrains_mono.variable, 
                  "font-sans antialiased min-h-screen flex flex-col bg-slate-50 selection:bg-red-500/20 selection:text-red-900 relative"
                )}
              >
                {isPublicPage ? (
                  /* 🟢 PUBLIC FLOW: Landing, Test Lab, Calculators */
                  getLayout(<Component {...pageProps} />)
                ) : (
                  /* 🔐 PROTECTED FLOW: Requires Session + Role Check */
                  <RouteGuard allowedRoles={Component.roles}>
                     {getLayout(<Component {...pageProps} />)}
                  </RouteGuard>
                )}
              </main>

              {/* 🟢 GLOBAL WIDGET LAYER: Only active on marketing/public pages */}
              {/* SideStickyWidget has been completely purged from the DOM */}
              {!isDashboardRoute && (
                <ChatWidget />
              )}

            </LocationProvider>
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </>
  );
}