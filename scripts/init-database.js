const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Content = require('../models/Content');
const path = require('path');
const fs = require('fs');

// Database initialization script
async function initializeDatabase(forceReset = false) {
  try {
    console.log('🔧 Initializing database...');
    
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
    
    // Create seed data
    await createSeedData();
    
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
  await Listing.collection.createIndex({ location: 1 });
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

// Create initial seed data
async function createSeedData() {
  console.log('🌱 Creating seed data...');
  
  // Create admin user
  await createAdminUser();
  
  // Create sample host users
  await createSampleHosts();
  
  // Create sample listings
  await createSampleListings();
  
  // Create content translations
  await createContentTranslations();
  
  console.log('✅ Seed data created');
}

// Create admin user
async function createAdminUser() {
  const adminExists = await User.findOne({ email: 'admin@nu3pbnb.com' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@nu3pbnb.com',
      password: hashedPassword,
      role: 'admin',
      emailVerified: true,
      profile: {
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        bio: 'System administrator for nu3PBnB platform',
        phone: '+1-555-0123'
      }
    });
    await adminUser.save();
    console.log('👤 Admin user created');
  }
}

// Create sample host users
async function createSampleHosts() {
  const hosts = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'host',
      profile: {
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        bio: 'Experienced host with beautiful properties in downtown area',
        phone: '+1-555-0101'
      }
    },
    {
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      password: 'password123',
      role: 'host',
      profile: {
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        bio: 'Professional host offering luxury accommodations',
        phone: '+1-555-0102'
      }
    },
    {
      name: 'Mike Johnson',
      email: 'mike@example.com',
      password: 'password123',
      role: 'host',
      profile: {
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        bio: 'Local host with cozy suburban properties',
        phone: '+1-555-0103'
      }
    }
  ];

  for (const hostData of hosts) {
    const existingHost = await User.findOne({ email: hostData.email });
    if (!existingHost) {
      const hashedPassword = await bcrypt.hash(hostData.password, 10);
      const host = new User({
        ...hostData,
        password: hashedPassword,
        emailVerified: true
      });
      await host.save();
    }
  }
  console.log('👥 Sample host users created');
}

// Create sample listings
async function createSampleListings() {
  const hosts = await User.find({ role: 'host' }).limit(3);
  if (hosts.length === 0) {
    console.log('⚠️ No host users found, skipping listings creation');
    return;
  }

  const listings = [
    {
      title: 'Beautiful Downtown Apartment',
      description: 'A lovely apartment in the city center with stunning views and modern amenities. Perfect for business travelers or couples looking for a comfortable stay.',
      location: 'Downtown',
      city: 'New York',
      country: 'USA',
      price: 150,
      type: 'apartment',
      latitude: 40.7128,
      longitude: -74.0060,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 1,
      photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
      amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'TV', 'Washer/Dryer'],
      featured: true,
      host: hosts[0]._id
    },
    {
      title: 'Cozy Suburban House',
      description: 'A charming house in a quiet suburban neighborhood. Perfect for families with plenty of space and a beautiful garden.',
      location: 'Suburbs',
      city: 'Los Angeles',
      country: 'USA',
      price: 200,
      type: 'house',
      latitude: 34.0522,
      longitude: -118.2437,
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 2,
      photos: ['photo4.jpg', 'photo5.jpg', 'photo6.jpg'],
      amenities: ['WiFi', 'Kitchen', 'Garden', 'Parking', 'Fireplace'],
      featured: true,
      host: hosts[1]._id
    },
    {
      title: 'Luxury Penthouse Suite',
      description: 'Exclusive penthouse with panoramic city views. High-end finishes and premium amenities for the discerning traveler.',
      location: 'Uptown',
      city: 'Chicago',
      country: 'USA',
      price: 350,
      type: 'penthouse',
      latitude: 41.8781,
      longitude: -87.6298,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 2,
      photos: ['photo7.jpg', 'photo8.jpg', 'photo9.jpg'],
      amenities: ['WiFi', 'Kitchen', 'Balcony', 'Gym', 'Pool', 'Concierge'],
      featured: true,
      host: hosts[2]._id
    },
    {
      title: 'Charming Studio Loft',
      description: 'Modern studio loft with industrial design. Perfect for solo travelers or couples seeking a unique urban experience.',
      location: 'Arts District',
      city: 'San Francisco',
      country: 'USA',
      price: 120,
      type: 'studio',
      latitude: 37.7749,
      longitude: -122.4194,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      photos: ['photo10.jpg', 'photo11.jpg'],
      amenities: ['WiFi', 'Kitchen', 'High Ceilings', 'Art Gallery Access'],
      featured: false,
      host: hosts[0]._id
    },
    {
      title: 'Family-Friendly Villa',
      description: 'Spacious villa with multiple bedrooms and a large backyard. Ideal for families or groups looking for privacy and comfort.',
      location: 'Residential Area',
      city: 'Miami',
      country: 'USA',
      price: 280,
      type: 'villa',
      latitude: 25.7617,
      longitude: -80.1918,
      maxGuests: 8,
      bedrooms: 4,
      bathrooms: 3,
      photos: ['photo12.jpg', 'photo13.jpg', 'photo14.jpg'],
      amenities: ['WiFi', 'Kitchen', 'Backyard', 'BBQ', 'Game Room', 'Parking'],
      featured: false,
      host: hosts[1]._id
    }
  ];

  for (const listingData of listings) {
    const existingListing = await Listing.findOne({ 
      title: listingData.title, 
      host: listingData.host 
    });
    if (!existingListing) {
      const listing = new Listing({
        ...listingData,
        available: true,
        averageRating: 4.5,
        reviewCount: Math.floor(Math.random() * 50) + 5
      });
      await listing.save();
    }
  }
  console.log('🏠 Sample listings created');
}

// Create content translations
async function createContentTranslations() {
  const contentData = [
    { key: 'home.hero.title', title: 'Find Your Perfect Stay', content: 'Find Your Perfect Stay', section: 'hero', language: 'en' },
    { key: 'nav.home', title: 'Home', content: 'Home', section: 'homepage', language: 'en' },
    { key: 'common.loading', title: 'Loading...', content: 'Loading...', section: 'general', language: 'en' },
    { key: 'nav.logout', title: 'Logout', content: 'Logout', section: 'footer', language: 'en' }
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