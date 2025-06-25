const express = require('express');
const Listing = require('../models/Listing');
const { auth, requireRole } = require('../middleware/auth');
const mongoose = require('mongoose');
const BookingRequest = require('../models/BookingRequest');
const multer = require('multer');

const router = express.Router();

// Environment-based logging control
const isDevelopment = process.env.NODE_ENV === 'development';
const ENABLE_VERBOSE_LOGGING = process.env.ENABLE_VERBOSE_LOGGING === 'true';

if (isDevelopment && ENABLE_VERBOSE_LOGGING) {
  console.log('Loading routes/listings.js');
  console.log('Registering POST /api/listings');
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Get featured properties - MUST come before /:id route
router.get('/featured', async (req, res) => {
  try {
    const { language, limit = 6 } = req.query;

    // Build filter object
    const filter = { featured: true };

    // Language filter
    let userLanguage = language || 'en';
    if (req.user && req.user.language) {
      userLanguage = language || req.user.language;
    }
    filter.language = userLanguage;

    // Execute query
    const featuredListings = await Listing.find(filter)
      .populate('host', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      featuredListings: featuredListings,
      total: featuredListings.length,
      language: userLanguage
    });
  } catch (error) {
    console.error('Featured listings error:', error);
    res.status(500).json({ message: req.t('errors.server') });
  }
});

// Get all listings with optional search and filtering
router.get('/', async (req, res) => {
  try {
    const {
      search,
      location,
      minPrice,
      maxPrice,
      guests,
      checkIn,
      checkOut,
      amenities,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 20,
      page = 1,
      language,
      featured
    } = req.query;

    // Build filter object
    const filter = {};

    // Language filter - prioritize query parameter, then user preference, then default to 'en'
    let userLanguage = language || 'en';
    if (req.user && req.user.language) {
      userLanguage = language || req.user.language;
    }
    filter.language = userLanguage;

    // Featured filter
    if (featured !== undefined) {
      filter.featured = featured === 'true';
    }

    // City filter (for more precise filtering)
    if (req.query.city) {
      filter.city = { $regex: `^${req.query.city}$`, $options: 'i' };
    }

    // Country filter
    if (req.query.country) {
      filter.country = { $regex: req.query.country, $options: 'i' };
    }

    // Location filter (legacy, fallback)
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Guest capacity filter
    if (guests) {
      filter.maxGuests = { $gte: parseInt(guests) };
    }

    // Date availability filter
    if (checkIn && checkOut) {
      filter.availability = {
        $elemMatch: {
          start: { $lte: new Date(checkIn) },
          end: { $gte: new Date(checkOut) }
        }
      };
    }

    // Amenities filter
    if (amenities) {
      const amenitiesArray = amenities.split(',').map(a => a.trim());
      filter.amenities = { $all: amenitiesArray };
    }

    // Host filter
    if (req.query.host) {
      if (!mongoose.Types.ObjectId.isValid(req.query.host)) {
        return res.status(400).json({ message: 'Invalid host id' });
      }
      filter.host = req.query.host;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const listings = await Listing.find(filter)
      .populate('host', 'name email')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Listing.countDocuments(filter);

    res.json({
      listings: listings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: skip + listings.length < total,
        hasPrev: parseInt(page) > 1
      },
      language: userLanguage
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: req.t('errors.server') });
  }
});

// Get search suggestions - MUST come before /:id route
router.get('/search/suggestions', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json([]);
    }

    // Get unique locations that match the query
    const locations = await Listing.distinct('location', {
      location: { $regex: query, $options: 'i' }
    });

    // Get unique titles that match the query
    const titles = await Listing.distinct('title', {
      title: { $regex: query, $options: 'i' }
    });

    // Combine and format suggestions
    const suggestions = [
      ...locations.slice(0, 5).map(location => ({
        type: 'location',
        text: location,
        value: location
      })),
      ...titles.slice(0, 5).map(title => ({
        type: 'property',
        text: title,
        value: title
      }))
    ];

    res.json(suggestions);
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ message: 'Failed to get suggestions' });
  }
});

