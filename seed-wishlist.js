const mongoose = require('mongoose');
const User = require('./models/User');
const Listing = require('./models/Listing');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/nu3pbnb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedWishlist() {
  try {
    console.log('Seeding wishlist data for all guests...');

    // Find all guest users
    const guestUsers = await User.find({ role: 'guest' });
    if (!guestUsers.length) {
      console.log('No guest users found. Please run the main seed script first.');
      return;
    }

    // Find some listings to add to wishlist
    const listings = await Listing.find().limit(5);
    if (listings.length === 0) {
      console.log('No listings found. Please run the main seed script first.');
      return;
    }

    for (const guestUser of guestUsers) {
      guestUser.wishlist = listings.map(listing => listing._id);
      await guestUser.save();
      await guestUser.populate('wishlist');
      console.log(`Guest: ${guestUser.email} - Added ${guestUser.wishlist.length} properties to wishlist:`);
      guestUser.wishlist.forEach((listing, index) => {
        console.log(`${index + 1}. ${listing.title} - $${listing.price}/night`);
      });
    }

    console.log('Wishlist seeding for all guests completed successfully!');
  } catch (error) {
    console.error('Error seeding wishlist:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedWishlist(); 