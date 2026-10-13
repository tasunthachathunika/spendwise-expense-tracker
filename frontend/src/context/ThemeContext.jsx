import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('spendwise-theme');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // fallback if localStorage/matchMedia unavailable
    }
    return 'light';
  });

  // Apply theme class to <html> whenever theme state changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  // Listen for OS system theme changes ONLY if the user hasn't chosen manually
  useEffect(() => {
    try {
      if (localStorage.getItem('spendwise-theme')) return;
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        if (!localStorage.getItem('spendwise-theme')) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      };
      if (mediaQuery?.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    } catch {
      // safe fallback
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('spendwise-theme', next);
      } catch {
        // localStorage error fallback
      }
      return next;
    });
  };

  const setThemeMode = (mode) => {
    if (mode === 'light' || mode === 'dark') {
      setTheme(mode);
      try {
        localStorage.setItem('spendwise-theme', mode);
      } catch {
        // fallback
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeMode, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
