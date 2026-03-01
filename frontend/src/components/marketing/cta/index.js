import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, PlayCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';

export default function FinalCTA() {
  const [showVideo, setShowVideo] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowVideo(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      <section className="relative py-20 overflow-hidden bg-content isolate">
        
        {/* Background Warp Effect */}
        <div className="absolute inset-0 pointer-events-none -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-content-subtle via-content to-black opacity-90"></div>
          {/* Grid Lines */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] transform perspective-500 rotate-x-12 scale-150 opacity-20"></div>
        </div>

        <div className="container relative z-10 px-4 mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-xs font-bold uppercase tracking-wider text-white border rounded-full bg-white/5 border-white/10 backdrop-blur-sm animate-in slide-in-from-bottom fade-in duration-700">
            <Sparkles size={14} className="text-warning" />
            <span>Join 25,000+ happy homeowners</span>
          </div>

          {/* Headline */}
          <h2 className="max-w-4xl mx-auto mb-6 text-4xl font-bold leading-tight tracking-tight text-white duration-700 delay-100 md:text-5xl font-display animate-in slide-in-from-bottom fade-in">
            Ready to close 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
               &nbsp;at lightspeed?
            </span>
          </h2>

          {/* Description */}
          <p className="max-w-2xl mx-auto mb-10 text-base leading-relaxed duration-700 delay-200 text-content-muted md:text-lg animate-in slide-in-from-bottom fade-in">
            No paperwork. No hidden fees. Just the smartest way to finance your home. 
            Get your Verified Approval Letter in minutes.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 duration-700 delay-300 sm:flex-row animate-in slide-in-from-bottom fade-in">
            
            <Button 
              asChild 
              size="lg" 
              className="px-8 py-6 text-lg transition-transform rounded-full font-regular shadow-glow-primary hover:scale-105"
            >
              <Link href="/auth/register">
                Start My Application <ArrowRight size={20} className="ml-2" />
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              size="lg" 
              onClick={() => setShowVideo(true)}
              className="px-8 py-6 text-lg text-white rounded-full font-regular hover:bg-white/10 hover:text-white"
            >
              <PlayCircle size={20} className="mr-2" /> Watch Demo
            </Button>

          </div>

          {/* Micro-Trust Text */}
          <p className="mt-8 text-xs font-medium duration-1000 delay-500 text-content-muted/60 animate-in fade-in">
            No credit card required for pre-approval.
          </p>

        </div>
      </section>

      {/* --- VIDEO MODAL --- */}
      {showVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl overflow-hidden duration-200 bg-black border shadow-2xl rounded-2xl border-white/10 animate-in zoom-in-95">
            
            {/* Header / Close */}
            <div className="absolute top-0 right-0 z-10 p-4">
              <button 
                onClick={() => setShowVideo(false)}
                className="p-2 text-white transition-colors rounded-full bg-black/50 hover:bg-white hover:text-black"
              >
                <X size={24} />
              </button>
            </div>

            {/* Video Container (16:9 Aspect Ratio) */}
            <div className="relative w-full aspect-video">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/ScMzIvxBSi4?autoplay=1&mute=0" 
                title="Product Demo" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            
          </div>
          
          {/* Backdrop Click to Close */}
          <div className="absolute inset-0 -z-10" onClick={() => setShowVideo(false)}></div>
        </div>
      )}
    </>
  );
}