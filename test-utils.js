const User = require('./models/User');
const Listing = require('./models/Listing');
const BookingRequest = require('./models/BookingRequest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Counter for generating unique emails
let userCounter = 0;

// Test utilities
const createTestUser = async (userData = {}) => {
  userCounter++;
  const defaultUser = {
    name: 'Test User',
    email: `test${userCounter}@example.com`,
    password: await bcrypt.hash('password123', 10),
    role: 'guest',
    ...userData
  };
  
  const user = new User(defaultUser);
  await user.save();
  return user;
};

const createTestListing = async (listingData = {}) => {
  const host = await createTestUser({ role: 'host' });
  
  const defaultListing = {
    title: 'Test Property',
    description: 'A beautiful test property',
    location: 'Test City, Test Country',
    city: 'Test City',
    country: 'Test Country',
    price: 100,
    type: 'apartment',
    latitude: 40.7128,
    longitude: -74.006,
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    host: host._id,
    language: 'en',
    ...listingData
  };
  
  const listing = new Listing(defaultListing);
  await listing.save();
  return listing;
};

const createTestBooking = async (bookingData = {}) => {
  let guest = bookingData.guest;
  let listing = bookingData.listing;
  
  if (!guest) {
    guest = await createTestUser({ role: 'guest' });
  }
  
  if (!listing) {
    listing = await createTestListing();
  }
  // Always fetch the listing from DB and populate host
  listing = await Listing.findById(listing._id || listing).exec();

  // Calculate start and end dates
  const startDate = bookingData.startDate ? new Date(bookingData.startDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);
  const endDate = bookingData.endDate ? new Date(bookingData.endDate) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const guests = bookingData.guests || 2;
  const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const totalPrice = bookingData.totalPrice || (nights * (listing.price || 100));

  const defaultBooking = {
    guest: guest._id,
    host: listing.host,
    listing: listing._id,
    startDate,
    endDate,
    guests,
    totalPrice,
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
  mongoose
}; 