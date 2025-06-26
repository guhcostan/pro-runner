const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes.js');
const planRoutes = require('./routes/planRoutes.js');
const motivationalRoutes = require('./routes/motivational.js');
const cacheRoutes = require('./routes/cacheRoutes.js');
const performanceRoutes = require('./routes/performanceRoutes.js');
const adaptiveRoutes = require('./routes/adaptiveRoutes.js');
const { createRateLimit } = require('./middleware/auth.js');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler.js');
const logger = require('./config/logger.js');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
app.use(morgan('combined', { stream: logger.stream }));

// Add request ID for tracking
app.use((req, res, next) => {
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  next();
});

// Rate limiting middleware
app.use('/api/users', createRateLimit(15 * 60 * 1000, 20)); // 20 requests per 15 minutes for user operations
app.use('/api/plans', createRateLimit(15 * 60 * 1000, 30)); // 30 requests per 15 minutes for plan operations
app.use('/api/adaptive', createRateLimit(15 * 60 * 1000, 50)); // 50 requests per 15 minutes for adaptive operations

// Routes
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/motivational', motivationalRoutes);
app.use('/api/cache', cacheRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/adaptive', adaptiveRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  logger.logUserAction('system', 'health_check', { ip: req.ip });
  res.json({ 
    status: 'ok', 
    service: 'ProRunner API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// 404 handler for undefined routes
app.use('*', notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

// Only start server if this file is run directly (not imported)
if (require.main === module) {
  const server = app.listen(PORT, () => {
    logger.info(`🚀 ProRunner API server running on port ${PORT}`, {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
    logger.info(`🏥 Health check: http://localhost:${PORT}/api/health`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });
}

// Export app for testing
module.exports = app; 