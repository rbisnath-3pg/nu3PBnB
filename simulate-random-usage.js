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

// Diagnostic tracking
const diagnostics = {
  admin: { success: 0, failed: 0, errors: [] },
  host: { success: 0, failed: 0, errors: [] },
  guest: { success: 0, failed: 0, errors: [] },
  system: { success: 0, failed: 0, errors: [] }
};

function logDiagnostic(role, operation, success, error = null, responseTime = null) {
  const timestamp = new Date().toISOString();
  const status = success ? '✅' : '❌';
  
  if (success) {
    diagnostics[role].success++;
  } else {
    diagnostics[role].failed++;
    if (error) {
      diagnostics[role].errors.push({
        timestamp,
        operation,
        error: error.message || error
      });
    }
  }
  
  const timeInfo = responseTime ? ` (${responseTime}ms)` : '';
  console.log(`${status} [${role.toUpperCase()}] ${operation}${timeInfo}`);
}

async function login(user) {
  const startTime = Date.now();
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password: user.password })
    });
    const responseTime = Date.now() - startTime;
    
    if (!res.ok) {
      logDiagnostic(user.role, `Login (${user.email})`, false, `HTTP ${res.status}`, responseTime);
      return null;
    }
    
    const data = await res.json();
    logDiagnostic(user.role, `Login (${user.email})`, true, null, responseTime);
    return data.token;
  } catch (err) {
    const responseTime = Date.now() - startTime;
    logDiagnostic(user.role, `Login (${user.email})`, false, err, responseTime);
    return null;
  }
}

async function simulateAdmin(token) {
  const adminTests = [
    { path: '/api/admin/dashboard', name: 'Admin Dashboard' },
    { path: '/api/admin/users', name: 'User Management' },
    { path: '/api/analytics', name: 'Analytics Dashboard' },
    { path: '/api/admin/bookings', name: 'Admin Bookings' },
    { path: '/api/admin/listings', name: 'Admin Listings' },
    { path: '/api/admin/payments', name: 'Admin Payments' },
    { path: '/api/admin/reviews', name: 'Admin Reviews' },
    { path: '/api/admin/messages', name: 'Admin Messages' },
    { path: '/api/admin/feedback', name: 'Admin Feedback' },
    { path: '/api/admin/content', name: 'Admin Content' }
  ];

  for (const test of adminTests) {
    const startTime = Date.now();
    try {
      await fetchWithAuth(test.path, token, 'GET');
      const responseTime = Date.now() - startTime;
      logDiagnostic('admin', test.name, true, null, responseTime);
    } catch (err) {
      const responseTime = Date.now() - startTime;
      logDiagnostic('admin', test.name, false, err, responseTime);
    }
    await sleep(500 + Math.random() * 1000);
  }
}

async function simulateHost(token) {
  const hostTests = [
    { path: '/api/host/dashboard', name: 'Host Dashboard' },
    { path: '/api/listings', name: 'Browse Listings' },
    { path: '/api/bookings/host', name: 'Host Bookings' },
    { path: '/api/payments/host', name: 'Host Payments' },
    { path: '/api/messages/host', name: 'Host Messages' },
    { path: '/api/reviews/host', name: 'Host Reviews' },
    { path: '/api/analytics/host', name: 'Host Analytics' }
  ];

  // Get listings first for detailed tests
  let listings = [];
  try {
    listings = await fetchWithAuth('/api/listings', token, 'GET');
  } catch (err) {
    logDiagnostic('host', 'Get Listings for Testing', false, err);
  }

  // Basic endpoint tests
  for (const test of hostTests) {
    const startTime = Date.now();
    try {
      await fetchWithAuth(test.path, token, 'GET');
      const responseTime = Date.now() - startTime;
      logDiagnostic('host', test.name, true, null, responseTime);
    } catch (err) {
      const responseTime = Date.now() - startTime;
      logDiagnostic('host', test.name, false, err, responseTime);
    }
    await sleep(500 + Math.random() * 1000);
  }

  // Detailed listing tests
  if (listings && listings.length > 0) {
    const listing = random(listings);
    
    // Test individual listing details
    const startTime = Date.now();
    try {
      await fetchWithAuth(`/api/listings/${listing._id}`, token, 'GET');
      const responseTime = Date.now() - startTime;
      logDiagnostic('host', 'Listing Details', true, null, responseTime);
    } catch (err) {
      const responseTime = Date.now() - startTime;
      logDiagnostic('host', 'Listing Details', false, err, responseTime);
    }

    // Test listing reviews
    const reviewStartTime = Date.now();
    try {
      await fetchWithAuth(`/api/listings/${listing._id}/reviews`, token, 'GET');
      const responseTime = Date.now() - reviewStartTime;
      logDiagnostic('host', 'Listing Reviews', true, null, responseTime);
    } catch (err) {
      const responseTime = Date.now() - reviewStartTime;
      logDiagnostic('host', 'Listing Reviews', false, err, responseTime);
    }
  }
}

