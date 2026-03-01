import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/utils';
import { Button } from '@/components/ui/primitives/Button';

const Snackbar = ({ 
  message, 
  actionLabel, 
  onAction, 
  onClose, 
  isOpen,
  className 
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 w-full max-w-md px-4 -translate-x-1/2 bottom-4 left-1/2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={cn(
          "flex items-center justify-between gap-4 rounded-lg bg-background-inverted px-4 py-3 text-sm text-content-inverted shadow-xl",
          className
        )}
      >
        <span>{message}</span>
        
        <div className="flex items-center gap-2">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="text-sm font-semibold transition-colors text-primary hover:text-primary-hover"
            >
              {actionLabel}
            </button>
          )}
          <button 
            onClick={onClose}
            className="transition-colors text-content-muted hover:text-content-inverted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Snackbar;