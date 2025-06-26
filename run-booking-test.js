require('dotenv').config();
const fetch = require('node-fetch');

const API_BASE = 'https://nu3pbnb-api.onrender.com';

async function runBookingTest() {
  console.log('🧪 Running booking test...');
  
  const TEST_USER = {
    email: 'Evelyn_Feeney68@gmail.com',
    password: 'guest123'
  };
  
  const logs = [];
  const errors = [];
  let success = true;
  let token = null;
  let bookingId = null;
  let paymentId = null;
  
  try {
    logs.push('🧪 [BookingTest] Logging in as guest...');
    const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });
    
    if (!loginRes.ok) {
      throw new Error(`[BookingTest] Login failed: ${loginRes.status}`);
    }
    
    const loginData = await loginRes.json();
    token = loginData.token;
    logs.push('✅ [BookingTest] Login successful');

    logs.push('🧪 [BookingTest] Fetching listings...');
    const listingsRes = await fetch(`${API_BASE}/api/listings`, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    
    if (!listingsRes.ok) {
      throw new Error(`[BookingTest] Listings fetch failed: ${listingsRes.status}`);
    }
    
    const listingsData = await listingsRes.json();
    const listings = listingsData.listings || [];
    
    if (!listings.length) {
      throw new Error('[BookingTest] No listings found');
    }
    
    const testListing = listings[0];
    logs.push(`✅ [BookingTest] Found ${listings.length} listings, using: ${testListing.title}`);

    logs.push('🧪 [BookingTest] Creating booking...');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 100); // 100 days from now
    
    const endDate = new Date(startDate); // Create new date object from startDate
    endDate.setDate(endDate.getDate() + 3); // 3 days after start date
    
    const bookingData = {
      listingId: testListing._id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      guests: 2,
      message: 'Automated booking test'
    };
    
    const bookingRes = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(bookingData)
    });
    
    if (!bookingRes.ok) {
      const err = await bookingRes.json().catch(() => ({}));
      throw new Error(`[BookingTest] Booking creation failed: ${bookingRes.status} - ${err.message || bookingRes.statusText}`);
    }
    
    const bookingResult = await bookingRes.json();
    bookingId = bookingResult.booking._id;
    logs.push(`✅ [BookingTest] Booking created: ${bookingId}`);

    logs.push('🧪 [BookingTest] Fetching user bookings...');
    const userBookingsRes = await fetch(`${API_BASE}/api/bookings`, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    
    if (!userBookingsRes.ok) {
      throw new Error(`[BookingTest] User bookings fetch failed: ${userBookingsRes.status}`);
    }
    
    const userBookingsData = await userBookingsRes.json();
    const found = userBookingsData.bookings.some(b => b._id === bookingId);
    
    if (!found) {
      throw new Error('[BookingTest] Created booking not found in user bookings');
    }
    
    logs.push('✅ [BookingTest] Booking found in user bookings');

    logs.push('🧪 [BookingTest] Processing payment...');
    const paymentData = {
      bookingId,
      amount: bookingResult.booking.totalPrice,
      paymentMethod: 'credit_card',
      paymentType: 'new'
    };
    
    const paymentRes = await fetch(`${API_BASE}/api/payments/process`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(paymentData)
    });
    
    if (!paymentRes.ok) {
      const err = await paymentRes.json().catch(() => ({}));
      throw new Error(`[BookingTest] Payment failed: ${paymentRes.status} - ${err.message || paymentRes.statusText}`);
    }
    
    const paymentResult = await paymentRes.json();
    paymentId = paymentResult.payment._id;
    logs.push(`✅ [BookingTest] Payment processed: ${paymentId}`);
    
  } catch (err) {
    errors.push(err.message);
    logs.push(`❌ [BookingTest] Error: ${err.message}`);
    success = false;
  }
  
  // Update the diagnostics
  const diagnosticsData = {
    lastRun: new Date().toISOString(),
    success,
    errors,
    logs
  };
  
  console.log('\n📊 Booking Test Results:');
  console.log(`Last Run: ${diagnosticsData.lastRun}`);
  console.log(`Success: ${success ? '✅ YES' : '❌ NO'}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Logs: ${logs.length} entries`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(error => console.log(`  - ${error}`));
  }
  
  console.log('\n📝 Logs:');
  logs.forEach(log => console.log(`  ${log}`));
  
  return diagnosticsData;
}

runBookingTest().catch(console.error); 