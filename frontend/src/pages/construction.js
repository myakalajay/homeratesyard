import React from 'react';
import Link from 'next/link';
import { Hammer, ArrowLeft, Bell } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';

export default function UnderConstruction() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-background text-content">
      
      {/* Background Blueprint Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

      <div className="container relative z-10 max-w-xl px-4 mx-auto text-center duration-700 animate-in fade-in slide-in-from-bottom-8">
        
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 mb-8 border shadow-xl rounded-3xl bg-secondary/10 text-secondary border-secondary/20 rotate-3">
          <Hammer size={40} strokeWidth={1.5} />
        </div>

        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold tracking-widest uppercase border rounded-full bg-background-subtle border-border text-content-muted">
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
            Work in Progress
          </span>
        </div>

        {/* Headlines */}
        <h1 className="mb-4 text-4xl font-bold font-display text-content md:text-5xl">
          Building the Future.
        </h1>
        <p className="mb-10 text-lg text-content-muted text-balance">
          Our engineering team is currently crafting this feature. It will be available in the next release cycle.
        </p>

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto min-w-[160px] gap-2 shadow-lg shadow-primary/20">
            <Link href="/">
              <ArrowLeft size={18} />
              Return Home
            </Link>
          </Button>
          
          <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[160px] gap-2">
            <Bell size={18} />
            Notify Me
          </Button>
        </div>

      </div>
    </div>
  );
}