import React from 'react';
import { cn } from '@/utils/utils';
import Sidebar from './Sidebar';

/**
 * @component MobileNav
 * @description A lightweight wrapper to show the Sidebar as an overlay on mobile.
 */
const MobileNav = ({ isOpen, onClose }) => {
  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-background-inverted/80 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      
      {/* Sidebar Instance */}
      <Sidebar 
        className={cn(
          "shadow-xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )} 
        isOpen={isOpen}
        onClose={onClose}
      />
    </div>
  );
};

export default MobileNav;