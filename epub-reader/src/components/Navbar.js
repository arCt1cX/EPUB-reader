import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BackendStatus from './BackendStatus';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg transition-colors duration-300 safe-area-top">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-violet-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm lg:text-base">E</span>
            </div>
            <span className="text-xl lg:text-2xl font-semibold text-gray-800 dark:text-white">
              EPUB Reader
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-4 py-2 rounded-md text-sm lg:text-base font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-violet-500 text-white shadow-lg' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400'
              }`}
            >
              Library
            </Link>
            <Link
              to="/settings"
              className={`px-4 py-2 rounded-md text-sm lg:text-base font-medium transition-colors ${
                isActive('/settings') 
                  ? 'bg-violet-500 text-white shadow-lg' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400'
              }`}
            >
              Settings
            </Link>
            <BackendStatus />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-500"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className={`block px-4 py-3 rounded-md text-base font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-violet-500 text-white shadow-lg' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Library
              </Link>
              <Link
                to="/settings"
                className={`block px-4 py-3 rounded-md text-base font-medium transition-colors ${
                  isActive('/settings') 
                    ? 'bg-violet-500 text-white shadow-lg' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
              <div className="px-4 py-2">
                <BackendStatus />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
