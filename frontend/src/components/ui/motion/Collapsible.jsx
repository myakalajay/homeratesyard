import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronsUpDown } from 'lucide-react';
import { cn } from '@/utils/utils';
import { Button } from '@/components/ui/primitives/Button';

const Collapsible = ({ 
  title, 
  children, 
  defaultOpen = false,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between px-1 space-x-4">
        <h4 className="text-sm font-semibold text-content">
          {title}
        </h4>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsOpen(!isOpen)}
          className="p-0 w-9 h-9"
        >
          <ChevronsUpDown className="w-4 h-4" />
          <span className="sr-only">Toggle</span>
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-1 pt-2 pb-4 text-sm text-content-muted">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Collapsible;