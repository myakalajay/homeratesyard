import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/utils';

const Backdrop = ({ onClick, className, zIndex = 40 }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      className={cn(
        "fixed inset-0 bg-background-inverted/80 backdrop-blur-sm",
        className
      )}
      style={{ zIndex }}
    />
  );
};

export default Backdrop;