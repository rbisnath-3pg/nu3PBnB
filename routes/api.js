const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const User = require('../models/User');
const BookingRequest = require('../models/BookingRequest');
const Review = require('../models/Review');
const Message = require('../models/Message');
const Payment = require('../models/Payment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth, requireRole } = require('../middleware/auth');

// API Documentation endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Nu3PBnB API v1.0',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/profile': 'Get user profile (requires auth)',
        'PUT /api/auth/profile': 'Update user profile (requires auth)'
      },
      listings: {
        'GET /api/listings': 'Get all listings with filters',
        'GET /api/listings/:id': 'Get specific listing',
        'POST /api/listings': 'Create new listing (requires host role)',
        'PUT /api/listings/:id': 'Update listing (requires host role)',
        'DELETE /api/listings/:id': 'Delete listing (requires host role)',
        'GET /api/listings/search': 'Search listings',
        'GET /api/listings/popular': 'Get popular listings'
      },
      bookings: {
        'GET /api/bookings': 'Get user bookings (requires auth)',
        'POST /api/bookings': 'Create booking request (requires auth)',
        'PUT /api/bookings/:id': 'Update booking status (requires host role)',
        'DELETE /api/bookings/:id': 'Cancel booking (requires auth)'
      },
      reviews: {
        'GET /api/reviews/listing/:listingId': 'Get reviews for a listing',
        'POST /api/reviews': 'Create review (requires auth)',
        'PUT /api/reviews/:id': 'Update review (requires auth)',
        'DELETE /api/reviews/:id': 'Delete review (requires auth)'
      },
      messages: {
        'GET /api/messages': 'Get user messages (requires auth)',
        'POST /api/messages': 'Send message (requires auth)',
        'PUT /api/messages/:id/read': 'Mark message as read (requires auth)'
      },
      payments: {
        'GET /api/payments/methods': 'Get payment methods (requires auth)',
        'POST /api/payments/process': 'Process payment (requires auth)',
        'GET /api/payments/history': 'Get payment history (requires auth)'
      },
      wishlist: {
        'GET /api/users/:id/wishlist': 'Get a user\'s wishlist',
        'POST /api/users/:id/wishlist': 'Add a listing to a user\'s wishlist',
        'DELETE /api/users/:id/wishlist/:listingId': 'Remove a listing from a user\'s wishlist'
      }
    },
    authentication: 'Use Bearer token in Authorization header',
    rateLimit: '100 requests per hour per API key',
    baseUrl: `${req.protocol}://${req.get('host')}/api`
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API v1 endpoint
router.get('/v1', (req, res) => {
  res.json({
    message: 'Nu3PBnB API v1.0',
    version: '1.0.0'
  });
});

// API Key middleware for third-party access
const validateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'API key required',
      message: 'Please provide an API key in the X-API-Key header or Authorization header'
    });
  }

  try {
    // For now, we'll use a simple API key validation
    // In production, you'd want to store API keys in a database
    const validApiKeys = ['nu3pbnb_api_key_2024', 'demo_api_key_123', 'test_api_key_456'];
    
    if (!validApiKeys.includes(apiKey)) {
      return res.status(401).json({ 
        error: 'Invalid API key',
        message: 'The provided API key is not valid'
      });
    }

    req.apiKey = apiKey;
    next();
  } catch (error) {
    res.status(500).json({ error: 'API key validation failed' });
  }
};

// Rate limiting middleware
const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Rate limit exceeded',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply API key validation and rate limiting to protected routes only
router.use('/listings', validateApiKey, apiLimiter);
router.use('/bookings', validateApiKey, apiLimiter);
router.use('/reviews', validateApiKey, apiLimiter);
router.use('/messages', validateApiKey, apiLimiter);
router.use('/payments', validateApiKey, apiLimiter);
router.use('/users', validateApiKey, apiLimiter);

// ===== LISTINGS ENDPOINTS =====

// Get all listings with filters
router.get('/listings', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      location,
      minPrice,
      maxPrice,
      guests,
      amenities,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      host
    } = req.query;

    const query = {};

    // Host filter
    if (host) {
      query.host = host;
    }

    // Location filter
    if (location) {
      query.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } }
      ];
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Guests filter
    if (guests) {
      query.maxGuests = { $gte: parseInt(guests) };
    }

    // Amenities filter
    if (amenities) {
      const amenitiesArray = amenities.split(',').map(a => a.trim());
      query.amenities = { $all: amenitiesArray };
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const listings = await Listing.find(query)
      .populate('host', 'firstName lastName email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Listing.countDocuments(query);

    res.json({
      data: listings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ error: 'Failed to get listings' });
  }
});

// Get specific listing
router.get('/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('host', 'firstName lastName email phone bio')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'firstName lastName' }
      });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ listing });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ error: 'Failed to get listing' });
  }
});

