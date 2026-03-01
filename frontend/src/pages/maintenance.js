import React from 'react';
import { Settings, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';

export default function MaintenanceMode() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-white bg-content selection:bg-primary/30">
      
      {/* Dark Mode Background Ambience */}
      <div className="absolute top-0 w-full pointer-events-none h-1/2 bg-gradient-to-b from-primary/10 to-transparent"></div>

      <div className="container relative z-10 max-w-lg px-4 mx-auto text-center duration-500 animate-in zoom-in-95">
        
        {/* Animated Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 mb-8 border rounded-full shadow-2xl bg-white/5 border-white/10 backdrop-blur-md">
          <Settings size={48} className="text-primary animate-spin-slow" strokeWidth={1.5} />
        </div>

        {/* Headline */}
        <h1 className="mb-4 text-3xl font-bold text-white font-display md:text-5xl">
          System Upgrade <br/> in Progress
        </h1>
        
        {/* Description */}
        <p className="mb-8 text-lg text-white/60">
          We are currently updating our AI engine to bring you even faster rates. The platform will be back shortly.
        </p>

        {/* Estimated Time Card */}
        <div className="flex items-center justify-center gap-4 p-4 mb-8 border rounded-xl bg-white/5 border-white/10">
          <Clock size={20} className="text-warning" />
          <div className="text-left">
            <p className="text-xs font-bold tracking-wider uppercase text-white/40">Estimated Return</p>
            <p className="text-sm font-bold text-white">Today at 2:00 PM EST</p>
          </div>
        </div>

        {/* Refresh Action */}
        <Button 
          onClick={() => window.location.reload()}
          size="lg" 
          className="w-full gap-2 bg-white sm:w-auto text-content hover:bg-white/90"
        >
          <RefreshCw size={18} />
          Check Status
        </Button>

      </div>
    </div>
  );
}