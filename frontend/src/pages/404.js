import React from 'react';
import Link from 'next/link';
import { Home, Search, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';

export default function Custom404() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-background text-content selection:bg-primary/20">
      
      {/* Background Decor - Big "404" Watermark */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
        <h1 className="text-[20vw] font-bold text-content-subtle/5 font-display tracking-tighter">
          404
        </h1>
      </div>

      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10 max-w-2xl px-4 mx-auto text-center duration-700 animate-in fade-in slide-in-from-bottom-4">
        
        {/* Icon Blob */}
        <div className="inline-flex items-center justify-center w-20 h-20 mb-8 border shadow-xl rounded-3xl bg-background-subtle border-border shadow-content/5">
          <Search size={40} className="text-content-muted" strokeWidth={1.5} />
        </div>

        {/* Headlines */}
        <h2 className="mb-4 text-4xl font-bold font-display text-content md:text-5xl">
          We couldn't locate that property.
        </h2>
        <p className="mb-10 text-lg text-content-muted text-balance">
          The page you are looking for might have been sold, removed, or is temporarily off the market.
        </p>

        {/* Action Grid */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto min-w-[160px] gap-2 shadow-lg shadow-primary/20">
            <Link href="/">
              <Home size={18} />
              Return Home
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto min-w-[160px] gap-2">
            <Link href="/support">
              <HelpCircle size={18} />
              Visit Help Center
            </Link>
          </Button>
        </div>

        {/* Footer Link */}
        <div className="mt-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors text-content-muted hover:text-primary"
          >
            <ArrowLeft size={14} />
            Back to previous page
          </Link>
        </div>

      </div>
    </div>
  );
}