const API_BASE = 'http://localhost:3000/api';

async function testMessagingAPI() {
  console.log('Testing Messaging API...\n');

  try {
    // First, let's sign in to get a token
    console.log('1. Testing sign in...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
    });

    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');

    // Test getting available users
    console.log('\n2. Testing get available users...');
    const usersResponse = await fetch(`${API_BASE}/messages/users/available`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log(`✅ Found ${usersData.data.length} available users`);
      console.log('Users:', usersData.data.map(u => u.name));
    } else {
      console.log('❌ Failed to get users');
    }

    // Test getting inbox
    console.log('\n3. Testing get inbox...');
    const inboxResponse = await fetch(`${API_BASE}/messages/inbox`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (inboxResponse.ok) {
      const inboxData = await inboxResponse.json();
      console.log(`✅ Inbox has ${inboxData.data.length} messages`);
    } else {
      console.log('❌ Failed to get inbox');
    }

    // Test getting sent messages
    console.log('\n4. Testing get sent messages...');
    const sentResponse = await fetch(`${API_BASE}/messages/sent`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (sentResponse.ok) {
      const sentData = await sentResponse.json();
      console.log(`✅ Sent messages: ${sentData.data.length}`);
    } else {
      console.log('❌ Failed to get sent messages');
    }

    // Test getting conversations
    console.log('\n5. Testing get conversations...');
    const conversationsResponse = await fetch(`${API_BASE}/messages/conversations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (conversationsResponse.ok) {
      const conversationsData = await conversationsResponse.json();
      console.log(`✅ Conversations: ${conversationsData.data.length}`);
    } else {
      console.log('❌ Failed to get conversations');
    }

    // Test sending a message
    console.log('\n6. Testing send message...');
    const sendMessageResponse = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        recipient: '507f1f77bcf86cd799439011', // Use a test user ID
        subject: 'Test Message',
        content: 'This is a test message from the API'
      })
    });

    if (sendMessageResponse.ok) {
      const sendData = await sendMessageResponse.json();
      console.log('✅ Message sent successfully');
      console.log('Message ID:', sendData.data._id);
    } else {
      console.log('❌ Failed to send message');
    }

    console.log('\n🎉 Messaging API test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMessagingAPI(); 