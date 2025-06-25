require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('./models/Listing');

async function updateFeaturedListings() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all listings
    const listings = await Listing.find({});
    console.log(`Found ${listings.length} listings`);

    // Mark first 6 listings as featured
    const featuredCount = Math.min(6, listings.length);
    for (let i = 0; i < featuredCount; i++) {
      await Listing.findByIdAndUpdate(listings[i]._id, { featured: true });
      console.log(`Marked listing "${listings[i].title}" as featured`);
    }

    // Verify the update
    const featuredListings = await Listing.find({ featured: true });
    console.log(`\nUpdated ${featuredListings.length} listings as featured:`);
    featuredListings.forEach(listing => {
      console.log(`- ${listing.title} (${listing.city}, ${listing.country})`);
    });

    console.log('\nFeatured listings update completed successfully!');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Update error:', error);
    process.exit(1);
  }
}

updateFeaturedListings(); 