// Storage utility functions for data persistence
const STORAGE_KEYS = {
  SESSIONS: 'pomodoro_sessions',
  REMINDERS: 'pomodoro_reminders',
  NOTES: 'pomodoro_notes',
  ANALYTICS: 'pomodoro_analytics',
  SETTINGS: 'pomodoro_settings',
  CURRENT_SESSION: 'pomodoro_current_session'
};

// Generic storage functions
const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
};

const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
};

// Specific storage functions for different data types
export const storageAPI = {
  // Sessions
  getSessions: () => getFromStorage(STORAGE_KEYS.SESSIONS, []),
  saveSessions: (sessions) => saveToStorage(STORAGE_KEYS.SESSIONS, sessions),

  // Current session
  getCurrentSession: () => getFromStorage(STORAGE_KEYS.CURRENT_SESSION, 'work'),
  saveCurrentSession: (sessionId) => saveToStorage(STORAGE_KEYS.CURRENT_SESSION, sessionId),

  // Reminders
  getReminders: () => getFromStorage(STORAGE_KEYS.REMINDERS, []),
  saveReminders: (reminders) => saveToStorage(STORAGE_KEYS.REMINDERS, reminders),

  // Notes
  getNotes: () => getFromStorage(STORAGE_KEYS.NOTES, ''),
  saveNotes: (notes) => saveToStorage(STORAGE_KEYS.NOTES, notes),

  // Analytics
  getAnalytics: () => getFromStorage(STORAGE_KEYS.ANALYTICS, {
    totalSessions: 0,
    totalFocusTime: 0,
    todaySessions: 0,
    todayFocusTime: 0,
    lastSessionDate: null
  }),
  saveAnalytics: (analytics) => saveToStorage(STORAGE_KEYS.ANALYTICS, analytics),

  // Settings
  getSettings: () => getFromStorage(STORAGE_KEYS.SETTINGS, {
    darkMode: false,
    soundEnabled: true,
    notificationsEnabled: true,
    autoStartBreaks: false,
    autoStartPomodoros: false
  }),
  saveSettings: (settings) => saveToStorage(STORAGE_KEYS.SETTINGS, settings),

  // Clear all data
  clearAllData: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      removeFromStorage(key);
    });
  },

  // Export all data
  exportData: () => {
    const data = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      data[name.toLowerCase()] = getFromStorage(key);
    });
    return data;
  },

  // Import data
  importData: (data) => {
    try {
      Object.entries(data).forEach(([name, value]) => {
        const key = STORAGE_KEYS[name.toUpperCase()];
        if (key && value !== null && value !== undefined) {
          saveToStorage(key, value);
        }
      });
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
};

export default storageAPI;