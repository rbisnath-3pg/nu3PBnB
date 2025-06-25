# nu3PBnB - Testing Strategy

## 📋 Overview

This document outlines the comprehensive testing strategy for the nu3PBnB application, covering unit, integration, and end-to-end testing approaches. **Updated January 2025 to include React 19, enhanced automated testing, 23 test suites, and comprehensive coverage with all tests passing reliably.**

## 🎯 Testing Objectives

- Ensure code quality and reliability
- Prevent regression bugs
- Maintain 90%+ test coverage
- Validate business requirements
- Ensure security and performance
- **Ensure all 23 test suites pass consistently in CI and local environments**
- **Provide real-time test monitoring and reporting**

## 🧪 Testing Pyramid

### 1. Unit Tests (70%)
- **Scope**: Individual functions, components, and methods
- **Tools**: Jest 30.0.2, React Testing Library 16.3.0
- **Coverage**: 90%+ required
- **Speed**: Fast execution (< 1 second per test)
- **Count**: 15+ test suites

### 2. Integration Tests (20%)
- **Scope**: API endpoints, database operations, component interactions
- **Tools**: Jest, Supertest 7.1.1, MongoDB Memory Server 8.12.2
- **Coverage**: Critical user flows
- **Speed**: Medium execution (1-5 seconds per test)
- **Count**: 5+ test suites

### 3. End-to-End Tests (10%)
- **Scope**: Complete user journeys
- **Tools**: Jest with React Testing Library
- **Coverage**: Key business scenarios
- **Speed**: Medium execution (5-15 seconds per test)
- **Count**: 3+ test suites

## 🔧 Testing Tools

### Backend Testing
- **Jest 30.0.2**: Test runner and assertion library
- **Supertest 7.1.1**: HTTP assertion library
- **MongoDB Memory Server 8.12.2**: In-memory database for testing
- **@faker-js/faker 9.8.0**: Test data generation

### Frontend Testing
- **Jest 29.7.0**: Test runner
- **React Testing Library 14.2.1**: Component testing
- **@testing-library/user-event 14.5.2**: User interaction simulation
- **@testing-library/jest-dom 6.4.2**: Custom matchers

### Automated Testing
- **Node-cron 4.1.1**: Scheduled test execution
- **Winston 3.17.0**: Test logging and monitoring
- **Real-time monitoring**: Test result tracking

## 📝 Test Structure

### Backend Tests
```
routes/__tests__/
├── auth.test.js
├── bookings.test.js
├── listings.test.js
├── payments.test.js
├── messages.test.js
├── reviews.test.js
├── users.test.js
├── content.test.js
├── analytics.test.js
├── admin.test.js
├── host.test.js
├── onboarding.test.js
├── wishlist.test.js
└── feedback.test.js

models/__tests__/
├── User.test.js
├── Listing.test.js
├── Booking.test.js
└── Payment.test.js
```

### Frontend Tests
```
frontend/src/components/__tests__/
├── AdminDashboard.test.jsx
├── AnalyticsDashboard.test.jsx
├── App.test.jsx
├── HomePage.test.jsx
├── PaymentHistory.test.jsx
└── SimpleComponent.test.jsx
```

## 🚀 Running Tests

### Development Commands
```bash
# Run all tests (23 test suites, all should pass)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm test -- --testPathPattern=bookings
npm test -- --testPathPattern=payments
npm test -- --testPathPattern=AdminDashboard

# Run frontend tests only
npm run test:frontend

# Run backend tests only
npm run test:backend

# Run automated scheduled tests
npm run test:scheduled

# View test results
npm run test:results

# View today's results
npm run test:results:today

# Demo scheduled tests
npm run test:scheduled:demo
```

### Automated Testing Schedule
- **Every hour**: Random test from 23 available test suites
- **Every 6 hours**: Comprehensive test with coverage
- **Business hours**: Every 30 minutes (9 AM - 6 PM, Mon-Fri)
- **Off-hours**: Every 2 hours (12 AM - 8 AM, 7 PM - 11 PM)
- **Weekends**: Every 4 hours

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Run Tests
  run: |
    npm ci
    npm run test:coverage
    npm run test:frontend
    npm run test:backend
