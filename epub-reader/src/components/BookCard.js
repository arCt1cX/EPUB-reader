import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({ book, onDelete }) => {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Book Cover */}
      <Link to={`/reader/${book.id}`} className="block">
        <div className="aspect-[2/3] bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-600 relative overflow-hidden">
          {book.cover && !imageError ? (
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center p-4">
                <svg
                  className="w-12 h-12 mx-auto mb-2 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {book.title.length > 20 ? `${book.title.substring(0, 20)}...` : book.title}
                </p>
              </div>
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white bg-opacity-90 rounded-full p-3">
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-7 4h12l-2 5H9l-2-5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Book Info */}
      <div className="p-4">
        <Link to={`/reader/${book.id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1 hover:text-blue-500 transition-colors">
            {book.title}
          </h3>
        </Link>
        <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-1">
          {book.author}
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-xs">
          Added {formatDate(book.addedDate)}
        </p>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(book.id)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg"
        title="Delete book"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Reading Progress Indicator (placeholder for future implementation) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
        <div 
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: '0%' }} // This will be dynamically calculated based on reading progress
        ></div>
      </div>
    </div>
  );
};

export default BookCard;
