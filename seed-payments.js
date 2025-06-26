const mongoose = require('mongoose');
const BookingRequest = require('./models/BookingRequest');
const Payment = require('./models/Payment');
const User = require('./models/User');
const Listing = require('./models/Listing');

async function seedPayments() {
  try {
    await mongoose.connect('mongodb://localhost:27017/nu3pbnb');
    console.log('Connected to MongoDB');

    // Find bookings that are pending or approved and have no payment
    const bookings = await BookingRequest.find({
      status: { $in: ['pending', 'approved'] },
      paymentStatus: { $ne: 'paid' }
    }).populate('guest').populate('listing');

    let paymentsCreated = 0;
    for (const booking of bookings) {
      // Create a payment for this booking
      const payment = new Payment({
        booking: booking._id,
        user: booking.guest._id,
        amount: booking.totalPrice || booking.listing.price || 100,
        paymentMethod: 'credit_card',
        paymentStatus: 'completed',
        metadata: {
          description: `Seeded payment for ${booking.listing.title}`
        }
      });
      await payment.save();
      // Update booking status
      booking.paymentStatus = 'paid';
      booking.status = 'approved';
      await booking.save();
      paymentsCreated++;
      console.log(`Created payment for booking ${booking._id}`);
    }

    // If not enough payments, create mock bookings and payments (DISABLED)
    /*
    if (paymentsCreated < 5) {
      // Find a guest and a listing
      const guest = await User.findOne({ role: 'guest' });
      const host = await User.findOne({ role: 'host' });
      const listing = await Listing.findOne({});
      if (guest && host && listing) {
        for (let i = 0; i < 5 - paymentsCreated; i++) {
          const booking = new BookingRequest({
            guest: guest._id,
            host: host._id,
            listing: listing._id,
            startDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + (i + 2) * 24 * 60 * 60 * 1000),
            guests: 2,
            totalPrice: listing.price || 100,
            status: 'approved',
            paymentStatus: 'paid',
            message: 'Seeded booking for payment seeding'
          });
          await booking.save();
          const payment = new Payment({
            booking: booking._id,
            user: guest._id,
            amount: booking.totalPrice,
            paymentMethod: 'credit_card',
            paymentStatus: 'completed',
            metadata: {
              description: `Seeded payment for ${listing.title}`
            }
          });
          await payment.save();
          console.log(`Created mock booking and payment: ${booking._id}`);
        }
      } else {
        console.log('Not enough users or listings to create mock bookings/payments.');
      }
    }
    */

    console.log('Seeding payments complete.');
  } catch (error) {
    console.error('Seeding payments failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

seedPayments(); 