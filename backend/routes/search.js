const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { searchLimiter } = require('../utils/rateLimiter');
const router = express.Router();

// Search endpoint
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Rate limiting check
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    if (!searchLimiter.isAllowed(clientIp)) {
      const resetTime = searchLimiter.getResetTime(clientIp);
      const waitTime = Math.ceil((resetTime - Date.now()) / 1000);
      
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Too many search requests. Please wait ${waitTime} seconds before trying again.`,
        retryAfter: waitTime
      });
    }

    console.log(`Searching Ocean of PDF for: ${q} (IP: ${clientIp})`);

    // Construct the Ocean of PDF search URL
    const searchQuery = encodeURIComponent(q.trim());
    const searchUrl = `https://oceanofpdf.com/?s=${searchQuery}`;
    
    console.log(`Search URL: ${searchUrl}`);

    // Make request to Ocean of PDF
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 10000 // 10 second timeout
    });

    // Parse the HTML
    const $ = cheerio.load(response.data);
    const books = [];

    // Ocean of PDF uses article elements for search results
    $('article.post').each((index, element) => {
      try {
        const $article = $(element);
        
        // Extract title
        const titleElement = $article.find('h2.entry-title a, h1.entry-title a');
        const title = titleElement.text().trim();
        const bookUrl = titleElement.attr('href');
        
        // Extract author from title (Ocean of PDF often includes author in title)
        let author = 'Unknown Author';
        const titleLower = title.toLowerCase();
        
        // Common patterns to extract author
        if (title.includes(' by ')) {
          author = title.split(' by ')[1].split(' ')[0];
        } else if (title.includes(' - ')) {
          const parts = title.split(' - ');
          if (parts.length > 1) {
            author = parts[1];
          }
        }
        
        // Extract description/excerpt
        const descriptionElement = $article.find('.entry-content p, .excerpt p, .entry-summary');
        let description = descriptionElement.first().text().trim();
        if (description.length > 200) {
          description = description.substring(0, 200) + '...';
        }
        
        // Extract cover image
        const coverElement = $article.find('img');
        const cover = coverElement.attr('src') || coverElement.attr('data-src') || null;
        
        // Only add if we have at least a title and URL
        if (title && bookUrl) {
          books.push({
            id: index + 1,
            title: title,
            author: author,
            description: description || 'No description available',
            downloadUrl: bookUrl, // This will be the book page URL, not direct download
            cover: cover,
            source: 'Ocean of PDF'
          });
        }
      } catch (error) {
        console.error('Error parsing book element:', error);
      }
    });

    // If no results found with the main selector, try alternative selectors
    if (books.length === 0) {
      $('.post, .search-item, .book-item').each((index, element) => {
        try {
          const $element = $(element);
          
          const titleLink = $element.find('a[href*="oceanofpdf.com"]').first();
          const title = titleLink.text().trim() || $element.find('h2, h3, .title').text().trim();
          const bookUrl = titleLink.attr('href');
          
          if (title && bookUrl) {
            books.push({
              id: index + 1,
              title: title,
              author: 'Unknown Author',
              description: 'Book found on Ocean of PDF',
              downloadUrl: bookUrl,
              cover: null,
              source: 'Ocean of PDF'
            });
          }
        } catch (error) {
          console.error('Error parsing alternative book element:', error);
        }
      });
    }

    console.log(`Found ${books.length} books for query: ${q}`);

    // Return results
    res.json(books);

  } catch (error) {
    console.error('Search error:', error);
    
    // Check if it's a timeout or network error
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ 
        error: 'Search timeout',
        message: 'The search request took too long. Please try again.'
      });
    }
    
    if (error.response) {
      console.error('HTTP Error:', error.response.status, error.response.statusText);
      return res.status(502).json({ 
        error: 'Search service unavailable',
        message: 'Ocean of PDF is currently unavailable. Please try again later.'
      });
    }
    
    res.status(500).json({ 
      error: 'Search failed',
      message: 'Unable to search for books at this time. Please try again later.'
    });
  }
});

module.exports = router;
