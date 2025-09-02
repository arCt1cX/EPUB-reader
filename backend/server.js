const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const searchRoutes = require('./routes/search');
const downloadRoutes = require('./routes/download');

const app = express();
const PORT = process.env.PORT || process.env.EPUB_PORT || 3001;

// Middleware
app.use(helmet());

// Configure CORS to allow multiple origins
const allowedOrigins = process.env.FRONTEND_URL ? 
  process.env.FRONTEND_URL.split(',').map(url => url.trim()) : 
  ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/search', searchRoutes);
app.use('/api/download', downloadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'EPUB Reader Backend',
    version: '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Status endpoint with more detailed information
app.get('/api/status', (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    service: 'EPUB Reader Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: {
      seconds: Math.floor(process.uptime()),
      human: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m ${Math.floor(process.uptime() % 60)}s`
    },
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
    },
    endpoints: [
      'GET /api/health - Basic health check',
      'GET /api/status - Detailed status information', 
      'GET /api/search?q=query - Search for EPUB books',
      'POST /api/download - Download EPUB book'
    ],
    cors: {
      allowedOrigins: allowedOrigins,
      note: 'CORS is configured for frontend origins'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`EPUB Reader Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
