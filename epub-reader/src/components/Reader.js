import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ePub from 'epubjs';
import { getBook, savePosition, getPosition } from '../utils/indexedDB';
import { useSettings } from '../contexts/SettingsContext';
import ReaderControls from './ReaderControls';

const Reader = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const viewerRef = useRef(null);
  const bookRef = useRef(null);
  const renditionRef = useRef(null);
  
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [toc, setToc] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadBook();
    
    return () => {
      // Cleanup
      if (renditionRef.current) {
        renditionRef.current.destroy();
      }
    };
  }, [bookId]);

  useEffect(() => {
    // Apply settings to rendition
    if (renditionRef.current) {
      applySettings();
    }
  }, [settings]);

  const loadBook = async () => {
    try {
      setIsLoading(true);
      const bookData = await getBook(bookId);
      
      if (!bookData) {
        setError('Book not found');
        return;
      }
      
      setBook(bookData);
      
      // Create EPUB book instance
      const epubBook = ePub(bookData.file);
      bookRef.current = epubBook;
      
      // Load book metadata
      await epubBook.ready;
      
      // Get table of contents
      const navigation = await epubBook.loaded.navigation;
      setToc(navigation.toc);
      
      // Create rendition
      const rendition = epubBook.renderTo(viewerRef.current, {
        width: '100%',
        height: '100%',
        spread: 'none'
      });
      renditionRef.current = rendition;
      
      // Load saved position or start from beginning
      const savedPosition = await getPosition(bookId);
      if (savedPosition) {
        await rendition.display(savedPosition);
      } else {
        await rendition.display();
      }
      
      // Apply current settings
      applySettings();
      
      // Set up event listeners
      rendition.on('relocated', (location) => {
        setCurrentLocation(location.start.cfi);
        const progressPercent = epubBook.locations.percentageFromCfi(location.start.cfi);
        setProgress(progressPercent);
        
        // Save position
        savePosition(bookId, location.start.cfi);
      });
      
      // Generate locations for progress tracking
      await epubBook.locations.generate(1024);
      
    } catch (err) {
      console.error('Error loading book:', err);
      setError('Failed to load book');
    } finally {
      setIsLoading(false);
    }
  };

  const applySettings = () => {
    if (!renditionRef.current) return;
    
    const rendition = renditionRef.current;
    
    // Apply font settings
    rendition.themes.fontSize(`${settings.fontSize}px`);
    rendition.themes.register('custom', {
      'body': {
        'font-family': settings.dyslexicFont ? 'OpenDyslexic, sans-serif !important' : `${settings.fontFamily}, serif !important`,
        'line-height': `${settings.lineHeight} !important`,
      },
      'p': {
        'font-family': settings.dyslexicFont ? 'OpenDyslexic, sans-serif !important' : `${settings.fontFamily}, serif !important`,
        'line-height': `${settings.lineHeight} !important`,
      }
    });
    
    // Apply theme
    switch (settings.theme) {
      case 'dark':
        rendition.themes.register('dark', {
          'body': {
            'background-color': '#1f2937 !important',
            'color': '#f9fafb !important'
          },
          'p': {
            'color': '#f9fafb !important'
          }
        });
        rendition.themes.select('dark');
        break;
      case 'ultra-dark':
        rendition.themes.register('ultra-dark', {
          'body': {
            'background-color': '#000000 !important',
            'color': '#ffffff !important'
          },
          'p': {
            'color': '#ffffff !important'
          },
          '*': {
            'background-color': '#000000 !important'
          }
        });
        rendition.themes.select('ultra-dark');
        break;
      case 'sepia':
        rendition.themes.register('sepia', {
          'body': {
            'background-color': '#f8eed6 !important',
            'color': '#654a37 !important'
          },
          'p': {
            'color': '#654a37 !important'
          }
        });
        rendition.themes.select('sepia');
        break;
      case 'custom':
        rendition.themes.register('userCustom', {
          'body': {
            'background-color': `${settings.customBg} !important`,
            'color': `${settings.customText} !important`
          },
          'p': {
            'color': `${settings.customText} !important`
          }
        });
        rendition.themes.select('userCustom');
        break;
      default:
        rendition.themes.register('light', {
          'body': {
            'background-color': '#ffffff !important',
            'color': '#1f2937 !important'
          },
          'p': {
            'color': '#1f2937 !important'
          }
        });
        rendition.themes.select('light');
    }
    
    rendition.themes.select('custom');
  };

  const goToChapter = (href) => {
    if (renditionRef.current) {
      renditionRef.current.display(href);
      setIsMenuOpen(false);
    }
  };

  const nextPage = () => {
    if (renditionRef.current) {
      renditionRef.current.next();
    }
  };

  const prevPage = () => {
    if (renditionRef.current) {
      renditionRef.current.prev();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading book...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {error}
          </h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 lg:px-4 lg:py-2 bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white rounded-lg transition-colors font-medium min-h-[44px] lg:min-h-auto focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen flex flex-col safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="flex items-center justify-between p-4 lg:p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center space-x-3 lg:space-x-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
              {book?.title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {book?.author}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Progress */}
          <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span>{Math.round(progress)}%</span>
          </div>
          
          {/* Table of Contents */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-200 dark:bg-gray-700">
        <div 
          className="h-full bg-violet-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Reader Container */}
      <div className="flex-1 relative">
        {/* EPUB Viewer */}
        <div 
          ref={viewerRef}
          className="w-full h-full reading-area"
          style={{
            fontFamily: settings.dyslexicFont ? 'OpenDyslexic, sans-serif' : settings.fontFamily
          }}
        ></div>

        {/* Navigation Arrows */}
        <button
          onClick={prevPage}
          className="absolute left-2 lg:left-4 top-1/2 transform -translate-y-1/2 p-3 lg:p-4 bg-violet-500 bg-opacity-80 hover:bg-opacity-100 text-white rounded-full transition-all opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-violet-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={nextPage}
          className="absolute right-2 lg:right-4 top-1/2 transform -translate-y-1/2 p-3 lg:p-4 bg-violet-500 bg-opacity-80 hover:bg-opacity-100 text-white rounded-full transition-all opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-violet-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Table of Contents Sidebar */}
        {isMenuOpen && (
          <div className="absolute top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-10">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Table of Contents
                </h3>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="overflow-y-auto h-full pb-4">
              {toc.map((chapter, index) => (
                <button
                  key={index}
                  onClick={() => goToChapter(chapter.href)}
                  className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {chapter.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reader Controls */}
      <ReaderControls
        onPrevPage={prevPage}
        onNextPage={nextPage}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        progress={progress}
      />
    </div>
  );
};

export default Reader;
