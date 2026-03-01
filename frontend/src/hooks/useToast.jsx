import { useState, useEffect, useCallback } from 'react';

// Global event bus for Toasts to allow triggering from anywhere
const listeners = new Set();

const dispatch = (action) => {
  listeners.forEach((listener) => listener(action));
};

/**
 * @hook useToast
 * @description Hook to dispatch and consume toast notifications.
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleDispatch = ({ type, payload }) => {
      if (type === 'ADD_TOAST') {
        setToasts((prev) => [...prev, { ...payload, id: Math.random().toString(36).substr(2, 9) }]);
      }
      if (type === 'REMOVE_TOAST') {
        setToasts((prev) => prev.filter((t) => t.id !== payload.id));
      }
    };

    listeners.add(handleDispatch);
    return () => listeners.delete(handleDispatch);
  }, []);

  const toast = useCallback(({ title, description, variant = 'default', duration = 5000 }) => {
    dispatch({
      type: 'ADD_TOAST',
      payload: { title, description, variant, duration },
    });
  }, []);

  const dismiss = useCallback((id) => {
    dispatch({ type: 'REMOVE_TOAST', payload: { id } });
  }, []);

  return { toast, dismiss, toasts };
};