require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Listing = require('./models/Listing');
const BookingRequest = require('./models/BookingRequest');
const Review = require('./models/Review');
const Message = require('./models/Message');
const Feedback = require('./models/Feedback');
const { faker } = require('@faker-js/faker');
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

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Listing.deleteMany({});
    await BookingRequest.deleteMany({});
    await Review.deleteMany({});
    await Message.deleteMany({});
    await Feedback.deleteMany({});
    console.log('Cleared existing data');

    // Always seed locked users
    execSync('node scripts/seed-locked-users.js', { stdio: 'inherit' });

    // Create 40 listings, randomly assigned to hosts and cities
    console.log('Creating listings...');
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
      });
      await listing.save();
      listings.push(listing);
      console.log(`Created listing ${i + 1}/40: ${listing.title} with ${photos.length} images${featured ? ' (FEATURED)' : ''}`);
    }

    console.log('Seeding completed successfully!');
    console.log(`Created: 40 listings`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

async function createListingsForHosts() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hosts = await User.find({ role: 'host' });
  const propertyTypes = ['Apartment', 'House', 'Condo', 'Villa', 'Cabin', 'Loft'];
  const locations = [
    { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
    { city: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437 },
    { city: 'Chicago', country: 'USA', lat: 41.8781, lng: -87.6298 },
    { city: 'Miami', country: 'USA', lat: 25.7617, lng: -80.1918 },
    { city: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194 },
    { city: 'Seattle', country: 'USA', lat: 47.6062, lng: -122.3321 }
  ];
  const amenities = ['WiFi', 'Kitchen', 'Free parking', 'Air conditioning', 'Heating', 'Washer', 'Dryer', 'TV', 'Pool', 'Gym', 'Balcony', 'Garden'];
  const adjectives = ['Cozy', 'Modern', 'Luxurious', 'Charming', 'Spacious', 'Elegant', 'Stylish', 'Comfortable'];
  const imagePool = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1519974719765-e6559eac2575?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1460474647541-4edd0cd0c746?w=800&h=600&fit=crop'
  ];
  for (const host of hosts) {
    for (let i = 0; i < 3; i++) {
      const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const price = Math.floor(Math.random() * 400) + 50;
      const randomAmenities = amenities.sort(() => 0.5 - Math.random()).slice(0, 5);
      // Pick 2-5 random images for each listing
      const shuffledImages = imagePool.sort(() => 0.5 - Math.random());
      const numImages = Math.floor(Math.random() * 4) + 2; // 2-5 images
      const photos = shuffledImages.slice(0, numImages);
      
      // Mark some listings as featured (randomly)
      const featured = Math.random() < 0.2; // 20% chance of being featured
      
      const listing = new Listing({
        title: `${adjective} ${propertyType} in ${location.city}`,
        description: `Beautiful ${propertyType.toLowerCase()} located in the heart of ${location.city}. This ${adjective.toLowerCase()} property offers all the amenities you need for a comfortable stay. Perfect for both business and leisure travelers.`,
        location: `${location.city}, ${location.country}`,
        city: location.city,
        country: location.country,
        price,
        type: propertyType,
        photos,
        latitude: location.lat + (Math.random() - 0.5) * 0.1,
        longitude: location.lng + (Math.random() - 0.5) * 0.1,
        amenities: randomAmenities,
        maxGuests: Math.floor(Math.random() * 6) + 2,
        bedrooms: Math.floor(Math.random() * 4) + 1,
        bathrooms: Math.floor(Math.random() * 3) + 1,
        available: true,
        featured: featured,
        host: host._id
      });
      await listing.save();
      console.log(`Created listing for host ${host.email}${featured ? ' (FEATURED)' : ''}`);
    }
  }
  await mongoose.disconnect();
  console.log('Done creating listings for all hosts.');
}

if (process.argv.includes('--host-listings')) {
  createListingsForHosts();
} else {
  seed();
} 