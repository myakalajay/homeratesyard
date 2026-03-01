'use client'; 

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  Phone, HelpCircle, MapPin, Loader2, 
  ChevronDown, Globe, Clock, Zap
} from 'lucide-react';
import { cn } from '@/utils/utils';
import { useLocation } from '@/context/LocationContext';
import { useToast } from '@/context/ToastContext'; // 🟢 Added for 'Coming Soon' alerts

const WebsiteTopBar = ({ activeSegment = 'mortgage' }) => {
  const { location, updateLocation } = useLocation() || {};
  const { addToast } = useToast() || {}; // 🟢 Hook for feedback
  
  const [isMounted, setIsMounted] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setOpenDropdown(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // 🟢 FEATURE GATE: Shows a professional alert for non-mortgage segments
  const handleSegmentClick = (e, segmentLabel) => {
    if (segmentLabel !== 'Mortgage') {
      e.preventDefault();
      if (addToast) {
        addToast(`${segmentLabel} features are currently in development. Coming soon!`, 'info');
      }
    }
  };

  const handleMarketSelect = (market) => {
    if (updateLocation) {
        updateLocation({
          zip: market.zip,
          city: market.city,
          state: market.state,
          isUS: true
        });
    }
    setOpenDropdown(null);
  };

  const getLocationDisplay = () => {
    if (!isMounted) return "Loading..."; 
    if (location?.loading) return "Detecting...";
    if (location?.error || !location?.city) return "Select Location";
    return location.state ? `${location.city}, ${location.state}` : location.city;
  };

  const MARKETS = [
    { label: 'California (CA)', city: 'Los Angeles', state: 'CA', zip: '90001' },
    { label: 'Florida (FL)', city: 'Miami', state: 'FL', zip: '33101' },
    { label: 'Texas (TX)', city: 'Austin', state: 'TX', zip: '73301' },
    { label: 'New York (NY)', city: 'New York', state: 'NY', zip: '10001' },
    { label: 'Illinois (IL)', city: 'Chicago', state: 'IL', zip: '60601' },
  ];

  if (!isMounted) {
      return <div className="hidden w-full h-10 border-b md:block bg-slate-50 border-slate-200" />;
  }

  return (
    <div className="relative z-[120] hidden w-full border-b md:block bg-slate-50 border-slate-200 text-slate-500 font-medium text-[11px] lg:text-xs">
      <div className="flex items-center justify-between h-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        
        {/* LEFT SIDE: BRAND SEGMENTS */}
        <div className="flex items-center h-full gap-6">
          {[
            { id: 'mortgage', label: 'Mortgage', href: '/' }, // 🟢 Changed from Personal
            { id: 'business', label: 'Business', href: '#' },
            { id: 'enterprise', label: 'Enterprise', href: '#' }
          ].map((seg) => (
            <Link 
              key={seg.id}
              href={seg.href}
              onClick={(e) => handleSegmentClick(e, seg.label)} // 🟢 Apply gate
              className={cn(
                "relative flex items-center h-full transition-all duration-300 hover:text-slate-900",
                activeSegment === seg.id ? "text-red-600 font-semibold" : "text-slate-500"
              )}
            >
              {seg.label}
              {activeSegment === seg.id && (
                <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-red-600 animate-in fade-in slide-in-from-bottom-1 duration-500" />
              )}
            </Link>
          ))}
        </div>

        {/* RIGHT SIDE: UTILITY HUB */}
        <div className="flex items-center gap-4 lg:gap-6" ref={dropdownRef}>
          
          {/* MARKET STATUS PILL */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm cursor-help">
            <Clock size={12} className="text-slate-400" />
            <span className="uppercase tracking-wide font-bold text-[10px]">Markets:</span>
            <span className="flex items-center gap-1 text-green-600 font-bold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              OPEN
            </span>
          </div>

          <div className="hidden w-px h-3 bg-slate-200 lg:block" />

          {/* DYNAMIC LOCATION SELECTOR */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('location')}
              className={cn(
                "group flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200",
                openDropdown === 'location' ? "bg-white shadow-sm ring-1 ring-slate-200 text-slate-900" : "hover:text-slate-900"
              )}
            >
              {location?.loading ? (
                <Loader2 size={12} className="text-red-600 animate-spin" />
              ) : (
                <MapPin size={12} className={cn("transition-transform group-hover:scale-110", location?.city && location?.city !== 'Detecting...' ? "text-red-600" : "text-slate-400")} />
              )}
              <span className="truncate max-w-[100px] lg:max-w-[140px]">
                {getLocationDisplay()}
              </span>
              <ChevronDown size={10} className={cn("transition-transform duration-200 text-slate-400", openDropdown === 'location' && "rotate-180")} />
            </button>

            {openDropdown === 'location' && (
              <div className="absolute right-0 w-56 p-2 mt-1 bg-white border rounded-xl shadow-xl top-full border-slate-200 animate-in fade-in slide-in-from-top-1 z-[130]">
                <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-50 mb-1">Local Market Selection</div>
                {MARKETS.map((m) => (
                  <button 
                    key={m.zip} 
                    onClick={() => handleMarketSelect(m)}
                    className="w-full px-2 py-2 text-xs font-semibold text-left transition-colors rounded-lg hover:bg-red-50 hover:text-red-700 text-slate-700"
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-3 bg-slate-200" />

          {/* SUPPORT & CONTACT */}
          <div className="flex items-center gap-4">
            <a href="tel:+18005550123" className="flex items-center gap-1.5 hover:text-red-600 transition-colors">
              <Phone size={12} className="text-slate-400" />
              <span className="hidden lg:inline">1-800-HOMERATES</span>
            </a>
            <Link href="/contact" className="flex items-center gap-1.5 hover:text-red-600 transition-colors">
              <HelpCircle size={12} className="text-slate-400" />
              <span>Help</span>
            </Link>
          </div>

          <div className="w-px h-3 bg-slate-200" />

          {/* LANGUAGE SELECTOR */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('lang')}
              className="flex items-center gap-1 transition-colors hover:text-slate-900"
            >
              <Globe size={12} className="text-slate-400" />
              <span className="font-semibold">EN</span>
              <ChevronDown size={10} className={cn("transition-transform duration-200 text-slate-400", openDropdown === 'lang' && "rotate-180")} />
            </button>
            
            {openDropdown === 'lang' && (
              <div className="absolute right-0 p-1 mt-1 bg-white border rounded-lg shadow-xl top-full w-28 border-slate-200 animate-in fade-in slide-in-from-top-1 z-[130]">
                {['English', 'Español'].map((l) => (
                  <button key={l} onClick={() => setOpenDropdown(null)} className="w-full px-3 py-2 text-xs font-semibold text-left rounded-md hover:bg-slate-50 text-slate-700">
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteTopBar;