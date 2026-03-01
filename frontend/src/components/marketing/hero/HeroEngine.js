'use client'; 

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic'; 
import { 
  MapPin, ArrowRight, Clock, ShieldCheck, 
  TrendingUp, TrendingDown, Minus, Crosshair, Loader2, AlertCircle, 
  Info, ChevronDown, Activity
} from 'lucide-react';

import { useMarketEngine } from '@/hooks/useMarketEngine'; 
import { useLocation } from '@/context/LocationContext';

// Dynamically load the modal to keep initial bundle size tiny
const ConversionModal = dynamic(() => import('@/components/modals/ConversionModal'), {
  loading: () => null,
  ssr: false 
});

const LOAN_CONFIG = {
  '30Y': { label: '30Y Fixed', color: '#DC2626' }, 
  '20Y': { label: '20Y Fixed', color: '#0F172A' },
  '15Y': { label: '15Y Fixed', color: '#059669' },
  'FHA': { label: 'FHA 30Y',   color: '#2563EB' },
  'VA':  { label: 'VA 30Y',    color: '#7C3AED' },
};

// SVG Smooth Curve Generator
const getPath = (points, height, width, minVal, maxVal) => {
  if (!points || points.length === 0) return "";
  const range = maxVal - minVal || 1;
  const coords = points.map((point, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((parseFloat(point.value) - minVal) / range) * height;
    return [x, y];
  });
  return coords.reduce((acc, [x, y], i, arr) => {
    if (i === 0) return `M ${x},${y}`;
    const [px, py] = arr[i - 1];
    const cp1x = px + (x - px) / 2;
    const cp2x = x - (x - px) / 2;
    return `${acc} C ${cp1x},${py} ${cp2x},${y} ${x},${y}`;
  }, "");
};

