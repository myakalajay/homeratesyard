import React from 'react';
import Link from 'next/link';
import { RefreshCw, ServerCrash, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';

export default function Custom500({ reset }) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background text-content">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="container relative z-10 max-w-xl px-4 mx-auto text-center duration-500 animate-in zoom-in-95">
        
        {/* Error Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 mb-6 border-4 rounded-full shadow-2xl bg-danger/10 text-danger border-background">
          <ServerCrash size={40} strokeWidth={1.5} />
        </div>

        {/* Status Code */}
        <p className="mb-2 text-xs font-bold tracking-widest uppercase text-danger">
          Error 500 • System Malfunction
        </p>

        {/* Headline */}
        <h1 className="mb-4 text-3xl font-bold font-display text-content md:text-4xl">
          Our algorithm hit a snag.
        </h1>
        
        {/* Description */}
        <p className="mb-8 text-content-muted">
          Don't worry, your data is safe. Our engineering team has been notified and is fixing the issue as we speak.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <Button 
            size="lg" 
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto min-w-[200px] gap-2"
          >
            <RefreshCw size={18} />
            Try Again
          </Button>

          <div className="pt-2">
             <Link href="/contact" className="inline-flex items-center gap-2 text-sm text-content-muted hover:text-content hover:underline underline-offset-4">
               <MessageSquare size={14} />
               Report this issue to support
             </Link>
          </div>
        </div>

      </div>
    </div>
  );
}