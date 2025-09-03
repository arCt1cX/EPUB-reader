import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Library from './components/Library';
import Reader from './components/Reader';
import Settings from './components/Settings';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { getSettings } from './utils/indexedDB';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize app settings
    const initializeApp = async () => {
      try {
        const settings = await getSettings();
        if (settings) {
          // Apply saved theme
          document.body.className = `theme-${settings.theme}`;
          if (settings.theme === 'custom') {
            document.documentElement.style.setProperty('--custom-bg', settings.customBg);
            document.documentElement.style.setProperty('--custom-text', settings.customText);
          }
          if (settings.highContrast) {
            document.body.classList.add('high-contrast');
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-violet-500"></div>
      </div>
    );
  }

  return (
    <SettingsProvider>
      <ThemeProvider>
        <div className="h-screen overflow-hidden transition-colors duration-300 safe-area-bottom">
          <Navbar />
          <main className="h-full overflow-y-auto overscroll-none" style={{ height: 'calc(100vh - 4rem)' }}>
            <div className="container mx-auto px-4 py-6 lg:py-8 lg:px-6">
              <Routes>
                <Route path="/" element={<Library />} />
                <Route path="/reader/:bookId" element={<Reader />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </main>
        </div>
      </ThemeProvider>
    </SettingsProvider>
  );
}

export default App;
