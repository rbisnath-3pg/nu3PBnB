// Automatic login testing service
// Attempts to log in with a set of test credentials and returns a summary

const API_BASE = import.meta && import.meta.env && import.meta.env.VITE_API_BASE
  ? import.meta.env.VITE_API_BASE
  : (typeof window !== 'undefined' ? window.API_BASE : 'https://nu3pbnb-api.onrender.com');

const TEST_USERS = [
  { email: 'admin@nu3pbnb.com', password: 'admin123', role: 'admin' },
  { email: 'davonte_runolfsdottir-russel@hotmail.com', password: 'host123', role: 'host' },
  { email: 'georgette_klocko@hotmail.com', password: 'host123', role: 'host' },
  { email: 'josh15@hotmail.com', password: 'host123', role: 'host' },
  { email: 'patience_kutch78@hotmail.com', password: 'guest123', role: 'guest' },
  { email: 'rubie.maggio38@gmail.com', password: 'guest123', role: 'guest' },
];

export default async function testLogins() {
  const results = [];
  let allPassed = true;

  for (const user of TEST_USERS) {
    try {
      const payload = { email: user.email, password: user.password };
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      const passed = response.ok && data.user && data.user.email === user.email;
      results.push({
        email: user.email,
        role: user.role,
        status: response.status,
        passed,
        response: data,
      });
      if (!passed) {
        allPassed = false;
        console.error('[AUTO LOGIN TEST] Failed:', { user, response: data });
      } else {
        console.log('[AUTO LOGIN TEST] Success:', { user, response: data });
      }
    } catch (err) {
      allPassed = false;
      results.push({
        email: user.email,
        role: user.role,
        status: 'network-error',
        passed: false,
        error: err.message,
      });
      console.error('[AUTO LOGIN TEST] Network error:', { user, error: err });
    }
  }

  return {
    success: allPassed,
    tested: TEST_USERS.length,
    results,
    timestamp: new Date().toISOString(),
  };
} 