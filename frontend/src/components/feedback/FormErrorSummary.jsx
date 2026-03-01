import React from 'react';
import { XCircle, AlertOctagon } from 'lucide-react';
import { cn } from '@/utils/utils';

/**
 * @component FormErrorSummary
 * @description Aggregates React Hook Form errors into a visible, clickable summary.
 * @param {Object} errors - The 'errors' object from useForm()
 */
const FormErrorSummary = ({ errors, className }) => {
  if (!errors || Object.keys(errors).length === 0) return null;

  // 1. Recursive Flattening Strategy
  // Converts { borrower: { name: { message: "Required" } } } 
  // into [{ field: "borrower.name", message: "Required" }]
  const flattenErrors = (obj, parentKey = '') => {
    let messages = [];
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      
      // React Hook Form error objects always have a 'message' or 'type' key
      if (value?.message) {
        messages.push({ field: fullKey, message: value.message });
      } else if (value && typeof value === 'object' && !value.ref) {
        // Recurse deeper (ignore Ref objects which RHF sometimes attaches)
        messages = [...messages, ...flattenErrors(value, fullKey)];
      }
    }
    return messages;
  };

  const errorList = flattenErrors(errors);

  if (errorList.length === 0) return null;

  // 2. UX Enhancement: Scroll to Error
  const scrollToField = (fieldName) => {
    // RHF usually attaches 'name' attributes matching the key structure
    const element = document.querySelector(`[name="${fieldName}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus({ preventScroll: true }); // Focus for accessibility
    }
  };

  return (
    <div 
      role="alert" 
      aria-live="assertive"
      className={cn(
        "rounded-md border border-red-200 bg-red-50 p-4 mb-6 animate-in fade-in slide-in-from-top-1", 
        className
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-shrink-0">
            <XCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-medium text-red-800">
          There are {errorList.length} errors in your submission
        </h3>
      </div>

      <div className="mt-2 ml-8">
        <ul className="pl-5 space-y-1 list-disc">
          {errorList.map((err, index) => (
            <li key={index} className="text-sm text-red-700">
              <span className="font-semibold text-red-800 capitalize">
                {err.field.split('.').pop().replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              {' '}
              {err.message}
              
              {/* Optional: Jump Link */}
              <button 
                onClick={() => scrollToField(err.field)}
                className="ml-2 text-xs text-red-600 underline hover:text-red-900 focus:outline-none"
                aria-label={`Scroll to ${err.field} error`}
              >
                (Fix)
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FormErrorSummary;