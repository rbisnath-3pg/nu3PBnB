/**
 * nu3PBnB Backend Server
 * Copyright (c) 2025 Robbie Bisnath (robbie.bisnath@3pillarglobal.com). All rights reserved.
 * 
 * Main server entry point for the nu3PBnB property booking platform.
 * Handles API routes, database connections, middleware, and server configuration.
 */

console.log('Starting index.js');
require('dotenv').config();

// Set timezone to Toronto EST
process.env.TZ = 'America/Toronto';
console.log('🕐 Server timezone set to Toronto EST:', new Date().toLocaleString('en-US', { 
  timeZone: 'America/Toronto',
  timeZoneName: 'short'
}));

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const Backend = require('i18next-fs-backend');
const { trackPageView } = require('./middleware/tracking');
const { apiLimiter, pollingLimiter } = require('./middleware/rateLimit');
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const { initializeDatabase } = require('./scripts/init-database');

const app = express();

// Trust proxy for rate limiting behind load balancers (Render, etc.)
app.set('trust proxy', 1);

// Environment-based configuration
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const ENABLE_VERBOSE_LOGGING = process.env.ENABLE_VERBOSE_LOGGING === 'true';
const API_RATE_LIMIT = parseInt(process.env.API_RATE_LIMIT) || 1000; // requests per minute

// CORS configuration
const corsOrigins = [
  'http://localhost:5173', 
  'http://localhost:5174', 
  'http://localhost:5175'
];

// Add production frontend URL
if (isProduction || process.env.CORS_ORIGIN) {
  corsOrigins.push('https://nu3pbnb.onrender.com');
}

// Add custom CORS origin if provided
if (process.env.CORS_ORIGIN) {
  corsOrigins.push(process.env.CORS_ORIGIN);
}

// GLOBAL DEBUG LOGGER - only in development and when verbose logging is enabled
if (isDevelopment && ENABLE_VERBOSE_LOGGING) {
  app.use((req, res, next) => {
    // Skip logging for frequent polling requests
    if (req.url.includes('/test-results/') || req.url.includes('/heartbeat') || req.url.includes('/unread-count')) {
      return next();
    }
    console.log('[GLOBAL] Incoming:', req.method, req.url);
    next();
  });
}

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175',
    'https://nu3pbnb.onrender.com',
    'https://nu3pbnb-frontend.onrender.com'
  ],
  credentials: true
}));

app.use(express.json());

// Apply rate limiting
app.use('/api', apiLimiter);

// Apply stricter rate limiting to polling endpoints
app.use('/api/admin/test-results', pollingLimiter);
app.use('/api/analytics/heartbeat', pollingLimiter);
app.use('/api/admin/messages/unread-count', pollingLimiter);
app.use('/api/messages/unread-count', pollingLimiter);

// Add tracking middleware for all routes
app.use(trackPageView);

// i18n configuration
// This will load translations from ./locales/{lng}/translation.json
// and detect language from 'accept-language' header or ?lng=fr query param

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    preload: ['en', 'fr', 'es'],
    backend: {
      loadPath: __dirname + '/locales/{{lng}}/translation.json'
    },
    detection: {
      order: ['querystring', 'header'],
      lookupQuerystring: 'lng',
      caches: false
    }
  });

app.use(i18nextMiddleware.handle(i18next));

// Ensure logs directory exists
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Winston logger setup
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => new Date().toLocaleString('en-US', { 
        timeZone: 'America/Toronto',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      })
    }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log') })
  ]
});

// Add console transport in development
if (isDevelopment) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({
        format: () => new Date().toLocaleString('en-US', { 
          timeZone: 'America/Toronto',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        })
      }),
      winston.format.simple()
    )
  }));
}

// Log all requests - but skip frequent polling requests
app.use((req, res, next) => {
  // Skip logging for frequent polling requests
  if (req.url.includes('/test-results/') || req.url.includes('/heartbeat') || req.url.includes('/unread-count')) {
    return next();
  }
  
  logger.info({
    message: 'HTTP Request',
    method: req.method,
    url: req.url,
    ip: req.ip
  });
  next();
});

