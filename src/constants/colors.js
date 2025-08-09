// Clean, simple design system colors
export const colors = {
  primary: '#2563eb', // Blue
  success: '#059669', // Green  
  warning: '#d97706', // Orange
  danger: '#dc2626',  // Red
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

// Theme helper functions
export const getThemeClasses = (darkMode) => ({
  bg: darkMode ? 'bg-gray-900' : 'bg-gray-50',
  text: darkMode ? 'text-white' : 'text-gray-900',
  card: darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
  input: darkMode 
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
});

export default colors;