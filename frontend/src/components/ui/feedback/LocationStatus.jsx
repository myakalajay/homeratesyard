import React from 'react';
import { MapPin, Loader2, Globe } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';

export default function LocationStatus() {
  const { location } = useLocation();

  if (location.loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-white/60">
        <Loader2 size={12} className="animate-spin" /> Detecting Location...
      </div>
    );
  }

  if (!location.isUS) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 text-xs font-bold text-white bg-red-600 rounded-full">
        <Globe size={12} /> Outside US Coverage
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-white/80">
      <MapPin size={14} className="text-primary" />
      <span>
        Rates customized for <strong>{location.city}, {location.state}</strong> ({location.zip})
      </span>
    </div>
  );
}