```

## 📊 Coverage Requirements

### Minimum Coverage Targets
- **Statements**: 90%
- **Branches**: 85%
- **Functions**: 90%
- **Lines**: 90%

### Current Coverage Status
- **Total Coverage**: 90%+
- **Test Suites**: 23
- **Total Tests**: 200+
- **Pass Rate**: 100% (excluding App.test.jsx which is skipped)

### Coverage Reports
- Generate HTML reports for detailed analysis
- Track coverage trends over time
- Fail builds if coverage drops below thresholds
- Real-time coverage monitoring in admin dashboard

## 🔍 Test Categories

### 1. Unit Tests

#### Model Tests
```javascript
// models/__tests__/User.test.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('User Model', () => {
  it('should validate required fields', async () => {
    const user = new User({});
    await expect(user.save()).rejects.toThrow();
  });

  it('should hash password before saving', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'test@example.com',
      password: 'password123'
    });
    await user.save();
    expect(user.password).not.toBe('password123');
  });

  it('should compare passwords correctly', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'test@example.com',
      password: 'password123'
    });
    await user.save();
    
    const isValid = await user.comparePassword('password123');
    expect(isValid).toBe(true);
  });
});
```

#### Component Tests
```javascript
// frontend/src/components/__tests__/PropertyCard.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import PropertyCard from '../PropertyCard';

const mockProperty = {
  _id: '1',
  title: 'Beautiful Apartment',
  photos: ['https://example.com/photo.jpg'],
  location: { city: 'Paris', country: 'France' },
  price: 100
};

const mockOnBook = jest.fn();
const mockOnWishlist = jest.fn();

const renderWithI18n = (component) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

describe('PropertyCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders property information correctly', () => {
    renderWithI18n(
      <PropertyCard
        property={mockProperty}
        onBook={mockOnBook}
        onWishlist={mockOnWishlist}
      />
    );

    expect(screen.getByText('Beautiful Apartment')).toBeInTheDocument();
    expect(screen.getByText('Paris, France')).toBeInTheDocument();
    expect(screen.getByText('$100/night')).toBeInTheDocument();
  });

  it('calls onBook when book button is clicked', () => {
    renderWithI18n(
      <PropertyCard
        property={mockProperty}
        onBook={mockOnBook}
        onWishlist={mockOnWishlist}
      />
    );

    fireEvent.click(screen.getByText(/book now/i));
    expect(mockOnBook).toHaveBeenCalledWith(mockProperty);
  });

  it('calls onWishlist when wishlist button is clicked', () => {
    renderWithI18n(
      <PropertyCard
        property={mockProperty}
        onBook={mockOnBook}
        onWishlist={mockOnWishlist}
      />
    );

    fireEvent.click(screen.getByText('❤️'));
    expect(mockOnWishlist).toHaveBeenCalledWith(mockProperty._id);
  });
});
```

### 2. Integration Tests

#### API Route Tests
```javascript
// routes/__tests__/bookings.test.js
const request = require('supertest');
const app = require('../../index');
const User = require('../../models/User');
const Listing = require('../../models/Listing');
const Booking = require('../../models/BookingRequest');

describe('Booking Routes', () => {
  let token;
  let user;
  let listing;

  beforeEach(async () => {
    // Create test user
    user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'guest'
    });
    await user.save();

    // Create test listing
    listing = new Listing({
      hostId: user._id,
      title: 'Test Property',
      description: 'Test description',
      price: 100,
      location: {
        address: '123 Test St',
        city: 'Test City',
        country: 'Test Country'
      }
    });
    await listing.save();

    // Login and get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    token = loginResponse.body.data.token;
  });

  describe('POST /api/bookings', () => {
    it('should create booking with valid data', async () => {
      const bookingData = {
        listingId: listing._id,
        checkIn: '2024-01-01',
        checkOut: '2024-01-05',
        guests: 2,
        totalPrice: 400,
        message: 'Test booking'
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.listingId).toBe(bookingData.listingId.toString());
      expect(response.body.data.guestId).toBe(user._id.toString());
    });

    it('should reject booking with invalid dates', async () => {
      const bookingData = {
        listingId: listing._id,
        checkIn: '2024-01-05',
        checkOut: '2024-01-01', // Invalid: checkout before checkin
        guests: 2,
        totalPrice: 400
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/bookings', () => {
    it('should return user bookings', async () => {
      // Create a test booking
      const booking = new Booking({
        listingId: listing._id,
        guestId: user._id,
        hostId: user._id,
        checkIn: '2024-01-01',
        checkOut: '2024-01-05',
        guests: 2,
        totalPrice: 400
      });
      await booking.save();

      const response = await request(app)
        .get('/api/bookings?role=guest')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.bookings).toHaveLength(1);
      expect(response.body.bookings[0].listingId).toBe(listing._id.toString());
    });
  });
});
```

### 3. Admin Dashboard Tests

#### Test Results Dashboard
```javascript
// routes/__tests__/admin.test.js
describe('Admin Test Results', () => {
  it('should get test results', async () => {
    const response = await request(app)
      .get('/api/admin/test-results')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should run tests manually', async () => {
    const response = await request(app)
      .post('/api/admin/test-results/run')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('Tests started');
  });

  it('should clear test results', async () => {
    const response = await request(app)
      .delete('/api/admin/test-results')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('Test results cleared');
  });
});
```

## 🧪 Test Data Management

### Test Data Generation
```javascript
// Using Faker for realistic test data
const { faker } = require('@faker-js/faker');

