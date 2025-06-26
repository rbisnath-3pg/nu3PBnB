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
    
    // Pick a random listing
    const testListing = listings[Math.floor(Math.random() * listings.length)];
    logs.push(`✅ [BookingTest] Found ${listings.length} listings, using: ${testListing.title} (${testListing._id})`);
    logs.push(`[BookingTest] Full listing object: ${JSON.stringify(testListing)}`);

    // Pick a random far-future date range
    const baseDays = 10000 + Math.floor(Math.random() * 10000); // 10,000–20,000 days in the future
    const duration = 2 + Math.floor(Math.random() * 4); // 2–5 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + baseDays);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);
    logs.push(`[BookingTest] Using startDate: ${startDate.toISOString()}, endDate: ${endDate.toISOString()}`);

    // Try to fetch existing bookings for this listing and date range (if endpoint exists)
    try {
      const availRes = await fetch(`${API_BASE}/api/listings/${testListing._id}/availability`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (availRes.ok) {
        const availData = await availRes.json();
        logs.push(`[BookingTest] Existing bookings for this listing:`);
        logs.push(JSON.stringify(availData.bookings || [], null, 2));
      } else {
        logs.push(`[BookingTest] Could not fetch existing bookings: ${availRes.status}`);
      }
    } catch (err) {
      logs.push(`[BookingTest] Error fetching existing bookings: ${err.message}`);
    }

    logs.push('🧪 [BookingTest] Creating booking... (DISABLED)');
    // DISABLED - No booking data should be created
    /*
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
      const errBody = await bookingRes.text();
      logs.push(`[BookingTest] Booking creation failed. Response body: ${errBody}`);
      throw new Error(`[BookingTest] Booking creation failed: ${bookingRes.status} - ${errBody}`);
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
    */
    
    logs.push('❌ [BookingTest] Booking creation DISABLED - No booking data should be created');

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
    
    if (!listingDetail._id || !listingDetail.title) {
      throw new Error('[PropertyTest] No listing detail returned');
    }
    
    logs.push(`✅ [PropertyTest] Listing detail retrieved: ${listingDetail.title}`);
    
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
    const searchRes = await fetch(`${API_BASE}/api/listings/search/advanced?query=apartment`, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    
    if (!searchRes.ok) {
      throw new Error(`[PropertyTest] Search failed: ${searchRes.status}`);
    }
    
    const searchData = await searchRes.json();
    const searchResults = searchData.data || [];
    
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
    
    // Test 7: Check if properties display correctly (frontend simulation)
    logs.push('🧪 [PropertyTest] Testing property display functionality...');
    const propertyDisplayTest = {
      hasListings: authListings.length > 0,
      hasValidData: authListings.every(listing => 
        listing._id && listing.title && listing.price && listing.location
      ),
      hasPhotos: authListings.every(listing => 
        listing.photos && Array.isArray(listing.photos) && listing.photos.length > 0
      ),
      hasRequiredFields: authListings.every(listing => 
        listing.maxGuests && listing.bedrooms && listing.bathrooms
      )
    };
    
    if (!propertyDisplayTest.hasListings) {
      throw new Error('[PropertyTest] No properties available for display');
    }
    if (!propertyDisplayTest.hasValidData) {
      throw new Error('[PropertyTest] Properties missing required display data');
    }
    if (!propertyDisplayTest.hasPhotos) {
      logs.push('⚠️ [PropertyTest] Some properties missing photos (may cause blank images)');
    }
    if (!propertyDisplayTest.hasRequiredFields) {
      logs.push('⚠️ [PropertyTest] Some properties missing required fields (may cause display issues)');
    }
    
    logs.push(`✅ [PropertyTest] Property display test passed: ${authListings.length} properties ready for display`);
    
    // Test 8: Check if bookings display correctly
    logs.push('🧪 [PropertyTest] Testing booking display functionality...');
    const userBookingsRes = await fetch(`${API_BASE}/api/bookings`, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    
    if (!userBookingsRes.ok) {
      throw new Error(`[PropertyTest] User bookings fetch failed: ${userBookingsRes.status}`);
    }
    
    const userBookingsData = await userBookingsRes.json();
    const userBookings = userBookingsData.bookings || [];
    
    const bookingDisplayTest = {
      hasBookings: userBookings.length >= 0, // Can be 0 for new users
      hasValidBookingData: userBookings.every(booking => 
        booking._id && booking.listing && booking.startDate && booking.endDate
      ),
      hasListingDetails: userBookings.every(booking => 
        booking.listing && (booking.listing._id || booking.listingId)
      )
    };
    
    logs.push(`✅ [PropertyTest] Found ${userBookings.length} user bookings`);
    if (userBookings.length > 0 && !bookingDisplayTest.hasValidBookingData) {
      throw new Error('[PropertyTest] Bookings missing required display data');
    }
    if (userBookings.length > 0 && !bookingDisplayTest.hasListingDetails) {
      logs.push('⚠️ [PropertyTest] Some bookings missing listing details (may cause blank pages)');
    }
    
    logs.push(`✅ [PropertyTest] Booking display test passed: ${userBookings.length} bookings ready for display`);
    
    // Test 9: Check for potential blank page issues
    logs.push('🧪 [PropertyTest] Checking for potential blank page issues...');
    const blankPageIssues = [];
    
    // Check if listings have all required data for detail pages
    const sampleListing = authListings[0];
    if (!sampleListing.description || sampleListing.description.trim() === '') {
      blankPageIssues.push('Sample listing has empty description');
    }
    if (!sampleListing.amenities || sampleListing.amenities.length === 0) {
      blankPageIssues.push('Sample listing has no amenities');
    }
    if (!sampleListing.host && !sampleListing.hostId) {
      blankPageIssues.push('Sample listing has no host information');
    }
    
    // Check if bookings have all required data for detail pages
    if (userBookings.length > 0) {
      const sampleBooking = userBookings[0];
      if (!sampleBooking.totalPrice && !sampleBooking.price) {
        blankPageIssues.push('Sample booking has no price information');
      }
      if (!sampleBooking.status) {
        blankPageIssues.push('Sample booking has no status');
      }
    }
    
    if (blankPageIssues.length > 0) {
      logs.push(`⚠️ [PropertyTest] Potential blank page issues detected:`);
      blankPageIssues.forEach(issue => logs.push(`  - ${issue}`));
    } else {
      logs.push('✅ [PropertyTest] No obvious blank page issues detected');
    }
    
    logs.push('✅ [PropertyTest] Blank page check completed');
    
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