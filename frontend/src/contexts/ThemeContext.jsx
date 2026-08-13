import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('app_theme');
    if (saved === 'dark' || saved === 'light' || saved === 'system') return saved;
    return 'system';
  });

  const getResolvedTheme = (themeMode) => {
    if (themeMode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return themeMode;
  };

  const [resolvedTheme, setResolvedTheme] = useState(() => getResolvedTheme(theme));

  useEffect(() => {
    const actual = getResolvedTheme(theme);
    setResolvedTheme(actual);

    const root = document.documentElement;
    if (actual === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const currentResolved = getResolvedTheme(prev);
      return currentResolved === 'light' ? 'dark' : 'light';
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        resolvedTheme,
        isDark: resolvedTheme === 'dark',
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
