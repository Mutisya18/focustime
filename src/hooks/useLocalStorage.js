import { useState, useEffect, useCallback } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

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

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.error(`Error saving persistent state for "${storageKey}":`, error);
    }
  }, [storageKey, state]);

  const updateState = useCallback((updates) => {
    setState(prevState => ({
      ...prevState,
      ...(typeof updates === 'function' ? updates(prevState) : updates)
    }));
  }, []);

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

export const useAnalytics = () => {
  const today = new Date().toDateString();
  
  const [analytics, setAnalytics] = useLocalStorage('pomodoro_analytics', {
    totalSessions: 0,
    totalFocusTime: 0,
    todaySessions: 0,
    todayFocusTime: 0,
    lastSessionDate: today
  });

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
