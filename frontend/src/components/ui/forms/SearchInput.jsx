import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/utils';

const SearchInput = React.forwardRef(({ className, onClear, value, onChange, placeholder = "Search...", ...props }, ref) => {
  return (
    <div className="relative flex items-center w-full">
      <Search className="absolute w-4 h-4 pointer-events-none left-3 text-content-muted" />
      <input
        ref={ref}
        type="text"
        className={cn(
          "flex h-10 w-full rounded-md border border-border bg-background pl-9 pr-8 py-2 text-sm ring-offset-background placeholder:text-content-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-content-muted hover:text-content"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});
SearchInput.displayName = "SearchInput";

export default SearchInput;