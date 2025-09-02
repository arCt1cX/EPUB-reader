import React, { createContext, useContext } from 'react';
import { useSettings } from './SettingsContext';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { settings, updateSettings } = useSettings();

  const themes = [
    { id: 'light', name: 'Light', class: 'theme-light' },
    { id: 'dark', name: 'Dark', class: 'theme-dark' },
    { id: 'sepia', name: 'Sepia', class: 'theme-sepia' },
    { id: 'custom', name: 'Custom', class: 'theme-custom' }
  ];

  const setTheme = (themeId) => {
    updateSettings({ theme: themeId });
  };

  const getCurrentTheme = () => {
    return themes.find(theme => theme.id === settings.theme) || themes[0];
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: settings.theme,
        themes,
        setTheme,
        getCurrentTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
