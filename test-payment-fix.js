require('dotenv').config();
const fetch = require('node-fetch');

const API_BASE = 'https://nu3pbnb-api.onrender.com';

// Test the payment processing with new booking creation
async function testPaymentWithNewBooking() {
  try {
    // First, login as a guest user
    console.log('🔐 Logging in as guest user...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'Evelyn_Feeney68@gmail.com', 
        password: 'guest123' 
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');

    // Get a listing to book
    console.log('🏠 Fetching listings...');
    const listingsResponse = await fetch(`${API_BASE}/api/listings`);
    if (!listingsResponse.ok) {
      throw new Error(`Failed to fetch listings: ${listingsResponse.status}`);
    }

    const listingsData = await listingsResponse.json();
    const listing = listingsData.listings[0];
    console.log(`✅ Found listing: ${listing.title}`);

    // Test payment processing with new booking creation
    console.log('💳 Testing payment processing with new booking...');
    const paymentData = {
      paymentMethod: 'credit_card',
      amount: 150.00,
      paymentType: 'new',
      bookingData: {
        listingId: listing._id,
        startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endDate: new Date(Date.now() + 2 * 86400000).toISOString(), // Day after tomorrow
        guests: 2,
        totalPrice: 150.00,
        message: 'Test booking via payment processing'
      }
    };

    const paymentResponse = await fetch(`${API_BASE}/api/payments/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    console.log(`Payment response status: ${paymentResponse.status}`);

    if (paymentResponse.ok) {
      const paymentResult = await paymentResponse.json();
      console.log('✅ Payment processed successfully!');
      console.log('Payment result:', JSON.stringify(paymentResult, null, 2));
      
      if (paymentResult.bookingId) {
        console.log(`✅ Booking created with ID: ${paymentResult.bookingId}`);
      }
      
      if (paymentResult.bookingApproved) {
        console.log('✅ Booking automatically approved!');
      }
    } else {
      const errorData = await paymentResponse.json();
      console.error('❌ Payment failed:', errorData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test the payment processing with existing booking
async function testPaymentWithExistingBooking() {
  try {
    // First, login as a guest user
    console.log('\n🔐 Logging in as guest user for existing booking test...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'Evelyn_Feeney68@gmail.com', 
        password: 'guest123' 
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');

    // Get user's bookings
    console.log('📋 Fetching user bookings...');
    const bookingsResponse = await fetch(`${API_BASE}/api/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!bookingsResponse.ok) {
      throw new Error(`Failed to fetch bookings: ${bookingsResponse.status}`);
    }

    const bookingsData = await bookingsResponse.json();
    const booking = bookingsData.bookings[0];
    
    if (!booking) {
      console.log('⚠️ No existing bookings found, skipping existing booking test');
      return;
    }

    console.log(`✅ Found existing booking: ${booking._id}`);

    // Test payment processing with existing booking
    console.log('💳 Testing payment processing with existing booking...');
    const paymentData = {
      bookingId: booking._id,
      paymentMethod: 'credit_card',
      amount: booking.totalPrice,
      paymentType: 'existing'
    };

    const paymentResponse = await fetch(`${API_BASE}/api/payments/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    console.log(`Payment response status: ${paymentResponse.status}`);

    if (paymentResponse.ok) {
      const paymentResult = await paymentResponse.json();
      console.log('✅ Payment processed successfully!');
      console.log('Payment result:', JSON.stringify(paymentResult, null, 2));
      
      if (paymentResult.bookingApproved) {
        console.log('✅ Booking automatically approved!');
      }
    } else {
      const errorData = await paymentResponse.json();
      console.error('❌ Payment failed:', errorData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
async function runTests() {
  console.log('🧪 Testing Payment Processing Fix\n');
  
  await testPaymentWithNewBooking();
  await testPaymentWithExistingBooking();
  
  console.log('\n✅ All tests completed!');
}

runTests(); 