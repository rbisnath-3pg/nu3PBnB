const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Global test setup
beforeAll(async () => {
  // Disconnect from any existing connections first
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  // Create new in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Clear all collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Global test teardown
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Test utilities
const createTestUser = async (userData = {}) => {
  const User = require('./models/User');
  const defaultUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'guest',
    ...userData
  };
  
  const user = new User(defaultUser);
  await user.save();
  return user;
};

const createTestListing = async (listingData = {}) => {
  const Listing = require('./models/Listing');
  const User = require('./models/User');
  
  // Create a host user if not provided
  let host = listingData.host;
  if (!host) {
    host = await createTestUser({ role: 'host' });
  }
  
  const defaultListing = {
    title: 'Test Property',
    description: 'A beautiful test property',
    location: 'Test City, Test Country',
    price: 100,
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    available: true,
    language: 'en',
    host: host._id,
    ...listingData
  };
  
  const listing = new Listing(defaultListing);
  await listing.save();
  return listing;
};

const createTestBooking = async (bookingData = {}) => {
  const BookingRequest = require('./models/BookingRequest');
  
  // Create default users and listing if not provided
  let guest = bookingData.guest;
  let listing = bookingData.listing;
  
  if (!guest) {
    guest = await createTestUser({ role: 'guest' });
  }
  
  if (!listing) {
    listing = await createTestListing();
  }
  
  const defaultBooking = {
    guest: guest._id,
    listing: listing._id,
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    status: 'pending',
    paymentStatus: 'pending',
    message: 'Test booking request',
    ...bookingData
  };
  
  const booking = new BookingRequest(defaultBooking);
  await booking.save();
  return booking;
};

const generateAuthToken = (user) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

module.exports = {
  createTestUser,
  createTestListing,
  createTestBooking,
  generateAuthToken,
  mongoServer
}; 