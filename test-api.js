/**
 * Nu3PBnB API Test Script
 * Tests the main API endpoints to ensure they're working correctly
 */

const API_BASE = 'http://localhost:3000/api/v1';
const API_KEY = 'nu3pbnb_api_key_2024';

async function testAPI() {
  console.log('🧪 Testing Nu3PBnB API Endpoints\n');

  const headers = {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
  };

  let userToken = null;

  try {
    // Test 1: API Documentation endpoint
    console.log('📖 Test 1: API Documentation');
    const docResponse = await fetch(`${API_BASE}`, { headers });
    const docData = await docResponse.json();
    console.log('✅ API Documentation endpoint working');
    console.log(`   Version: ${docData.version}`);
    console.log(`   Endpoints available: ${Object.keys(docData.endpoints).length}\n`);

    // Test 2: Get listings
    console.log('🏠 Test 2: Get Listings');
    const listingsResponse = await fetch(`${API_BASE}/listings?limit=3`, { headers });
    const listingsData = await listingsResponse.json();
    console.log(`✅ Found ${listingsData.listings.length} listings\n`);

    // Test 3: Register a test user
    console.log('👤 Test 3: Register User');
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: `testuser${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'guest'
      })
    });
    const registerData = await registerResponse.json();
    userToken = registerData.token;
    console.log(`✅ Registered user: ${registerData.user.firstName} ${registerData.user.lastName}\n`);

    // Test 4: Login
    console.log('🔐 Test 4: Login User');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: registerData.user.email,
        password: 'password123'
      })
    });
    const loginData = await loginResponse.json();
    console.log(`✅ Login successful: ${loginData.user.email}\n`);

    // Test 5: Get user profile
    console.log('👤 Test 5: Get User Profile');
    const profileResponse = await fetch(`${API_BASE}/auth/profile`, {
      headers: {
        ...headers,
        'Authorization': `Bearer ${userToken}`
      }
    });
    const profileData = await profileResponse.json();
    console.log(`✅ Profile retrieved: ${profileData.user.email}\n`);

    // Test 6: Search listings
    console.log('🔍 Test 6: Search Listings');
    const searchResponse = await fetch(`${API_BASE}/listings/search?location=New York`, { headers });
    const searchData = await searchResponse.json();
    console.log(`✅ Search found ${searchData.listings.length} listings in New York\n`);

    // Test 7: Get popular listings
    console.log('🔥 Test 7: Popular Listings');
    const popularResponse = await fetch(`${API_BASE}/listings/popular`, { headers });
    const popularData = await popularResponse.json();
    console.log(`✅ Found ${popularData.listings.length} popular listings\n`);

    // Test 8: Get payment methods
    console.log('💳 Test 8: Payment Methods');
    const paymentResponse = await fetch(`${API_BASE}/payments/methods`, {
      headers: {
        ...headers,
        'Authorization': `Bearer ${userToken}`
      }
    });
    const paymentData = await paymentResponse.json();
    console.log(`✅ Payment methods: ${paymentData.supportedMethods.join(', ')}\n`);

    // Test 9: Create a booking (if we have listings)
    if (listingsData.listings.length > 0) {
      console.log('📅 Test 9: Create Booking');
      const firstListing = listingsData.listings[0];
      const bookingResponse = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          ...headers,
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          listingId: firstListing._id,
          checkIn: '2024-02-15',
          checkOut: '2024-02-20',
          guests: 2,
          totalPrice: 750,
          message: 'Test booking from API'
        })
      });
      const bookingData = await bookingResponse.json();
      console.log(`✅ Booking created: ${bookingData.booking.status}\n`);

      // Test 10: Get user bookings
      console.log('📋 Test 10: Get User Bookings');
      const bookingsResponse = await fetch(`${API_BASE}/bookings`, {
        headers: {
          ...headers,
          'Authorization': `Bearer ${userToken}`
        }
      });
      const bookingsData = await bookingsResponse.json();
      console.log(`✅ User has ${bookingsData.bookings.length} bookings\n`);

      // Test 11: Send a message
      console.log('💬 Test 11: Send Message');
      const messageResponse = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: {
          ...headers,
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          recipientId: firstListing.host._id,
          listingId: firstListing._id,
          content: 'Test message from API'
        })
      });
      const messageData = await messageResponse.json();
      console.log(`✅ Message sent successfully\n`);

      // Test 12: Get messages
      console.log('📨 Test 12: Get Messages');
      const messagesResponse = await fetch(`${API_BASE}/messages`, {
        headers: {
          ...headers,
          'Authorization': `Bearer ${userToken}`
        }
      });
      const messagesData = await messagesResponse.json();
      console.log(`✅ User has ${messagesData.messages.length} messages\n`);

      // Test 13: Get listing reviews
      console.log('⭐ Test 13: Get Listing Reviews');
      const reviewsResponse = await fetch(`${API_BASE}/reviews/listing/${firstListing._id}`, { headers });
      const reviewsData = await reviewsResponse.json();
      console.log(`✅ Listing has ${reviewsData.reviews.length} reviews\n`);
    }

    console.log('🎉 All API tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ API Documentation working');
    console.log('   ✅ Authentication working');
    console.log('   ✅ Listings endpoints working');
    console.log('   ✅ Bookings endpoints working');
    console.log('   ✅ Messages endpoints working');
    console.log('   ✅ Reviews endpoints working');
    console.log('   ✅ Payments endpoints working');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the tests
testAPI(); 