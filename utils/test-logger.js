/**
 * Enhanced Test Logger Utility
 * Provides comprehensive logging for test execution
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'test-execution',
    environment: process.env.NODE_ENV || 'test'
  },
  transports: [
    // Console transport with colors
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      )
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'test-execution.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
    
    // Error file transport
    new winston.transports.File({
      filename: path.join(logsDir, 'test-errors.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    })
  ]
});

// Test execution tracking
class TestExecutionTracker {
  constructor() {
    this.currentTest = null;
    this.testStartTime = null;
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      errors: []
    };
  }

  startTest(testName, testSuite = 'unknown') {
    this.currentTest = { name: testName, suite: testSuite };
    this.testStartTime = Date.now();
    
    logger.info('🧪 Test started', {
      testName,
      testSuite,
      timestamp: new Date().toISOString()
    });
  }

  endTest(testName, status = 'passed', error = null) {
    if (!this.testStartTime) return;
    
    const duration = Date.now() - this.testStartTime;
    
    // Update test results
    this.testResults.total++;
    this.testResults.duration += duration;
    
    switch (status) {
      case 'passed':
        this.testResults.passed++;
        logger.info('✅ Test passed', {
          testName,
          duration,
          status
        });
        break;
      case 'failed':
        this.testResults.failed++;
        this.testResults.errors.push({
          testName,
          error: error?.message || 'Unknown error',
          timestamp: new Date().toISOString()
        });
        logger.error('❌ Test failed', {
          testName,
          duration,
          status,
          error: error?.message
        });
        break;
      case 'skipped':
        this.testResults.skipped++;
        logger.warn('⏭️ Test skipped', {
          testName,
          duration,
          status
        });
        break;
    }
    
    // Reset current test
    this.currentTest = null;
    this.testStartTime = null;
  }

  logSummary() {
    const summary = {
      total: this.testResults.total,
      passed: this.testResults.passed,
      failed: this.testResults.failed,
      skipped: this.testResults.skipped,
      duration: this.testResults.duration,
      successRate: this.testResults.total > 0 
        ? ((this.testResults.passed / this.testResults.total) * 100).toFixed(2) 
        : 0,
      errors: this.testResults.errors.length
    };

    logger.info('📊 Test execution summary', summary);
    
    // Save summary to file
    const summaryFile = path.join(logsDir, `test-summary-${Date.now()}.json`);
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
    return summary;
  }

  getResults() {
    return { ...this.testResults };
  }

  reset() {
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      errors: []
    };
    this.currentTest = null;
    this.testStartTime = null;
  }
}

// Global test tracker instance
const testTracker = new TestExecutionTracker();

// Export utilities
module.exports = {
  logger,
  testTracker,
  
  // Utility functions
  logTestStart: (testName, testSuite) => testTracker.startTest(testName, testSuite),
  logTestEnd: (testName, status, error) => testTracker.endTest(testName, status, error),
  logSummary: () => testTracker.logSummary(),
  
  // Logging utilities
  logInfo: (message, meta = {}) => logger.info(message, meta),
  logError: (message, meta = {}) => logger.error(message, meta),
  logWarn: (message, meta = {}) => logger.warn(message, meta),
  logDebug: (message, meta = {}) => logger.debug(message, meta),
  
  // Test utilities
  getTestResults: () => testTracker.getResults(),
  resetTestResults: () => testTracker.reset()
}; 