// Get popular searches - MUST come before /:id route
router.get('/search/popular', async (req, res) => {
  try {
    // Return some popular search terms
    const popularSearches = [
      'New York',
      'Los Angeles',
      'Chicago',
      'Miami',
      'San Francisco',
      'Beach House',
      'Mountain Cabin',
      'Downtown Apartment'
    ];
    
    res.json({
      popularListings: popularSearches
    });
  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json({ message: 'Failed to get popular searches' });
  }
});

// Advanced search endpoint - MUST come before /:id route
router.get('/search/advanced', async (req, res) => {
  try {
    const {
      query,
      location,
      minPrice,
      maxPrice,
      checkIn,
      checkOut,
      guests,
      amenities,
      propertyType,
      instantBookable,
      superhost,
      sortBy = 'relevance',
      limit = 20
    } = req.query;

    // Build advanced filter
    const filter = {};

    // Multi-field text search
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } }
      ];
    }

    // Location search with proximity (if coordinates are provided)
    if (location) {
      // For now, simple text search. Could be enhanced with geospatial queries
      filter.location = { $regex: location, $options: 'i' };
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Date availability
    if (checkIn && checkOut) {
      filter.availability = {
        $elemMatch: {
          start: { $lte: new Date(checkIn) },
          end: { $gte: new Date(checkOut) }
        }
      };
    }

    // Guest capacity
    if (guests) {
      filter.guestCapacity = { $gte: parseInt(guests) };
    }

    // Property type (if we add this field)
    if (propertyType) {
      filter.propertyType = propertyType;
    }

    // Amenities
    if (amenities) {
      const amenitiesArray = amenities.split(',').map(a => a.trim());
      filter.amenities = { $all: amenitiesArray };
    }

    // Superhost filter (if we add this field to User model)
    if (superhost === 'true') {
      // This would require joining with User model
      // For now, we'll skip this filter
    }

    // Host filter
    if (req.query.host) {
      if (!mongoose.Types.ObjectId.isValid(req.query.host)) {
        return res.status(400).json({ message: 'Invalid host id' });
      }
      filter.host = req.query.host;
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'price_low':
        sort.price = 1;
        break;
      case 'price_high':
        sort.price = -1;
        break;
      case 'rating':
        sort.averageRating = -1;
        break;
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'oldest':
        sort.createdAt = 1;
        break;
      default: // relevance
        sort = { averageRating: -1, createdAt: -1 };
    }

    // Execute search
    const listings = await Listing.find(filter)
      .populate('host', 'name email')
      .sort(sort)
      .limit(parseInt(limit));

    res.json({
      data: listings,
      total: listings.length,
      filters: {
        query,
        location,
        minPrice,
        maxPrice,
        checkIn,
        checkOut,
        guests,
        amenities,
        propertyType
      }
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ message: req.t('errors.server') });
  }
});

// Get listings for map (with coordinates, filtered by location if provided) - MUST come before /:id route
router.get('/map/data', async (req, res) => {
  try {
    const { location, bounds } = req.query;
    const filter = {};

    // Location filter
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Geographic bounds filter (if bounds are provided)
    if (bounds) {
      const [swLat, swLng, neLat, neLng] = bounds.split(',').map(Number);
      filter.latitude = { $gte: swLat, $lte: neLat };
      filter.longitude = { $gte: swLng, $lte: neLng };
    }

    const listings = await Listing.find(filter, 'title latitude longitude price photos location averageRating')
      .populate('host', 'name');

    res.json(listings);
  } catch (error) {
    console.error('Map data error:', error);
    res.status(500).json({ message: 'Failed to get map data' });
  }
});

// Create new listing (requires host role)
router.post('/', auth, requireRole('host'), async (req, res) => {
  try {
    console.log('Received property payload:', req.body);
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'location', 'city', 'country', 'price', 'type', 'latitude', 'longitude'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    
    const Listing = require('../models/Listing');
    const listing = new Listing({
      ...req.body,
      host: req.user.id
    });

    await listing.save();

    res.status(201).json({
      message: 'Listing created successfully',
      listing
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ message: 'Failed to create listing' });
  }
});