// ==========================================
// COMPONENT: RateTrendChart
// ==========================================
const RateTrendChart = React.memo(({ graphData, chartMetrics, onHover, hoveredData, loading, error, onRetry }) => {
  if (loading && (!graphData || graphData.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] gap-3 text-slate-400 animate-pulse">
        <Loader2 size={28} className="animate-spin text-red-500/50" />
        <span className="text-sm font-medium">Syncing live market data...</span>
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center h-[200px] gap-3 text-slate-500">
            <div className="p-3 text-red-600 rounded-full bg-red-50">
                <AlertCircle size={24} />
            </div>
            <p className="text-sm font-medium">Connection lost.</p>
            <button onClick={onRetry} className="text-xs font-semibold underline hover:text-red-600">Retry</button>
        </div>
    );
  }

  const isNearRightEdge = chartMetrics.todayX > (chartMetrics.width * 0.85);

  return (
    <div className="h-[200px] w-full px-6 relative group cursor-crosshair isolate z-0 mt-4">
      {/* Y-Axis reference lines */}
      <div className="absolute inset-0 flex flex-col justify-between px-6 py-4 pointer-events-none z-[-1] opacity-40">
        <div className="w-full border-t border-dashed border-slate-200" />
        <div className="w-full border-t border-dashed border-slate-200" />
        <div className="w-full border-t border-dashed border-slate-200" />
      </div>

      <svg viewBox={`0 0 ${chartMetrics.width} ${chartMetrics.height}`} className="z-0 w-full h-full overflow-visible">
        <defs>
          <linearGradient id="gradientArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={chartMetrics.activeColor} stopOpacity="0.15" />
            <stop offset="100%" stopColor={chartMetrics.activeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={chartMetrics.areaPath} fill="url(#gradientArea)" className="transition-all duration-700 ease-out" />
        <path d={chartMetrics.linePath} fill="none" stroke={chartMetrics.activeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-700 ease-out drop-shadow-sm" />
        
        {graphData.map((d, i) => {
            const x = (i / (graphData.length - 1)) * chartMetrics.width;
            return (
              <rect
                key={i} x={x - 10} y="0" width="20" height={chartMetrics.height} fill="transparent"
                onMouseEnter={() => onHover({ 
                  x, value: d.value, date: d.date, 
                  y: chartMetrics.height - ((parseFloat(d.value) - chartMetrics.minVal) / (chartMetrics.maxVal - chartMetrics.minVal)) * chartMetrics.height 
                })}
                onMouseLeave={() => onHover(null)}
              />
            );
        })}
      </svg>

      <div className="absolute inset-0 z-50 pointer-events-none">
          {chartMetrics.todayPoint && !hoveredData && (
              <div 
                className="absolute flex flex-col mb-3 duration-500 transform -translate-y-full animate-in fade-in zoom-in"
                style={{ 
                    left: isNearRightEdge ? 'auto' : `${(chartMetrics.todayX / chartMetrics.width) * 100}%`,
                    right: isNearRightEdge ? '0' : 'auto',
                    top: `${(chartMetrics.todayY / chartMetrics.height) * 100}%`,
                    transform: isNearRightEdge ? 'translateY(-100%)' : 'translate(-50%, -100%)'
                }}
              >
                  <div className="flex flex-col items-center px-3 py-1.5 text-white border rounded-lg shadow-lg bg-slate-900 border-slate-700">
                      <span className="text-[9px] font-semibold opacity-80 uppercase tracking-wide">Today</span>
                      <span className="text-sm font-semibold leading-none">{chartMetrics.todayPoint.value}%</span>
                      <div className={`absolute w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-700 -bottom-1 ${isNearRightEdge ? 'left-6' : 'left-1/2 -translate-x-1/2'}`} />
                  </div>
              </div>
          )}
          
          {hoveredData && (
              <div 
                  className="absolute z-50 flex flex-col items-center gap-1 px-3 py-2 mb-4 text-white transition-all duration-75 transform -translate-x-1/2 -translate-y-full border rounded-lg shadow-xl bg-slate-900 border-slate-700"
                  style={{ left: `${(hoveredData.x / chartMetrics.width) * 100}%`, top: hoveredData.y }}
              >
                  <span className="font-medium text-slate-400 uppercase text-[9px] tracking-wide">{hoveredData.date}</span>
                  <span className="text-base font-semibold">{hoveredData.value}%</span>
                  <div className="absolute w-2 h-2 rotate-45 border-b border-r bg-slate-900 -bottom-1 border-slate-700" />
              </div>
          )}
      </div>
    </div>
  );
});

// ==========================================
// MAIN COMPONENT: HeroEngine
// ==========================================
const HeroEngine = ({ onSearch }) => {
  const { location, updateLocation, handleGPSDetect } = useLocation() || {};
  const { 
    loading, error, rates, graphData, insights, 
    activeLoanType, setActiveLoanType, refresh: refetch 
  } = useMarketEngine({ initialZip: location?.zip || '' }); // 🟢 SAFETY CHECK: Reverted to object pattern just in case

  const [zipInput, setZipInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredData, setHoveredData] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true); 
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (location?.zip) setZipInput(location.zip);
  }, [location]);

  const handleZipChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 5) setZipInput(val);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (zipInput.length === 5) {
      if (updateLocation) updateLocation({ zip: zipInput, city: 'Manual Search', state: 'US' });
      if (onSearch) onSearch(zipInput, false);
    }
  };

  const handleLocateMe = async () => {
    if (isLocating || !handleGPSDetect) return;
    setIsLocating(true);
    setZipInput("..."); 
    try {
        await handleGPSDetect();
    } catch (e) {
        setZipInput("");
        alert("Location access denied or unavailable.");
    } finally {
        setIsLocating(false);
    }
  };

  const handleCardClick = (type) => {
    if (activeLoanType === type) {
        setIsModalOpen(true);
    } else {
        setActiveLoanType(type);
    }
  };

  const handleHover = useCallback((data) => setHoveredData(data), []);

  const chartMetrics = useMemo(() => {
    const width = 600; 
    const height = 200; 
    if (!graphData || graphData.length === 0) return { width, height, linePath: "", activeColor: '#DC2626' };
    
    const allVals = graphData.map(d => parseFloat(d.value));
    const maxVal = Math.max(...allVals, 0) + 0.1;
    const minVal = Math.min(...allVals, 10) - 0.1;
    
    const linePath = getPath(graphData, height, width, minVal, maxVal);
    const areaPath = linePath ? `${linePath} L ${width},${height} L 0,${height} Z` : "";
    const activeColor = LOAN_CONFIG[activeLoanType]?.color || '#DC2626';
    
    const todayPoint = graphData[graphData.length - 1];
    const todayX = width; 
    const todayY = todayPoint ? height - ((parseFloat(todayPoint.value) - minVal) / (maxVal - minVal)) * height : 0;
    
    return { width, height, linePath, areaPath, activeColor, minVal, maxVal, todayPoint, todayX, todayY };
  }, [graphData, activeLoanType]);

  const getInsightIcon = (type) => {
    if (type === 'Urgent') return <TrendingUp size={14} />;
    if (type === 'Float') return <TrendingDown size={14} />;
    return <Minus size={14} />;
  };

  // 🟢 SSR SAFE STRING: Prevents hydration mismatch on city name
  const displayCity = !mounted ? 'Your Area' : (location?.city && location.city !== 'Detecting...' ? location.city : 'Your Area');

  return (
    <>
      <ConversionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        locationName={displayCity !== 'Manual Search' ? displayCity : (location?.zip || 'your area')} 
        loanType={activeLoanType}
        currentRate={rates ? rates[activeLoanType] : null}
      />

      <section className="relative w-full min-h-[90vh] flex flex-col justify-center pt-10 pb-20 bg-slate-50 overflow-hidden">
        
        {/* Subtle Wave Pattern */}
        <div className="absolute bottom-0 left-0 w-full h-[25vh] z-0 opacity-[0.03] pointer-events-none select-none">
          <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
            </defs>
            <path d="M0,100 C250,150 350,50 500,100 C650,150 750,50 1000,100 L1000,200 L0,200 Z" fill="url(#wave-gradient)" />
          </svg>
        </div>

        <div className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none z-0" />

        <div className="container relative z-10 px-4 mx-auto max-w-7xl">
          <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            
            {/* LEFT COLUMN */}
            <div className="flex flex-col items-start space-y-8 text-left duration-700 lg:col-span-5 animate-in slide-in-from-left fade-in">
              <h1 className="text-5xl lg:text-6xl font-sans font-bold tracking-tight text-slate-900 leading-[1.1]">
                Live Mortgage <br/> Rates for <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
                  {displayCity}
                </span>
              </h1>
              
              {insights && (
                 <div className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-500 shadow-sm
                   ${insights.lockRecommendation === 'Urgent' 
                     ? 'bg-red-50 text-red-700 border border-red-100' 
                     : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                   }`}>
                   {getInsightIcon(insights.lockRecommendation)}
                   {insights.insight || "Market analysis active."}
                 </div>
              )}

              <div className="w-full max-w-md">
                <label htmlFor="zip-input" className="block mb-2 ml-1 text-xs font-semibold tracking-wider uppercase text-slate-500">
                  Refine by Zip Code
                </label>
                
                <form onSubmit={handleSearch} className="relative group">
                  <div className={`flex items-center p-1.5 bg-white border-2 rounded-full shadow-sm transition-all duration-300 focus-within:border-red-400 focus-within:ring-4 focus-within:ring-red-600/10 ${loading ? 'border-orange-200' : 'border-slate-200 group-hover:border-slate-300'}`}>
                    <div className="pl-4 pr-2 text-slate-400"><MapPin size={22} strokeWidth={2} /></div>
                    <input 
                      id="zip-input" type="text" placeholder="e.g. 90210" 
                      className={`w-full px-2 text-xl font-semibold bg-transparent border-none outline-none ring-0 focus:ring-0 text-slate-900 placeholder:text-slate-300 ${isLocating ? 'animate-pulse text-slate-400' : ''}`}
                      maxLength={5} value={zipInput} onChange={handleZipChange} inputMode="numeric" readOnly={isLocating}
                    />
                    <button type="button" onClick={handleLocateMe} disabled={isLocating || loading} className="p-2 mr-1 transition-colors rounded-full text-slate-400 hover:bg-slate-100 hover:text-red-600 disabled:opacity-50" title="Use GPS Location">
                      {isLocating ? <Loader2 size={18} className="text-red-600 animate-spin" /> : <Crosshair size={18} />}
                    </button>
                    <button type="submit" disabled={loading || (zipInput.length !== 5 && !isLocating)} className={`flex items-center justify-center w-[64px] h-11 rounded-full transition-all duration-200 shadow-sm shrink-0 ${loading || (zipInput.length !== 5 && !isLocating) ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02] active:scale-95'}`}>
                      {loading ? <Clock size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                    </button>
                  </div>
                </form>
              </div>

              <div className="flex flex-col gap-2 pl-4 border-l-2 border-slate-200">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <div className={`w-2 h-2 rounded-full ${loading ? 'bg-orange-400 animate-ping' : 'bg-emerald-500'}`} />
                    {loading ? 'AI Engine Analyzing...' : 'Live Market Feed Active'}
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={12}/> Updated moments ago</span>
                      <span className="flex items-center gap-1"><ShieldCheck size={12}/> Bank-Level Security</span>
                  </div>
              </div>
            </div>

            {/* RIGHT COLUMN: The Interactive Graph */}
            <div className="w-full duration-700 delay-100 lg:col-span-7 animate-in slide-in-from-right fade-in">
              <div className="bg-white rounded-[1.25rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative flex flex-col overflow-hidden">
                <div className="flex items-start justify-between px-8 pt-8 mb-2">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-slate-900">{LOAN_CONFIG[activeLoanType]?.label} Trend</h3>
                    </div>
                </div>

                {/* Chart Legend */}
                <div className="flex items-center gap-5 px-8 mt-1 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: LOAN_CONFIG[activeLoanType]?.color }}></div> 
                     Active Rate
                   </div>
                   <div className="flex items-center gap-2">
                     <Activity size={12} className="text-slate-300" />
                     30-Day Historical
                   </div>
                </div>

                <RateTrendChart 
                  graphData={graphData} chartMetrics={chartMetrics} onHover={handleHover} 
                  hoveredData={hoveredData} loading={loading} error={error} onRetry={refetch}
                />

                <div className="grid grid-cols-5 mt-6 border-t border-slate-100 bg-slate-50/50">
                    {Object.keys(LOAN_CONFIG).map((type) => {
                      const isActive = activeLoanType === type;
                      return (
                        <button key={type} onClick={() => handleCardClick(type)} className={`relative py-4 px-1 text-center transition-all border-r border-slate-100 last:border-r-0 group flex flex-col items-center justify-center min-h-[90px] ${isActive ? 'bg-white z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]' : 'hover:bg-white cursor-pointer'}`}>
                          {isActive && <div className="absolute top-0 left-0 w-full h-[2px] bg-red-600" />}
                          <p className={`text-[10px] font-bold uppercase mb-1 tracking-wider truncate ${isActive ? 'text-red-600' : 'text-slate-400'}`}>{LOAN_CONFIG[type].label}</p>
                          <h4 className={`text-lg font-bold tracking-tight mb-2 ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{rates ? rates[type] : '-'}%</h4>
                          <div className={`transition-all duration-300 ${isActive ? 'opacity-100 h-auto translate-y-0' : 'opacity-0 h-0 overflow-hidden translate-y-1'}`}>
                             <span className="text-[10px] font-semibold text-white bg-red-600 px-3 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                               Lock <ArrowRight size={10} />
                             </span>
                          </div>
                        </button>
                      );
                    })}
                </div>

                {/* Disclaimers */}
                <div className="px-6 py-3 border-t bg-slate-50 border-slate-100">
                  <button onClick={() => setShowDisclaimer(!showDisclaimer)} className="flex items-center justify-between w-full text-[10px] text-slate-500 font-semibold tracking-wider hover:text-slate-700 transition-colors">
                    <span className="flex items-center gap-1.5"><Info size={12} className="text-slate-400" /> DISCLOSURES & ASSUMPTIONS</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 text-slate-400 ${showDisclaimer ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showDisclaimer ? 'max-h-[200px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <p className="text-[10px] font-medium leading-relaxed text-slate-500 text-justify pr-2 pb-1">
                        Rates shown are national averages based on a $450,000 loan amount, 740+ FICO score, and 20% down payment. <strong>Not a commitment to lend.</strong> Connect with a licensed loan officer for an official Loan Estimate based on your specific financial profile. <Link href="/website/disclaimers" className="ml-1 text-red-600 underline hover:text-red-700">Read Full Disclosures</Link>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroEngine;