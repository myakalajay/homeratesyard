'use client'; // 🟢 FIX 1: REQUIRED for state and effects in Next.js App Router

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';
import { cn } from '@/utils/utils';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇲🇽' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' }
];

const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const dropdownRef = useRef(null);

  // Toggle Menu
  const toggleOpen = () => setIsOpen((prev) => !prev);

  // Select Language
  const handleSelect = (code) => {
    setCurrentLang(code);
    setIsOpen(false);
    // 💡 Demo Tip: If asked about translation, you can mention the i18n hook goes here!
    // i18n.changeLanguage(code); 
  };

  // 🟢 FIX 2: Wrapped in useCallback to prevent recreation on every render
  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Trigger Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={toggleOpen}
        aria-expanded={isOpen} // 🟢 FIX 3: Added ARIA labels for accessibility
        aria-haspopup="menu"
        aria-label="Select Language"
        className={cn(
          "flex items-center gap-1.5 px-2 transition-colors text-slate-500 hover:text-slate-900",
          isOpen && "text-red-600 bg-red-50 hover:text-red-700 hover:bg-red-50"
        )}
      >
        <Globe className="w-4 h-4" />
        <span className="text-[10px] font-semibold uppercase">{currentLang}</span>
        <ChevronDown size={12} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        // 🟢 FIX 4: Boosted z-index and standardized border colors
        <div className="absolute right-0 z-[150] w-40 mt-2 origin-top-right bg-white border shadow-xl rounded-xl border-slate-200 animate-in fade-in zoom-in-95">
          <div className="p-1.5" role="menu">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                role="menuitem"
                onClick={() => handleSelect(lang.code)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors group",
                  currentLang === lang.code 
                    ? "bg-red-50 text-red-600" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                {currentLang === lang.code && (
                  <Check size={14} className="text-red-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;