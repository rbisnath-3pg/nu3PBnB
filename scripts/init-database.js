const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Content = require('../models/Content');
const BookingRequest = require('../models/BookingRequest');
const Review = require('../models/Review');
const Message = require('../models/Message');
const Feedback = require('../models/Feedback');
const { faker } = require('@faker-js/faker');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// List of global cities for randomization
const cities = [
  { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.006 },
  { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { city: 'Tokyo', country: 'Japan', lat: 35.6895, lng: 139.6917 },
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
  { city: 'Cape Town', country: 'South Africa', lat: -33.9249, lng: 18.4241 },
  { city: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729 },
  { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
  { city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832 },
  { city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 },
  { city: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018 },
  { city: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.405 },
  { city: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6173 },
  { city: 'Mumbai', country: 'India', lat: 19.076, lng: 72.8777 },
  { city: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784 },
  { city: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
  { city: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.978 },
  { city: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332 },
  { city: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437 },
  { city: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734 },
  { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { city: 'Hong Kong', country: 'China', lat: 22.3193, lng: 114.1694 },
  { city: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816 },
  { city: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194 },
  { city: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393 },
  { city: 'Auckland', country: 'New Zealand', lat: -36.8485, lng: 174.7633 },
  { city: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357 },
  { city: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792 },
  { city: 'Hanoi', country: 'Vietnam', lat: 21.0285, lng: 105.8542 },
  { city: 'Kuala Lumpur', country: 'Malaysia', lat: 3.139, lng: 101.6869 },
  { city: 'Santiago', country: 'Chile', lat: -33.4489, lng: -70.6693 },
  { city: 'Prague', country: 'Czech Republic', lat: 50.0755, lng: 14.4378 },
  { city: 'Dublin', country: 'Ireland', lat: 53.3498, lng: -6.2603 },
  { city: 'Budapest', country: 'Hungary', lat: 47.4979, lng: 19.0402 },
  { city: 'Warsaw', country: 'Poland', lat: 52.2297, lng: 21.0122 },
  { city: 'Helsinki', country: 'Finland', lat: 60.1699, lng: 24.9384 },
  { city: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686 },
  { city: 'Vienna', country: 'Austria', lat: 48.2082, lng: 16.3738 },
  { city: 'Zurich', country: 'Switzerland', lat: 47.3769, lng: 8.5417 },
  { city: 'Brussels', country: 'Belgium', lat: 50.8503, lng: 4.3517 },
  { city: 'Copenhagen', country: 'Denmark', lat: 55.6761, lng: 12.5683 }
];

const propertyTypes = ['Apartment', 'House', 'Villa', 'Cottage', 'Loft', 'Studio', 'Bungalow', 'Cabin', 'Penthouse', 'Townhouse'];

// Guaranteed working Unsplash image URLs with proper formatting
const guaranteedImages = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1519974719765-e6559eac2575?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1460474647541-4edd0cd0c746?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600566753376-12c8ab8c8a2f?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1460474647541-4edd0cd0c746?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1519974719765-e6559eac2575?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop'
];

// Function to generate multiple random images for a listing
function generateListingImages() {
  const numImages = Math.floor(Math.random() * 4) + 3; // 3-6 images per listing
  const selectedImages = [];
  
  // Shuffle the array to get random images
  const shuffled = [...guaranteedImages].sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < numImages && i < shuffled.length; i++) {
    selectedImages.push(shuffled[i]);
  }
  
  return selectedImages;
}

// Database initialization script
async function initializeDatabase(forceReset = false) {
  try {
    console.log('🔧 Initializing database with comprehensive data...');
    
    // Check if database is already initialized (unless force reset)
    if (!forceReset) {
      const isInitialized = await checkIfInitialized();
      if (isInitialized) {
        console.log('✅ Database already initialized, skipping...');
        console.log('💡 Use --reset flag to force re-initialization');
        return;
      }
    } else {
      console.log('🔄 Force reset mode - re-initializing database...');
      // Clear existing data
      await clearExistingData();
    }

    // Create indexes for all collections
    await createIndexes();
    
    // Create comprehensive seed data
    await createComprehensiveSeedData();
    
    // Mark database as initialized
    await markAsInitialized();
    
    console.log('✅ Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Check if database has been initialized before
async function checkIfInitialized() {
  try {
    // Check if admin user exists (indicates initialization)
    const adminUser = await User.findOne({ role: 'admin' });
    return !!adminUser;
  } catch (error) {
    console.log('Database not yet initialized');
    return false;
  }
}

// Create database indexes for performance
async function createIndexes() {
  console.log('📊 Creating database indexes...');
  
  // User indexes
  await User.collection.createIndex({ email: 1 }, { unique: true });
  await User.collection.createIndex({ role: 1 });
  await User.collection.createIndex({ createdAt: -1 });
  
  // Listing indexes
  await Listing.collection.createIndex({ host: 1 });
  await Listing.collection.createIndex({ price: 1 });
  await Listing.collection.createIndex({ featured: 1 });
  await Listing.collection.createIndex({ status: 1 });
  await Listing.collection.createIndex({ createdAt: -1 });
  await Listing.collection.createIndex({ 
    title: 'text', 
    description: 'text', 
    location: 'text' 
  });
  
  // Content indexes
  await Content.collection.createIndex({ key: 1 }, { unique: true });
  await Content.collection.createIndex({ language: 1 });
  
  console.log('✅ Database indexes created');
}

// Create comprehensive seed data
async function createComprehensiveSeedData() {
  console.log('🌱 Creating comprehensive seed data...');
  
  // Create admin user
  // await createAdminUser();
  // Create comprehensive user data
  // await createComprehensiveUsers();
  // Instead, always seed locked users
  execSync('node scripts/seed-locked-users.js', { stdio: 'inherit' });
  
  // Create comprehensive listings
  await createComprehensiveListings();
  
  // Create content translations
  await createContentTranslations();
  
  console.log('✅ Comprehensive seed data created');
}

// Create comprehensive listings
async function createComprehensiveListings() {
  console.log('🏠 Creating comprehensive listings...');
  
  const hosts = await User.find({ role: 'host' }).limit(10);
  if (hosts.length === 0) {
    console.log('⚠️ No host users found, skipping listings creation');
    return;
  }

  // Create 40 listings, randomly assigned to hosts and cities
  const listings = [];
  for (let i = 0; i < 40; i++) {
    const cityObj = cities[Math.floor(Math.random() * cities.length)];
    const host = hosts[Math.floor(Math.random() * hosts.length)];
    const type = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    const price = Math.floor(Math.random() * 400) + 50;
    const location = `${faker.location.streetAddress()}, ${cityObj.city}, ${cityObj.country}`;
    
    // Generate multiple guaranteed working images
    const photos = generateListingImages();
    
    // Calculate random coordinates within the city area
    const latitude = cityObj.lat + (Math.random() - 0.5) * 0.1;
    const longitude = cityObj.lng + (Math.random() - 0.5) * 0.1;
    
    // Mark first 6 listings as featured (15% of total)
    const featured = i < 6;
    
    const listing = new Listing({
      title: `${type} in ${cityObj.city}`,
      description: faker.lorem.paragraph(),
      host: host._id,
      location,
      city: cityObj.city,
      country: cityObj.country,
      price,
      type,
      photos,
      latitude,
      longitude,
      amenities: faker.helpers.arrayElements(['wifi', 'kitchen', 'parking', 'pool', 'air conditioning', 'pet friendly', 'washer', 'dryer', 'heating', 'tv'], Math.floor(Math.random() * 5) + 3),
      maxGuests: Math.floor(Math.random() * 6) + 2,
      bedrooms: Math.floor(Math.random() * 4) + 1,
      bathrooms: Math.floor(Math.random() * 3) + 1,
      available: true,
      featured: featured,
      averageRating: 4.0 + Math.random() * 1.0, // 4.0 to 5.0
      reviewCount: Math.floor(Math.random() * 50) + 5
    });
    await listing.save();
    listings.push(listing);
    console.log(`Created listing ${i + 1}/40: ${listing.title} with ${photos.length} images${featured ? ' (FEATURED)' : ''}`);
  }
  
  console.log('✅ Comprehensive listings created');
}

// Create content translations
async function createContentTranslations() {
  const contentData = [
    { key: 'home.hero.title', title: 'Find Your Perfect Stay', content: 'Find Your Perfect Stay', section: 'hero', language: 'en' },
    { key: 'nav.home', title: 'Home', content: 'Home', section: 'homepage', language: 'en' },
    { key: 'common.loading', title: 'Loading...', content: 'Loading...', section: 'general', language: 'en' },
    { key: 'nav.logout', title: 'Logout', content: 'Logout', section: 'footer', language: 'en' },
    { key: 'home.hero.subtitle', title: 'Discover amazing places to stay', content: 'Discover amazing places to stay', section: 'hero', language: 'en' },
    { key: 'home.featured.title', title: 'Featured Properties', content: 'Featured Properties', section: 'homepage', language: 'en' },
    { key: 'listing.price.per_night', title: 'per night', content: 'per night', section: 'general', language: 'en' },
    { key: 'listing.amenities.title', title: 'Amenities', content: 'Amenities', section: 'general', language: 'en' },
    { key: 'booking.book_now', title: 'Book Now', content: 'Book Now', section: 'general', language: 'en' },
    { key: 'auth.sign_in', title: 'Sign In', content: 'Sign In', section: 'general', language: 'en' },
    { key: 'auth.sign_up', title: 'Sign Up', content: 'Sign Up', section: 'general', language: 'en' }
  ];

  for (const content of contentData) {
    const existingContent = await Content.findOne({ key: content.key, language: content.language });
    if (!existingContent) {
      const newContent = new Content(content);
      await newContent.save();
    }
  }
  console.log('📝 Content translations created');
}

// Mark database as initialized
async function markAsInitialized() {
  // Create a simple marker in the database
  const initMarker = new Content({
    key: 'database_initialized',
    title: 'Database Initialized',
    content: new Date().toISOString(),
    section: 'general',
    language: 'en'
  });
  await initMarker.save();
}

// Clear existing data for reset
async function clearExistingData() {
  console.log('🗑️ Clearing existing data...');
  
  try {
    // Clear all collections except system collections
    const collections = ['users', 'listings', 'contents', 'bookingrequests', 'payments', 'messages', 'reviews', 'useractivities', 'feedback'];
    
    for (const collectionName of collections) {
      try {
        await mongoose.connection.db.collection(collectionName).deleteMany({});
        console.log(`✅ Cleared ${collectionName} collection`);
      } catch (error) {
        console.log(`⚠️ Could not clear ${collectionName}: ${error.message}`);
      }
    }
    
    console.log('✅ Existing data cleared');
  } catch (error) {
    console.error('❌ Error clearing existing data:', error);
    throw error;
  }
}

// Export the initialization function
module.exports = { initializeDatabase };

// Run initialization if this script is executed directly
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const forceReset = args.includes('--reset');
  
  // Connect to MongoDB
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nu3pbnb';
  
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('📦 Connected to MongoDB');
      return initializeDatabase(forceReset);
    })
    .then(() => {
      console.log('🎉 Database initialization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database initialization failed:', error);
      process.exit(1);
    });
} 