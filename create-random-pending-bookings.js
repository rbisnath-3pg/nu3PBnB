const mongoose = require('mongoose');
const User = require('./models/User');
const Listing = require('./models/Listing');
const BookingRequest = require('./models/BookingRequest');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function createRandomPendingBookings() {
  console.log('❌ Random pending booking creation DISABLED - No booking data should be created');
  return;
  
  /*
  try {
    await mongoose.connect('mongodb://localhost:27017/nu3pbnb');
    console.log('Connected to MongoDB');

    const guests = await User.find({ role: 'guest' });
    const listings = await Listing.find();
    if (!guests.length || !listings.length) {
      console.log('No guests or listings found. Seed the database first.');
      return;
    }

    for (const guest of guests) {
      // Each guest gets 1-3 new pending bookings
      const numBookings = getRandomInt(1, 3);
      const usedListingIds = new Set();
      for (let i = 0; i < numBookings; i++) {
        // Pick a random listing not already booked by this guest in this run
        let listing;
        let attempts = 0;
        do {
          listing = listings[getRandomInt(0, listings.length - 1)];
          attempts++;
        } while (usedListingIds.has(String(listing._id)) && attempts < 10);
        if (usedListingIds.has(String(listing._id))) continue;
        usedListingIds.add(String(listing._id));

        // Random future dates (between 3 and 30 days from now, 2-7 nights)
        const startOffset = getRandomInt(3, 30);
        const nights = getRandomInt(2, 7);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + startOffset);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + nights);

        // Random guest count (1-4)
        const numGuests = getRandomInt(1, Math.min(4, listing.maxGuests || 4));
        const totalPrice = (listing.price || 100) * nights;

        const booking = new BookingRequest({
          guest: guest._id,
          host: listing.host,
          listing: listing._id,
          startDate,
          endDate,
          guests: numGuests,
          totalPrice,
          status: 'pending',
          paymentStatus: 'pending',
          message: `Random pending booking (${new Date().toISOString()})`
        });
        await booking.save();
        console.log(`Created pending booking for guest ${guest.email} at listing ${listing.title} (${booking._id})`);
      }
    }
    console.log('Random pending bookings created for all guest users!');
  } catch (error) {
    console.error('Error creating random pending bookings:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
  */
}

createRandomPendingBookings(); 