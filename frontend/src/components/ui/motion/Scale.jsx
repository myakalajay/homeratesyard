import React from 'react';
import { motion } from 'framer-motion';

const Scale = ({ 
  children, 
  duration = 0.2, 
  delay = 0, 
  className 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default Scale;