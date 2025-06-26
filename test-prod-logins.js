const fetch = require('node-fetch');

const API_BASE = 'https://nu3pbnb-api.onrender.com';
const TEST_USERS = [
  { email: 'admin_robbie@google.com', password: 'admin123', role: 'admin' },
  { email: 'host_davonte@hotmail.com', password: 'host123', role: 'host' },
  { email: 'host_georgette@hotmail.com', password: 'host123', role: 'host' },
  { email: 'host_josh@hotmail.com', password: 'host123', role: 'host' },
  { email: 'guest_patience@hotmail.com', password: 'guest123', role: 'guest' },
  { email: 'guest_rubie@gmail.com', password: 'guest123', role: 'guest' },
];

(async () => {
  let allPassed = true;
  for (const user of TEST_USERS) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: user.password })
      });
      const data = await res.json().catch(() => ({}));
      const passed = res.ok && data.user && data.user.email === user.email && data.user.role === user.role && !!data.token;
      if (passed) {
        console.log(`✅ ${user.email} (${user.role}): Login successful`);
      } else {
        allPassed = false;
        console.error(`❌ ${user.email} (${user.role}): Login failed`);
        console.error('  Response:', data);
      }
    } catch (err) {
      allPassed = false;
      console.error(`❌ ${user.email} (${user.role}): Network error`, err.message);
    }
  }
  if (allPassed) {
    console.log('\n🎉 All production logins succeeded!');
  } else {
    console.log('\n⚠️  Some production logins failed. See above for details.');
  }
})(); 