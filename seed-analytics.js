const mongoose = require('mongoose');
const User = require('./models/User');
const Listing = require('./models/Listing');
const BookingRequest = require('./models/BookingRequest');
const Payment = require('./models/Payment');
const UserActivity = require('./models/UserActivity');

async function seedAnalytics() {
  try {
    await mongoose.connect('mongodb://localhost:27017/nu3pbnb');
    console.log('Connected to MongoDB');

    // Get existing users, listings, and bookings
    const users = await User.find({ role: { $in: ['guest', 'host'] } });
    const listings = await Listing.find();
    const bookings = await BookingRequest.find();

    console.log(`Found ${users.length} users, ${listings.length} listings, ${bookings.length} bookings`);

    if (users.length === 0 || listings.length === 0) {
      console.log('Need users and listings first. Please run seed.js first.');
      return;
    }

    // Clear existing analytics data
    await UserActivity.deleteMany({});
    console.log('Cleared existing user activity data');

    // Only generate data for the last 7 days
    const now = new Date();
    const bookingStatuses = ['pending', 'approved', 'confirmed', 'cancelled', 'declined'];
    const newBookings = [];
    const activities = [];
    const propertyVisitActivities = [];
    const payments = [];
    const wishlistUpdates = [];
    const bounceEvents = [];

    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      // --- Bookings ---
      const bookingsToday = Math.floor(Math.random() * 6) + 5; // 5-10 bookings per day
      for (let j = 0; j < bookingsToday; j++) {
        const guest = users.find(u => u.role === 'guest');
        const listing = listings[Math.floor(Math.random() * listings.length)];
        const status = bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)];
        const startDate = new Date(day.getTime() + (Math.random() * 2) * 24 * 60 * 60 * 1000);
        const endDate = new Date(startDate.getTime() + (Math.random() * 7 + 1) * 24 * 60 * 60 * 1000);
        const nights = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000));
        const totalPrice = listing.price * nights;
        const bookingCreatedAt = new Date(day.getTime() + Math.random() * 24 * 60 * 60 * 1000);
        const booking = new BookingRequest({
          guest: guest._id,
          listing: listing._id,
          host: listing.host,
          startDate,
          endDate,
          guests: Math.floor(Math.random() * 4) + 1,
          totalPrice,
          status,
          paymentStatus: status === 'approved' || status === 'confirmed' ? 'paid' : 'pending',
          createdAt: bookingCreatedAt
        });
        newBookings.push(booking);
        // --- Payments for paid bookings ---
        if (status === 'approved' || status === 'confirmed') {
          payments.push(new Payment({
            user: guest._id,
            booking: booking._id,
            amount: totalPrice,
            paymentMethod: 'credit_card',
            paymentStatus: 'completed',
            transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: bookingCreatedAt
          }));
        }
      }
      // --- Property Visits ---
      const visitsToday = Math.floor(Math.random() * 21) + 10; // 10-30 visits per day
      for (let j = 0; j < visitsToday; j++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const listing = listings[Math.floor(Math.random() * listings.length)];
        const timestamp = new Date(day.getTime() + Math.random() * 24 * 60 * 60 * 1000);
        propertyVisitActivities.push({
          userId: user._id,
          sessionId: `session_${user._id}_${Date.now()}_${Math.random()}`,
          eventType: 'page_view',
          page: `/listings/${listing._id}`,
          listing: listing._id,
          timestamp,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        });
      }
      // --- User Activity (page views, clicks, sessions, bounces) ---
      const dailyActivities = Math.floor(Math.random() * 40) + 10;
      for (let k = 0; k < dailyActivities; k++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const timestamp = new Date(day.getTime() + Math.random() * 24 * 60 * 60 * 1000);
        const sessionId = `session_${user._id}_${Date.now()}_${Math.random()}`;
        const activityTypes = [
          { eventType: 'page_view', page: '/' },
          { eventType: 'page_view', page: '/listings' },
          { eventType: 'page_view', page: '/search' },
          { eventType: 'click', element: 'search_button', elementType: 'button', page: '/' },
          { eventType: 'click', element: 'wishlist_button', elementType: 'button', page: '/listings' },
          { eventType: 'click', element: 'book_now', elementType: 'button', page: '/listings' },
          { eventType: 'session_start', page: '/' },
          { eventType: 'session_end', page: '/', timeSpent: Math.floor(Math.random() * 1800) + 300 }
        ];
        if (listings.length > 0) {
          const randomListing = listings[Math.floor(Math.random() * listings.length)];
          activityTypes.push(
            { eventType: 'page_view', page: `/listings/${randomListing._id}` },
            { eventType: 'click', element: 'view_photos', elementType: 'button', page: `/listings/${randomListing._id}` },
            { eventType: 'click', element: 'contact_host', elementType: 'button', page: `/listings/${randomListing._id}` }
          );
        }
        const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const activity = {
          userId: user._id,
          sessionId,
          eventType: activityType.eventType,
          page: activityType.page,
          element: activityType.element,
          elementType: activityType.elementType,
          timestamp,
          timeSpent: activityType.timeSpent || 0,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        };
        if (activityType.page && activityType.page.includes('/listings/')) {
          const listingId = activityType.page.split('/listings/')[1];
          activity.listing = listingId;
        }
        activities.push(activity);
      }
      // --- Bounces ---
      const bounceCount = Math.floor(dailyActivities * 0.1);
      for (let b = 0; b < bounceCount; b++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const timestamp = new Date(day.getTime() + Math.random() * 24 * 60 * 60 * 1000);
        bounceEvents.push({
          userId: user._id,
          sessionId: `session_${user._id}_${Date.now()}_${Math.random()}`,
          eventType: 'bounce',
          page: '/',
          timestamp,
          timeSpent: Math.floor(Math.random() * 60),
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        });
      }
    }

    // Insert all generated data
    await BookingRequest.insertMany(newBookings);
    await Payment.insertMany(payments);
    await UserActivity.insertMany(activities);
    await UserActivity.insertMany(propertyVisitActivities);
    await UserActivity.insertMany(bounceEvents);
    console.log(`Seeded last 7 days: ${newBookings.length} bookings, ${payments.length} payments, ${activities.length} activities, ${propertyVisitActivities.length} property visits, ${bounceEvents.length} bounces.`);

    // Generate wishlist data
    for (const user of users) {
      if (user.role === 'guest') {
        // Each guest adds 1-5 listings to wishlist
        const wishlistCount = Math.floor(Math.random() * 5) + 1;
        const userWishlist = [];
        
        for (let i = 0; i < wishlistCount; i++) {
          const randomListing = listings[Math.floor(Math.random() * listings.length)];
          if (!userWishlist.includes(randomListing._id)) {
            userWishlist.push(randomListing._id);
          }
        }
        
        wishlistUpdates.push(
          User.updateOne(
            { _id: user._id },
            { $set: { wishlist: userWishlist } }
          )
        );
      }
    }

    await Promise.all(wishlistUpdates);
    console.log(`Updated wishlists for ${wishlistUpdates.length} users`);

    console.log('\n✅ Analytics data seeding completed!');
    console.log('\n📊 Generated data includes:');
    console.log(`   • ${activities.length} user activities`);
    console.log(`   • ${newBookings.length} additional bookings`);
    console.log(`   • ${payments.length} payments`);
    console.log(`   • ${wishlistUpdates.length} wishlist updates`);
    console.log(`   • ${bounceEvents.length} bounce events`);
    console.log(`   • ${propertyVisitActivities.length} property visit activities`);
    console.log('\n🎯 All admin analytics metrics should now show realistic data!');

  } catch (error) {
    console.error('Error seeding analytics data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedAnalytics(); 