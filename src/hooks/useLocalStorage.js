import { useState, useEffect, useCallback } from 'react';

// Custom hook for managing localStorage with React state
export const useLocalStorage = (key, initialValue) => {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

// Hook for managing multiple localStorage values with automatic persistence
export const usePersistentState = (storageKey, initialState) => {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
    } catch (error) {
      console.error(`Error loading persistent state for "${storageKey}":`, error);
      return initialState;
    }
  });

  // Auto-save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.error(`Error saving persistent state for "${storageKey}":`, error);
    }
  }, [storageKey, state]);

  // Merge updates with existing state
  const updateState = useCallback((updates) => {
    setState(prevState => ({
      ...prevState,
      ...(typeof updates === 'function' ? updates(prevState) : updates)
    }));
  }, []);

  // Reset to initial state
  const resetState = useCallback(() => {
    setState(initialState);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error(`Error resetting persistent state for "${storageKey}":`, error);
    }
  }, [storageKey, initialState]);

  return [state, updateState, resetState];
};

// Hook for managing analytics with date-based reset
export const useAnalytics = () => {
  const today = new Date().toDateString();
  
  const [analytics, setAnalytics] = useLocalStorage('pomodoro_analytics', {
    totalSessions: 0,
    totalFocusTime: 0,
    todaySessions: 0,
    todayFocusTime: 0,
    lastSessionDate: today
  });

  // Reset today's stats if it's a new day
  useEffect(() => {
    if (analytics.lastSessionDate !== today) {
      setAnalytics(prev => ({
        ...prev,
        todaySessions: 0,
        todayFocusTime: 0,
        lastSessionDate: today
      }));
    }
  }, [analytics.lastSessionDate, today, setAnalytics]);

  const addSession = useCallback((duration) => {
    setAnalytics(prev => ({
      ...prev,
      totalSessions: prev.totalSessions + 1,
      totalFocusTime: prev.totalFocusTime + duration,
      todaySessions: prev.todaySessions + 1,
      todayFocusTime: prev.todayFocusTime + duration,
      lastSessionDate: today
    }));
  }, [setAnalytics, today]);

  return [analytics, addSession, setAnalytics];
};

export default useLocalStorage;