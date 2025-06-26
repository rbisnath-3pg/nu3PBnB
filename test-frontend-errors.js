require('dotenv').config();
const fetch = require('node-fetch');

const API_BASE = 'https://nu3pbnb-api.onrender.com';
const FRONTEND_URL = 'https://nu3pbnb.onrender.com';

async function testFrontendAccessibility() {
  console.log('🌐 Testing Frontend Accessibility...');
  
  try {
    const response = await fetch(FRONTEND_URL);
    console.log(`Frontend Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 404) {
      console.log('❌ Frontend is returning 404 - deployment issue detected');
      return false;
    }
    
    const text = await response.text();
    if (text.includes('<!DOCTYPE html>')) {
      console.log('✅ Frontend is serving HTML content');
    } else {
      console.log('⚠️ Frontend response is not HTML');
    }
    
    return response.status === 200;
  } catch (error) {
    console.error('❌ Frontend accessibility test failed:', error.message);
    return false;
  }
}

async function testAPIEndpoints() {
  console.log('\n🔌 Testing API Endpoints...');
  
  const endpoints = [
    { path: '/api/health', name: 'Health Check' },
    { path: '/api/listings', name: 'Listings' },
    { path: '/api/listings/featured', name: 'Featured Listings' },
    { path: '/api/diagnostics', name: 'General Diagnostics' },
    { path: '/api/diagnostics/booking-tests', name: 'Booking Diagnostics' },
    { path: '/api/diagnostics/property-tests', name: 'Property Diagnostics' }
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE}${endpoint.path}`);
      const contentType = response.headers.get('content-type');
      
      console.log(`${endpoint.name}: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        try {
          const data = await response.json();
          results[endpoint.name] = {
            status: response.status,
            contentType,
            hasData: !!data,
            dataType: typeof data
          };
          
          if (endpoint.name === 'Listings') {
            console.log(`  📊 Found ${data.length || 0} listings`);
          } else if (endpoint.name === 'Featured Listings') {
            console.log(`  📊 Found ${data.length || 0} featured listings`);
          }
        } catch (jsonError) {
          console.log(`  ⚠️ Response is not JSON: ${contentType}`);
          results[endpoint.name] = {
            status: response.status,
            contentType,
            error: 'Not JSON'
          };
        }
      } else {
        results[endpoint.name] = {
          status: response.status,
          error: response.statusText
        };
      }
    } catch (error) {
      console.log(`${endpoint.name}: ❌ ${error.message}`);
      results[endpoint.name] = {
        error: error.message
      };
    }
  }
  
  return results;
}

async function testUserInteractions() {
  console.log('\n👤 Testing User Interactions...');
  
  try {
    // Test login
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
    
    // Test authenticated endpoints
    const authEndpoints = [
      { path: '/api/listings', name: 'Authenticated Listings' },
      { path: '/api/bookings', name: 'User Bookings' },
      { path: '/api/users/me/wishlist', name: 'User Wishlist' }
    ];
    
    for (const endpoint of authEndpoints) {
      try {
        const response = await fetch(`${API_BASE}${endpoint.path}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`${endpoint.name}: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          if (endpoint.name === 'Authenticated Listings') {
            console.log(`  📊 Found ${data.length || 0} listings`);
          }
        }
      } catch (error) {
        console.log(`${endpoint.name}: ❌ ${error.message}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ User interaction test failed:', error.message);
    return false;
  }
}

async function testDiagnosticsComprehensive() {
  console.log('\n🔍 Comprehensive Diagnostics Test...');
  
  try {
    // Test all diagnostics endpoints
    const diagnosticsEndpoints = [
      '/api/diagnostics',
      '/api/diagnostics/booking-tests',
      '/api/diagnostics/property-tests'
    ];
    
    for (const endpoint of diagnosticsEndpoints) {
      try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        console.log(`${endpoint}: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`  📊 Data:`, {
            lastRun: data.lastRun,
            success: data.success,
            errors: data.errors ? data.errors.length : 0,
            logs: data.logs ? data.logs.length : 0
          });
        } else {
          const text = await response.text();
          console.log(`  ⚠️ Response: ${text.substring(0, 200)}...`);
        }
      } catch (error) {
        console.log(`${endpoint}: ❌ ${error.message}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Comprehensive diagnostics test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Comprehensive Frontend Error Detection...\n');
  
  const results = {
    frontendAccessible: false,
    apiEndpoints: {},
    userInteractions: false,
    diagnostics: false
  };
  
  // Test 1: Frontend Accessibility
  results.frontendAccessible = await testFrontendAccessibility();
  
  // Test 2: API Endpoints
  results.apiEndpoints = await testAPIEndpoints();
  
  // Test 3: User Interactions
  results.userInteractions = await testUserInteractions();
  
  // Test 4: Comprehensive Diagnostics
  results.diagnostics = await testDiagnosticsComprehensive();
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`Frontend Accessible: ${results.frontendAccessible ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`API Endpoints: ${Object.values(results.apiEndpoints).filter(r => r.status === 200).length}/${Object.keys(results.apiEndpoints).length} working`);
  console.log(`User Interactions: ${results.userInteractions ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Diagnostics: ${results.diagnostics ? '✅ PASS' : '❌ FAIL'}`);
  
  // Identify issues
  console.log('\n🔍 Issue Analysis:');
  
  if (!results.frontendAccessible) {
    console.log('❌ CRITICAL: Frontend is not accessible - this will cause blank pages');
  }
  
  const failedEndpoints = Object.entries(results.apiEndpoints)
    .filter(([name, result]) => result.error || result.status !== 200)
    .map(([name, result]) => name);
  
  if (failedEndpoints.length > 0) {
    console.log(`⚠️ API Issues: ${failedEndpoints.join(', ')}`);
  }
  
  if (!results.userInteractions) {
    console.log('❌ User interaction tests failed - authentication issues');
  }
  
  console.log('\n✅ Comprehensive testing complete!');
}

main().catch(console.error); 