// Update listing (requires host role)
router.put('/:id', auth, requireRole('host'), async (req, res) => {
  const now = new Date().toISOString();
  try {
    console.info(`[EditListing][${now}] Incoming edit request for listing:`, req.params.id);
    console.info(`[EditListing][${now}] User:`, req.user);
    console.info(`[EditListing][${now}] Payload:`, req.body);
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      console.warn(`[EditListing][${now}] Listing not found:`, req.params.id);
      return res.status(404).json({ message: 'Listing not found' });
    }
    if (listing.host.toString() !== req.user.id) {
      console.warn(`[EditListing][${now}] Not authorized. Listing host:`, listing.host.toString(), 'User:', req.user.id);
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('host', 'name email');
    console.info(`[EditListing][${now}] Listing updated successfully:`, updatedListing);
    res.json({
      message: 'Listing updated successfully',
      listing: updatedListing
    });
  } catch (error) {
    console.error(`[EditListing][${now}] Update listing error:`, error);
    res.status(500).json({ message: 'Failed to update listing' });
  }
});

// Get listing by ID - MUST come after all other routes
router.get('/:id', async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid listing ID format' });
    }

    const listing = await Listing.findById(req.params.id)
      .populate('host', 'name email')
      .populate('reviews');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ message: 'Failed to get listing' });
  }
});

// Admin: Get all listings
router.get('/admin/all', auth, requireRole('admin'), async (req, res) => {
  const listings = await Listing.find().populate('host', 'name email');
  res.json(listings);
});

// Admin: Update any listing
router.put('/admin/:id', auth, requireRole('admin'), async (req, res) => {
  const update = req.body;
  const listing = await Listing.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  res.json(listing);
});

// Admin: Delete any listing
router.delete('/admin/:id', auth, requireRole('admin'), async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  res.json({ message: 'Listing deleted successfully' });
});

// Admin: Create new listing with random test data
router.post('/admin/create', auth, requireRole('admin'), async (req, res) => {
  try {
    const { hostId } = req.body;
    
    if (!hostId) {
      return res.status(400).json({ message: 'Host ID is required' });
    }

    // Generate random test data
    const propertyTypes = ['Apartment', 'House', 'Condo', 'Villa', 'Cabin', 'Loft'];
    const locations = [
      { city: 'New York', lat: 40.7128, lng: -74.0060 },
      { city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
      { city: 'Chicago', lat: 41.8781, lng: -87.6298 },
      { city: 'Miami', lat: 25.7617, lng: -80.1918 },
      { city: 'San Francisco', lat: 37.7749, lng: -122.4194 },
      { city: 'Seattle', lat: 47.6062, lng: -122.3321 },
      { city: 'Austin', lat: 30.2672, lng: -97.7431 },
      { city: 'Denver', lat: 39.7392, lng: -104.9903 },
      { city: 'Boston', lat: 42.3601, lng: -71.0589 },
      { city: 'Portland', lat: 45.5152, lng: -122.6784 }
    ];
    
    const amenities = [
      'WiFi', 'Kitchen', 'Free parking', 'Air conditioning', 'Heating',
      'Washer', 'Dryer', 'TV', 'Pool', 'Gym', 'Balcony', 'Garden'
    ];
    
    const adjectives = ['Cozy', 'Modern', 'Luxurious', 'Charming', 'Spacious', 'Elegant', 'Stylish', 'Comfortable'];
    const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    
    // Generate random photos
    const photoUrls = [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800',
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
    ];
    
    const randomPhotos = [];
    const numPhotos = Math.floor(Math.random() * 4) + 3; // 3-6 photos
    for (let i = 0; i < numPhotos; i++) {
      const randomIndex = Math.floor(Math.random() * photoUrls.length);
      randomPhotos.push(photoUrls[randomIndex]);
    }
    
    // Generate random price between $50 and $500
    const price = Math.floor(Math.random() * 450) + 50;
    
    // Generate random availability dates
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 30) + 7);
    
    const listingData = {
      title: `${adjective} ${propertyType} in ${location.city}`,
      description: `Beautiful ${propertyType.toLowerCase()} located in the heart of ${location.city}. This ${adjective.toLowerCase()} property offers all the amenities you need for a comfortable stay. Perfect for both business and leisure travelers.`,
      location: `${location.city}, USA`,
      price: price,
      photos: randomPhotos,
      availability: [{
        start: startDate,
        end: endDate
      }],
      host: hostId,
      latitude: location.lat + (Math.random() - 0.5) * 0.1, // Add some variation
      longitude: location.lng + (Math.random() - 0.5) * 0.1,
      averageRating: 0,
      reviews: []
    };
    
    const listing = new Listing(listingData);
    await listing.save();
    
    // Populate host info for response
    await listing.populate('host', 'name email');
    
    res.status(201).json({
      message: 'Listing created successfully',
      listing
    });
  } catch (error) {
    console.error('Admin create listing error:', error);
    res.status(500).json({ message: 'Failed to create listing' });
  }
});

