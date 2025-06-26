require('dotenv').config();
const fetch = require('node-fetch');

const SERVICES = {
  backend: 'https://nu3pbnb-api.onrender.com',
  frontend: 'https://nu3pbnb-frontend.onrender.com'
};

async function checkService(url, name) {
  try {
    console.log(`🔍 Checking ${name}...`);
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      timeout: 10000
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (response.ok) {
      console.log(`✅ ${name} is UP - Status: ${response.status} (${responseTime}ms)`);
      return { status: 'up', responseTime, statusCode: response.status };
    } else {
      console.log(`⚠️ ${name} is responding but with status: ${response.status} (${responseTime}ms)`);
      return { status: 'warning', responseTime, statusCode: response.status };
    }
  } catch (error) {
    console.log(`❌ ${name} is DOWN - Error: ${error.message}`);
    return { status: 'down', error: error.message };
  }
}

async function testLoginFunctionality() {
  console.log('\n🔐 Testing Login Functionality...');
  
  try {
    const response = await fetch(`${SERVICES.backend}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin_robbie@google.com',
        password: 'admin123'
      }),
      timeout: 10000
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Login API working - Admin login successful`);
      return true;
    } else {
      console.log(`❌ Login API not working - Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Login API error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Checking nu3PBnB Deployment Status');
  console.log('=====================================\n');

  const results = {};

  // Check backend
  results.backend = await checkService(SERVICES.backend, 'Backend API');
  
  // Check frontend
  results.frontend = await checkService(SERVICES.frontend, 'Frontend App');

  // Test login functionality
  results.login = await testLoginFunctionality();

  console.log('\n=====================================');
  console.log('📊 DEPLOYMENT SUMMARY:');
  console.log('=====================================');
  
  const allServicesUp = results.backend.status === 'up' && results.frontend.status === 'up';
  const loginWorking = results.login;
  
  console.log(`Backend: ${results.backend.status === 'up' ? '✅ UP' : '❌ DOWN'}`);
  console.log(`Frontend: ${results.frontend.status === 'up' ? '✅ UP' : '❌ DOWN'}`);
  console.log(`Login API: ${loginWorking ? '✅ WORKING' : '❌ FAILED'}`);
  
  if (allServicesUp && loginWorking) {
    console.log('\n🎉 All services are deployed and working!');
    console.log('🌐 Frontend: https://nu3pbnb-frontend.onrender.com');
    console.log('🔧 Backend: https://nu3pbnb-api.onrender.com');
  } else {
    console.log('\n⚠️ Some services may still be deploying or have issues.');
    console.log('💡 Check Render dashboard for deployment status.');
  }

  return { allServicesUp, loginWorking, results };
}

main().catch(console.error); 