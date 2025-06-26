// Polyfill for TextEncoder/TextDecoder (needed for Node.js < 18)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill for setImmediate (needed for some middleware)
global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));

// Mock fetch for tests
global.fetch = jest.fn();

// Suppress Jest warnings for better test output
process.env.SUPPRESS_JEST_WARNINGS = 'true';

// Only set up browser-specific mocks if we're in a browser environment
if (typeof window !== 'undefined') {
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  global.localStorage = localStorageMock;

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Mock environment variables for tests
process.env.MONGODB_URI = 'mongodb://localhost:27017/nu3pbnb_test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';
process.env.SUPPRESS_JEST_WARNINGS = 'true';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Enhanced Jest setup with robust logging and error handling
console.log('🔧 Jest setup initialized - Environment:', process.env.NODE_ENV || 'test');

// Global test timeout
jest.setTimeout(15000);

// Enhanced error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Enhanced error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Log test environment details
console.log('📊 Test Environment Details:');
console.log('  - Node Version:', process.version);
console.log('  - Platform:', process.platform);
console.log('  - Architecture:', process.arch);
console.log('  - Memory Usage:', process.memoryUsage());

// Enhanced console logging for tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.log = (...args) => {
  originalConsoleLog('📝 [TEST LOG]', ...args);
};

console.error = (...args) => {
  originalConsoleError('❌ [TEST ERROR]', ...args);
};

console.warn = (...args) => {
  originalConsoleWarn('⚠️ [TEST WARN]', ...args);
};

// Global test utilities
global.testUtils = {
  logTestStart: (testName) => {
    console.log(`🚀 Starting test: ${testName}`);
  },
  logTestEnd: (testName, duration) => {
    console.log(`✅ Completed test: ${testName} (${duration}ms)`);
  },
  logTestError: (testName, error) => {
    console.error(`💥 Test failed: ${testName}`, error);
  }
};

// Enhanced beforeEach and afterEach logging
beforeEach(() => {
  const testName = expect.getState().currentTestName || 'Unknown';
  console.log(`🔄 Setting up test: ${testName}`);
  
  // Log test start with enhanced logging if available
  if (global.testUtils && global.testUtils.logTestStart) {
    global.testUtils.logTestStart(testName);
  }
});

afterEach(() => {
  const testName = expect.getState().currentTestName || 'Unknown';
  console.log(`🧹 Cleaning up test: ${testName}`);
  
  // Log test end with enhanced logging if available
  if (global.testUtils && global.testUtils.logTestEnd) {
    global.testUtils.logTestEnd(testName, 0); // Duration would need to be tracked
  }
});

// MongoDB connection setup for tests
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Global test setup
beforeAll(async () => {
  console.log('🔧 Setting up MongoDB for tests...');
  
  // Disconnect from any existing connections first
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  // Create new in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  console.log('📊 Connecting to MongoDB:', mongoUri);
  await mongoose.connect(mongoUri);
  
  console.log('✅ MongoDB setup completed');
}, 30000); // 30 second timeout for setup

// Clear all collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Global test teardown
afterAll(async () => {
  console.log('🧹 Cleaning up MongoDB connection...');
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
  
  console.log('✅ MongoDB cleanup completed');
}, 30000); // 30 second timeout for teardown

// Enhanced test result logging
const originalTest = global.test;
global.test = function(name, fn, timeout) {
  const startTime = Date.now();
  
  return originalTest(name, async (...args) => {
    try {
      console.log(`🚀 Test started: ${name}`);
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      console.log(`✅ Test passed: ${name} (${duration}ms)`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Test failed: ${name} (${duration}ms)`, error);
      throw error;
    }
  }, timeout);
};

// Enhanced describe logging
const originalDescribe = global.describe;
global.describe = function(name, fn) {
  return originalDescribe(name, () => {
    console.log(`📦 Test suite: ${name}`);
    return fn();
  });
};

// Log when setup is complete
console.log('✅ Jest setup completed successfully'); 