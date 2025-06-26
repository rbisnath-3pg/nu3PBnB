const mongoose = require('mongoose');
const User = require('./models/User');
const Listing = require('./models/Listing');
const BookingRequest = require('./models/BookingRequest');
const Payment = require('./models/Payment');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/nu3pbnb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestBookings() {
  console.log('❌ Test booking creation DISABLED - No booking data should be created');
  return;
  
  /*
  try {
    console.log('Creating test bookings and payments for all guests...');

    // Find all guest users
    const guestUsers = await User.find({ role: 'guest' });
    if (!guestUsers.length) {
      console.log('No guest users found. Please run the main seed script first.');
      return;
    }

    // Find some listings
    const listings = await Listing.find().limit(3);
    if (listings.length === 0) {
      console.log('No listings found. Please run the main seed script first.');
      return;
    }

    for (const guestUser of guestUsers) {
      // Create sample bookings
      const bookings = [];
      for (let i = 0; i < 3; i++) {
        const listing = listings[i];
        const checkIn = new Date();
        checkIn.setDate(checkIn.getDate() + 7 + (i * 7)); // 1, 2, 3 weeks from now
        const checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + 3 + i); // 3-5 nights
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const totalPrice = listing.price * nights;
        const numGuests = 2;
        const booking = new BookingRequest({
          guest: guestUser._id,
          host: listing.host,
          listing: listing._id,
          startDate: checkIn,
          endDate: checkOut,
          guests: numGuests,
          totalPrice: totalPrice,
          status: i === 0 ? 'approved' : (i === 1 ? 'pending' : 'approved'),
          message: `Sample booking ${i + 1} with special requests`,
          paymentStatus: i === 0 ? 'paid' : (i === 1 ? 'pending' : 'paid')
        });

        const savedBooking = await booking.save();
        bookings.push(savedBooking);
        console.log(`Guest: ${guestUser.email} - Created booking ${i + 1}: ${listing.title} - ${booking.status}`);
      }

      // Create sample payments for the bookings
      for (let i = 0; i < bookings.length; i++) {
        const booking = bookings[i];
        const listing = listings[i];
        const daysDiff = Math.ceil((booking.endDate - booking.startDate) / (1000 * 60 * 60 * 24));
        const totalPrice = listing.price * daysDiff;
        
        const payment = new Payment({
          user: guestUser._id,
          booking: booking._id,
          amount: totalPrice,
          currency: 'USD',
          paymentMethod: i === 0 ? 'paypal' : (i === 1 ? 'apple_pay' : 'system_generated'),
          paymentStatus: i === 0 ? 'completed' : (i === 1 ? 'pending' : 'completed'),
          transactionId: `TXN_${Date.now()}_${i}_${guestUser._id}`,
          metadata: {
            description: `Payment for ${listing.title} - ${booking.startDate.toDateString()} to ${booking.endDate.toDateString()}`,
            receiptUrl: `/receipts/${booking._id}`
          }
        });

        const savedPayment = await payment.save();
        console.log(`Guest: ${guestUser.email} - Created payment ${i + 1}: $${payment.amount} - ${payment.paymentStatus}`);
      }

      console.log(`Created ${bookings.length} bookings and ${bookings.length} payments for ${guestUser.email}`);
    }

    console.log('Test bookings and payments created successfully for all guests!');

  } catch (error) {
    console.error('Error creating test bookings:', error);
  } finally {
    mongoose.connection.close();
  }
  */
}

createTestBookings(); 