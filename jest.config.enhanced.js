/**
 * Enhanced Jest Configuration with Robust Logging
 * Provides comprehensive test execution with detailed logging and reporting
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  testTimeout: 15000,
  detectOpenHandles: true,
  logHeapUsage: true,
  maxWorkers: 1,
  maxConcurrency: 1,
  runInBand: true,
  forceExit: true,
  
  // Verbose output
  verbose: true,
  colors: true,
  
  // Coverage settings
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json',
    'json-summary'
  ],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20
    }
  },
  
  // Coverage collection
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/logs/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/*.config.js',
    '!**/jest.setup.js',
    '!**/test-runner.js',
    '!**/scheduled-tests.js',
    '!**/start-scheduled-tests.js',
    '!**/demo-scheduled-tests.js',
    '!**/view-test-results.js'
  ],
  
  // Transform settings
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
    '/frontend/node_modules/',
    '/logs/',
    '/coverage/'
  ],
  
  // Module name mapper
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    '^../services/getApiBase$': '<rootDir>/frontend/src/services/getApiBase.node.js'
  },
  
  // Projects configuration
  projects: [
    {
      displayName: 'backend',
      testEnvironment: 'node',
      testTimeout: 15000,
      detectOpenHandles: true,
      testMatch: [
        '<rootDir>/routes/__tests__/**/*.test.js',
        '<rootDir>/models/__tests__/**/*.test.js'
      ],
      setupFilesAfterEnv: [
        '<rootDir>/jest.setup.js'
      ],
      maxWorkers: 1,
      runInBand: true,
      verbose: true,
      collectCoverage: true,
      coverageDirectory: 'coverage/backend',
      coverageReporters: ['text', 'lcov', 'html'],
      coverageThreshold: {
        global: {
          branches: 20,
          functions: 20,
          lines: 20,
          statements: 20
        }
      }
    },
    {
      displayName: 'frontend',
      testEnvironment: 'jsdom',
      testTimeout: 15000,
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
      maxWorkers: 1,
      runInBand: true,
      verbose: true,
      collectCoverage: true,
      coverageDirectory: 'coverage/frontend',
      coverageReporters: ['text', 'lcov', 'html'],
      coverageThreshold: {
        global: {
          branches: 20,
          functions: 20,
          lines: 20,
          statements: 20
        }
      }
    }
  ],
  
  // Reporter configuration
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'logs',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true
      }
    ]
  ],
  
  // Global test configuration
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  
  // Test results processor
  testResultsProcessor: 'jest-junit',
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // Notify mode
  notify: true,
  notifyMode: 'always',
  
  // Cache settings
  cache: true,
  cacheDirectory: '.jest-cache',
  
  // Clear mocks
  clearMocks: true,
  restoreMocks: true,
  
  // Test location in results
  testLocationInResults: true,
  
  // Error on deprecated
  errorOnDeprecated: true,
  
  // Fail fast
  bail: false,
  
  // Coverage provider
  coverageProvider: 'v8',
  
  // Dependency extraction
  dependencyExtractor: null,
  
  // Global setup and teardown
  globalSetup: null,
  globalTeardown: null,
  
  // Inject globals
  injectGlobals: true,
  
  // Module path mapping
  modulePaths: ['<rootDir>'],
  
  // Preset
  preset: null,
  
  // Preprocessor ignore patterns
  preprocessorIgnorePatterns: [
    '/node_modules/',
    '/logs/',
    '/coverage/'
  ],
  
  // Reset modules
  resetModules: false,
  
  // Root directory
  rootDir: '.',
  
  // Roots
  roots: ['<rootDir>'],
  
  // Runtime
  runtime: null,
  
  // Seed
  seed: null,
  
  // Show seed
  showSeed: false,
  
  // Slow test threshold
  slowTestThreshold: 5,
  
  // Snapshot serializers
  snapshotSerializers: [],
  
  // Test environment options
  testEnvironmentOptions: {},
  
  // Test failure exit code
  testFailureExitCode: 1,
  
  // Test name pattern
  testNamePattern: '',
  
  // Test path pattern
  testPathPattern: '',
  
  // Test regex
  testRegex: [
    '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$'
  ],
  
  // Test runner
  testRunner: 'jest-circus/runner',
  
  // Test sequencer
  testSequencer: null,
  
  // Test timeout
  testTimeout: 15000,
  
  // Timers
  timers: 'real',
  
  // Transform
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(mongoose|mongodb|bson|@babel|react-leaflet|leaflet|@react-leaflet|@esri|@types/leaflet)/)'
  ],
  
  // Unmocked module path patterns
  unmockedModulePathPatterns: [],
  
  // Update snapshot
  updateSnapshot: false,
  
  // Use fake timers
  useFakeTimers: false,
  
  // Watch
  watch: false,
  
  // Watch all
  watchAll: false,
  
  // Watch path ignore patterns
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/logs/',
    '/coverage/',
    '/.git/'
  ],
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ]
}; 