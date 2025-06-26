const fetch = require('node-fetch');

const API_BASE = 'https://nu3pbnb-api.onrender.com';

async function testLogin() {
  try {
    console.log('Testing login with admin@nu3pbnb.com...');
    
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@nu3pbnb.com',
        password: 'admin123'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Response body:', data);
    
    if (response.ok) {
      const jsonData = JSON.parse(data);
      console.log('✅ Login successful!');
      console.log('Token:', jsonData.token ? jsonData.token.substring(0, 20) + '...' : 'No token');
      console.log('User:', jsonData.user);
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.error('Error testing login:', error);
  }
}

testLogin(); 