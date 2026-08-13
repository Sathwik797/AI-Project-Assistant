import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    localStorage.removeItem('app_theme');
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: 'light',
        setTheme: () => {},
        toggleTheme: () => {},
        resolvedTheme: 'light',
        isDark: false,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
