const express = require('express');
const axios = require('axios');
const https = require('https');
const cheerio = require('cheerio');
const { searchLimiter } = require('../utils/rateLimiter');

// Configure global HTTPS agent to handle SSL issues (like accepting insecure certificates)
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; // This is like clicking "proceed anyway" in browser

// Set global HTTPS agent for axios
axios.defaults.httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  checkServerIdentity: () => undefined
});

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

    let response;
    let searchUrl;
    
    // Try HTTPS first, then HTTP as fallback
    const searchQuery = encodeURIComponent(q.trim());
    
    try {
      // First attempt: HTTPS with SSL bypass
      searchUrl = `https://oceanofpdf.com/?s=${searchQuery}`;
      console.log(`Trying HTTPS: ${searchUrl}`);
      
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false, // Accept self-signed certificates
        checkServerIdentity: () => undefined, // Skip hostname verification
        secureProtocol: 'TLSv1_2_method' // Use older TLS if needed
      });

      response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0',
          'Referer': 'https://oceanofpdf.com/',
        },
        timeout: 20000, // 20 second timeout
        httpsAgent: httpsAgent,
        maxRedirects: 5, // Follow redirects
        validateStatus: function (status) {
          return status < 500; // Accept anything less than 500 as success
        }
      });
      
      console.log(`HTTPS request successful, status: ${response.status}`);
      
    } catch (httpsError) {
      console.log(`HTTPS failed: ${httpsError.message}, trying HTTP...`);
      
      // Second attempt: Try HTTP instead
      try {
        searchUrl = `http://oceanofpdf.com/?s=${searchQuery}`;
        console.log(`Trying HTTP: ${searchUrl}`);
        
        response = await axios.get(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'Referer': 'http://oceanofpdf.com/',
          },
          timeout: 20000,
          maxRedirects: 5,
          validateStatus: function (status) {
            return status < 500;
          }
        });
        
        console.log(`HTTP request successful, status: ${response.status}`);
        
      } catch (httpError) {
        console.log(`Both HTTPS and HTTP failed. HTTPS error: ${httpsError.message}, HTTP error: ${httpError.message}`);
        throw httpsError; // Throw the original HTTPS error
      }
    }

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

    // If no books found from Ocean of PDF, try Project Gutenberg as fallback
    if (books.length === 0) {
      console.log('No results from Ocean of PDF, trying Project Gutenberg...');
      
      try {
        const gutenbergUrl = `https://www.gutenberg.org/ebooks/search/?query=${encodeURIComponent(q)}&submit_search=Go%21`;
        const gutenbergResponse = await axios.get(gutenbergUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          timeout: 10000
        });

        const $gutenberg = cheerio.load(gutenbergResponse.data);
        
        $('.booklink').each((index, element) => {
          if (books.length >= 5) return false; // Limit Gutenberg results to 5
          
          try {
            const $element = $gutenberg(element);
            const title = $element.find('.title').text().trim();
            const author = $element.find('.subtitle').text().trim() || 'Unknown Author';
            const bookId = $element.attr('href')?.match(/\/ebooks\/(\d+)/)?.[1];
            
            if (title && bookId) {
              books.push({
                id: books.length + 1,
                title: title,
                author: author,
                description: 'Free ebook from Project Gutenberg',
                downloadUrl: `https://www.gutenberg.org/ebooks/${bookId}`,
                cover: null,
                source: 'Project Gutenberg'
              });
            }
          } catch (err) {
            console.error('Error parsing Gutenberg result:', err);
          }
        });
        
        console.log(`Added ${books.length} books from Project Gutenberg`);
      } catch (gutenbergError) {
        console.error('Project Gutenberg fallback failed:', gutenbergError.message);
      }
    }

    // Return results
    res.json(books);

  } catch (error) {
    console.error('Search error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      hostname: error.hostname,
      syscall: error.syscall
    });
    
    // Check if it's a timeout or network error
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ 
        error: 'Search timeout',
        message: 'The search request took too long. Please try again.',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    // SSL/TLS errors
    if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || 
        error.code === 'SELF_SIGNED_CERT_IN_CHAIN' || error.code === 'ENOTFOUND') {
      return res.status(502).json({ 
        error: 'Connection failed',
        message: 'Unable to connect to book sources. They may be temporarily unavailable.',
        debug: process.env.NODE_ENV === 'development' ? `${error.code}: ${error.message}` : undefined
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