console.log('[BOOT] MONGODB_URI:', process.env.MONGODB_URI);
// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    logger.info('MongoDB connected');
    console.log('MongoDB connected');
    
    // Initialize database with seed data on first run
    try {
      await initializeDatabase();
    } catch (initError) {
      logger.error('Database initialization failed:', initError);
      console.error('Database initialization failed:', initError);
    }
    
    // Clear all user sessions on deployment
    try {
      console.log('🔐 Clearing all user sessions on deployment...');
      
      // Clear any session data (if you have a sessions collection)
      try {
        const sessionResult = await mongoose.connection.db.collection('sessions').deleteMany({});
        console.log(`🗑️  Cleared ${sessionResult.deletedCount} session records`);
      } catch (err) {
        console.log('ℹ️  No sessions collection found (this is normal)');
      }

      // Clear any user activity records that might contain session info
      try {
        const activityResult = await mongoose.connection.db.collection('useractivities').deleteMany({});
        console.log(`🗑️  Cleared ${activityResult.deletedCount} user activity records`);
      } catch (err) {
        console.log('ℹ️  No user activities collection found (this is normal)');
      }

      // Update all users to clear any session-related fields
      const User = require('./models/User');
      const updateResult = await User.updateMany({}, {
        $unset: {
          lastLoginAt: 1,
          sessionId: 1,
          refreshToken: 1,
          deviceToken: 1
        }
      });
      console.log(`🔄 Updated ${updateResult.modifiedCount} user records`);
      
      console.log('✅ All users logged out on deployment');
    } catch (logoutError) {
      logger.error('Failed to clear user sessions:', logoutError);
      console.error('❌ Failed to clear user sessions:', logoutError);
    }
    
    // Create indexes for better performance
    try {
      const db = mongoose.connection.db;
      
      // User indexes
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ role: 1 });
      
      // Listing indexes
      await db.collection('listings').createIndex({ host: 1 });
      await db.collection('listings').createIndex({ city: 1 });
      await db.collection('listings').createIndex({ category: 1 });
      await db.collection('listings').createIndex({ featured: 1 });
      
      // Booking indexes
      await db.collection('bookings').createIndex({ guest: 1 });
      await db.collection('bookings').createIndex({ listing: 1 });
      await db.collection('bookings').createIndex({ startDate: 1, endDate: 1 });
      
      // Payment indexes
      await db.collection('payments').createIndex({ booking: 1 });
      await db.collection('payments').createIndex({ user: 1 });
      
      // Message indexes
      await db.collection('messages').createIndex({ sender: 1 });
      await db.collection('messages').createIndex({ recipient: 1 });
      await db.collection('messages').createIndex({ booking: 1 });
      
      console.log('Database indexes created successfully');
    } catch (indexError) {
      logger.error('Database index creation failed:', indexError);
      console.error('Database index creation failed:', indexError);
    }
    
    // Run startup tests in production
    if (isProduction) {
      try {
        console.log('🧪 Running startup tests...');
        const { runStartupTests } = require('./startup-tests');
        await runStartupTests();
        console.log('✅ Startup tests completed');
      } catch (testError) {
        logger.error('Startup tests failed:', testError);
        console.error('❌ Startup tests failed:', testError);
      }
    }
  })
  .catch(err => {
    logger.error('MongoDB connection failed:', err);
    console.error('MongoDB connection failed:', err);
  });

// Global error handler to prevent server crashes
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  console.error('Uncaught Exception:', err);
  // Don't exit the process, just log the error
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Graceful shutdown handler
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.get('/', (req, res) => {
  res.send('nu3PBnB API is running');
});

