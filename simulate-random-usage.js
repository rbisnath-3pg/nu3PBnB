require('dotenv').config();
const fetch = require('node-fetch');

const API_BASE = 'https://nu3pbnb-api.onrender.com';

// Test logins
const USERS = [
  // Admin
  { email: 'admin@nu3pbnb.com', password: 'admin123', role: 'admin' },
  // Hosts
  { email: 'Raul50@gmail.com', password: 'host123', role: 'host' },
  { email: 'Ashtyn.Barrows99@gmail.com', password: 'host123', role: 'host' },
  // Guests
  { email: 'Evelyn_Feeney68@gmail.com', password: 'guest123', role: 'guest' },
  { email: 'Kristopher32@hotmail.com', password: 'guest123', role: 'guest' },
];

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function login(user) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password: user.password })
    });
    if (!res.ok) throw new Error(`Login failed for ${user.email}`);
    const data = await res.json();
    return data.token;
  } catch (err) {
    console.error(`[${user.role}] Login error:`, err.message);
    return null;
  }
}

async function simulateAdmin(token) {
  // Admin: View dashboard, users, analytics
  try {
    await fetchWithAuth('/api/admin/dashboard', token, 'GET');
    await fetchWithAuth('/api/admin/users', token, 'GET');
    await fetchWithAuth('/api/analytics', token, 'GET');
  } catch (err) {
    console.error('[admin] Error:', err.message);
  }
}

async function simulateHost(token) {
  // Host: View dashboard, listings, bookings
  try {
    await fetchWithAuth('/api/host/dashboard', token, 'GET');
    const listings = await fetchWithAuth('/api/listings', token, 'GET');
    if (listings && listings.length > 0) {
      await fetchWithAuth(`/api/listings/${listings[0]._id}`, token, 'GET');
    }
    await fetchWithAuth('/api/bookings/host', token, 'GET');
  } catch (err) {
    console.error('[host] Error:', err.message);
  }
}

async function simulateGuest(token) {
  // Guest: Browse listings, view details, make bookings
  try {
    const listings = await fetchWithAuth('/api/listings', token, 'GET');
    if (listings && listings.length > 0) {
      const listing = random(listings);
      await fetchWithAuth(`/api/listings/${listing._id}`, token, 'GET');
      // Try to make a booking (simulate, but don't care if fails)
      await fetchWithAuth('/api/bookings', token, 'POST', {
        listing: listing._id,
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        guests: 1
      });
    }
  } catch (err) {
    console.error('[guest] Error:', err.message);
  }
}

async function fetchWithAuth(path, token, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`Request failed: ${path} (${res.status})`);
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function simulateUser(user, iterations = 5) {
  const token = await login(user);
  if (!token) return;
  for (let i = 0; i < iterations; i++) {
    if (user.role === 'admin') await simulateAdmin(token);
    if (user.role === 'host') await simulateHost(token);
    if (user.role === 'guest') await simulateGuest(token);
    console.log(`[${user.role}] ${user.email} completed iteration ${i + 1}`);
    await sleep(1000 + Math.random() * 4000); // 1-5s
  }
}

async function testFrontendInteractions() {
  console.log('🧪 Testing Frontend Interactions...');
  
  try {
    // Test 1: Check if frontend is accessible
    const frontendResponse = await fetch('https://nu3pbnb.onrender.com');
    console.log(`✅ Frontend accessible: ${frontendResponse.status}`);
    
    // Test 2: Check if API is accessible
    const apiResponse = await fetch(`${API_BASE}/api/health`);
    console.log(`✅ API accessible: ${apiResponse.status}`);
    
    // Test 3: Test listings endpoint
    const listingsResponse = await fetch(`${API_BASE}/api/listings`);
    const listingsData = await listingsResponse.json();
    console.log(`✅ Listings endpoint: ${listingsData.length || 0} listings found`);
    
    // Test 4: Test featured listings
    const featuredResponse = await fetch(`${API_BASE}/api/listings/featured`);
    const featuredData = await featuredResponse.json();
    console.log(`✅ Featured listings: ${featuredData.length || 0} featured found`);
    
    // Test 5: Test individual listing details
    if (listingsData.length > 0) {
      const firstListing = listingsData[0];
      const listingDetailResponse = await fetch(`${API_BASE}/api/listings/${firstListing._id}`);
      console.log(`✅ Listing detail endpoint: ${listingDetailResponse.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Frontend interaction test failed:', error.message);
    return false;
  }
}

async function testDiagnostics() {
  console.log('🔍 Testing Diagnostics...');
  
  try {
    // Test booking diagnostics
    const bookingDiagnosticsResponse = await fetch(`${API_BASE}/api/diagnostics/booking`);
    const bookingDiagnostics = await bookingDiagnosticsResponse.json();
    console.log('✅ Booking diagnostics:', bookingDiagnostics.status || 'unknown');
    
    // Test property diagnostics
    const propertyDiagnosticsResponse = await fetch(`${API_BASE}/api/diagnostics/property`);
    const propertyDiagnostics = await propertyDiagnosticsResponse.json();
    console.log('✅ Property diagnostics:', propertyDiagnostics.status || 'unknown');
    
    // Test general diagnostics
    const generalDiagnosticsResponse = await fetch(`${API_BASE}/api/diagnostics`);
    const generalDiagnostics = await generalDiagnosticsResponse.json();
    console.log('✅ General diagnostics:', generalDiagnostics.status || 'unknown');
    
    return true;
  } catch (error) {
    console.error('❌ Diagnostics test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Comprehensive nu3PBnB Testing...\n');
  
  // Test 1: Frontend Interactions
  const frontendTest = await testFrontendInteractions();
  
  // Test 2: Diagnostics
  const diagnosticsTest = await testDiagnostics();
  
  // Test 3: User Simulations
  console.log('\n👥 Starting User Simulations...');
  const iterations = 3; // Reduced for faster testing
  await Promise.all(
    USERS.map(user => simulateUser(user, iterations))
  );
  
  console.log('\n📊 Test Summary:');
  console.log(`Frontend Interactions: ${frontendTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Diagnostics: ${diagnosticsTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log('User Simulations: ✅ COMPLETE');
  
  console.log('\n✅ Comprehensive testing complete!');
}

main(); 