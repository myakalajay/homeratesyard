import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/utils';

/**
 * @component PageContainer
 * @description Standardized layout wrapper for Dashboard pages.
 * Handles SEO title, breadcrumbs, responsive padding, and max-width constraints.
 */
export default function PageContainer({ 
  children, 
  title, 
  subtitle, // Renamed from description for clarity
  actions, 
  breadcrumbs = [],
  className,
  maxWidth = "7xl", // 2xl, 4xl, 5xl, 6xl, 7xl, full
  loading = false,
  metaTitle
}) {
  
  // Map simple size names to Tailwind classes
  const widthClass = {
    'sm': 'max-w-screen-sm',
    'md': 'max-w-screen-md',
    'lg': 'max-w-screen-lg',
    'xl': 'max-w-screen-xl',
    '2xl': 'max-w-2xl', // specific reading width
    '7xl': 'max-w-7xl', // standard dashboard
    'full': 'max-w-full',
  }[maxWidth] || 'max-w-7xl';

  return (
    <>
      {/* 🟢 SEO AUTOMATION */}
      <Head>
        <title>{metaTitle || title ? `${metaTitle || title} | HomeRatesYard` : 'HomeRatesYard'}</title>
      </Head>

      <div className={cn("flex flex-col flex-1 w-full min-h-full", widthClass, "mx-auto px-4 sm:px-6 lg:px-8 py-8", className)}>
        
        {/* 🟢 HEADER SECTION */}
        {(title || breadcrumbs.length > 0) && (
          <header className="mb-8 duration-500 animate-in fade-in slide-in-from-top-2">
            
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <nav className="flex mb-4" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  <li>
                    <div>
                      <Link href="/dashboard" className="text-gray-400 hover:text-gray-500">
                        <Home className="flex-shrink-0 w-4 h-4" aria-hidden="true" />
                        <span className="sr-only">Dashboard</span>
                      </Link>
                    </div>
                  </li>
                  {breadcrumbs.map((crumb, index) => (
                    <li key={index}>
                      <div className="flex items-center">
                        <ChevronRight className="flex-shrink-0 w-4 h-4 text-gray-300" aria-hidden="true" />
                        {crumb.href ? (
                          <Link 
                            href={crumb.href} 
                            className="ml-2 text-xs font-medium text-gray-500 hover:text-gray-700"
                          >
                            {crumb.label}
                          </Link>
                        ) : (
                          <span className="ml-2 text-xs font-medium text-gray-700" aria-current="page">
                            {crumb.label}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* Title & Actions Row */}
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                {loading ? (
                    <div className="w-48 h-8 mb-2 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                    <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    {title}
                    </h1>
                )}
                
                {subtitle && !loading && (
                    <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                )}
              </div>
              
              {/* Actions Toolbar */}
              {actions && (
                <div className="flex mt-4 md:ml-4 md:mt-0">
                  {actions}
                </div>
              )}
            </div>
          </header>
        )}

        {/* 🟢 CONTENT SECTION */}
        <main className="relative flex-1">
            {children}
        </main>
      </div>
    </>
  );
}