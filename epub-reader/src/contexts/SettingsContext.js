import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings, saveSettings, getDefaultSettings } from '../utils/indexedDB';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(getDefaultSettings());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await getSettings();
        setSettings(savedSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = async (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await saveSettings(updatedSettings);
    
    // Apply theme changes immediately
    document.body.className = `theme-${updatedSettings.theme}`;
    if (updatedSettings.theme === 'custom') {
      document.documentElement.style.setProperty('--custom-bg', updatedSettings.customBg);
      document.documentElement.style.setProperty('--custom-text', updatedSettings.customText);
    }
    
    // Apply accessibility settings
    if (updatedSettings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  };

  const resetSettings = async () => {
    const defaultSettings = getDefaultSettings();
    await updateSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        isLoading
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
