const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { downloadLimiter } = require('../utils/rateLimiter');
const router = express.Router();

// Helper function to extract download link from Ocean of PDF page
async function getDownloadLink(pageUrl) {
  try {
    console.log(`Extracting download link from: ${pageUrl}`);
    
    const response = await axios.get(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://oceanofpdf.com/'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    // Look for download links - Ocean of PDF typically has download buttons
    let downloadUrl = null;
    
    // Common selectors for download links
    const downloadSelectors = [
      'a[href*=".epub"]',
      'a[href*="download"]',
      '.download-link',
      '.download-btn',
      'a:contains("Download")',
      'a:contains("EPUB")',
      'a:contains("PDF")'
    ];
    
    for (const selector of downloadSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        downloadUrl = element.attr('href');
        if (downloadUrl) {
          // Make absolute URL if relative
          if (downloadUrl.startsWith('/')) {
            downloadUrl = 'https://oceanofpdf.com' + downloadUrl;
          }
          break;
        }
      }
    }
    
    return downloadUrl;
  } catch (error) {
    console.error('Error extracting download link:', error);
    return null;
  }
}

// Download endpoint
router.get('/', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || url.trim().length === 0) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Rate limiting check
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    if (!downloadLimiter.isAllowed(clientIp)) {
      const resetTime = downloadLimiter.getResetTime(clientIp);
      const waitTime = Math.ceil((resetTime - Date.now()) / 1000);
      
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Too many download requests. Please wait ${waitTime} seconds before trying again.`,
        retryAfter: waitTime
      });
    }

    console.log(`Processing download request for: ${url} (IP: ${clientIp})`);

    // Check if this is an Ocean of PDF page URL (not a direct download link)
    let downloadUrl = url;
    if (url.includes('oceanofpdf.com') && !url.includes('.epub') && !url.includes('.pdf')) {
      // Extract the actual download link from the book page
      downloadUrl = await getDownloadLink(url);
      
      if (!downloadUrl) {
        return res.status(404).json({
          error: 'Download link not found',
          message: 'Could not find a download link on this page. The book might not be available for download.'
        });
      }
      
      console.log(`Extracted download URL: ${downloadUrl}`);
    }

    // Validate the download URL
    if (!downloadUrl.startsWith('http')) {
      return res.status(400).json({ 
        error: 'Invalid URL', 
        message: 'The provided URL is not valid' 
      });
    }

    // Make the download request
    const response = await axios({
      method: 'GET',
      url: downloadUrl,
      responseType: 'stream',
      timeout: 30000, // 30 seconds
      maxContentLength: 50 * 1024 * 1024, // 50MB limit
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/epub+zip,application/pdf,application/octet-stream,*/*',
        'Referer': 'https://oceanofpdf.com/'
      }
    });

    // Check content type and size
    const contentType = response.headers['content-type'] || '';
    const contentLength = response.headers['content-length'];
    
    console.log(`Content-Type: ${contentType}, Content-Length: ${contentLength}`);

    // Determine file extension based on content type
    let fileExtension = '.epub';
    let mimeType = 'application/epub+zip';
    
    if (contentType.includes('pdf')) {
      fileExtension = '.pdf';
      mimeType = 'application/pdf';
    } else if (contentType.includes('epub')) {
      fileExtension = '.epub';
      mimeType = 'application/epub+zip';
    }

    // Set response headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="book${fileExtension}"`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition,Content-Type,Content-Length');

    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    // Pipe the file data to the response
    response.data.pipe(res);
    
    // Handle stream errors
    response.data.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Download stream error' });
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ 
        error: 'Download timeout',
        message: 'The download request took too long. Please try again.'
      });
    }
    
    if (error.response) {
      console.error('HTTP Error:', error.response.status, error.response.statusText);
      
      if (error.response.status === 404) {
        return res.status(404).json({ 
          error: 'File not found',
          message: 'The requested file could not be found.'
        });
      }
      
      if (error.response.status === 403) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'Access to this file is restricted.'
        });
      }
    }
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Download failed',
        message: 'Unable to download the requested file. Please try again later.'
      });
    }
  }
});

module.exports = router;