// Create new listing (requires host role)
router.post('/listings', auth, requireRole('host'), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      location,
      maxGuests,
      bedrooms,
      bathrooms,
      amenities,
      images
    } = req.body;

    if (!title || !description || !price || !location || !maxGuests) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Title, description, price, location, and maxGuests are required'
      });
    }

    const listing = new Listing({
      host: req.user.id,
      title,
      description,
      price,
      location,
      maxGuests,
      bedrooms,
      bathrooms,
      amenities: amenities || [],
      images: images || []
    });

    await listing.save();

    res.status(201).json({
      message: 'Listing created successfully',
      listing
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Update listing (requires host role)
router.put('/listings/:id', auth, requireRole('host'), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.host.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: 'Listing updated successfully',
      listing: updatedListing
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// Delete listing (requires host role)
router.delete('/listings/:id', auth, requireRole('host'), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.host.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// Search listings
router.get('/listings/search', async (req, res) => {
  try {
    const { q, location, minPrice, maxPrice, guests, checkIn, checkOut } = req.query;

    const query = {};

    // Text search
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    // Location search
    if (location) {
      query.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } }
      ];
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Guest capacity
    if (guests) {
      query.maxGuests = { $gte: parseInt(guests) };
    }

    const listings = await Listing.find(query)
      .populate('host', 'firstName lastName')
      .limit(20);

    res.json({ listings });
  } catch (error) {
    console.error('Search listings error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get popular listings
router.get('/listings/popular', async (req, res) => {
  try {
    const listings = await Listing.aggregate([
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'listing',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          averageRating: { $avg: '$reviews.rating' },
          reviewCount: { $size: '$reviews' }
        }
      },
      {
        $match: {
          averageRating: { $gte: 4.0 },
          reviewCount: { $gte: 1 }
        }
      },
      {
        $sort: { averageRating: -1, reviewCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({ listings });
  } catch (error) {
    console.error('Get popular listings error:', error);
    res.status(500).json({ error: 'Failed to get popular listings' });
  }
});

// ===== BOOKINGS ENDPOINTS =====

// Get user bookings
router.get('/bookings', auth, async (req, res) => {
  try {
    const { role } = req.query;
    
    if (role === 'guest') {
      const bookings = await BookingRequest.find({ guest: req.user.id }).populate('listing');
      res.json({ bookings });
    } else {
      // For hosts, get bookings for their listings
      const listings = await Listing.find({ host: req.user.id });
      const listingIds = listings.map(l => l._id);
      const bookings = await BookingRequest.find({ listing: { $in: listingIds } })
        .populate('guest', 'name email')
        .populate('listing');
      res.json({ bookings });
    }
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// ===== REVIEWS ENDPOINTS =====

// Get reviews for a listing
router.get('/reviews/listing/:listingId', async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

// Create review
router.post('/reviews', auth, async (req, res) => {
  try {
    const { listingId, rating, comment } = req.body;

    if (!listingId || !rating || !comment) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'listingId, rating, and comment are required'
      });
    }

    // Check if user has already reviewed this listing
    const existingReview = await Review.findOne({
      listing: listingId,
      user: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this listing' });
    }

    const review = new Review({
      listing: listingId,
      user: req.user.id,
      rating: parseInt(rating),
      comment
    });

    await review.save();

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Update review
router.put('/reviews/:id', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete review
router.delete('/reviews/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// ===== MESSAGES ENDPOINTS =====

// Get user messages
router.get('/messages', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }]
    })
      .populate('sender', 'firstName lastName')
      .populate('recipient', 'firstName lastName')
      .populate('listing', 'title')
      .sort({ createdAt: -1 });

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send message
router.post('/messages', auth, async (req, res) => {
  try {
    const { recipientId, listingId, content } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'recipientId and content are required'
      });
    }

    const message = new Message({
      sender: req.user.id,
      recipient: recipientId,
      listing: listingId,
      content
    });

    await message.save();

    res.status(201).json({
      message: 'Message sent successfully',
      messageData: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark message as read
router.put('/messages/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.recipient.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to mark this message as read' });
    }

    message.read = true;
    await message.save();

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// ===== WISHLIST ENDPOINTS =====

// Get a user's wishlist
router.get('/users/:id/wishlist', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('wishlist', '-__v');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.wishlist || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get wishlist' });
  }
});

// Add a listing to a user's wishlist
router.post('/users/:id/wishlist', async (req, res) => {
  try {
    const { listingId } = req.body;
    if (!listingId) return res.status(400).json({ error: 'listingId is required' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.wishlist.includes(listingId)) {
      user.wishlist.push(listingId);
      await user.save();
    }
    await user.populate('wishlist', '-__v');
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove a listing from a user's wishlist
router.delete('/users/:id/wishlist/:listingId', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.listingId);
    await user.save();
    await user.populate('wishlist', '-__v');
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

module.exports = router; 