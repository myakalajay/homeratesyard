'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/utils';
import { IconButton } from '@/components/ui/primitives/IconButton';

/**
 * @component Modal
 * @description Enterprise-grade modal with full-pledged backdrop, 
 * scroll-locking, and optimized hydration safety.
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  footer,
  size = "md", 
  className,
  showCloseButton = true,
  closeOnOverlayClick = true
}) => {
  const [mounted, setMounted] = useState(false);

  // 1. Hydration Safety: Portals must only render on the client
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 2. Scroll Lock & Keyboard Escape Handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    // Standard high-level scroll lock
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen, onClose]);

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[calc(100vw-2rem)]",
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 isolate">
          
          {/* FULL PLEDGED BACKDROP: Fixed Opacity and Blur for professional look */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-[4px] z-0"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />
          
          {/* MODAL CONTAINER */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 400,
              duration: 0.2 
            }}
            role="dialog"
            aria-modal="true"
            className={cn(
              "relative z-10 flex w-full flex-col overflow-hidden rounded-[2rem] bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] ring-1 ring-slate-200",
              sizes[size],
              className
            )}
          >
            {/* Header: Medium weights used for professional look */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 bg-white/50">
                <div className="flex flex-col gap-1 pr-6">
                  {title && (
                    <h3 className="text-xl font-semibold leading-tight tracking-tight text-slate-900">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="text-sm font-medium text-slate-500">
                      {description}
                    </p>
                  )}
                </div>
                
                {showCloseButton && (
                  <IconButton 
                    icon={<X size={20} />} 
                    label="Dismiss" 
                    onClick={onClose} 
                    className="w-10 h-10 -mr-2 transition-all rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                  />
                )}
              </div>
            )}

            {/* Body: Responsive max-height for mobile long-forms */}
            <div className="flex-1 p-8 overflow-y-auto max-h-[75vh] scrollbar-thin scrollbar-thumb-slate-200">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-slate-50 bg-slate-50/50">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;