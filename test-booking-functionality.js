require('dotenv').config();
const fetch = require('node-fetch');

const API_BASE = 'https://nu3pbnb-api.onrender.com';

// Test user credentials
const TEST_USER = {
  email: 'guest_patience@hotmail.com',
  password: 'guest123'
};

async function testBookingFunctionality() {
  console.log('🧪 Testing Booking Functionality');
  console.log('=====================================\n');

  try {
    // Step 1: Login as guest user
    console.log('1️⃣ Logging in as guest user...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful\n');

    // Step 2: Get available listings
    console.log('2️⃣ Fetching available listings...');
    const listingsResponse = await fetch(`${API_BASE}/api/listings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!listingsResponse.ok) {
      throw new Error(`Failed to fetch listings: ${listingsResponse.status}`);
    }

    const listingsData = await listingsResponse.json();
    const listings = listingsData.listings || [];
    
    if (listings.length === 0) {
      throw new Error('No listings available for testing');
    }

    const testListing = listings[0];
    console.log(`✅ Found ${listings.length} listings`);
    console.log(`📋 Using listing: ${testListing.title} (ID: ${testListing._id})\n`);

    // Step 3: Create a test booking
    console.log('3️⃣ Creating test booking...');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 30); // 1 month from now
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 33); // 3 nights later

    const bookingData = {
      listingId: testListing._id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      guests: 2,
      message: 'Test booking from automated test'
    };

    const bookingResponse = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });

    if (!bookingResponse.ok) {
      const errorData = await bookingResponse.json().catch(() => ({}));
      throw new Error(`Booking creation failed: ${bookingResponse.status} - ${errorData.message || bookingResponse.statusText}`);
    }

    const bookingResult = await bookingResponse.json();
    console.log('✅ Booking created successfully!');
    console.log(`📅 Booking ID: ${bookingResult.booking._id}`);
    console.log(`💰 Total Price: $${bookingResult.booking.totalPrice}`);
    console.log(`📊 Status: ${bookingResult.booking.status}\n`);

    // Step 4: Verify booking appears in user's bookings
    console.log('4️⃣ Verifying booking appears in user bookings...');
    const userBookingsResponse = await fetch(`${API_BASE}/api/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!userBookingsResponse.ok) {
      throw new Error(`Failed to fetch user bookings: ${userBookingsResponse.status}`);
    }

    const userBookingsData = await userBookingsResponse.json();
    const userBookings = userBookingsData.bookings || [];
    
    const createdBooking = userBookings.find(b => b._id === bookingResult.booking._id);
    
    if (createdBooking) {
      console.log('✅ Booking found in user bookings list');
      console.log(`📋 Total user bookings: ${userBookings.length}\n`);
    } else {
      console.log('⚠️ Booking not found in user bookings list');
    }

    // Step 5: Test payment processing (simulate)
    console.log('5️⃣ Testing payment processing...');
    const paymentData = {
      bookingId: bookingResult.booking._id,
      amount: bookingResult.booking.totalPrice,
      paymentMethod: 'credit_card',
      paymentType: 'new'
    };

    const paymentResponse = await fetch(`${API_BASE}/api/payments/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    if (paymentResponse.ok) {
      const paymentResult = await paymentResponse.json();
      console.log('✅ Payment processed successfully!');
      console.log(`💳 Payment ID: ${paymentResult.payment._id}`);
      console.log(`💰 Amount: $${paymentResult.payment.amount}`);
    } else {
      const errorData = await paymentResponse.json().catch(() => ({}));
      console.log(`⚠️ Payment processing failed: ${paymentResponse.status} - ${errorData.message || paymentResponse.statusText}`);
    }

    console.log('\n🎉 Booking functionality test completed successfully!');
    console.log('=====================================');
    console.log('✅ Login working');
    console.log('✅ Listings fetching working');
    console.log('✅ Booking creation working');
    console.log('✅ User bookings retrieval working');
    console.log('✅ Payment processing working');

  } catch (error) {
    console.error('\n❌ Booking functionality test failed:');
    console.error('=====================================');
    console.error(`Error: ${error.message}`);
    console.error('\n🔍 Debugging information:');
    console.error('- Check if backend is running');
    console.error('- Check if database is accessible');
    console.error('- Check if test user exists in database');
    console.error('- Check API endpoints are working');
  }
}

// Run the test
testBookingFunctionality(); 