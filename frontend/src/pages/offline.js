import React from 'react';
import { WifiOff, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';

export default function ConnectionLost() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-subtle text-content">
      
      <div className="container max-w-md px-4 mx-auto text-center duration-500 animate-in slide-in-from-top-4">
        
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 mb-6 border-4 rounded-full shadow-lg bg-background border-content-subtle/10 text-content-muted">
          <WifiOff size={40} strokeWidth={2} />
        </div>

        {/* Headline */}
        <h2 className="mb-3 text-2xl font-bold text-content">
          No Internet Connection
        </h2>
        
        {/* Description */}
        <p className="mb-8 text-content-muted text-balance">
          Please check your network settings and try again. We can't reach the HomeRatesYard servers right now.
        </p>

        {/* Retry Action */}
        <Button 
          onClick={() => window.location.reload()} 
          size="lg" 
          className="w-full gap-2 shadow-lg shadow-content/10"
        >
          <RotateCcw size={18} />
          Retry Connection
        </Button>
        
        <p className="mt-8 text-xs text-content-muted/60">
          Error Code: NETWORK_ERR_CONNECTION_REFUSED
        </p>

      </div>
    </div>
  );
}