import React from 'react';
import { Inter, JetBrains_Mono } from 'next/font/google'; // Import fonts if using Next.js fonts
import { cn } from '@/utils/utils';

// Global styles are usually imported in pages/_app.js or app/layout.js, 
// but this wrapper ensures semantic structure.

// If you are using 'sonner' or a toast context, import the Toaster here.
// import { Toaster } from 'sonner'; 

export default function AppLayout({ children, className }) {
  return (
    <div className={cn("min-h-screen bg-background text-content antialiased", className)}>
      {children}
      
      {/* Global Toast Container placeholder */}
      {/* <Toaster position="top-right" /> */}
    </div>
  );
}