'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { X, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';

/**
 * @component ConversionModal
 * @description Professional full-page overlay for rate locking.
 * Utilizes React Portals to guarantee it breaks out of stacking contexts 
 * and covers all fixed navbars (Z-Index Warfare resolution).
 */
const ConversionModal = ({ isOpen, onClose, locationName, currentRate, loanType }) => {
  // 🟢 SSR/Hydration Check for Portals
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling for a "True Modal" experience
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Do not render if closed or during SSR
  if (!isOpen || !mounted) return null;

  // Professional fallback logic for dynamic strings
  const displayLocation = locationName && locationName !== 'your area' ? locationName : 'your market';
  const displayRate = currentRate ? `${currentRate}%` : 'this';

  // 🟢 Extract the modal content
  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* Click-outside backdrop */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} aria-hidden="true" />

      <div 
        className="relative w-full max-w-xl p-8 md:p-10 bg-white border border-slate-100 shadow-2xl rounded-[1.5rem] animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Close Button: Subtle & Professional */}
        <button 
          onClick={onClose}
          className="absolute p-2 transition-colors rounded-full top-6 right-6 text-slate-400 hover:text-slate-900 hover:bg-slate-50"
        >
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center text-center">
          {/* ICON: High-end Security Cue instead of Alert */}
          <div className="flex items-center justify-center w-16 h-16 mb-8 text-red-600 rounded-full bg-red-50 ring-8 ring-red-50/50">
            <Lock size={28} strokeWidth={2} />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl text-slate-900">
              Lock your {displayRate} rate in {displayLocation}?
            </h2>
            
            <p className="px-4 text-sm font-medium leading-relaxed md:text-base text-slate-500">
              Rates in <span className="font-semibold text-slate-900">{displayLocation}</span> are showing upward volatility. 
              Secure your personalized 30-Year Fixed quote today before market adjustments.
            </p>
          </div>
          
          <div className="flex flex-col w-full gap-3 mt-10">
            <Button asChild className="text-base font-semibold transition-all bg-red-600 shadow-lg h-14 hover:bg-red-700 shadow-red-600/20 group">
              <Link href="/auth/register">
                Get Verified Approval 
                <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              className="h-12 text-sm font-semibold text-slate-400 hover:text-slate-600" 
              onClick={onClose}
            >
              Review Other Products
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // 🟢 Inject the modal directly into the document body
  return createPortal(modalContent, document.body);
};

export default ConversionModal;