'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation } from '@/context/LocationContext';

export const useMarketEngine = (options = {}) => {
  const { initialCredit = 'excellent', initialLtv = 80 } = options || {};

  // 1. Connect to Context
  const { location: globalLocation } = useLocation() || {};
  const detectedZip = globalLocation?.zip || '';

  // 2. Internal State
  const [zip, setZip] = useState(detectedZip);
  const [creditScore, setCreditScore] = useState(initialCredit);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState('National Average');
  const [activeLoanType, setActiveLoanType] = useState('30Y');
  
  const prevZipRef = useRef(detectedZip);
  
  // 🟢 FIX 1: Removed graphData from this state object. It should be derived dynamically.
  const [data, setData] = useState({
    rates: { '30Y': '6.875', '15Y': '6.125', 'FHA': '6.250', 'VA': '6.250', '20Y': '6.500' },
    insights: { lockRecommendation: 'Neutral', insight: 'Syncing local market...' },
    isMarketOpen: true
  });

  // Sync Logic
  useEffect(() => {
    if (detectedZip && detectedZip !== zip) {
      setZip(detectedZip);
    }
  }, [detectedZip, zip]);

  const checkMarketStatus = useCallback(() => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
  }, []);

  const getRateAdjustment = useCallback(() => {
    let adjustment = 0;
    if (creditScore === 'good') adjustment += 0.250;
    if (creditScore === 'fair') adjustment += 0.750;
    if (initialLtv > 90) adjustment += 0.125;
    return adjustment;
  }, [creditScore, initialLtv]);

  // 🟢 FIX 2: Modified to accept the specific rate of the ACTIVE loan type
  const generateGraphData = useCallback((targetRate) => {
    if (!targetRate) return [];
    const base = parseFloat(targetRate);
    
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (30 - i));
      
      // Creates a realistic market drift pattern
      const drift = Math.sin(i * 0.4) * 0.08 + Math.cos(i * 0.2) * 0.04; 
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: (base + drift).toFixed(3)
      };
    });
  }, []);

  // 🟢 FIX 3: Graph data is now perfectly reactive. When activeLoanType changes, the chart redraws!
  const reactiveGraphData = useMemo(() => {
    const currentActiveRate = data.rates[activeLoanType] || data.rates['30Y'];
    return generateGraphData(currentActiveRate);
  }, [data.rates, activeLoanType, generateGraphData]);

  const fetchMarketData = useCallback(async (isRefresh = false, abortSignal) => {
    const currentZip = zip;
    const isValidZip = currentZip.length === 0 || /^\d{5}$/.test(currentZip);
    
    if (!isValidZip) return;

    if (isRefresh || currentZip !== prevZipRef.current) setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Latency sim

      // 🟢 FIX 4: Respect AbortSignal to prevent state updates on unmounted components
      if (abortSignal?.aborted) return;

      const baseRate = (currentZip ? 6.950 : 6.875) + getRateAdjustment();
      const marketOpen = checkMarketStatus();
      const cityDisplay = globalLocation?.city && globalLocation.city !== 'Detecting...' 
        ? globalLocation.city 
        : 'your area';
      
      setData({
        rates: {
          '30Y': baseRate.toFixed(3),
          '20Y': (baseRate - 0.375).toFixed(3),
          '15Y': (baseRate - 0.750).toFixed(3),
          'FHA': (baseRate - 0.500).toFixed(3),
          'VA':  (baseRate - 0.625).toFixed(3),
          'Jumbo': (baseRate + 0.375).toFixed(3),
        },
        insights: {
          lockRecommendation: baseRate > 7 ? 'Lock' : 'Float',
          insight: marketOpen 
            ? `Live markets in ${cityDisplay} are active.`
            : `Markets closed. Rates based on last close.`
        },
        isMarketOpen: marketOpen
      });

      setLocationName(currentZip ? `${cityDisplay} (${currentZip})` : 'National Average');
      prevZipRef.current = currentZip;
      
    } catch (err) {
      if (!abortSignal?.aborted) setError("Market sync failed.");
    } finally {
      if (!abortSignal?.aborted) setLoading(false);
    }
  }, [zip, getRateAdjustment, globalLocation, checkMarketStatus]);

  // Debounced fetch execution
  useEffect(() => {
    const abortController = new AbortController();
    
    const handler = setTimeout(() => {
      fetchMarketData(false, abortController.signal);
    }, 400);
    
    return () => {
      clearTimeout(handler);
      abortController.abort(); // 🟢 Correct cleanup to prevent memory leaks
    };
  }, [zip, fetchMarketData, creditScore]);

  return {
    zip, setZip, 
    creditScore, setCreditScore,
    loading, error, location: locationName,
    activeLoanType, setActiveLoanType,
    refresh: () => fetchMarketData(true),
    rates: data.rates,
    graphData: reactiveGraphData, // 🟢 Exporting the reactive version
    insights: data.insights,
    isMarketOpen: data.isMarketOpen
  };
};