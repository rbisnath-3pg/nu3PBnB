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

async function main() {
  const iterations = 5;
  await Promise.all(
    USERS.map(user => simulateUser(user, iterations))
  );
  console.log('✅ Simulation complete!');
}

main(); 