console.log('Starting index.js');
require('dotenv').config();
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

// Environment-based configuration
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const ENABLE_VERBOSE_LOGGING = process.env.ENABLE_VERBOSE_LOGGING === 'true';
const API_RATE_LIMIT = parseInt(process.env.API_RATE_LIMIT) || 1000; // requests per minute

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
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
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
    winston.format.timestamp(),
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
    format: winston.format.simple()
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
    
    // Create indexes for better performance
    try {
      const db = mongoose.connection.db;
      
      // User indexes
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ role: 1 });
      await db.collection('users').createIndex({ createdAt: -1 });
      
      // Listing indexes
      await db.collection('listings').createIndex({ hostId: 1 });
      await db.collection('listings').createIndex({ status: 1 });
      await db.collection('listings').createIndex({ createdAt: -1 });
      
      // Booking indexes
      await db.collection('bookingrequests').createIndex({ guestId: 1 });
      await db.collection('bookingrequests').createIndex({ listingId: 1 });
      await db.collection('bookingrequests').createIndex({ status: 1 });
      await db.collection('bookingrequests').createIndex({ startDate: 1 });
      await db.collection('bookingrequests').createIndex({ createdAt: -1 });
      
      // Payment indexes
      await db.collection('payments').createIndex({ bookingId: 1 });
      await db.collection('payments').createIndex({ status: 1 });
      await db.collection('payments').createIndex({ createdAt: -1 });
      
      // Message indexes
      await db.collection('messages').createIndex({ senderId: 1 });
      await db.collection('messages').createIndex({ recipientId: 1 });
      await db.collection('messages').createIndex({ read: 1 });
      await db.collection('messages').createIndex({ createdAt: -1 });
      
      // UserActivity indexes
      await db.collection('useractivities').createIndex({ userId: 1 });
      await db.collection('useractivities').createIndex({ action: 1 });
      await db.collection('useractivities').createIndex({ timestamp: -1 });
      
      // Review indexes
      await db.collection('reviews').createIndex({ listingId: 1 });
      await db.collection('reviews').createIndex({ reviewerId: 1 });
      await db.collection('reviews').createIndex({ createdAt: -1 });
      
      logger.info('MongoDB indexes created successfully');
    } catch (indexError) {
      logger.warn('Some indexes may already exist:', indexError.message);
    }
  })
  .catch((err) => {
    logger.error({ message: 'MongoDB connection error', error: err });
    console.error('MongoDB connection error:', err);
  });

app.get('/', (req, res) => {
  res.send('nu3PBnB API is running');
});

// Temporary public endpoint for database initialization (for production setup)
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

// Temporary endpoint to remove problematic geospatial index
app.post('/fix-index', async (req, res) => {
  try {
    console.log('🔄 Attempting to remove geospatial index on location field');
    
    const db = mongoose.connection.db;
    
    // Try to drop the problematic index
    try {
      await db.collection('listings').dropIndex('location_2dsphere');
      console.log('✅ Successfully dropped location_2dsphere index');
    } catch (dropError) {
      console.log('⚠️ Could not drop location_2dsphere index:', dropError.message);
    }
    
    // Try alternative index names
    try {
      await db.collection('listings').dropIndex('location_1');
      console.log('✅ Successfully dropped location_1 index');
    } catch (dropError) {
      console.log('⚠️ Could not drop location_1 index:', dropError.message);
    }
    
    // List all indexes to see what's there
    const indexes = await db.collection('listings').getIndexes();
    console.log('📊 Current indexes:', Object.keys(indexes));
    
    res.json({ 
      message: 'Index removal attempted',
      currentIndexes: Object.keys(indexes)
    });
  } catch (error) {
    console.error('❌ Index removal failed:', error);
    res.status(500).json({ 
      message: 'Index removal failed',
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