const mongoose = require('mongoose');
const User = require('./models/User');
const Listing = require('./models/Listing');
const BookingRequest = require('./models/BookingRequest');
const Payment = require('./models/Payment');
const bcrypt = require('bcryptjs');

async function createTestData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/nu3pbnb');
    console.log('Connected to MongoDB');

    // Clear existing test data
    await User.deleteMany({ email: { $in: ['testhost@example.com', 'testguest@example.com'] } });
    await Listing.deleteMany({ title: { $regex: /Test Property/ } });
    await BookingRequest.deleteMany({});
    await Payment.deleteMany({});

    // Create test host
    const hostPassword = await bcrypt.hash('password123', 10);
    const host = new User({
      name: 'Test Host',
      email: 'testhost@example.com',
      password: hostPassword,
      role: 'host',
      profilePicture: 'https://ui-avatars.com/api/?name=Test+Host&background=0D9488&color=fff'
    });
    await host.save();
    console.log('Created test host:', host._id);

    // Create test guest
    const guestPassword = await bcrypt.hash('password123', 10);
    const guest = new User({
      name: 'Test Guest',
      email: 'testguest@example.com',
      password: guestPassword,
      role: 'guest',
      profilePicture: 'https://ui-avatars.com/api/?name=Test+Guest&background=3B82F6&color=fff'
    });
    await guest.save();
    console.log('Created test guest:', guest._id);

    // Create test listings for the host
    const listing1 = new Listing({
      title: 'Test Property 1 - Cozy Apartment',
      description: 'A beautiful cozy apartment in the heart of the city with all modern amenities.',
      location: 'New York, USA',
      city: 'New York',
      country: 'USA',
      price: 150,
      type: 'Apartment',
      photos: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&h=600&fit=crop'
      ],
      latitude: 40.7128,
      longitude: -74.0060,
      amenities: ['WiFi', 'Kitchen', 'Free parking', 'Air conditioning'],
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 1,
      available: true,
      host: host._id,
      language: 'en'
    });
    await listing1.save();
    console.log('Created test listing 1:', listing1._id);

    const listing2 = new Listing({
      title: 'Test Property 2 - Luxury Villa',
      description: 'A stunning luxury villa with pool and garden, perfect for a relaxing getaway.',
      location: 'Los Angeles, USA',
      city: 'Los Angeles',
      country: 'USA',
      price: 300,
      type: 'Villa',
      photos: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop'
      ],
      latitude: 34.0522,
      longitude: -118.2437,
      amenities: ['WiFi', 'Kitchen', 'Pool', 'Garden', 'Gym'],
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 2,
      available: true,
      host: host._id,
      language: 'en'
    });
    await listing2.save();
    console.log('Created test listing 2:', listing2._id);

    // Create test bookings (DISABLED - No booking data should be created)
    /*
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const twoWeeks = new Date(now);
    twoWeeks.setDate(twoWeeks.getDate() + 14);

    // Pending booking
    const pendingBooking = new BookingRequest({
      guest: guest._id,
      listing: listing1._id,
      startDate: tomorrow,
      endDate: nextWeek,
      message: 'Hi! I would love to stay at your beautiful apartment. Is it available for these dates?',
      status: 'pending',
      paymentStatus: 'pending'
    });
    await pendingBooking.save();
    console.log('Created pending booking:', pendingBooking._id);

    // Approved booking
    const approvedBooking = new BookingRequest({
      guest: guest._id,
      listing: listing2._id,
      startDate: nextWeek,
      endDate: twoWeeks,
      message: 'Looking forward to our stay!',
      status: 'approved',
      paymentStatus: 'paid'
    });
    await approvedBooking.save();
    console.log('Created approved booking:', approvedBooking._id);

    // Create payment for approved booking
    const nights = Math.ceil((new Date(approvedBooking.endDate) - new Date(approvedBooking.startDate)) / (1000 * 60 * 60 * 24));
    const paymentAmount = nights * listing2.price;
    
    const payment = new Payment({
      booking: approvedBooking._id,
      user: guest._id,
      amount: paymentAmount,
      currency: 'USD',
      paymentMethod: 'system_generated',
      paymentStatus: 'completed',
      metadata: {
        description: `Payment for ${listing2.title} - ${nights} nights`,
        receiptUrl: `/receipts/${approvedBooking._id}`
      }
    });
    await payment.save();
    console.log('Created payment for approved booking:', payment._id);

    // Declined booking
    const declinedBooking = new BookingRequest({
      guest: guest._id,
      listing: listing1._id,
      startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      endDate: new Date(now.getTime() + 37 * 24 * 60 * 60 * 1000), // 37 days from now
      message: 'Interested in a longer stay',
      status: 'declined',
      paymentStatus: 'pending'
    });
    await declinedBooking.save();
    console.log('Created declined booking:', declinedBooking._id);
    */

    console.log('\n=== Test Data Created Successfully ===');
    console.log('Host Login: testhost@example.com / password123');
    console.log('Guest Login: testguest@example.com / password123');
    console.log('Host ID:', host._id);
    console.log('Guest ID:', guest._id);
    console.log('Listing 1 ID:', listing1._id);
    console.log('Listing 2 ID:', listing2._id);
    console.log('❌ No bookings or payments created (DISABLED)');

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  }
}

createTestData(); 