async function simulateGuest(token) {
  const guestTests = [
    { path: '/api/listings', name: 'Browse Listings' },
    { path: '/api/listings/featured', name: 'Featured Listings' },
    { path: '/api/bookings/guest', name: 'Guest Bookings' },
    { path: '/api/payments/guest', name: 'Guest Payments' },
    { path: '/api/messages/guest', name: 'Guest Messages' },
    { path: '/api/reviews/guest', name: 'Guest Reviews' },
    { path: '/api/wishlist', name: 'Wishlist' },
    { path: '/api/user/profile', name: 'User Profile' }
  ];

  // Get listings first for detailed tests
  let listings = [];
  try {
    listings = await fetchWithAuth('/api/listings', token, 'GET');
  } catch (err) {
    logDiagnostic('guest', 'Get Listings for Testing', false, err);
  }

  // Basic endpoint tests
  for (const test of guestTests) {
    const startTime = Date.now();
    try {
      await fetchWithAuth(test.path, token, 'GET');
      const responseTime = Date.now() - startTime;
      logDiagnostic('guest', test.name, true, null, responseTime);
    } catch (err) {
      const responseTime = Date.now() - startTime;
      logDiagnostic('guest', test.name, false, err, responseTime);
    }
    await sleep(500 + Math.random() * 1000);
  }

  // Detailed listing and booking tests
  if (listings && listings.length > 0) {
    const listing = random(listings);
    
    // Test individual listing details
    const detailStartTime = Date.now();
    try {
      await fetchWithAuth(`/api/listings/${listing._id}`, token, 'GET');
      const responseTime = Date.now() - detailStartTime;
      logDiagnostic('guest', 'Listing Details', true, null, responseTime);
    } catch (err) {
      const responseTime = Date.now() - detailStartTime;
      logDiagnostic('guest', 'Listing Details', false, err, responseTime);
    }

    // Test listing reviews
    const reviewStartTime = Date.now();
    try {
      await fetchWithAuth(`/api/listings/${listing._id}/reviews`, token, 'GET');
      const responseTime = Date.now() - reviewStartTime;
      logDiagnostic('guest', 'Listing Reviews', true, null, responseTime);
    } catch (err) {
      const responseTime = Date.now() - reviewStartTime;
      logDiagnostic('guest', 'Listing Reviews', false, err, responseTime);
    }

    // Test booking creation (simulation)
    const bookingStartTime = Date.now();
    try {
      await fetchWithAuth('/api/bookings', token, 'POST', {
        listing: listing._id,
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        guests: 1
      });
      const responseTime = Date.now() - bookingStartTime;
      logDiagnostic('guest', 'Create Booking', true, null, responseTime);
    } catch (err) {
      const responseTime = Date.now() - bookingStartTime;
      logDiagnostic('guest', 'Create Booking', false, err, responseTime);
    }

    // Test wishlist operations
    const wishlistStartTime = Date.now();
    try {
      await fetchWithAuth(`/api/wishlist/${listing._id}`, token, 'POST');
      const responseTime = Date.now() - wishlistStartTime;
      logDiagnostic('guest', 'Add to Wishlist', true, null, responseTime);
    } catch (err) {
      const responseTime = Date.now() - wishlistStartTime;
      logDiagnostic('guest', 'Add to Wishlist', false, err, responseTime);
    }
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

async function simulateUser(user, iterations = 3) {
  console.log(`\n👤 Starting simulation for ${user.role}: ${user.email}`);
  
  const token = await login(user);
  if (!token) {
    console.log(`❌ Failed to login ${user.email}, skipping simulation`);
    return;
  }
  
  for (let i = 0; i < iterations; i++) {
    console.log(`\n🔄 Iteration ${i + 1}/${iterations} for ${user.role}: ${user.email}`);
    
    if (user.role === 'admin') await simulateAdmin(token);
    if (user.role === 'host') await simulateHost(token);
    if (user.role === 'guest') await simulateGuest(token);
    
    await sleep(1000 + Math.random() * 2000); // 1-3s between iterations
  }
}

async function testFrontendInteractions() {
  console.log('🧪 Testing Frontend Interactions...');
  
  const frontendTests = [
    { url: 'https://nu3pbnb.onrender.com', name: 'Frontend Homepage' },
    { url: `${API_BASE}/api/health`, name: 'API Health Check' },
    { url: `${API_BASE}/api/listings`, name: 'Public Listings' },
    { url: `${API_BASE}/api/listings/featured`, name: 'Featured Listings' }
  ];

  for (const test of frontendTests) {
    const startTime = Date.now();
    try {
      const response = await fetch(test.url);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        logDiagnostic('system', test.name, true, null, responseTime);
        
        // Additional data for listings
        if (test.name.includes('Listings')) {
          try {
            const data = await response.json();
            console.log(`   📊 Found ${data.length || 0} listings`);
          } catch (e) {
            // Ignore JSON parsing errors for non-JSON responses
          }
        }
      } else {
        logDiagnostic('system', test.name, false, `HTTP ${response.status}`, responseTime);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logDiagnostic('system', test.name, false, error, responseTime);
    }
    await sleep(500);
  }
  
  return true;
}

async function testDiagnostics() {
  console.log('🔍 Testing System Diagnostics...');
  
  const diagnosticTests = [
    { path: '/api/diagnostics/booking', name: 'Booking Diagnostics' },
    { path: '/api/diagnostics/property', name: 'Property Diagnostics' },
    { path: '/api/diagnostics', name: 'General Diagnostics' },
    { path: '/api/health', name: 'Health Check' }
  ];

  for (const test of diagnosticTests) {
    const startTime = Date.now();
    try {
      const response = await fetch(`${API_BASE}${test.path}`);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        logDiagnostic('system', test.name, true, null, responseTime);
        console.log(`   📊 Status: ${data.status || 'unknown'}`);
      } else {
        logDiagnostic('system', test.name, false, `HTTP ${response.status}`, responseTime);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logDiagnostic('system', test.name, false, error, responseTime);
    }
    await sleep(500);
  }
  
  return true;
}

function printDiagnosticSummary() {
  console.log('\n📊 COMPREHENSIVE DIAGNOSTIC SUMMARY');
  console.log('=====================================');
  
  Object.entries(diagnostics).forEach(([role, stats]) => {
    const total = stats.success + stats.failed;
    const successRate = total > 0 ? ((stats.success / total) * 100).toFixed(1) : 0;
    
    console.log(`\n${role.toUpperCase()} ROLE:`);
    console.log(`  ✅ Success: ${stats.success}`);
    console.log(`  ❌ Failed: ${stats.failed}`);
    console.log(`  📈 Success Rate: ${successRate}%`);
    
    if (stats.errors.length > 0) {
      console.log(`  🚨 Recent Errors:`);
      stats.errors.slice(-3).forEach(error => {
        console.log(`    - ${error.operation}: ${error.error}`);
      });
    }
  });
  
  // Overall summary
  const totalSuccess = Object.values(diagnostics).reduce((sum, stats) => sum + stats.success, 0);
  const totalFailed = Object.values(diagnostics).reduce((sum, stats) => sum + stats.failed, 0);
  const totalTests = totalSuccess + totalFailed;
  const overallSuccessRate = totalTests > 0 ? ((totalSuccess / totalTests) * 100).toFixed(1) : 0;
  
  console.log(`\n🎯 OVERALL SUMMARY:`);
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  Overall Success Rate: ${overallSuccessRate}%`);
  console.log(`  System Health: ${overallSuccessRate >= 80 ? '🟢 EXCELLENT' : overallSuccessRate >= 60 ? '🟡 GOOD' : '🔴 NEEDS ATTENTION'}`);
}

async function main() {
  console.log('🚀 Starting Comprehensive nu3PBnB Testing with Full Diagnostics...\n');
  
  // Test 1: Frontend Interactions
  console.log('🌐 PHASE 1: Frontend & System Tests');
  await testFrontendInteractions();
  
  // Test 2: System Diagnostics
  console.log('\n🔍 PHASE 2: System Diagnostics');
  await testDiagnostics();
  
  // Test 3: User Simulations with Detailed Diagnostics
  console.log('\n👥 PHASE 3: User Role Simulations');
  const iterations = 2; // Reduced for comprehensive testing
  await Promise.all(
    USERS.map(user => simulateUser(user, iterations))
  );
  
  // Print comprehensive diagnostic summary
  printDiagnosticSummary();
  
  console.log('\n✅ Comprehensive diagnostic testing complete!');
}

main(); 