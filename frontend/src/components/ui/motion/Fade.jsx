import React from 'react';
import { motion } from 'framer-motion';

const Fade = ({ 
  children, 
  duration = 0.3, 
  delay = 0, 
  className,
  inView = false // If true, only fades in when scrolled into view
}) => {
  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const Component = inView ? motion.div : motion.div;
  const props = inView 
    ? { 
        initial: "hidden", 
        whileInView: "visible", 
        viewport: { once: true, margin: "-50px" } 
      }
    : { 
        initial: "hidden", 
        animate: "visible",
        exit: "hidden" 
      };

  return (
    <Component
      variants={variants}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Fade;