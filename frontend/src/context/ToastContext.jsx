import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext({});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    // 🟢 Use crypto.randomUUID if available, else fallback
    const id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substr(2, 9);

    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  // Helper to determine styles based on type
  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-white border-green-200 text-slate-800';
      case 'error':
        return 'bg-white border-red-200 text-slate-800';
      case 'info':
        return 'bg-slate-900 text-white border-slate-700';
      default:
        return 'bg-white border-slate-200 text-slate-800';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-emerald-500" size={20} />;
      case 'error': return <AlertCircle className="text-red-500" size={20} />;
      default: return <Info className="text-blue-400" size={20} />;
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* 🟢 Toast Container */}
      {/* suppressHydrationWarning fixes the 'bis_skin_checked' extension error */}
      <div 
        suppressHydrationWarning
        className="fixed z-[9999] flex flex-col gap-3 pointer-events-none top-4 right-4 sm:top-6 sm:right-6"
      >
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            suppressHydrationWarning
            className={`
              pointer-events-auto flex w-full max-w-sm items-start gap-4 rounded-xl border p-4 shadow-sm transition-all duration-300 animate-in slide-in-from-right-full
              ${getToastStyles(toast.type)}
            `}
            role="alert"
          >
            {/* Icon */}
            <div className="shrink-0 pt-0.5">
              {getIcon(toast.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-bold ${toast.type === 'error' ? 'text-red-600' : ''}`}>
                {toast.type === 'error' ? 'Error' : toast.type === 'success' ? 'Success' : 'Note'}
              </h4>
              <p className="mt-1 text-xs font-medium leading-relaxed break-words opacity-90">
                {toast.message}
              </p>
            </div>

            {/* Close Button */}
            <button 
              onClick={() => removeToast(toast.id)} 
              className="p-1 -mt-2 -mr-2 transition-colors rounded-lg shrink-0 hover:bg-black/5 active:scale-95 text-slate-400 hover:text-slate-600"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};