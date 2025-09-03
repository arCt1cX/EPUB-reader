import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';

const Settings = () => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { themes } = useTheme();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    updateSettings({ [key]: value });
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      resetSettings();
      setLocalSettings(settings);
    }
  };

  const fontFamilies = [
    { value: 'Inter', label: 'Inter (Default)' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Verdana', label: 'Verdana' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400">
          Customize your reading experience
        </p>
      </div>

      {/* Theme Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Theme
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleSettingChange('theme', theme.id)}
              className={`p-4 rounded-lg border-2 transition-all min-h-[80px] lg:min-h-[100px] ${
                localSettings.theme === theme.id
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 ring-2 ring-violet-200 dark:ring-violet-800'
                  : 'border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50/50 dark:hover:bg-violet-900/10'
              }`}
            >
              <div className={`w-full h-12 lg:h-16 rounded mb-2 ${theme.class} flex items-center justify-center`}>
                <div className="text-xs lg:text-sm font-medium opacity-75">
                  {theme.name}
                </div>
              </div>
              <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                {theme.name}
              </span>
            </button>
          ))}
        </div>

        {/* Custom Theme Colors */}
        {localSettings.theme === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Background Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={localSettings.customBg}
                  onChange={(e) => handleSettingChange('customBg', e.target.value)}
                  className="w-12 h-12 rounded border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={localSettings.customBg}
                  onChange={(e) => handleSettingChange('customBg', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Text Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={localSettings.customText}
                  onChange={(e) => handleSettingChange('customText', e.target.value)}
                  className="w-12 h-12 rounded border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={localSettings.customText}
                  onChange={(e) => handleSettingChange('customText', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Typography Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Typography
        </h2>

        <div className="space-y-6">
          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Font Family
            </label>
            <select
              value={localSettings.fontFamily}
              onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
              className="w-full px-3 py-3 lg:py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent text-base lg:text-sm"
            >
              {fontFamilies.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Font Size: {localSettings.fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="24"
              value={localSettings.fontSize}
              onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>12px</span>
              <span>18px</span>
              <span>24px</span>
            </div>
          </div>

          {/* Line Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Line Height: {localSettings.lineHeight}
            </label>
            <input
              type="range"
              min="1.2"
              max="2.0"
              step="0.1"
              value={localSettings.lineHeight}
              onChange={(e) => handleSettingChange('lineHeight', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1.2</span>
              <span>1.6</span>
              <span>2.0</span>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preview
            </h4>
            <p
              style={{
                fontFamily: localSettings.dyslexicFont ? 'OpenDyslexic, sans-serif' : localSettings.fontFamily,
                fontSize: `${localSettings.fontSize}px`,
                lineHeight: localSettings.lineHeight,
              }}
              className="text-gray-900 dark:text-white"
            >
              The quick brown fox jumps over the lazy dog. This is how your text will appear in the reader with the current settings.
            </p>
          </div>
        </div>
      </div>

      {/* Accessibility Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Accessibility
        </h2>

        <div className="space-y-4">
          {/* Dyslexic Font */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Dyslexic-Friendly Font
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use OpenDyslexic font for better readability
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('dyslexicFont', !localSettings.dyslexicFont)}
              className={`relative inline-flex h-7 w-12 lg:h-6 lg:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
                localSettings.dyslexicFont ? 'bg-violet-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 lg:h-4 lg:w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.dyslexicFont ? 'translate-x-6 lg:translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                High Contrast
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Increase contrast for better visibility
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('highContrast', !localSettings.highContrast)}
              className={`relative inline-flex h-7 w-12 lg:h-6 lg:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
                localSettings.highContrast ? 'bg-violet-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 lg:h-4 lg:w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.highContrast ? 'translate-x-6 lg:translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Reset Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-800 p-6">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
          Reset Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This will reset all settings to their default values. This action cannot be undone.
        </p>
        <button
          onClick={handleReset}
          className="px-6 py-3 lg:px-4 lg:py-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 min-h-[44px] lg:min-h-auto"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default Settings;
