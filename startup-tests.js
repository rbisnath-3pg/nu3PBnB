const axios = require('axios');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Configuration
const API_BASE = process.env.API_BASE || 'https://nu3pbnb-api.onrender.com';
const TEST_RESULTS_FILE = path.join(__dirname, 'logs/startup-test-results.json');

// Test users
const TEST_USERS = {
  admin: {
    email: 'admin_robbie@google.com',
    password: 'admin123',
    role: 'admin'
  },
  host1: {
    email: 'host_davonte@hotmail.com',
    password: 'host123',
    role: 'host'
  },
  host2: {
    email: 'host_georgette@hotmail.com',
    password: 'host123',
    role: 'host'
  },
  guest1: {
    email: 'guest_patience@hotmail.com',
    password: 'guest123',
    role: 'guest'
  },
  guest2: {
    email: 'guest_rubie@gmail.com',
    password: 'guest123',
    role: 'guest'
  }
};

// Global diagnostics object
const diagnostics = {
  bookingTest: {
    lastRun: null,
    success: null,
    errors: [],
    logs: []
  }
};

global.nu3pbnbDiagnostics = diagnostics;

// Test Logger
class StartupTestLogger {
  constructor() {
    this.logs = [];
    this.startTime = Date.now();
    this.testResults = {
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      },
      tests: [],
      timestamp: new Date().toISOString(),
      duration: 0
    };
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };
    
    this.logs.push(logEntry);
    
    const timeStr = new Date().toLocaleTimeString();
    const levelColors = {
      INFO: '\x1b[36m', // Cyan
      SUCCESS: '\x1b[32m', // Green
      WARN: '\x1b[33m', // Yellow
      ERROR: '\x1b[31m', // Red
      RESET: '\x1b[0m' // Reset
    };
    
    console.log(`${levelColors[level]}[${timeStr}] ${level}: ${message}${levelColors.RESET}`);
    if (data) {
      console.log('  Data:', JSON.stringify(data, null, 2));
    }
  }

  info(message, data = null) {
    this.log('INFO', message, data);
  }

  success(message, data = null) {
    this.log('SUCCESS', message, data);
  }

  warn(message, data = null) {
    this.log('WARN', message, data);
  }

  error(message, data = null) {
    this.log('ERROR', message, data);
  }

  addTestResult(testName, status, details = {}) {
    this.testResults.summary.total++;
    
    const testResult = {
      name: testName,
      status,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.testResults.tests.push(testResult);
    
    switch (status) {
      case 'PASSED':
        this.testResults.summary.passed++;
        this.success(`✅ ${testName} - PASSED`);
        break;
      case 'FAILED':
        this.testResults.summary.failed++;
        this.error(`❌ ${testName} - FAILED`, details);
        break;
      case 'SKIPPED':
        this.testResults.summary.skipped++;
        this.warn(`⏭️ ${testName} - SKIPPED`, details);
        break;
    }
  }

  saveResults() {
    this.testResults.duration = Date.now() - this.startTime;
    
    // Ensure logs directory exists
    const logsDir = path.dirname(TEST_RESULTS_FILE);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    try {
      fs.writeFileSync(TEST_RESULTS_FILE, JSON.stringify(this.testResults, null, 2));
      this.success('Test results saved to logs/startup-test-results.json');
    } catch (error) {
      this.error('Failed to save test results', error);
    }
  }

  printSummary() {
    const { total, passed, failed, skipped } = this.testResults.summary;
    const duration = (this.testResults.duration / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('🚀 STARTUP TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️ Skipped: ${skipped}`);
    console.log(`⏱️ Duration: ${duration}s`);
    console.log(`📊 Success Rate: ${total > 0 ? ((passed / total) * 100).toFixed(1) : 0}%`);
    console.log('='.repeat(60));
  }
}

// HTTP Client with authentication
class TestClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = null;
    this.user = null;
  }

  async login(email, password) {
    try {
      const response = await axios.post(`${this.baseURL}/api/auth/login`, {
        email,
        password
      });
      
      if (response.data && response.data.token) {
        this.token = response.data.token;
        this.user = response.data.user;
        return { success: true, user: response.data.user };
      } else {
        return { success: false, error: 'No token in response' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async request(method, endpoint, data = null, requireAuth = true) {
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {}
    };

    if (requireAuth && this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    if (data) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      };
    }
  }
}

// Test Suite
class StartupTestSuite {
  constructor() {
    this.logger = new StartupTestLogger();
    this.clients = {};
  }

  async runAllTests() {
    this.logger.info('🚀 Starting comprehensive startup tests...');
    
    try {
      // Basic connectivity and health checks
      await this.testApiConnectivity();
      
      // Authentication tests
      await this.testAuthentication();
      
      // Role-based functionality tests
      await this.testAdminFunctions();
      await this.testHostFunctions();
      await this.testGuestFunctions();
      
      // Public endpoint tests
      await this.testPublicEndpoints();
      
      // Error handling tests
      await this.testErrorHandling();
      
      // Booking functionality test
      await this.testBookingFunctionality();
      
    } catch (error) {
      this.logger.error('Startup test suite failed', error);
    } finally {
      this.logger.saveResults();
      this.logger.printSummary();
    }
  }

  async testApiConnectivity() {
    this.logger.info('Testing API connectivity...');
    
    try {
      const response = await axios.get(`${API_BASE}/api/health`);
      if (response.status === 200) {
        this.logger.addTestResult('API Connectivity', 'PASSED', { status: response.status });
      } else {
        this.logger.addTestResult('API Connectivity', 'FAILED', { status: response.status });
      }
    } catch (error) {
      this.logger.addTestResult('API Connectivity', 'FAILED', { error: error.message });
    }
  }

  async testAuthentication() {
    this.logger.info('Testing authentication for all user types...');

    for (const [userType, userData] of Object.entries(TEST_USERS)) {
      const client = new TestClient(API_BASE);
      const result = await client.login(userData.email, userData.password);
      
      if (result.success) {
        this.clients[userType] = client;
        this.logger.addTestResult(`${userType.toUpperCase()} Login`, 'PASSED', {
          userId: result.user._id,
          role: result.user.role
        });
      } else {
        this.logger.addTestResult(`${userType.toUpperCase()} Login`, 'FAILED', {
          error: result.error
        });
      }
    }
  }

  async testAdminFunctions() {
    this.logger.info('Testing admin functions...');
    const adminClient = this.clients.admin;
    
    if (!adminClient) {
      this.logger.addTestResult('Admin Functions', 'SKIPPED', { reason: 'Admin login failed' });
      return;
    }

    // Test admin user management
    const usersResult = await adminClient.request('GET', '/api/admin/users');
    this.logger.addTestResult('Admin - View Users', 
      usersResult.success ? 'PASSED' : 'FAILED',
      usersResult.success ? { userCount: usersResult.data?.length } : { error: usersResult.error }
    );

    // Test admin listing management
    const listingsResult = await adminClient.request('GET', '/api/admin/listings');
    this.logger.addTestResult('Admin - View Listings', 
      listingsResult.success ? 'PASSED' : 'FAILED',
      listingsResult.success ? { listingCount: listingsResult.data?.length } : { error: listingsResult.error }
    );

    // Test admin message management
    const messagesResult = await adminClient.request('GET', '/api/admin/messages');
    this.logger.addTestResult('Admin - View Messages', 
      messagesResult.success ? 'PASSED' : 'FAILED',
      messagesResult.success ? { messageCount: messagesResult.data?.messages?.length } : { error: messagesResult.error }
    );

    // Test admin conversations
    const conversationsResult = await adminClient.request('GET', '/api/admin/messages/conversations');
    this.logger.addTestResult('Admin - View Conversations', 
      conversationsResult.success ? 'PASSED' : 'FAILED',
      conversationsResult.success ? { conversationCount: conversationsResult.data?.conversations?.length } : { error: conversationsResult.error }
    );

    // Test admin unread count
    const unreadResult = await adminClient.request('GET', '/api/admin/messages/unread-count');
    this.logger.addTestResult('Admin - Unread Count', 
      unreadResult.success ? 'PASSED' : 'FAILED',
      unreadResult.success ? { unreadCount: unreadResult.data?.unreadCount } : { error: unreadResult.error }
    );

    // Test admin analytics
    const analyticsResult = await adminClient.request('GET', '/api/admin/analytics');
    this.logger.addTestResult('Admin - Analytics', 
      analyticsResult.success ? 'PASSED' : 'FAILED',
      analyticsResult.success ? { hasData: !!analyticsResult.data } : { error: analyticsResult.error }
    );

    // Test admin test results
    const testResultsResult = await adminClient.request('GET', '/api/admin/test-results');
    this.logger.addTestResult('Admin - Test Results', 
      testResultsResult.success ? 'PASSED' : 'FAILED',
      testResultsResult.success ? { hasResults: !!testResultsResult.data } : { error: testResultsResult.error }
    );

    // Test admin content management
    const contentResult = await adminClient.request('GET', '/api/admin/content');
    this.logger.addTestResult('Admin - Content Management', 
      contentResult.success ? 'PASSED' : 'FAILED',
      contentResult.success ? { hasContent: !!contentResult.data } : { error: contentResult.error }
    );

    // Test admin feedback
    const feedbackResult = await adminClient.request('GET', '/api/admin/feedback');
    this.logger.addTestResult('Admin - Feedback', 
      feedbackResult.success ? 'PASSED' : 'FAILED',
      feedbackResult.success ? { hasFeedback: !!feedbackResult.data } : { error: feedbackResult.error }
    );

    // Test admin reviews
    const reviewsResult = await adminClient.request('GET', '/api/admin/reviews');
    this.logger.addTestResult('Admin - Reviews', 
      reviewsResult.success ? 'PASSED' : 'FAILED',
      reviewsResult.success ? { hasReviews: !!reviewsResult.data } : { error: reviewsResult.error }
    );

    // Test admin payments
    const paymentsResult = await adminClient.request('GET', '/api/admin/payments');
    this.logger.addTestResult('Admin - Payments', 
      paymentsResult.success ? 'PASSED' : 'FAILED',
      paymentsResult.success ? { hasPayments: !!paymentsResult.data } : { error: paymentsResult.error }
    );
  }

  async testHostFunctions() {
    this.logger.info('Testing host functions...');
    
    for (const [hostType, hostClient] of Object.entries(this.clients)) {
      if (!hostType.includes('host') || !hostClient) continue;

      this.logger.info(`Testing ${hostType} functions...`);

      // Test host bookings
      const bookingsResult = await hostClient.request('GET', '/api/host/bookings');
      this.logger.addTestResult(`${hostType.toUpperCase()} - View Bookings`, 
        bookingsResult.success ? 'PASSED' : 'FAILED',
        bookingsResult.success ? { bookingCount: bookingsResult.data?.length } : { error: bookingsResult.error }
      );

      // Test host listings
      const listingsResult = await hostClient.request('GET', '/api/listings/my-listings');
      this.logger.addTestResult(`${hostType.toUpperCase()} - My Listings`, 
        listingsResult.success ? 'PASSED' : 'FAILED',
        listingsResult.success ? { listingCount: listingsResult.data?.length } : { error: listingsResult.error }
      );

      // Test host dashboard
      const dashboardResult = await hostClient.request('GET', '/api/host/dashboard');
      this.logger.addTestResult(`${hostType.toUpperCase()} - Dashboard`, 
        dashboardResult.success ? 'PASSED' : 'FAILED',
        dashboardResult.success ? { hasData: !!dashboardResult.data } : { error: dashboardResult.error }
      );

      // Test host payments
      const paymentsResult = await hostClient.request('GET', '/api/host/payments');
      this.logger.addTestResult(`${hostType.toUpperCase()} - Payments`, 
        paymentsResult.success ? 'PASSED' : 'FAILED',
        paymentsResult.success ? { hasPayments: !!paymentsResult.data } : { error: paymentsResult.error }
      );

      // Test host analytics
      const analyticsResult = await hostClient.request('GET', '/api/host/analytics');
      this.logger.addTestResult(`${hostType.toUpperCase()} - Analytics`, 
        analyticsResult.success ? 'PASSED' : 'FAILED',
        analyticsResult.success ? { hasAnalytics: !!analyticsResult.data } : { error: analyticsResult.error }
      );

      // Test host messages
      const messagesResult = await hostClient.request('GET', '/api/host/messages');
      this.logger.addTestResult(`${hostType.toUpperCase()} - Messages`, 
        messagesResult.success ? 'PASSED' : 'FAILED',
        messagesResult.success ? { hasMessages: !!messagesResult.data } : { error: messagesResult.error }
      );

      // Test host profile
      const profileResult = await hostClient.request('GET', '/api/host/profile');
      this.logger.addTestResult(`${hostType.toUpperCase()} - Profile`, 
        profileResult.success ? 'PASSED' : 'FAILED',
        profileResult.success ? { hasProfile: !!profileResult.data } : { error: profileResult.error }
      );
    }
  }

  async testGuestFunctions() {
    this.logger.info('Testing guest functions...');
    
    for (const [guestType, guestClient] of Object.entries(this.clients)) {
      if (!guestType.includes('guest') || !guestClient) continue;

      this.logger.info(`Testing ${guestType} functions...`);

      // Test guest bookings
      const bookingsResult = await guestClient.request('GET', '/api/bookings/my-bookings');
      this.logger.addTestResult(`${guestType.toUpperCase()} - My Bookings`, 
        bookingsResult.success ? 'PASSED' : 'FAILED',
        bookingsResult.success ? { bookingCount: bookingsResult.data?.length } : { error: bookingsResult.error }
      );

      // Test guest wishlist
      const wishlistResult = await guestClient.request('GET', '/api/wishlist');
      this.logger.addTestResult(`${guestType.toUpperCase()} - Wishlist`, 
        wishlistResult.success ? 'PASSED' : 'FAILED',
        wishlistResult.success ? { wishlistCount: wishlistResult.data?.length } : { error: wishlistResult.error }
      );

      // Test guest messages
      const messagesResult = await guestClient.request('GET', '/api/messages');
      this.logger.addTestResult(`${guestType.toUpperCase()} - Messages`, 
        messagesResult.success ? 'PASSED' : 'FAILED',
        messagesResult.success ? { messageCount: messagesResult.data?.messages?.length } : { error: messagesResult.error }
      );

      // Test guest profile
      const profileResult = await guestClient.request('GET', '/api/users/profile');
      this.logger.addTestResult(`${guestType.toUpperCase()} - Profile`, 
        profileResult.success ? 'PASSED' : 'FAILED',
        profileResult.success ? { hasProfile: !!profileResult.data } : { error: profileResult.error }
      );

      // Test guest payments
      const paymentsResult = await guestClient.request('GET', '/api/payments/my-payments');
      this.logger.addTestResult(`${guestType.toUpperCase()} - My Payments`, 
        paymentsResult.success ? 'PASSED' : 'FAILED',
        paymentsResult.success ? { paymentCount: paymentsResult.data?.length } : { error: paymentsResult.error }
      );

      // Test guest reviews
      const reviewsResult = await guestClient.request('GET', '/api/reviews/my-reviews');
      this.logger.addTestResult(`${guestType.toUpperCase()} - My Reviews`, 
        reviewsResult.success ? 'PASSED' : 'FAILED',
        reviewsResult.success ? { reviewCount: reviewsResult.data?.length } : { error: reviewsResult.error }
      );

      // Test guest feedback
      const feedbackResult = await guestClient.request('GET', '/api/feedback/my-feedback');
      this.logger.addTestResult(`${guestType.toUpperCase()} - My Feedback`, 
        feedbackResult.success ? 'PASSED' : 'FAILED',
        feedbackResult.success ? { feedbackCount: feedbackResult.data?.length } : { error: feedbackResult.error }
      );

      // Test guest onboarding
      const onboardingResult = await guestClient.request('GET', '/api/onboarding/status');
      this.logger.addTestResult(`${guestType.toUpperCase()} - Onboarding Status`, 
        onboardingResult.success ? 'PASSED' : 'FAILED',
        onboardingResult.success ? { hasStatus: !!onboardingResult.data } : { error: onboardingResult.error }
      );
    }
  }

  async testPublicEndpoints() {
    this.logger.info('Testing public endpoints...');

    // Test public listings
    const listingsResult = await axios.get(`${API_BASE}/api/listings`);
    this.logger.addTestResult('Public - Listings', 
      listingsResult.status === 200 ? 'PASSED' : 'FAILED',
      listingsResult.status === 200 ? { listingCount: listingsResult.data?.listings?.length } : { status: listingsResult.status }
    );

    // Test featured listings
    const featuredResult = await axios.get(`${API_BASE}/api/listings/featured`);
    this.logger.addTestResult('Public - Featured Listings', 
      featuredResult.status === 200 ? 'PASSED' : 'FAILED',
      featuredResult.status === 200 ? { featuredCount: featuredResult.data?.featuredListings?.length } : { status: featuredResult.status }
    );

    // Test search
    const searchResult = await axios.get(`${API_BASE}/api/listings/search?q=test`);
    this.logger.addTestResult('Public - Search', 
      searchResult.status === 200 ? 'PASSED' : 'FAILED',
      searchResult.status === 200 ? { hasResults: !!searchResult.data } : { status: searchResult.status }
    );

    // Test content
    const contentResult = await axios.get(`${API_BASE}/api/content`);
    this.logger.addTestResult('Public - Content', 
      contentResult.status === 200 ? 'PASSED' : 'FAILED',
      contentResult.status === 200 ? { hasContent: !!contentResult.data } : { status: contentResult.status }
    );

    // Test health endpoint
    const healthResult = await axios.get(`${API_BASE}/api/health`);
    this.logger.addTestResult('Public - Health Check', 
      healthResult.status === 200 ? 'PASSED' : 'FAILED',
      healthResult.status === 200 ? { status: healthResult.data?.status } : { status: healthResult.status }
    );

    // Test API info
    const apiInfoResult = await axios.get(`${API_BASE}/api`);
    this.logger.addTestResult('Public - API Info', 
      apiInfoResult.status === 200 ? 'PASSED' : 'FAILED',
      apiInfoResult.status === 200 ? { hasInfo: !!apiInfoResult.data } : { status: apiInfoResult.status }
    );

    // Test listings by city
    const cityListingsResult = await axios.get(`${API_BASE}/api/listings/city/New%20York`);
    this.logger.addTestResult('Public - Listings by City', 
      cityListingsResult.status === 200 ? 'PASSED' : 'FAILED',
      cityListingsResult.status === 200 ? { hasCityListings: !!cityListingsResult.data } : { status: cityListingsResult.status }
    );

    // Test listings by category
    const categoryListingsResult = await axios.get(`${API_BASE}/api/listings/category/apartment`);
    this.logger.addTestResult('Public - Listings by Category', 
      categoryListingsResult.status === 200 ? 'PASSED' : 'FAILED',
      categoryListingsResult.status === 200 ? { hasCategoryListings: !!categoryListingsResult.data } : { status: categoryListingsResult.status }
    );

    // Test reviews for a listing
    const reviewsResult = await axios.get(`${API_BASE}/api/reviews/listing/123456789012345678901234`);
    this.logger.addTestResult('Public - Listing Reviews', 
      reviewsResult.status === 200 ? 'PASSED' : 'FAILED',
      reviewsResult.status === 200 ? { hasReviews: !!reviewsResult.data } : { status: reviewsResult.status }
    );

    // Test user profile (public)
    const userProfileResult = await axios.get(`${API_BASE}/api/users/public/123456789012345678901234`);
    this.logger.addTestResult('Public - User Profile', 
      userProfileResult.status === 200 ? 'PASSED' : 'FAILED',
      userProfileResult.status === 200 ? { hasProfile: !!userProfileResult.data } : { status: userProfileResult.status }
    );
  }

  async testErrorHandling() {
    this.logger.info('Testing error handling and edge cases...');

    // Test invalid authentication
    const invalidAuthResult = await axios.get(`${API_BASE}/api/admin/users`, {
      headers: { Authorization: 'Bearer invalid-token' }
    }).catch(error => error.response);
    this.logger.addTestResult('Error Handling - Invalid Auth', 
      invalidAuthResult?.status === 401 ? 'PASSED' : 'FAILED',
      invalidAuthResult?.status === 401 ? { status: invalidAuthResult.status } : { status: invalidAuthResult?.status }
    );

    // Test non-existent endpoint
    const notFoundResult = await axios.get(`${API_BASE}/api/non-existent-endpoint`).catch(error => error.response);
    this.logger.addTestResult('Error Handling - 404 Not Found', 
      notFoundResult?.status === 404 ? 'PASSED' : 'FAILED',
      notFoundResult?.status === 404 ? { status: notFoundResult.status } : { status: notFoundResult?.status }
    );

    // Test invalid login
    const invalidLoginResult = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'invalid@email.com',
      password: 'wrongpassword'
    }).catch(error => error.response);
    this.logger.addTestResult('Error Handling - Invalid Login', 
      invalidLoginResult?.status === 401 ? 'PASSED' : 'FAILED',
      invalidLoginResult?.status === 401 ? { status: invalidLoginResult.status } : { status: invalidLoginResult?.status }
    );

    // Test malformed request
    const malformedResult = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'not-an-email',
      password: ''
    }).catch(error => error.response);
    this.logger.addTestResult('Error Handling - Malformed Request', 
      malformedResult?.status === 400 ? 'PASSED' : 'FAILED',
      malformedResult?.status === 400 ? { status: malformedResult.status } : { status: malformedResult?.status }
    );

    // Test rate limiting (if applicable)
    const rateLimitPromises = [];
    for (let i = 0; i < 10; i++) {
      rateLimitPromises.push(axios.get(`${API_BASE}/api/health`).catch(error => error.response));
    }
    const rateLimitResults = await Promise.all(rateLimitPromises);
    const rateLimited = rateLimitResults.some(result => result?.status === 429);
    this.logger.addTestResult('Error Handling - Rate Limiting', 
      rateLimited ? 'PASSED' : 'SKIPPED',
      rateLimited ? { status: 429 } : { reason: 'Rate limiting not triggered' }
    );
  }

  async testBookingFunctionality() {
    this.logger.info('Testing booking functionality...');

    const TEST_USER = {
      email: 'guest_patience@hotmail.com',
      password: 'guest123'
    };
    const logs = [];
    const errors = [];
    let success = true;
    let token = null;
    let bookingId = null;
    let paymentId = null;
    try {
      logs.push('🧪 [BookingTest] Logging in as guest...');
      const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_USER)
      });
      if (!loginRes.ok) throw new Error(`[BookingTest] Login failed: ${loginRes.status}`);
      const loginData = await loginRes.json();
      token = loginData.token;
      logs.push('✅ [BookingTest] Login successful');

      logs.push('🧪 [BookingTest] Fetching listings...');
      const listingsRes = await fetch(`${API_BASE}/api/listings`, { headers: { Authorization: `Bearer ${token}` } });
      if (!listingsRes.ok) throw new Error(`[BookingTest] Listings fetch failed: ${listingsRes.status}`);
      const listingsData = await listingsRes.json();
      const listings = listingsData.listings || [];
      if (!listings.length) throw new Error('[BookingTest] No listings found');
      const testListing = listings[0];
      logs.push(`✅ [BookingTest] Found ${listings.length} listings, using: ${testListing.title}`);

      logs.push('🧪 [BookingTest] Creating booking...');
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 40);
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 43);
      const bookingData = {
        listingId: testListing._id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        guests: 2,
        message: 'Startup booking test'
      };
      const bookingRes = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      if (!bookingRes.ok) {
        const err = await bookingRes.json().catch(() => ({}));
        throw new Error(`[BookingTest] Booking creation failed: ${bookingRes.status} - ${err.message || bookingRes.statusText}`);
      }
      const bookingResult = await bookingRes.json();
      bookingId = bookingResult.booking._id;
      logs.push(`✅ [BookingTest] Booking created: ${bookingId}`);

      logs.push('🧪 [BookingTest] Fetching user bookings...');
      const userBookingsRes = await fetch(`${API_BASE}/api/bookings`, { headers: { Authorization: `Bearer ${token}` } });
      if (!userBookingsRes.ok) throw new Error(`[BookingTest] User bookings fetch failed: ${userBookingsRes.status}`);
      const userBookingsData = await userBookingsRes.json();
      const found = userBookingsData.bookings.some(b => b._id === bookingId);
      if (!found) throw new Error('[BookingTest] Created booking not found in user bookings');
      logs.push('✅ [BookingTest] Booking found in user bookings');

      logs.push('🧪 [BookingTest] Processing payment...');
      const paymentData = {
        bookingId,
        amount: bookingResult.booking.totalPrice,
        paymentMethod: 'credit_card',
        paymentType: 'new'
      };
      const paymentRes = await fetch(`${API_BASE}/api/payments/process`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      if (!paymentRes.ok) {
        const err = await paymentRes.json().catch(() => ({}));
        throw new Error(`[BookingTest] Payment failed: ${paymentRes.status} - ${err.message || paymentRes.statusText}`);
      }
      const paymentResult = await paymentRes.json();
      paymentId = paymentResult.payment._id;
      logs.push(`✅ [BookingTest] Payment processed: ${paymentId}`);
    } catch (err) {
      errors.push(err.message);
      logs.push(`❌ [BookingTest] Error: ${err.message}`);
      success = false;
    }
    this.logger.addTestResult('Booking Functionality', 
      success ? 'PASSED' : 'FAILED',
      { errors: errors.join(', '), logs: logs.join('\n') }
    );
    
    // Update global diagnostics for frontend access
    global.nu3pbnbDiagnostics = {
      bookingTest: {
        lastRun: new Date().toISOString(),
        success,
        errors,
        logs
      }
    };
  }
}

// Run the tests
async function runStartupTests() {
  const testSuite = new StartupTestSuite();
  await testSuite.runAllTests();
}

// Export for use in other files
module.exports = {
  StartupTestSuite,
  StartupTestLogger,
  TestClient,
  runStartupTests
};

// Run if called directly
if (require.main === module) {
  runStartupTests().catch(console.error);
} 