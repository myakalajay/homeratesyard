import React from 'react';
import { cn } from '@/utils/utils';

// AICPA SOC Logo (Blue Circle Style)
export const LogoSOC = ({ className }) => (
  <svg viewBox="0 0 200 200" className={cn("w-full h-full", className)} xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="98" fill="#0099DA" />
    <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    <text x="100" y="85" fontFamily="Arial, sans-serif" fontWeight="300" fontSize="45" fill="white" textAnchor="middle" letterSpacing="-1">AICPA</text>
    <line x1="50" y1="95" x2="150" y2="95" stroke="white" strokeWidth="1" />
    <text x="100" y="140" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="42" fill="white" textAnchor="middle">SOC</text>
    <text x="100" y="165" fontFamily="Arial, sans-serif" fontSize="10" fill="white" textAnchor="middle" opacity="0.9">aicpa.org/soc4so</text>
  </svg>
);

// AES 256 Encryption (Gold Seal Style)
export const LogoAES = ({ className }) => (
  <svg viewBox="0 0 200 200" className={cn("w-full h-full", className)} xmlns="http://www.w3.org/2000/svg">
    <path d="M100 10 L115 35 L145 35 L145 65 L170 80 L160 110 L180 135 L155 155 L145 185 L115 175 L100 200 L85 175 L55 185 L45 155 L20 135 L40 110 L30 80 L55 65 L55 35 L85 35 Z" fill="#F4C430" stroke="#DAA520" strokeWidth="2"/>
    <circle cx="100" cy="105" r="65" fill="none" stroke="#333" strokeWidth="1" />
    <text x="100" y="115" fontFamily="Impact, Arial Black, sans-serif" fontSize="42" fill="#333" textAnchor="middle">AES 256</text>
    <defs>
      <path id="curveTop" d="M 60,105 A 40,40 0 0,1 140,105" />
      <path id="curveBot" d="M 60,105 A 40,40 0 0,0 140,105" />
    </defs>
    <text fontSize="12" fontWeight="bold" fill="#333" textAnchor="middle">
      <textPath href="#curveTop" startOffset="50%">ENCRYPTION</textPath>
    </text>
    <text fontSize="12" fontWeight="bold" fill="#333" textAnchor="middle">
       <textPath href="#curveBot" startOffset="50%">SECURED</textPath>
    </text>
  </svg>
);

// ISO 9001:2015 (Blue Globe Style)
export const LogoISO = ({ className }) => (
  <svg viewBox="0 0 300 150" className={cn("w-full h-full", className)} xmlns="http://www.w3.org/2000/svg">
     <g transform="translate(10, 25)">
       <circle cx="50" cy="50" r="45" fill="none" stroke="#005697" strokeWidth="3" />
       <ellipse cx="50" cy="50" rx="45" ry="15" fill="none" stroke="#005697" strokeWidth="2" />
       <ellipse cx="50" cy="50" rx="15" ry="45" fill="none" stroke="#005697" strokeWidth="2" />
       <line x1="5" y1="50" x2="95" y2="50" stroke="#005697" strokeWidth="2" />
       <line x1="50" y1="5" x2="50" y2="95" stroke="#005697" strokeWidth="2" />
     </g>
     <g transform="translate(120, 85)">
       <text x="0" y="0" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="50" fill="#005697">ISO</text>
       <text x="0" y="30" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="24" fill="#005697">9001:2015</text>
     </g>
  </svg>
);

// Equal Housing Opportunity (Blue House Style)
export const LogoEHO = ({ className }) => (
  <svg viewBox="0 0 200 240" className={cn("w-full h-full", className)} xmlns="http://www.w3.org/2000/svg">
    <path d="M 100,20 L 10,80 L 30,80 L 30,180 L 170,180 L 170,80 L 190,80 Z" fill="#1e3a8a" />
    <rect x="70" y="110" width="60" height="12" fill="white"/>
    <rect x="70" y="135" width="60" height="12" fill="white"/>
    <g fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="16" fill="#1e3a8a" textAnchor="middle">
      <text x="100" y="210">EQUAL HOUSING</text>
      <text x="100" y="230">OPPORTUNITY</text>
    </g>
  </svg>
);

/**
 * @component TrustBadgeRow
 * @description A pre-styled row for footers or landing pages.
 */
export const TrustBadgeRow = ({ className }) => {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500", className)}>
      <LogoEHO className="w-auto h-10" />
      <LogoSOC className="w-auto h-10" />
      <LogoISO className="w-auto h-10" />
      <LogoAES className="w-auto h-10" />
    </div>
  );
};