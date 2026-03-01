import { useEffect, useState } from 'react';

/**
 * @hook useDebounce
 * @description Delays updating a value until a specified time has passed since the last change.
 * Essential for search inputs to prevent API flooding.
 * * @param {any} value - The value to debounce.
 * @param {number} delay - Delay in milliseconds (default 500ms).
 * @returns {any} The debounced value.
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer to update the value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: Clear the timer if the value changes before the delay finishes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}