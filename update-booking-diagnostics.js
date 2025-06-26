require('dotenv').config();
const fetch = require('node-fetch');
const Diagnostics = require('./models/Diagnostics');
const mongoose = require('mongoose');

const API_BASE = 'https://nu3pbnb-api.onrender.com';

// Connect to MongoDB if not already connected
if (mongoose.connection.readyState === 0) {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nu3pbnb';
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB for diagnostics'))
    .catch(err => console.error('MongoDB connection error:', err.message));
}

async function updateBookingDiagnostics() {
  console.log('🔄 Updating booking diagnostics...');
  
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
    
    const testListing = listings[19];
    logs.push(`✅ [BookingTest] Found ${listings.length} listings, using: ${testListing.title}`);

    logs.push('🧪 [BookingTest] Creating booking...');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 20000); // 20000 days from now
    
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
  
  // Now trigger a backend restart to update the diagnostics
  console.log('\n🔄 Triggering backend restart to update diagnostics...');
  
  // Make a request to trigger the startup tests
  try {
    const healthRes = await fetch(`${API_BASE}/api/health`);
    if (healthRes.ok) {
      console.log('✅ Backend is running and diagnostics should be updated');
      console.log('📱 Refresh the frontend to see updated booking diagnostics');
    }
  } catch (err) {
    console.log('⚠️ Could not verify backend status:', err.message);
  }
  
  // Save diagnostics to MongoDB
  try {
    await Diagnostics.findOneAndUpdate(
      { key: 'bookingTest' },
      { ...diagnosticsData, key: 'bookingTest' },
      { upsert: true, new: true }
    );
    console.log('✅ Diagnostics saved to MongoDB');
  } catch (err) {
    console.error('❌ Failed to save diagnostics to MongoDB:', err.message);
  }
  
  return diagnosticsData;
}

async function updatePropertyViewDiagnostics() {
  console.log('🔄 Updating property view diagnostics...');
  
  const logs = [];
  const errors = [];
  let success = true;
  let token = null;
  
  try {
    // Test 1: Public listings access (no auth required)
    logs.push('🧪 [PropertyTest] Testing public listings access...');
    const publicListingsRes = await fetch(`${API_BASE}/api/listings`);
    
    if (!publicListingsRes.ok) {
      throw new Error(`[PropertyTest] Public listings fetch failed: ${publicListingsRes.status}`);
    }
    
    const publicListingsData = await publicListingsRes.json();
    const publicListings = publicListingsData.listings || [];
    
    if (!publicListings.length) {
      throw new Error('[PropertyTest] No public listings found');
    }
    
    logs.push(`✅ [PropertyTest] Found ${publicListings.length} public listings`);
    
    // Test 2: Authenticated listings access
    logs.push('🧪 [PropertyTest] Testing authenticated listings access...');
    const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'Evelyn_Feeney68@gmail.com', 
        password: 'guest123' 
      })
    });
    
    if (!loginRes.ok) {
      throw new Error(`[PropertyTest] Login failed: ${loginRes.status}`);
    }
    
    const loginData = await loginRes.json();
    token = loginData.token;
    logs.push('✅ [PropertyTest] Login successful');
    
    const authListingsRes = await fetch(`${API_BASE}/api/listings`, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    
    if (!authListingsRes.ok) {
      throw new Error(`[PropertyTest] Authenticated listings fetch failed: ${authListingsRes.status}`);
    }
    
    const authListingsData = await authListingsRes.json();
    const authListings = authListingsData.listings || [];
    
    if (!authListings.length) {
      throw new Error('[PropertyTest] No authenticated listings found');
    }
    
    logs.push(`✅ [PropertyTest] Found ${authListings.length} authenticated listings`);
    
    // Test 3: Individual listing details
    logs.push('🧪 [PropertyTest] Testing individual listing details...');
    const testListing = authListings[0];
    const listingDetailRes = await fetch(`${API_BASE}/api/listings/${testListing._id}`, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    
    if (!listingDetailRes.ok) {
      throw new Error(`[PropertyTest] Listing detail fetch failed: ${listingDetailRes.status}`);
    }
    
    const listingDetail = await listingDetailRes.json();
    
    if (!listingDetail.listing) {
      throw new Error('[PropertyTest] No listing detail returned');
    }
    
    logs.push(`✅ [PropertyTest] Listing detail retrieved: ${listingDetail.listing.title}`);
    
    // Test 4: Featured listings
    logs.push('🧪 [PropertyTest] Testing featured listings...');
    const featuredRes = await fetch(`${API_BASE}/api/listings/featured`, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    
    if (!featuredRes.ok) {
      throw new Error(`[PropertyTest] Featured listings fetch failed: ${featuredRes.status}`);
    }
    
    const featuredData = await featuredRes.json();
    const featuredListings = featuredData.listings || [];
    
    logs.push(`✅ [PropertyTest] Found ${featuredListings.length} featured listings`);
    
    // Test 5: Search functionality
    logs.push('🧪 [PropertyTest] Testing search functionality...');
    const searchRes = await fetch(`${API_BASE}/api/listings/search?q=apartment`, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    
    if (!searchRes.ok) {
      throw new Error(`[PropertyTest] Search failed: ${searchRes.status}`);
    }
    
    const searchData = await searchRes.json();
    const searchResults = searchData.listings || [];
    
    logs.push(`✅ [PropertyTest] Search returned ${searchResults.length} results`);
    
    // Test 6: Pagination
    logs.push('🧪 [PropertyTest] Testing pagination...');
    const page2Res = await fetch(`${API_BASE}/api/listings?page=2&limit=5`, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    
    if (!page2Res.ok) {
      throw new Error(`[PropertyTest] Pagination failed: ${page2Res.status}`);
    }
    
    const page2Data = await page2Res.json();
    const page2Listings = page2Data.listings || [];
    
    logs.push(`✅ [PropertyTest] Page 2 returned ${page2Listings.length} listings`);
    
  } catch (err) {
    errors.push(err.message);
    logs.push(`❌ [PropertyTest] Error: ${err.message}`);
    success = false;
  }
  
  // Update the diagnostics
  const diagnosticsData = {
    lastRun: new Date().toISOString(),
    success,
    errors,
    logs
  };
  
  console.log('\n📊 Property View Test Results:');
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
  
  // Save diagnostics to MongoDB
  try {
    await Diagnostics.findOneAndUpdate(
      { key: 'propertyViewTest' },
      { ...diagnosticsData, key: 'propertyViewTest' },
      { upsert: true, new: true }
    );
    console.log('✅ Property view diagnostics saved to MongoDB');
  } catch (err) {
    console.error('❌ Failed to save property view diagnostics to MongoDB:', err.message);
  }
  
  return diagnosticsData;
}

// Export both functions
module.exports = {
  updateBookingDiagnostics,
  updatePropertyViewDiagnostics
};

// Run both diagnostics if this file is executed directly
if (require.main === module) {
  (async () => {
    console.log('🚀 Running comprehensive diagnostics...\n');
    
    // Run booking diagnostics
    await updateBookingDiagnostics();
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Run property view diagnostics
    await updatePropertyViewDiagnostics();
    
    console.log('\n✅ All diagnostics completed!');
    process.exit(0);
  })().catch(err => {
    console.error('❌ Diagnostics failed:', err);
    process.exit(1);
  });
} 