# EPUB Reader PWA

A modern, feature-rich Progressive Web App for reading EPUB books with offline support and customizable reading experience.

## Features

### Frontend (React + TailwindCSS)
- 📚 **Library Management**: Import and organize your EPUB collection
- 🔍 **Online Search**: Search and download books from online sources
- 📖 **Advanced Reader**: Powered by epub.js with customizable settings
- 🎨 **Multiple Themes**: Light, dark, sepia, and custom color themes
- ♿ **Accessibility**: Dyslexic-friendly fonts and high contrast mode
- 💾 **Offline Support**: Full PWA with service worker caching
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🔖 **Reading Progress**: Automatic bookmark saving and restoration

### Backend (Node.js + Express)
- 🔍 **Search API**: Proxy search requests to external book sources
- 📥 **Download Service**: Handle EPUB file downloads
- 🔒 **Security**: CORS, helmet, and error handling
- 📊 **Monitoring**: Health checks and request logging

## Quick Start

### Frontend Setup
```bash
cd epub-reader
npm install
npm start
```

### Backend Setup
```bash
cd ../Server-arct1cx/epub-reader-backend
npm install
cp .env.example .env
npm run dev
```

## Project Structure

```
EPUB-reader/
├── epub-reader/                 # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── contexts/           # React contexts
│   │   ├── utils/              # Utility functions
│   │   └── index.js
│   ├── public/
│   │   ├── manifest.json       # PWA manifest
│   │   └── sw.js              # Service worker
│   └── package.json
└── .github/
    └── workflows/
        └── deploy.yml          # GitHub Actions

../Server-arct1cx/
└── epub-reader-backend/        # Node.js backend (separate server)
    ├── routes/                 # API routes
    ├── server.js
    └── package.json
```

## PWA Features

- **Installable**: Can be installed on devices like a native app
- **Offline Reading**: Read downloaded books without internet
- **Background Sync**: Sync reading progress when online
- **Responsive**: Adapts to all screen sizes
- **Fast Loading**: Cached resources for instant startup

## Customization Options

### Reading Experience
- Font size and family selection
- Line height adjustment
- Multiple color themes
- Custom background and text colors
- Dyslexic-friendly font option
- High contrast mode

### Accessibility
- ARIA labels and semantic HTML
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- High contrast themes

## Deployment

The app automatically deploys to GitHub Pages when code is pushed to the main branch.

### Manual Deployment
```bash
cd epub-reader
npm run build
npm run deploy
```

## Development

### Frontend Development
```bash
cd epub-reader
npm install
npm start
```

### Backend Development
```bash
cd ../Server-arct1cx/epub-reader-backend
npm install
npm run dev
```

## Technologies Used

### Frontend
- React 18 with Hooks
- React Router for navigation
- TailwindCSS for styling
- epub.js for EPUB rendering
- idb for IndexedDB management
- Service Worker for PWA features

### Backend
- Node.js with Express
- Axios for HTTP requests
- Cheerio for HTML parsing
- CORS and Helmet for security
- Morgan for logging

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [epub.js](https://github.com/futurepress/epub.js) for EPUB rendering
- [idb](https://github.com/jakearchibald/idb) for IndexedDB wrapper
- [TailwindCSS](https://tailwindcss.com/) for styling
- [OpenDyslexic](https://opendyslexic.org/) for accessibility font
