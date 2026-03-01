'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/utils';

export default function SideDrawer({ isOpen, onClose, title, subtitle, children }) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 duration-300 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className="relative flex flex-col w-full h-full max-w-md duration-300 bg-white border-l shadow-2xl animate-in slide-in-from-right border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs font-medium text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button 
            onClick={onClose}
            className="p-2 transition-colors rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 p-6 overflow-y-auto scroll-smooth">
          {children}
        </div>
      </div>
    </div>
  );
}