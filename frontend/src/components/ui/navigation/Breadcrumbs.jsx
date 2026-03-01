import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/utils';

const Breadcrumbs = ({ items = [], className, homeHref = "/dashboard" }) => {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        
        {/* 1. Root Item (Dashboard) */}
        <li className="flex items-center">
          <Link 
            href={homeHref} 
            className="flex items-center justify-center p-1 transition-colors rounded-md hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            title="Go to Dashboard"
          >
            <Home className="w-4 h-4" />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>
        
        {/* 2. Dynamic Items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={item.href || index} className="flex items-center gap-1.5 overflow-hidden">
              <ChevronRight 
                className="flex-shrink-0 w-4 h-4 text-slate-300" 
                aria-hidden="true" 
              />
              
              {isLast ? (
                <span 
                  className="font-semibold text-slate-900 truncate max-w-[150px] sm:max-w-xs cursor-default" 
                  aria-current="page"
                  title={item.label} // Tooltip for truncated text
                >
                  {item.label}
                </span>
              ) : (
                <Link 
                  href={item.href} 
                  className="transition-colors hover:text-slate-800 hover:underline decoration-slate-300 underline-offset-4 truncate max-w-[100px] sm:max-w-xs"
                  title={item.label}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;