/**
 * @service LocationService
 * @description Robust location detection using secure, production-ready HTTPS APIs.
 */

const DEFAULT_LOC = { 
  isUS: true, 
  zip: '20148', 
  city: 'Ashburn', 
  state: 'VA', 
  country: 'United States', 
  loading: false 
};

export const LocationService = {
  /**
   * 1. Detect via IP (Passive)
   * Failover chain: ipinfo.io -> ipapi.co -> bigdatacloud -> default
   */
  detectByIP: async () => {
    try {
      // 🟢 Primary: ipinfo.io (Industry Standard, Vercel-Friendly, HTTPS)
      const response = await fetch('https://ipinfo.io/json');
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.postal) {
          return {
            isUS: data.country === 'US',
            zip: data.postal,
            city: data.city,
            state: data.region, 
            country: data.country === 'US' ? 'United States' : data.country,
            loading: false
          };
        }
      }
      throw new Error("Primary API missing postal data");

    } catch (primaryError) {
      try {
        // 🟡 Backup 1: ipapi.co (Great free tier, strict HTTPS)
        const backupRes = await fetch('https://ipapi.co/json/');
        if (backupRes.ok) {
          const data = await backupRes.json();
          if (data && data.postal) {
            return {
              isUS: data.country_code === 'US',
              zip: data.postal,
              city: data.city,
              state: data.region_code,
              country: data.country_name,
              loading: false
            };
          }
        }
        throw new Error("Backup API failed");

      } catch (backupError) {
        try {
          // 🟠 Backup 2: BigDataCloud (Reliable, but ZIP code isn't always guaranteed)
          const finalRes = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client');
          if (finalRes.ok) {
            const data = await finalRes.json();
            return {
              isUS: data.countryCode === 'US',
              zip: data.postcode || DEFAULT_LOC.zip,
              city: data.city || data.locality || DEFAULT_LOC.city,
              state: data.principalSubdivisionCode || DEFAULT_LOC.state, 
              country: data.countryName,
              loading: false
            };
          }
        } catch (finalError) {
          console.warn("All live IP location APIs failed. Falling back to default.");
        }
        
        // 🔴 Final Fallback (Ad-blocker or total network failure)
        return DEFAULT_LOC;
      }
    }
  },

  /**
   * 2. Detect via GPS (Precise)
   */
  detectByGPS: async (latitude, longitude) => {
    try {
      // 🟢 FIX: Added 'email' parameter. Nominatim blocks production domains that don't identify themselves!
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&email=hello@homeratesyard.com`,
        { headers: { 'Accept-Language': 'en-US' } }
      );
      
      if (!response.ok) throw new Error("Geocoding API blocked or failed");
      
      const data = await response.json();
      const addr = data.address || {};
      
      const zip = addr.postcode || addr.postal;
      const city = addr.city || addr.town || addr.village || addr.suburb || "Local Area";
      const state = addr.state_code || addr.state || "US"; 
      
      if (!zip) throw new Error("No precise ZIP found at this GPS coordinate");

      return {
        isUS: addr.country_code?.toUpperCase() === 'US',
        zip,
        city,
        state,
        country: addr.country || "United States",
        loading: false
      };
    } catch (error) {
      throw error;
    }
  }
};