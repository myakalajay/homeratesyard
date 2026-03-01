import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCcw, WifiOff, X } from 'lucide-react';
import { cn } from '@/utils/utils'; // Assumes you have a utility for class merging

/**
 * @component ApiErrorBanner
 * @description Specialized alert for API/Network failures with Retry & Dismiss logic.
 * @accessibility Level AA Compliant (ARIA Live Regions)
 */
const ApiErrorBanner = ({ 
  error, 
  onRetry, 
  onDismiss,
  className,
  title = "Something went wrong"
}) => {
  const [isVisible, setIsVisible] = useState(!!error);

  // Sync internal visibility with external error prop
  useEffect(() => {
    setIsVisible(!!error);
  }, [error]);

  if (!isVisible || !error) return null;

  // 1. Robust Error Extraction
  // Handles Axios errors, Standard Errors, and Strings
  const message = typeof error === 'string' 
    ? error 
    : error?.response?.data?.message || error?.message || "An unexpected system error occurred.";

  // 2. Intelligent Context Detection
  // Changes icon based on error type (Network vs Server)
  const isNetworkError = message.toLowerCase().includes('network') || 
                         message.toLowerCase().includes('fetch') || 
                         message.toLowerCase().includes('offline');

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  return (
    <div 
      role="alert" 
      aria-live="assertive"
      className={cn(
        "rounded-md p-4 mb-4 border shadow-sm animate-in fade-in slide-in-from-top-2 duration-300",
        "bg-red-50 border-red-200 text-red-900", // Default Error Styling
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon Column */}
        <div className="shrink-0 mt-0.5">
          {isNetworkError ? (
            <WifiOff className="w-5 h-5 text-red-600" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
          )}
        </div>

        {/* Content Column */}
        <div className="flex-1 space-y-1">
          <h5 className="text-sm font-semibold leading-none tracking-tight text-red-900">
            {isNetworkError ? "Connection Lost" : title}
          </h5>
          <div className="text-sm text-red-800 break-words opacity-90">
            {message}
          </div>

          {/* Action Row */}
          {onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className="inline-flex items-center px-1 -ml-1 text-sm font-medium text-red-800 transition-colors rounded hover:text-red-900 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <RefreshCcw className="w-3 h-3 mr-1.5" />
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Dismiss Button (Top Right) */}
        <button
          onClick={handleDismiss}
          className="p-1 -mt-1 -mr-1 text-red-500 transition-colors rounded-full shrink-0 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ApiErrorBanner;