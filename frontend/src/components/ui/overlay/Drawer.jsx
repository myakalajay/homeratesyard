import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/utils';
import Backdrop from './Backdrop';
import { IconButton } from '@/components/ui/primitives/IconButton';

const Drawer = ({ 
  isOpen, 
  onClose, 
  position = "right", // left, right
  title,
  children, 
  className 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  const variants = {
    left: { x: "-100%" },
    right: { x: "100%" },
    visible: { x: "0%" },
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex overflow-hidden">
          <Backdrop onClick={onClose} />
          
          <div className={cn(
            "fixed inset-y-0 flex max-w-full",
            position === "right" ? "right-0 pl-10" : "left-0 pr-10"
          )}>
            <motion.div
              initial={variants[position]}
              animate="visible"
              exit={variants[position]}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn(
                "relative w-screen max-w-md flex-1 flex flex-col bg-background shadow-xl",
                className
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-6 border-b sm:px-6 border-border">
                <h2 className="text-lg font-semibold text-content">{title}</h2>
                <IconButton icon={X} label="Close panel" onClick={onClose} />
              </div>

              {/* Content */}
              <div className="relative flex-1 px-4 py-6 overflow-y-auto sm:px-6">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Drawer;