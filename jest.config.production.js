module.exports = {
  // Production-optimized Jest configuration
  testEnvironment: 'node',
  testTimeout: 8000, // Reduced timeout for production
  detectOpenHandles: true,
  forceExit: true,
  maxWorkers: 1, // Single worker to reduce memory usage
  maxConcurrency: 1,
  runInBand: true,
  
  // Memory optimization
  logHeapUsage: true,
  
  // Transform configuration
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  
  // Module file extensions
  moduleFileExtensions: [
    'js',
    'jsx',
    'json'
  ],
  
  // Setup files
  setupFilesAfterEnv: [
    '@testing-library/jest-dom',
    '<rootDir>/jest.setup.js'
  ],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(mongoose|mongodb|bson|@babel|react-leaflet|leaflet|@react-leaflet|@esri|@types/leaflet)/)'
  ],
  
  // Test path ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/frontend/node_modules/'
  ],
  
  // Module name mapper
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    '^../services/getApiBase$': '<rootDir>/frontend/src/services/getApiBase.node.js'
  },
  
  // Projects configuration for production
  projects: [
    {
      displayName: 'backend-prod',
      testEnvironment: 'node',
      testTimeout: 8000,
      detectOpenHandles: true,
      testMatch: [
        '<rootDir>/routes/__tests__/**/*.test.js',
        '<rootDir>/models/__tests__/**/*.test.js'
      ],
      setupFilesAfterEnv: [
        '<rootDir>/jest.setup.js'
      ],
      // Memory optimization for backend tests
      maxWorkers: 1,
      runInBand: true
    },
    {
      displayName: 'frontend-prod',
      testEnvironment: 'jsdom',
      testTimeout: 8000,
      detectOpenHandles: true,
      testMatch: [
        '<rootDir>/frontend/src/**/*.test.jsx',
        '<rootDir>/frontend/src/**/*.test.js'
      ],
      setupFilesAfterEnv: [
        '@testing-library/jest-dom',
        '<rootDir>/frontend/jest.setup.js'
      ],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
        '^./getApiBase\\.vite\\.js$': '<rootDir>/frontend/src/services/getApiBase.node.js',
        '^./getApiBase\\.node\\.js$': '<rootDir>/frontend/src/services/getApiBase.node.js'
      },
      // Memory optimization for frontend tests
      maxWorkers: 1,
      runInBand: true
    }
  ],
  
  // Coverage configuration for production
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20
    }
  },
  
  // Verbose output for debugging
  verbose: true,
  
  // Colors disabled for production logs
  colors: false
}; 