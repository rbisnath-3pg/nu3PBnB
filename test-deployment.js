const axios = require('axios');

const API_BASE = 'https://nu3pbnb-api.onrender.com';

async function testDeployment() {
  console.log('🚀 Testing nu3PBnB Deployment...\n');
  
  const tests = [
    {
      name: 'API Health Check',
      test: async () => {
        const response = await axios.get(`${API_BASE}/`);
        return response.data === 'nu3PBnB API is running';
      }
    },
    {
      name: 'Authentication Endpoint',
      test: async () => {
        const response = await axios.get(`${API_BASE}/api/auth/me`);
        return response.data.message === 'No token provided';
      }
    },
    {
      name: 'Listings Endpoint (Basic)',
      test: async () => {
        try {
          const response = await axios.get(`${API_BASE}/api/listings`);
          return response.status === 200;
        } catch (error) {
          console.log('   ⚠️  Listings endpoint error:', error.response?.data?.message || error.message);
          return false;
        }
      }
    },
    {
      name: 'CORS Configuration',
      test: async () => {
        const response = await axios.get(`${API_BASE}/`);
        return response.headers['access-control-allow-credentials'] === 'true';
      }
    },
    {
      name: 'SSL Certificate',
      test: async () => {
        const response = await axios.get(`${API_BASE}/`);
        return response.request.res.socket.encrypted === true;
      }
    }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}...`);
      const result = await test.test();
      if (result) {
        console.log(`   ✅ ${test.name} - PASSED`);
        passed++;
      } else {
        console.log(`   ❌ ${test.name} - FAILED`);
      }
    } catch (error) {
      console.log(`   ❌ ${test.name} - ERROR: ${error.message}`);
    }
    console.log('');
  }

  console.log(`📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Your deployment is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the deployment logs for issues.');
  }

  // Test database connection
  console.log('\n🗄️  Testing Database Connection...');
  try {
    const response = await axios.get(`${API_BASE}/api/listings`);
    if (response.status === 200) {
      console.log('   ✅ Database connection working');
    } else {
      console.log('   ❌ Database connection issues');
    }
  } catch (error) {
    console.log('   ❌ Database connection failed:', error.response?.data?.message || error.message);
  }
}

testDeployment().catch(console.error); 