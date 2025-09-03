import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ePub from 'epubjs';
import      console.log('🎨 Creating rendition...');
      // Create rendition with better error handling
      let rendition;
      try {
        rendition = epubBook.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          spread: 'none',
          allowScriptedContent: true,
          manager: 'default',
          flow: 'paginated',
          snap: true
        });
        console.log('✅ Rendition created successfully');
      } catch (renderError) {
        console.error('❌ Error creating rendition:', renderError);
        setError('Failed to initialize book reader');
        return;
      }osition, getPosition } from '../utils/indexedDB';
import { useSettings } from '../contexts/SettingsContext';
import ReaderControls from './ReaderControls';

const Reader = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const viewerRef = useRef(null);
  const bookRef = useRef(null);
  const renditionRef = useRef(null);
  const isMountedRef = useRef(true);
  
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toc, setToc] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    isMountedRef.current = true;
    console.log('🚀 Reader useEffect triggered with bookId:', bookId);
    
    if (bookId) {
      console.log('✅ BookId present, starting load timer...');
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          console.log('⏰ Timer fired, calling loadBook');
          loadBook();
        }
      }, 500); // Longer delay to ensure DOM is fully ready
      
      return () => clearTimeout(timer);
    } else {
      console.log('⏸️ No bookId provided');
    }
    
    return () => {
      isMountedRef.current = false;
      console.log('🧹 Cleaning up Reader component');
      // Cleanup
      if (renditionRef.current) {
        renditionRef.current.destroy();
      }
    };
  }, [bookId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Apply settings to rendition
    if (renditionRef.current) {
      applySettings();
    }
  }, [settings]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadBook = async () => {
    try {
      console.log('🔄 Starting loadBook for bookId:', bookId);
      
      if (!isMountedRef.current) {
        console.log('❌ Component not mounted, aborting');
        return;
      }
      
      setIsLoading(true);
      console.log('📚 Getting book from IndexedDB...');
      const bookData = await getBook(bookId);
      
      if (!isMountedRef.current) {
        console.log('❌ Component unmounted during getBook, aborting');
        return;
      }
      
      if (!bookData) {
        console.log('❌ Book not found in IndexedDB');
        setError('Book not found');
        return;
      }
      
      console.log('✅ Book data loaded:', { 
        id: bookData.id, 
        title: bookData.title, 
        fileType: typeof bookData.file,
        fileSize: bookData.file?.byteLength || 'unknown'
      });
      
      setBook(bookData);
      
      console.log('📖 Creating EPUB instance...');
      // Create EPUB book instance - handle ArrayBuffer correctly
      let epubBook;
      try {
        // Ensure the file data is properly formatted for epubjs
        if (bookData.file instanceof ArrayBuffer) {
          console.log('✅ File is ArrayBuffer, creating EPUB...');
          epubBook = ePub(bookData.file);
        } else {
          console.log('⚠️ File is not ArrayBuffer, converting...');
          // If it's not an ArrayBuffer, try to convert it
          const arrayBuffer = new Uint8Array(bookData.file).buffer;
          epubBook = ePub(arrayBuffer);
        }
      } catch (fileError) {
        console.error('❌ Error creating EPUB instance:', fileError);
        setError('Invalid EPUB file format');
        return;
      }
      
      console.log('✅ EPUB instance created successfully');
      bookRef.current = epubBook;
      
      console.log('⏳ Waiting for EPUB ready...');
      // Load book metadata
      await epubBook.ready;
      console.log('✅ EPUB ready completed');
      
      if (!isMountedRef.current) {
        console.log('❌ Component unmounted during ready, aborting');
        return;
      }
      
      console.log('📑 Loading navigation...');
      // Get table of contents
      const navigation = await epubBook.loaded.navigation;
      console.log('✅ Navigation loaded:', navigation);
      setToc(navigation.toc);

      // Wait for container to be available
      console.log('⏳ Checking for container...');
      let retries = 0;
      while (!viewerRef.current && retries < 10) {
        console.log('⏳ Container not ready, waiting... retry', retries);
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }
      
      if (!viewerRef.current) {
        console.error('❌ Container not available after', retries, 'retries');
        setError('Reader container initialization failed');
        return;
      }
      
      console.log('✅ Container found! Dimensions:', {
        width: viewerRef.current.offsetWidth,
        height: viewerRef.current.offsetHeight,
        element: viewerRef.current
      });
      
      // Force reflow to ensure container dimensions are calculated
      const height = viewerRef.current.offsetHeight;
      console.log('✅ Forced reflow, container height:', height);
      
      console.log('🎨 Creating rendition...');
      // Create rendition with better error handling
      let rendition;
      try {
        rendition = epubBook.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          spread: 'none',
          allowScriptedContent: true,
          manager: 'default'
        });
        console.log('✅ Rendition created successfully');
      } catch (renderError) {
        console.error('Error creating rendition:', renderError);
        setError('Failed to initialize book reader');
        return;
      }
      
      renditionRef.current = rendition;
      
      console.log('📍 Loading saved position...');
      // Load saved position or start from beginning
      const savedPosition = await getPosition(bookId);
      let displayResult;
      
      if (!isMountedRef.current) {
        console.log('❌ Component unmounted during position loading, aborting');
        return;
      }
      
      console.log('🎯 Displaying book...', savedPosition ? 'from saved position' : 'from beginning');
      if (savedPosition) {
        displayResult = rendition.display(savedPosition);
      } else {
        displayResult = rendition.display();
      }
      
      console.log('⏳ Waiting for display to complete...');
      // Wait for display to complete
      await displayResult;
      console.log('✅ Display completed');
      
      if (!isMountedRef.current) {
        console.log('❌ Component unmounted after display, aborting');
        return;
      }
      
      console.log('🎨 Applying settings...');
      // Apply current settings
      applySettings();
      
      console.log('👂 Setting up event listeners...');
      // Set up event listeners
      rendition.on('relocated', (location) => {
        if (isMountedRef.current) {
          const progressPercent = epubBook.locations.percentageFromCfi(location.start.cfi);
          setProgress(progressPercent);
          
          // Save position
          savePosition(bookId, location.start.cfi);
        }
      });
      
      rendition.on('rendered', () => {
        console.log('✅ Book rendered successfully');
      });
      
      console.log('📊 Generating locations for progress tracking...');
      // Generate locations for progress tracking
      await epubBook.locations.generate(1024);
      console.log('✅ Locations generated, book loading complete!');
      
    } catch (err) {
      console.error('❌ Error loading book:', err);
      if (isMountedRef.current) {
        setError('Failed to load book: ' + err.message);
      }
    } finally {
      if (isMountedRef.current) {
        console.log('🏁 Setting loading to false');
        setIsLoading(false);
      }
    }
  };

  const applySettings = () => {
    if (!renditionRef.current) return;
    
    const rendition = renditionRef.current;
    
    // Apply font settings
    rendition.themes.fontSize(`${settings.fontSize}px`);
    rendition.themes.register('custom', {
      'body': {
        'font-family': settings.dyslexicFont ? 'OpenDyslexic, Arial, sans-serif !important' : `${settings.fontFamily}, serif !important`,
        'line-height': `${settings.lineHeight} !important`,
      },
      'p': {
        'font-family': settings.dyslexicFont ? 'OpenDyslexic, Arial, sans-serif !important' : `${settings.fontFamily}, serif !important`,
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
    <div className="fixed inset-0 flex flex-col safe-area-top safe-area-bottom bg-white dark:bg-gray-900">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading book...</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between p-4 lg:p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0">
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
      <div className="h-1 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
        <div 
          className="h-full bg-violet-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Reader Container */}
      <div className="flex-1 relative overflow-hidden">
        {/* EPUB Viewer */}
        <div 
          ref={viewerRef}
          className="w-full h-full reading-area overflow-hidden"
          style={{
            fontFamily: settings.dyslexicFont ? 'OpenDyslexic, Arial, sans-serif' : settings.fontFamily,
            overscrollBehavior: 'none',
            WebkitOverflowScrolling: 'touch',
            minHeight: '400px',
            position: 'relative'
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
