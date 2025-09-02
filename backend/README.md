# EPUB Reader Backend

This is the backend API for the EPUB Reader Progressive Web App.

## Features

- Book search API (proxy to oceanofpdf.com)
- EPUB download endpoint
- CORS support for frontend integration
- Error handling and logging
- Health check endpoint

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy environment file:
   ```
   cp .env.example .env
   ```

3. Update environment variables in `.env` as needed

4. Start the server:
   ```
   npm run dev  # Development with nodemon
   npm start    # Production
   ```

## API Endpoints

### GET /api/health
Health check endpoint

### GET /api/search?q={query}
Search for books
- **q**: Search query (required)

### GET /api/download?url={book_url}
Download EPUB file
- **url**: Book download URL (required)

## Integration with Main Server

This backend can run independently or be integrated with your main server. The server uses port 3001 by default (configurable via EPUB_PORT environment variable).

## Development Notes

The current implementation includes mock responses for demonstration purposes. In a production environment, you would need to:

1. Implement actual scraping logic for book search
2. Handle real EPUB downloads from external sources
3. Add proper rate limiting and caching
4. Implement user authentication if needed
5. Add comprehensive error handling
6. Set up proper logging and monitoring

## Security Considerations

- Always validate and sanitize input parameters
- Implement rate limiting to prevent abuse
- Use HTTPS in production
- Add proper CORS configuration
- Consider implementing API key authentication
- Validate file types and sizes for downloads