router.post('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ ok: true });
});

// Add after the POST /api/listings route
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    // Allow if user is the host or is admin
    if (listing.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ message: 'Failed to delete listing' });
  }
});

// Get property availability and existing bookings
router.get('/:id/availability', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Get all bookings for this listing (excluding declined ones)
    const bookings = await BookingRequest.find({
      listing: req.params.id,
      status: { $ne: 'declined' }
    }).select('startDate endDate status');

    // Get availability periods from listing
    const availability = listing.availability || [];

    res.json({
      available: listing.available,
      listing: {
        id: listing._id,
        title: listing.title,
        available: listing.available
      },
      availability,
      bookings: bookings.map(booking => ({
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status
      }))
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ message: 'Failed to get availability' });
  }
});

// Check if dates are available for booking
router.post('/:id/check-availability', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (!listing.available) {
      return res.status(400).json({ 
        available: false, 
        message: 'This property is not available for booking' 
      });
    }

    // Get conflicting bookings
    const conflictingBookings = await BookingRequest.find({
      listing: req.params.id,
      status: { $ne: 'declined' },
      $or: [
        // New booking starts during existing booking
        {
          startDate: { $lte: new Date(startDate) },
          endDate: { $gt: new Date(startDate) }
        },
        // New booking ends during existing booking
        {
          startDate: { $lt: new Date(endDate) },
          endDate: { $gte: new Date(endDate) }
        },
        // New booking completely contains existing booking
        {
          startDate: { $gte: new Date(startDate) },
          endDate: { $lte: new Date(endDate) }
        }
      ]
    });

    const isAvailable = conflictingBookings.length === 0;

    res.json({
      available: isAvailable,
      message: isAvailable ? 'Dates are available' : 'Dates are not available',
      conflictingBookings: conflictingBookings.map(booking => ({
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status
      }))
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ message: 'Failed to check availability' });
  }
});

// Upload property images as blobs
router.post('/:id/upload-images', auth, requireRole('host'), upload.array('images', 10), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.host.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized to upload images for this listing' });
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No images uploaded' });
    // Store images as blobs in a new imagesBlobs array (or similar field)
    if (!listing.imagesBlobs) listing.imagesBlobs = [];
    req.files.forEach(file => {
      listing.imagesBlobs.push({
        data: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname,
        uploadedAt: new Date()
      });
    });
    await listing.save();
    // Return references (indexes) to the uploaded blobs
    const startIdx = listing.imagesBlobs.length - req.files.length;
    const urls = Array.from({ length: req.files.length }, (_, i) => `/api/listings/${listing._id}/image-blob/${startIdx + i}`);
    res.json({ message: 'Images uploaded successfully', urls });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ message: 'Failed to upload images' });
  }
});

// Serve a blob image by index
router.get('/:id/image-blob/:idx', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing || !listing.imagesBlobs || !listing.imagesBlobs[req.params.idx]) return res.status(404).send('Image not found');
    const img = listing.imagesBlobs[req.params.idx];
    res.set('Content-Type', img.mimetype);
    res.send(img.data);
  } catch (error) {
    res.status(500).send('Error serving image');
  }
});

module.exports = router; 