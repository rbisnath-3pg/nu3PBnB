// Polyfill for TextEncoder and TextDecoder
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock import.meta for Vite compatibility
global.import = {
  meta: {
    env: {
      PROD: false,
      DEV: true,
      VITE_API_URL: 'http://localhost:3000/api'
    }
  }
};

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

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock import.meta.env for Jest
if (typeof globalThis.import === 'undefined') {
  globalThis.import = {};
}
globalThis.import.meta = {
  env: {
    VITE_API_URL: 'http://localhost:3000',
    PROD: false,
    DEV: true,
  },
};
process.env.VITE_API_URL = 'http://localhost:3000';

// Mock fetch for tests
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Enhanced frontend Jest setup with robust logging and error handling
console.log('🔧 Frontend Jest setup initialized - Environment:', process.env.NODE_ENV || 'test');

// Global test timeout
jest.setTimeout(15000);

// Enhanced error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Frontend Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Enhanced error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Frontend Uncaught Exception:', error);
  process.exit(1);
});

// Log test environment details
console.log('📊 Frontend Test Environment Details:');
console.log('  - Node Version:', process.version);
console.log('  - Platform:', process.platform);
console.log('  - Architecture:', process.arch);
console.log('  - Memory Usage:', process.memoryUsage());

// Enhanced console logging for frontend tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.log = (...args) => {
  originalConsoleLog('📝 [FRONTEND TEST LOG]', ...args);
};

console.error = (...args) => {
  originalConsoleError('❌ [FRONTEND TEST ERROR]', ...args);
};

console.warn = (...args) => {
  originalConsoleWarn('⚠️ [FRONTEND TEST WARN]', ...args);
};

// Global test utilities for frontend
global.testUtils = {
  logTestStart: (testName) => {
    console.log(`🚀 Starting frontend test: ${testName}`);
  },
  logTestEnd: (testName, duration) => {
    console.log(`✅ Completed frontend test: ${testName} (${duration}ms)`);
  },
  logTestError: (testName, error) => {
    console.error(`💥 Frontend test failed: ${testName}`, error);
  }
};

// Enhanced beforeEach and afterEach logging for frontend
beforeEach(() => {
  console.log(`🔄 Setting up frontend test: ${expect.getState().currentTestName || 'Unknown'}`);
});

afterEach(() => {
  console.log(`🧹 Cleaning up frontend test: ${expect.getState().currentTestName || 'Unknown'}`);
});

// Log when frontend setup is complete
console.log('✅ Frontend Jest setup completed successfully'); 