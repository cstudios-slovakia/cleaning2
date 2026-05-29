import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEMES = [
  { id: 'basic', label: 'Basic' },
  { id: 'emerald', label: 'Emerald' },
  { id: 'lp', label: 'LP (Luxury Gold)' },
  { id: 'dark', label: 'Dark Slate' }
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem('cleaner_theme') || 'basic');

  useEffect(() => {
    // Remove all theme classes first
    document.body.classList.remove('theme-emerald', 'theme-lp', 'theme-dark');
    
    // Add current theme class
    if (theme !== 'basic') {
      document.body.classList.add(`theme-${theme}`);
    }
    
    localStorage.setItem('cleaner_theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
