import { openDB } from 'idb';

const DB_NAME = 'EpubReaderDB';
const DB_VERSION = 1;

// Initialize IndexedDB
export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Books store
      if (!db.objectStoreNames.contains('books')) {
        const bookStore = db.createObjectStore('books', { keyPath: 'id' });
        bookStore.createIndex('title', 'title', { unique: false });
        bookStore.createIndex('author', 'author', { unique: false });
      }

      // Reading positions store
      if (!db.objectStoreNames.contains('positions')) {
        db.createObjectStore('positions', { keyPath: 'bookId' });
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    },
  });
};

// Book operations
export const saveBook = async (book) => {
  const db = await initDB();
  const tx = db.transaction('books', 'readwrite');
  await tx.objectStore('books').put(book);
  await tx.done;
};

export const getBooks = async () => {
  const db = await initDB();
  return db.getAll('books');
};

export const getBook = async (id) => {
  const db = await initDB();
  return db.get('books', id);
};

export const deleteBook = async (id) => {
  const db = await initDB();
  const tx = db.transaction(['books', 'positions'], 'readwrite');
  await tx.objectStore('books').delete(id);
  await tx.objectStore('positions').delete(id);
  await tx.done;
};

// Reading position operations
export const savePosition = async (bookId, position) => {
  const db = await initDB();
  const tx = db.transaction('positions', 'readwrite');
  await tx.objectStore('positions').put({
    bookId,
    position,
    timestamp: new Date().toISOString()
  });
  await tx.done;
};

export const getPosition = async (bookId) => {
  const db = await initDB();
  const result = await db.get('positions', bookId);
  return result?.position || null;
};

// Settings operations
export const saveSettings = async (settings) => {
  const db = await initDB();
  const tx = db.transaction('settings', 'readwrite');
  await tx.objectStore('settings').put({
    id: 'user-settings',
    ...settings,
    timestamp: new Date().toISOString()
  });
  await tx.done;
};

export const getSettings = async () => {
  const db = await initDB();
  const result = await db.get('settings', 'user-settings');
  return result || getDefaultSettings();
};

export const getDefaultSettings = () => ({
  theme: 'light',
  fontSize: 16,
  lineHeight: 1.6,
  fontFamily: 'Inter',
  customBg: '#ffffff',
  customText: '#000000',
  dyslexicFont: false,
  highContrast: false,
});

// Search and download operations
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-url.com/api' // Replace with your actual backend URL
    : 'http://localhost:3001/api'
  );

export const searchBooks = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Search failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const downloadBook = async (url, title, author) => {
  try {
    const response = await fetch(`${API_BASE_URL}/download?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
      throw new Error('Download failed');
    }
    
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    
    // Create book object
    const book = {
      id: Date.now().toString(),
      title: title || 'Unknown Title',
      author: author || 'Unknown Author',
      file: arrayBuffer,
      addedDate: new Date().toISOString(),
      cover: null // Will be extracted from EPUB
    };
    
    await saveBook(book);
    return book;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

// File upload operations
export const uploadLocalBook = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  
  const book = {
    id: Date.now().toString(),
    title: file.name.replace('.epub', ''),
    author: 'Unknown Author',
    file: arrayBuffer,
    addedDate: new Date().toISOString(),
    cover: null
  };
  
  await saveBook(book);
  return book;
};
