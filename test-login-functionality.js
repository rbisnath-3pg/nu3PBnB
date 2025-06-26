require('dotenv').config();
const fetch = require('node-fetch');

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

// Test users from the simulation script
const TEST_USERS = [
  { email: 'admin@nu3pbnb.com', password: 'admin123', role: 'admin' },
  { email: 'Raul50@gmail.com', password: 'host123', role: 'host' },
  { email: 'Ashtyn.Barrows99@gmail.com', password: 'host123', role: 'host' },
  { email: 'Evelyn_Feeney68@gmail.com', password: 'guest123', role: 'guest' },
  { email: 'Kristopher32@hotmail.com', password: 'guest123', role: 'guest' },
];

async function testLogin(email, password) {
  try {
    console.log(`Testing login for: ${email}`);
    
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ SUCCESS: ${email} - Role: ${data.user?.role}`);
      return { success: true, user: data.user, token: data.token };
    } else {
      console.log(`❌ FAILED: ${email} - ${data.message}`);
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.log(`🌐 NETWORK ERROR: ${email} - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔐 Testing Login Functionality');
  console.log('API Base:', API_BASE);
  console.log('===============================\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const user of TEST_USERS) {
    totalTests++;
    const result = await testLogin(user.email, user.password);
    
    if (result.success) {
      passedTests++;
    } else {
      failedTests++;
    }
    
    console.log(''); // Add spacing between tests
  }

  console.log('===============================');
  console.log('📊 TEST SUMMARY:');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All login tests passed!');
  } else {
    console.log('⚠️ Some login tests failed. Check the results above.');
  }
}

main().catch(console.error); 