// Database initialization endpoint
app.post('/init-db', async (req, res) => {
  try {
    console.log('🔄 Public database initialization requested via /init-db');
    
    // Check if there's already data in the database
    const User = require('./models/User');
    const Listing = require('./models/Listing');
    const existingUsers = await User.countDocuments();
    const existingListings = await Listing.countDocuments();
    
    if (existingUsers > 0 || existingListings > 0) {
      return res.status(400).json({ 
        message: 'Database already contains data. Use /init-db/force to reinitialize.',
        existingUsers,
        existingListings
      });
    }
    
    // Initialize database
    await initializeDatabase();
    
    // Get counts after initialization
    const userCount = await User.countDocuments();
    const listingCount = await Listing.countDocuments();
    
    res.json({ 
      message: 'Database initialized successfully',
      userCount,
      listingCount,
      adminEmail: 'admin@nu3pbnb.com',
      adminPassword: 'password123'
    });
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    res.status(500).json({ 
      message: 'Database initialization failed',
      error: error.message 
    });
  }
});

// Temporary public endpoint for force database initialization
app.post('/init-db/force', async (req, res) => {
  try {
    console.log('🔄 Public force database initialization requested via /init-db/force');
    
    // Force reinitialize database
    await initializeDatabase(true);
    
    // Get counts after initialization
    const User = require('./models/User');
    const Listing = require('./models/Listing');
    const userCount = await User.countDocuments();
    const listingCount = await Listing.countDocuments();
    
    res.json({ 
      message: 'Database force reinitialized successfully',
      userCount,
      listingCount,
      adminEmail: 'admin@nu3pbnb.com',
      adminPassword: 'password123'
    });
  } catch (error) {
    console.error('❌ Database force initialization failed:', error);
    res.status(500).json({ 
      message: 'Database force initialization failed',
      error: error.message 
    });
  }
});

// Temporary public endpoint for database status
app.get('/db-status', async (req, res) => {
  try {
    const User = require('./models/User');
    const Listing = require('./models/Listing');
    const userCount = await User.countDocuments();
    const listingCount = await Listing.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const hostCount = await User.countDocuments({ role: 'host' });
    const guestCount = await User.countDocuments({ role: 'guest' });
    
    res.json({
      userCount,
      listingCount,
      adminCount,
      hostCount,
      guestCount,
      isInitialized: userCount > 0 || listingCount > 0
    });
  } catch (error) {
    console.error('❌ Database status check failed:', error);
    res.status(500).json({ 
      message: 'Database status check failed',
      error: error.message 
    });
  }
});

// Timezone information endpoint
app.get('/timezone', (req, res) => {
  try {
    const { getTorontoTimezoneInfo } = require('./utils/timezone');
    const timezoneInfo = getTorontoTimezoneInfo();
    
    res.json({
      message: 'Server timezone information',
      ...timezoneInfo,
      serverTime: new Date().toISOString(),
      serverTimezone: process.env.TZ || 'UTC'
    });
  } catch (error) {
    console.error('❌ Timezone info failed:', error);
    res.status(500).json({ 
      message: 'Timezone info failed',
      error: error.message 
    });
  }
});

const authRoutes = require('./routes/auth');
console.log('Loaded routes/auth.js');
app.use('/api/auth', authRoutes);

const listingsRoutes = require('./routes/listings');
console.log('Loading routes/listings.js');
const reviewsRoutes = require('./routes/reviews');
const paymentsRoutes = require('./routes/payments');
const messagesRoutes = require('./routes/messages');
const feedbackRoutes = require('./routes/feedback');
const analyticsRoutes = require('./routes/analytics');
const onboardingRoutes = require('./routes/onboarding');
const bookingsRoutes = require('./routes/bookings');
const hostRoutes = require('./routes/host');
const usersRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
console.log('Loaded routes/admin.js');
const contentRoutes = require('./routes/content');

app.use('/api/listings', listingsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/host', hostRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
console.log('Registered /api/admin routes');
app.use('/api/content', contentRoutes);

// Third-party API routes (must come after specific routes to avoid conflicts)
app.use('/api', require('./routes/api')); // Changed from /api/v1 to /api

// Error logging middleware (should be after all routes)
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip
  });
  res.status(500).json({ error: 'Internal Server Error' });
});

// Export app for testing
module.exports = app;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} 