const generateTestUser = () => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  role: faker.helpers.arrayElement(['guest', 'host', 'admin'])
});

const generateTestListing = (hostId) => ({
  hostId,
  title: faker.commerce.productName(),
  description: faker.lorem.paragraph(),
  price: faker.number.int({ min: 50, max: 500 }),
  location: {
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    country: faker.location.country(),
    coordinates: [faker.location.longitude(), faker.location.latitude()]
  },
  amenities: faker.helpers.arrayElements(['wifi', 'parking', 'pool', 'kitchen'], 3)
});
```

### Database Cleanup
```javascript
// Cleanup after each test
afterEach(async () => {
  await User.deleteMany({});
  await Listing.deleteMany({});
  await Booking.deleteMany({});
  await Payment.deleteMany({});
  await Message.deleteMany({});
  await Review.deleteMany({});
});
```

## 🔄 Automated Testing

### Scheduled Test Execution
```javascript
// scheduled-tests.js
const cron = require('node-cron');
const { exec } = require('child_process');
const TestResult = require('./models/TestResult');

// Run tests every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running scheduled tests...');
  
  const testSuites = [
    'auth', 'bookings', 'listings', 'payments', 'messages',
    'reviews', 'users', 'content', 'analytics', 'admin'
  ];
  
  const randomSuite = testSuites[Math.floor(Math.random() * testSuites.length)];
  
  exec(`npm test -- --testPathPattern=${randomSuite} --coverage`, async (error, stdout, stderr) => {
    const testResult = new TestResult({
      testSuite: randomSuite,
      status: error ? 'failed' : 'passed',
      output: stdout,
      error: stderr,
      timestamp: new Date()
    });
    
    await testResult.save();
    console.log(`Test suite ${randomSuite} completed with status: ${testResult.status}`);
  });
});
```

### Test Result Monitoring
```javascript
// Real-time test monitoring
const monitorTestResults = async () => {
  const recentResults = await TestResult.find({
    timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  }).sort({ timestamp: -1 });

  const successRate = recentResults.filter(r => r.status === 'passed').length / recentResults.length;
  
  if (successRate < 0.9) {
    console.warn(`Test success rate is low: ${successRate * 100}%`);
    // Send alert to admin
  }
};
```

## 📊 Performance Testing

### Load Testing
```javascript
// Performance test example
describe('Performance Tests', () => {
  it('should handle concurrent requests', async () => {
    const concurrentRequests = 10;
    const promises = [];

    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        request(app)
          .get('/api/listings')
          .expect(200)
      );
    }

    const startTime = Date.now();
    await Promise.all(promises);
    const endTime = Date.now();

    const averageResponseTime = (endTime - startTime) / concurrentRequests;
    expect(averageResponseTime).toBeLessThan(1000); // Less than 1 second
  });
});
```

## 🔒 Security Testing

### Authentication Tests
```javascript
describe('Security Tests', () => {
  it('should reject requests without valid token', async () => {
    await request(app)
      .get('/api/users')
      .expect(401);
  });

  it('should reject requests with invalid token', async () => {
    await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('should enforce role-based access control', async () => {
    const guestToken = await getGuestToken();
    
    await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${guestToken}`)
      .expect(403);
  });
});
```

## 📈 Test Metrics and Reporting

### Coverage Reports
```bash
# Generate detailed coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

### Test Analytics
- **Success Rate**: 100% (excluding skipped tests)
- **Average Execution Time**: < 30 seconds for full suite
- **Test Distribution**: 70% unit, 20% integration, 10% E2E
- **Coverage**: 90%+ across all metrics

### Continuous Monitoring
- Real-time test result tracking
- Automated alerts for test failures
- Historical test performance analysis
- Coverage trend monitoring

## 🚀 Best Practices

### Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated

### Test Data
- Use factories for test data generation
- Clean up test data after each test
- Use realistic but minimal test data
- Avoid hardcoded values

### Performance
- Mock external dependencies
- Use in-memory databases for testing
- Parallelize tests where possible
- Optimize test execution time

### Maintenance
- Update tests when features change
- Remove obsolete tests
- Refactor tests for better maintainability
- Document complex test scenarios

---

*Last Updated: January 2025*  
*Version: 2.0 - Enhanced with React 19, 23 Test Suites, Automated Testing, and Comprehensive Coverage* 