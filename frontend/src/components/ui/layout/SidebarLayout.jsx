import React, { useState } from 'react';
import { cn } from '@/utils/utils';
import Sidebar from '@/components/ui/navigation/Sidebar';
import Navbar from '@/components/ui/navigation/Navbar';
import MobileNav from '@/components/ui/navigation/MobileNav';

/**
 * @component SidebarLayout
 * @description The main shell for the authenticated dashboard. 
 * Handles responsive sidebar toggling and layout structure.
 */
const SidebarLayout = ({ children, user, className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={cn("min-h-screen bg-background-subtle", className)}>
      {/* 1. Mobile Navigation Overlay */}
      <MobileNav 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* 2. Desktop Sidebar (Hidden on mobile) */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <Sidebar className="border-r border-border bg-background" />
      </div>

      {/* 3. Main Content Area */}
      <div className="flex flex-col min-h-screen lg:pl-64">
        
        {/* Top Navbar */}
        <Navbar 
          user={user} 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
        />

        {/* Page Content */}
        <main className="flex-1 py-8">
           {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;