// Automatic login testing service
// Attempts to log in with a set of test credentials and returns a summary

const API_BASE = import.meta && import.meta.env && import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : (typeof window !== 'undefined' && window.API_BASE) 
    ? window.API_BASE 
    : 'https://nu3pbnb-api.onrender.com';

// LOCKED TEST USERS - DO NOT MODIFY
// These users are locked and always present in all environments
const TEST_USERS = [
  { email: 'admin@nu3pbnb.com', password: 'admin123', role: 'admin' },
  { email: 'Raul50@gmail.com', password: 'host123', role: 'host' },
  { email: 'Ashtyn.Barrows99@gmail.com', password: 'host123', role: 'host' },
  { email: 'Evelyn_Feeney68@gmail.com', password: 'guest123', role: 'guest' },
  { email: 'Kristopher32@hotmail.com', password: 'guest123', role: 'guest' },
];

export default async function testLogins() {
  console.log('[LOGIN TEST] Starting automated login tests...');
  console.log('[LOGIN TEST] API Base URL:', API_BASE);
  console.log('[LOGIN TEST] Environment check:', {
    hasImportMeta: !!import.meta,
    hasEnv: !!(import.meta && import.meta.env),
    viteApiUrl: import.meta?.env?.VITE_API_URL,
    windowApiBase: typeof window !== 'undefined' ? window.API_BASE : 'N/A'
  });
  console.log('[LOGIN TEST] Test users:', TEST_USERS.map(u => ({ email: u.email, role: u.role })));
  
  const results = [];
  let allPassed = true;
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let networkErrors = 0;

  for (const user of TEST_USERS) {
    totalTests++;
    console.log(`[LOGIN TEST] [${totalTests}/${TEST_USERS.length}] Testing ${user.role} user: ${user.email}`);
    
    try {
      const payload = { email: user.email, password: user.password };
      const loginUrl = `${API_BASE}/api/auth/login`;
      console.log(`[LOGIN TEST] [${totalTests}/${TEST_USERS.length}] Sending login request:`, {
        url: loginUrl,
        method: 'POST',
        payload: { ...payload, password: '[REDACTED]' }
      });
      
      const startTime = Date.now();
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log(`[LOGIN TEST] [${totalTests}/${TEST_USERS.length}] Response received:`, {
        status: response.status,
        statusText: response.statusText,
        responseTime: `${responseTime}ms`,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      let data;
      try {
        const responseText = await response.text();
        console.log(`[LOGIN TEST] [${totalTests}/${TEST_USERS.length}] Raw response text:`, responseText);
        
        if (responseText.trim()) {
          data = JSON.parse(responseText);
          console.log(`[LOGIN TEST] [${totalTests}/${TEST_USERS.length}] Parsed response data:`, data);
        } else {
          console.warn(`[LOGIN TEST] [${totalTests}/${TEST_USERS.length}] Empty response text`);
          data = {};
        }
      } catch (parseError) {
        console.error(`[LOGIN TEST] [${totalTests}/${TEST_USERS.length}] JSON parse error:`, parseError);
        data = {};
      }
      
      // Detailed validation
      const hasUser = !!data.user;
      const hasToken = !!data.token;
      const emailMatch = data.user && data.user.email === user.email;
      const roleMatch = data.user && data.user.role === user.role;
      const responseOk = response.ok;
      
      console.log(`[LOGIN TEST] [${totalTests}/${TEST_USERS.length}] Validation results:`, {
        responseOk,
        hasUser,
        hasToken,
        emailMatch,
        roleMatch,
        expectedEmail: user.email,
        actualEmail: data.user?.email,
        expectedRole: user.role,
        actualRole: data.user?.role
      });
      
      const passed = responseOk && hasUser && hasToken && emailMatch && roleMatch;
      
      if (passed) {
        passedTests++;
        console.log(`[LOGIN TEST] [${totalTests}/${TEST_USERS.length}] ✅ SUCCESS: ${user.email} (${user.role})`);
      } else {
        failedTests++;
        allPassed = false;
        console.error(`[LOGIN TEST] [${totalTests}/${TEST_USERS.length}] ❌ FAILED: ${user.email} (${user.role})`, {
          responseOk,
          hasUser,
          hasToken,
          emailMatch,
          roleMatch,
          data
        });
      }
      
      results.push({
        email: user.email,
        role: user.role,
        status: response.status,
        statusText: response.statusText,
        responseTime,
        passed,
        validation: {
          responseOk,
          hasUser,
          hasToken,
          emailMatch,
          roleMatch
        },
        response: data,
        error: null
      });
      
    } catch (err) {
      networkErrors++;
      failedTests++;
      allPassed = false;
      console.error(`[LOGIN TEST] [${totalTests}/${TEST_USERS.length}] 🌐 NETWORK ERROR: ${user.email} (${user.role})`, {
        error: err.message,
        stack: err.stack,
        user
      });
      
      results.push({
        email: user.email,
        role: user.role,
        status: 'network-error',
        statusText: 'Network Error',
        responseTime: null,
        passed: false,
        validation: {
          responseOk: false,
          hasUser: false,
          hasToken: false,
          emailMatch: false,
          roleMatch: false
        },
        response: null,
        error: {
          message: err.message,
          type: err.name,
          stack: err.stack
        }
      });
    }
  }

  const summary = {
    success: allPassed,
    tested: totalTests,
    passed: passedTests,
    failed: failedTests,
    networkErrors,
    successRate: totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0,
    results,
    timestamp: new Date().toISOString(),
    apiBase: API_BASE
  };

  console.log('[LOGIN TEST] 🎯 FINAL SUMMARY:', {
    success: allPassed,
    totalTests,
    passedTests,
    failedTests,
    networkErrors,
    successRate: `${summary.successRate}%`,
    timestamp: summary.timestamp
  });
  
  console.log('[LOGIN TEST] 📊 DETAILED RESULTS:', results);
  
  return summary;
} 