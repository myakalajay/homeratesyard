'use client'; 

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as LocationServiceAPI from '@/services/location.service';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState({
    zip: null,
    city: 'Detecting...',
    state: '',
    isUS: true,
    loading: true,
    error: null,
  });

  const initLocation = useCallback(async (isMounted) => {
    try {
      // 1. Check Local Storage with 🟢 FIX 1: Try/Catch for JSON parsing safety
      if (typeof window !== 'undefined') {
        const savedLocation = localStorage.getItem('hry_user_location');
        if (savedLocation) {
          try {
            const parsed = JSON.parse(savedLocation);
            if (parsed && parsed.zip && parsed.city !== 'Detecting...') {
              if (isMounted()) {
                setLocation({ ...parsed, loading: false });
                return;
              }
            }
          } catch (parseError) {
            console.warn("Cleared corrupted location cache");
            localStorage.removeItem('hry_user_location'); // Nuke bad data
          }
        }
      }

      // 2. Run Fresh Detection (IP Geolocation)
      const service = LocationServiceAPI?.LocationService;
      if (!service || !service.detectByIP) {
        throw new Error("LocationService not implemented");
      }

      const data = await service.detectByIP();
      
      if (isMounted()) {
        if (data && data.zip) {
          const finalData = { ...data, loading: false, error: null };
          setLocation(finalData);
          if (typeof window !== 'undefined') {
            localStorage.setItem('hry_user_location', JSON.stringify(finalData));
          }
        } else {
          setLocation(prev => ({ 
            ...prev, 
            loading: false, 
            city: 'Select Location',
            zip: null 
          }));
        }
      }
    } catch (err) {
      console.warn("Location auto-detection gracefully failed:", err.message);
      if (isMounted()) {
        setLocation(prev => ({ 
          ...prev, 
          loading: false, 
          city: 'Select Location', 
          zip: null,
          error: "Could not auto-detect location" 
        }));
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;
    
    initLocation(isMounted);
    
    return () => { mounted = false; };
  }, [initLocation]);

  const updateLocation = (dataOrZip, city, state) => {
    let updated;
    if (typeof dataOrZip === 'object' && dataOrZip !== null) {
      updated = {
        zip: dataOrZip.zip,
        city: dataOrZip.city,
        state: dataOrZip.state,
        isUS: dataOrZip.isUS !== undefined ? dataOrZip.isUS : true,
        loading: false,
        error: null
      };
    } else {
      updated = {
        zip: dataOrZip,
        city: city || 'Unknown City',
        state: state || '',
        isUS: true, 
        loading: false,
        error: null
      };
    }
    setLocation(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hry_user_location', JSON.stringify(updated));
    }
  };

  const handleGPSDetect = async () => {
    setLocation(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser.");
      }
      
      // 🟢 FIX 2: Awaiting the promise ensures the outer catch block traps denials
      const data = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { latitude, longitude } = pos.coords;
              const service = LocationServiceAPI?.LocationService;
              
              if (!service || !service.detectByGPS) {
                throw new Error("GPS Translation Service Unavailable");
              }

              const result = await service.detectByGPS(latitude, longitude);
              
              if (result) {
                updateLocation(result);
                resolve(result);
              } else {
                throw new Error("Could not resolve address from GPS coordinates");
              }
            } catch (err) {
              reject(err);
            }
          },
          (err) => {
            let msg = "Location access denied.";
            if (err.code === 2) msg = "Location unavailable.";
            if (err.code === 3) msg = "Location request timed out.";
            reject(new Error(msg));
          },
          { timeout: 10000, maximumAge: 60000 }
        );
      });
      
      return data;
      
    } catch (err) {
      // 🟢 FIX 3: This will now successfully reset the UI if the user denies location
      setLocation(prev => ({ ...prev, loading: false, error: err.message }));
      throw err;
    }
  };

  return (
    <LocationContext.Provider value={{ 
      location, 
      updateLocation, 
      handleGPSDetect,
      refreshLocation: () => initLocation(() => true) 
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    return { 
      location: { zip: null, city: 'Loading...', state: '', loading: true }, 
      updateLocation: () => console.warn("LocationProvider missing!"),
      handleGPSDetect: () => Promise.reject(new Error("LocationProvider missing!"))
    };
  }
  return context;
};