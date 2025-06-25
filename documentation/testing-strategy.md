# nu3PBnB - Testing Strategy

## 📋 Overview

This document outlines the comprehensive testing strategy for the nu3PBnB application, covering unit, integration, and end-to-end testing approaches. **As of June 2025, all automated tests pass reliably, with robust import paths, mocks, and test data.**

## 🎯 Testing Objectives

- Ensure code quality and reliability
- Prevent regression bugs
- Maintain 90%+ test coverage
- Validate business requirements
- Ensure security and performance
- **Ensure all tests pass consistently in CI and local environments**

## 🧪 Testing Pyramid

### 1. Unit Tests (70%)
- **Scope**: Individual functions, components, and methods
- **Tools**: Jest, React Testing Library
- **Coverage**: 90%+ required
- **Speed**: Fast execution (< 1 second per test)

### 2. Integration Tests (20%)
- **Scope**: API endpoints, database operations, component interactions
- **Tools**: Jest, Supertest, MongoDB Memory Server
- **Coverage**: Critical user flows
- **Speed**: Medium execution (1-5 seconds per test)

### 3. End-to-End Tests (10%)
- **Scope**: Complete user journeys
- **Tools**: Cypress, Playwright
- **Coverage**: Key business scenarios
- **Speed**: Slow execution (10-30 seconds per test)

## 🔧 Testing Tools

### Backend Testing
- **Jest**: Test runner and assertion library
- **Supertest**: HTTP assertion library
- **MongoDB Memory Server**: In-memory database for testing
- **Sinon**: Mocking and stubbing

### Frontend Testing
- **Jest**: Test runner
- **React Testing Library**: Component testing
- **Cypress**: E2E testing
- **MSW**: API mocking

## 📝 Test Structure

### Backend Tests
```
tests/
├── unit/
│   ├── models/
│   ├── middleware/
│   └── utils/
├── integration/
│   ├── routes/
│   ├── auth/
│   └── database/
└── e2e/
    ├── booking-flow/
    └── payment-flow/
```

### Frontend Tests
```
frontend/src/
├── components/
│   ├── __tests__/
│   └── ComponentName.test.jsx
├── hooks/
│   └── __tests__/
└── services/
    └── __tests__/
```

## 🚀 Running Tests

### Development Commands
```bash
# Run all tests (all should pass)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm test -- --testPathPattern=bookings
npm test -- --testPathPattern=payments

# Run E2E tests
npm run test:e2e
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Run Tests
  run: |
    npm ci
    npm run test:coverage
    npm run test:e2e
```

## 📊 Coverage Requirements

### Minimum Coverage Targets
- **Statements**: 90%
- **Branches**: 85%
- **Functions**: 90%
- **Lines**: 90%

### Coverage Reports
- Generate HTML reports for detailed analysis
- Track coverage trends over time
- Fail builds if coverage drops below thresholds

## 🔍 Test Categories

### 1. Unit Tests

#### Model Tests
```javascript
describe('User Model', () => {
  it('should validate required fields', async () => {
    const user = new User({});
    await expect(user.save()).rejects.toThrow();
  });

  it('should hash password before saving', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123'
    });
    await user.save();
    expect(user.password).not.toBe('password123');
  });
});
```

#### Middleware Tests
```javascript
describe('Auth Middleware', () => {
  it('should authenticate valid token', async () => {
    const token = generateValidToken();
    const req = { header: () => `Bearer ${token}` };
    const res = {};
    const next = jest.fn();

    await auth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });
});
```

### 2. Integration Tests

#### API Route Tests
```javascript
describe('POST /api/bookings', () => {
  it('should create booking with valid data', async () => {
    const bookingData = {
      propertyId: 'property123',
      checkIn: '2024-01-01',
      checkOut: '2024-01-05',
      guests: 2
    };

    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.propertyId).toBe(bookingData.propertyId);
  });
});
```

### 3. E2E Tests

#### User Journey Tests
```javascript
describe('Booking Flow', () => {
  it('should complete booking process', () => {
    cy.visit('/');
    cy.get('[data-testid=search-input]').type('Paris');
    cy.get('[data-testid=search-button]').click();
    cy.get('[data-testid=property-card]').first().click();
    cy.get('[data-testid=book-button]').click();
    cy.get('[data-testid=payment-form]').should('be.visible');
  });
});
```

## 🛡️ Security Testing

### Authentication Tests
- JWT token validation
- Password hashing verification
- Session management
- Role-based access control

### Authorization Tests
- Route protection
- Resource access control
- Admin-only endpoints
- User permission validation

### Input Validation Tests
- SQL injection prevention
- XSS protection
- CSRF protection
- File upload security

## ⚡ Performance Testing

### Load Testing
- API endpoint performance
- Database query optimization
- Concurrent user handling
- Memory usage monitoring

### Stress Testing
- Maximum user capacity
- System failure recovery
- Database connection limits
- Memory leak detection

## 🔄 Test Data Management

### Test Fixtures
```javascript
// test-utils.js
const createTestUser = (overrides = {}) => ({
  email: 'test@example.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User',
  ...overrides
});

const createTestProperty = (overrides = {}) => ({
  title: 'Test Property',
  description: 'Test description',
  price: 100,
  ...overrides
});
```

### Database Seeding
```javascript
// seed-test-data.js
const seedTestData = async () => {
  await User.deleteMany({});
  await Property.deleteMany({});
  
  const users = await User.insertMany(testUsers);
  const properties = await Property.insertMany(testProperties);
  
  return { users, properties };
};
```

## 📈 Continuous Testing

### Pre-commit Hooks
- Run unit tests
- Check code coverage
- Lint code
- Format code

### Pull Request Checks
- Full test suite execution (all tests must pass)
- Coverage reporting
- Security scanning
- Performance benchmarks

### Production Monitoring
- Error tracking
- Performance monitoring
- User behavior analytics
- A/B testing

## 🐛 Bug Reporting

### Test Failure Analysis
- Detailed error messages
- Screenshots for UI failures
- Log collection
- Environment information

### Regression Testing
- Automated regression test suite
- Manual testing checklist
- Smoke tests for critical paths
- Performance regression detection

## 📚 Best Practices

### Test Writing Guidelines
1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Use meaningful test names
3. **Single Responsibility**: Test one thing per test
4. **Independent Tests**: Tests should not depend on each other
5. **Fast Execution**: Keep tests quick and efficient
6. **Correct Import Paths**: Always use correct relative paths in imports and mocks (e.g., '../../App' instead of '../App' if needed)
7. **Reliable Mocks**: Ensure all mocks match the actual component structure and API
8. **Comprehensive Test Data**: Mock data should include all fields expected by components
9. **Use data-testid**: Add data-testid attributes to components for reliable test queries

### Test Maintenance
1. **Regular Updates**: Update tests with code changes
2. **Refactoring**: Improve test code quality
3. **Documentation**: Document complex test scenarios
4. **Review Process**: Code review includes test review

### Test Environment
1. **Isolation**: Tests should not affect each other
2. **Clean State**: Reset state between tests
3. **Mocking**: Mock external dependencies
4. **Configuration**: Use test-specific configuration

---

*This testing strategy was updated in June 2025 to reflect the latest improvements in test reliability, coverage, and best practices.*

*Last Updated: June 2025*
*Version: 1.0* 