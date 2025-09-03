import React, { useState, useEffect } from 'react';
import BookCard from './BookCard';
import SearchModal from './SearchModal';
import { getBooks, uploadLocalBook, deleteBook } from '../utils/indexedDB';

const Library = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [filteredBooks, setFilteredBooks] = useState([]);

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    // Filter books based on search query
    if (searchQuery.trim()) {
      const filtered = books.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(books);
    }
  }, [books, searchQuery]);

  const loadBooks = async () => {
    try {
      const savedBooks = await getBooks();
      setBooks(savedBooks);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/epub+zip') {
      try {
        setIsLoading(true);
        const book = await uploadLocalBook(file);
        setBooks(prevBooks => [...prevBooks, book]);
      } catch (error) {
        console.error('Error uploading book:', error);
        alert('Error uploading book. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      alert('Please select a valid EPUB file.');
    }
    // Reset file input
    event.target.value = '';
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBook(bookId);
        setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
      } catch (error) {
        console.error('Error deleting book:', error);
        alert('Error deleting book. Please try again.');
      }
    }
  };

  const handleBookDownloaded = (newBook) => {
    setBooks(prevBooks => [...prevBooks, newBook]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 h-full overflow-y-auto overscroll-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          My Library
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Upload Button */}
          <label className="inline-flex items-center justify-center px-6 py-3 lg:px-4 lg:py-2 bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white rounded-lg cursor-pointer transition-colors font-medium min-h-[44px] lg:min-h-auto focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload EPUB
            <input
              type="file"
              accept=".epub"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Search Online Button */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="inline-flex items-center justify-center px-6 py-3 lg:px-4 lg:py-2 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white rounded-lg transition-colors font-medium min-h-[44px] lg:min-h-auto focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Online
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search your books..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors text-base"
        />
        <svg
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg lg:text-xl font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'No books found' : 'No books in your library'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery 
              ? 'Try adjusting your search terms.' 
              : 'Upload an EPUB file or search for books online to get started.'
            }
          </p>
          {!searchQuery && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <label className="inline-flex items-center justify-center px-6 py-3 bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white rounded-lg cursor-pointer transition-colors font-medium min-h-[44px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload your first book
                <input
                  type="file"
                  accept=".epub"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="inline-flex items-center justify-center px-6 py-3 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white rounded-lg transition-colors font-medium min-h-[44px] focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search online
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onDelete={handleDeleteBook}
            />
          ))}
        </div>
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onBookDownloaded={handleBookDownloaded}
      />
    </div>
  );
};

export default Library;
