import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * @component FullScreenError
 * @description Global Fallback for React Error Boundary.
 * displayed when a runtime error crashes the app.
 */
const FullScreenError = ({ error, resetErrorBoundary }) => {
  
  // Generate a random Reference ID for support tickets
  const referenceId = React.useMemo(() => 
    `ERR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 
  []);

  // Reload page is often safer than just resetting boundary state
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md overflow-hidden bg-white border border-gray-100 shadow-2xl rounded-xl">
        
        {/* Header Color Bar */}
        <div className="w-full h-2 bg-red-600" />

        <div className="p-8 text-center">
          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          {/* Main Message */}
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            System Encountered an Error
          </h2>
          <p className="mb-6 text-gray-600">
            We apologize for the inconvenience. The application has encountered an unexpected state and cannot continue.
          </p>

          {/* Developer / Support Info */}
          <div className="p-4 mb-6 text-left border border-gray-200 rounded-lg bg-gray-50">
            <p className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Support Reference
            </p>
            <p className="mb-3 font-mono text-sm font-bold text-gray-800">
              {referenceId}
            </p>

            {/* Show technical details only in Development */}
            {process.env.NODE_ENV !== 'production' && error && (
              <>
                <p className="pt-2 mb-1 text-xs font-semibold tracking-wider text-red-500 uppercase border-t border-gray-200">
                  Debug Details
                </p>
                <div className="overflow-y-auto max-h-32 scrollbar-thin">
                    <p className="font-mono text-xs text-red-600 break-words">
                    {error.message || 'Unknown Error'}
                    </p>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={resetErrorBoundary || handleReload}
              className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
            
            <button
              onClick={handleGoHome}
              className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto"
            >
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-8 py-4 text-center border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500">
            If this persists, please contact IT Support with the reference code above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FullScreenError;