#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'https://nu3pbnb-api.onrender.com';
const FRONTEND_BASE = 'https://nu3pbnb.onrender.com';

console.log('🚀 Checking Nu3PBnB Deployment Status...');
console.log('='.repeat(60));

async function checkDeployment() {
  const startTime = Date.now();
  
  try {
    // Test API health endpoint
    console.log('📡 Testing API connectivity...');
    const healthResponse = await axios.get(`${API_BASE}/api/health`, {
      timeout: 10000
    });
    
    if (healthResponse.status === 200) {
      console.log('✅ API is responding successfully');
      console.log(`   Status: ${healthResponse.data?.status || 'OK'}`);
      console.log(`   Response time: ${Date.now() - startTime}ms`);
    } else {
      console.log('⚠️ API responded but with unexpected status:', healthResponse.status);
    }
    
    // Test login functionality (the main issue we fixed)
    console.log('\n🔐 Testing login functionality...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@nu3pbnb.com',
      password: 'admin123'
    }, {
      timeout: 10000
    });
    
    if (loginResponse.status === 200 && loginResponse.data.token) {
      console.log('✅ Login is working correctly');
      console.log(`   User: ${loginResponse.data.user.email}`);
      console.log(`   Role: ${loginResponse.data.user.role}`);
      console.log(`   Token received: ${loginResponse.data.token ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ Login test failed');
      console.log(`   Status: ${loginResponse.status}`);
      console.log(`   Response:`, loginResponse.data);
    }
    
    // Test a few more endpoints
    console.log('\n🔍 Testing additional endpoints...');
    
    // Test public listings
    const listingsResponse = await axios.get(`${API_BASE}/api/listings`, {
      timeout: 10000
    });
    console.log(`   Public listings: ${listingsResponse.status === 200 ? '✅' : '❌'} (${listingsResponse.status})`);
    
    // Test featured listings
    const featuredResponse = await axios.get(`${API_BASE}/api/listings/featured`, {
      timeout: 10000
    });
    console.log(`   Featured listings: ${featuredResponse.status === 200 ? '✅' : '❌'} (${featuredResponse.status})`);
    
    // Test content endpoint
    const contentResponse = await axios.get(`${API_BASE}/api/content`, {
      timeout: 10000
    });
    console.log(`   Content: ${contentResponse.status === 200 ? '✅' : '❌'} (${contentResponse.status})`);
    
    console.log('\n🎉 Deployment check completed successfully!');
    console.log(`⏱️ Total time: ${Date.now() - startTime}ms`);
    
    // Provide next steps
    console.log('\n📋 Next Steps:');
    console.log('1. Visit the frontend: https://nu3pbnb.onrender.com');
    console.log('2. Test login with admin@nu3pbnb.com / admin123');
    console.log('3. Run startup tests: npm run test:startup');
    console.log('4. Check the automatic login tests on the homepage');
    
  } catch (error) {
    console.error('❌ Deployment check failed:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.log('💡 The API might still be deploying. Please wait a few minutes and try again.');
    } else if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    }
    
    console.log('\n🔄 To manually trigger deployment:');
    console.log('1. Go to https://dashboard.render.com');
    console.log('2. Find your nu3pbnb-api service');
    console.log('3. Click "Manual Deploy"');
  }
}

// Run the deployment check
checkDeployment().catch(console.error); 