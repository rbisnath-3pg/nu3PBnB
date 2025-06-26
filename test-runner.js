#!/usr/bin/env node

/**
 * Enhanced Test Runner with Robust Logging
 * Provides comprehensive logging, error handling, and test execution monitoring
 */

const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const winston = require('winston');
const chalk = require('chalk');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'test-runner' },
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
      filename: path.join(logsDir, 'test-runner.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Error file transport
    new winston.transports.File({
      filename: path.join(logsDir, 'test-runner-error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// Test configuration
const TEST_CONFIG = {
  timeout: 300000, // 5 minutes
  maxRetries: 3,
  parallel: false,
  coverage: true,
  verbose: true,
  colors: true,
  detectOpenHandles: true,
  logHeapUsage: true,
  runInBand: true,
  forceExit: true
};

// Test suites configuration
const TEST_SUITES = {
  all: {
    command: 'npm test',
    description: 'All tests with coverage',
    timeout: 600000 // 10 minutes
  },
  backend: {
    command: 'npm run test:backend',
    description: 'Backend tests only',
    timeout: 300000
  },
  frontend: {
    command: 'npm run test:frontend',
    description: 'Frontend tests only',
    timeout: 300000
  },
  api: {
    command: 'npm run test:api',
    description: 'API tests only',
    timeout: 180000
  },
  models: {
    command: 'npm run test:models',
    description: 'Model tests only',
    timeout: 120000
  },
  unit: {
    command: 'npm run test:unit',
    description: 'Unit tests only',
    timeout: 120000
  },
  integration: {
    command: 'npm run test:integration',
    description: 'Integration tests only',
    timeout: 300000
  },
  ci: {
    command: 'npm run test:ci',
    description: 'CI/CD tests',
    timeout: 600000
  }
};

// Test patterns for specific components
const TEST_PATTERNS = [
  'AdminDashboard',
  'AnalyticsDashboard',
  'HomePage',
  'PaymentHistory',
  'SimpleComponent',
  'App',
  'auth',
  'bookings',
  'payments',
  'listings',
  'users',
  'reviews',
  'messages',
  'content',
  'feedback',
  'onboarding',
  'wishlist',
  'host',
  'admin',
  'analytics',
  'api',
  'User'
];

class TestRunner {
  constructor() {
    this.startTime = null;
    this.endTime = null;
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      coverage: null,
      errors: []
    };
  }

  /**
   * Log system information
   */
  logSystemInfo() {
    logger.info('🚀 Test Runner Starting', {
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      memoryUsage: process.memoryUsage(),
      cwd: process.cwd(),
      env: process.env.NODE_ENV || 'development'
    });

    // Log available test suites
    logger.info('📋 Available Test Suites', {
      suites: Object.keys(TEST_SUITES),
      patterns: TEST_PATTERNS
    });
  }

  /**
   * Run a single test command with enhanced logging
   */
  async runTestCommand(command, description, timeout = TEST_CONFIG.timeout) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const testId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      logger.info(`🧪 Starting test: ${description}`, {
        testId,
        command,
        timeout: `${timeout / 1000}s`
      });

      // Create child process with enhanced options
      const child = spawn('npm', ['test'], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          FORCE_COLOR: '1',
          CI: 'true'
        }
      });

      let stdout = '';
      let stderr = '';
      let killed = false;

      // Set timeout
      const timeoutId = setTimeout(() => {
        if (!killed) {
          killed = true;
          child.kill('SIGTERM');
          logger.error(`⏰ Test timeout after ${timeout / 1000}s`, {
            testId,
            command,
            description
          });
        }
      }, timeout);

      // Handle stdout
      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        
        // Log important lines
        const lines = output.split('\n');
        lines.forEach(line => {
          if (line.includes('PASS') || line.includes('FAIL') || line.includes('✓') || line.includes('✗')) {
            logger.info(`📊 Test Output: ${line.trim()}`, { testId });
          }
        });
      });

      // Handle stderr
      child.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        
        // Log errors
        if (output.trim()) {
          logger.warn(`⚠️ Test Warning: ${output.trim()}`, { testId });
        }
      });

      // Handle process completion
      child.on('close', (code, signal) => {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        
        if (killed) {
          const error = new Error(`Test timed out after ${timeout / 1000}s`);
          logger.error(`❌ Test failed: ${description}`, {
            testId,
            command,
            duration: `${duration}ms`,
            error: error.message
          });
          reject(error);
          return;
        }

        const success = code === 0;
        const result = {
          testId,
          command,
          description,
          success,
          code,
          signal,
          duration,
          stdout: stdout.substring(0, 5000), // Limit output size
          stderr: stderr.substring(0, 2000), // Limit error size
          timestamp: new Date().toISOString()
        };

        if (success) {
          logger.info(`✅ Test passed: ${description}`, {
            testId,
            duration: `${duration}ms`,
            code
          });
        } else {
          logger.error(`❌ Test failed: ${description}`, {
            testId,
            duration: `${duration}ms`,
            code,
            signal,
            stderr: stderr.substring(0, 500)
          });
        }

        resolve(result);
      });

      // Handle process errors
      child.on('error', (error) => {
        clearTimeout(timeoutId);
        logger.error(`💥 Process error: ${description}`, {
          testId,
          command,
          error: error.message,
          stack: error.stack
        });
        reject(error);
      });
    });
  }

  /**
   * Run all tests with comprehensive logging
   */
  async runAllTests() {
    this.startTime = Date.now();
    
    logger.info('🎯 Starting comprehensive test suite');
    this.logSystemInfo();

    try {
      const result = await this.runTestCommand(
        TEST_SUITES.all.command,
        TEST_SUITES.all.description,
        TEST_SUITES.all.timeout
      );

      this.endTime = Date.now();
      this.results.duration = this.endTime - this.startTime;

      // Parse test results from output
      this.parseTestResults(result.stdout);

      // Log final results
      this.logFinalResults(result);

      return result;

    } catch (error) {
      this.endTime = Date.now();
      this.results.duration = this.endTime - this.startTime;
      
      logger.error('💥 Test suite failed', {
        error: error.message,
        duration: `${this.results.duration}ms`
      });

      throw error;
    }
  }

  /**
   * Run specific test suite
   */
  async runTestSuite(suiteName) {
    if (!TEST_SUITES[suiteName]) {
      throw new Error(`Unknown test suite: ${suiteName}`);
    }

    const suite = TEST_SUITES[suiteName];
    logger.info(`🎯 Running test suite: ${suiteName}`, {
      description: suite.description,
      command: suite.command
    });

    return await this.runTestCommand(
      suite.command,
      suite.description,
      suite.timeout
    );
  }

  /**
   * Run test with specific pattern
   */
  async runTestPattern(pattern) {
    const command = `npm test -- --testPathPatterns=${pattern}`;
    const description = `Tests matching pattern: ${pattern}`;
    
    logger.info(`🎯 Running test pattern: ${pattern}`);
    
    return await this.runTestCommand(command, description);
  }

  /**
   * Run multiple test patterns in sequence
   */
  async runTestPatterns(patterns) {
    logger.info(`🎯 Running multiple test patterns`, { patterns });
    
    const results = [];
    for (const pattern of patterns) {
      try {
        const result = await this.runTestPattern(pattern);
        results.push({ pattern, ...result });
      } catch (error) {
        results.push({ pattern, error: error.message, success: false });
      }
    }

    return results;
  }

  /**
   * Parse test results from Jest output
   */
  parseTestResults(output) {
    // Extract test counts
    const passMatch = output.match(/(\d+) passing/);
    const failMatch = output.match(/(\d+) failing/);
    const skipMatch = output.match(/(\d+) skipped/);

    if (passMatch) this.results.passed = parseInt(passMatch[1]);
    if (failMatch) this.results.failed = parseInt(failMatch[1]);
    if (skipMatch) this.results.skipped = parseInt(skipMatch[1]);

    this.results.total = this.results.passed + this.results.failed + this.results.skipped;

    // Extract coverage information
    const coverageMatch = output.match(/All files\s+\|\s+(\d+)\s+\|\s+(\d+)\s+\|\s+(\d+)\s+\|\s+(\d+)/);
    if (coverageMatch) {
      this.results.coverage = {
        statements: parseInt(coverageMatch[1]),
        branches: parseInt(coverageMatch[2]),
        functions: parseInt(coverageMatch[3]),
        lines: parseInt(coverageMatch[4])
      };
    }
  }

  /**
   * Log final test results
   */
  logFinalResults(result) {
    const summary = {
      total: this.results.total,
      passed: this.results.passed,
      failed: this.results.failed,
      skipped: this.results.skipped,
      duration: `${this.results.duration}ms`,
      success: result.success,
      coverage: this.results.coverage
    };

    logger.info('📊 Test Results Summary', summary);

    // Log to daily results file
    const today = new Date().toISOString().split('T')[0];
    const dailyResultsFile = path.join(logsDir, `test-results-${today}.json`);
    
    let dailyResults = [];
    if (fs.existsSync(dailyResultsFile)) {
      try {
        dailyResults = JSON.parse(fs.readFileSync(dailyResultsFile, 'utf8'));
      } catch (e) {
        dailyResults = [];
      }
    }

    dailyResults.push({
      timestamp: new Date().toISOString(),
      type: 'comprehensive',
      ...summary,
      result: {
        success: result.success,
        code: result.code,
        stdout: result.stdout.substring(0, 1000),
        stderr: result.stderr.substring(0, 500)
      }
    });

    fs.writeFileSync(dailyResultsFile, JSON.stringify(dailyResults, null, 2));
  }

  /**
   * Generate test report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        skipped: this.results.skipped,
        successRate: this.results.total > 0 ? (this.results.passed / this.results.total * 100).toFixed(2) : 0,
        duration: `${this.results.duration}ms`
      },
      coverage: this.results.coverage,
      errors: this.results.errors
    };

    const reportFile = path.join(logsDir, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    logger.info('📄 Test report generated', { reportFile });
    return report;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const runner = new TestRunner();

  try {
    if (args.length === 0) {
      // Run all tests
      await runner.runAllTests();
    } else if (args[0] === 'suite' && args[1]) {
      // Run specific suite
      await runner.runTestSuite(args[1]);
    } else if (args[0] === 'pattern' && args[1]) {
      // Run specific pattern
      await runner.runTestPattern(args[1]);
    } else if (args[0] === 'patterns' && args[1]) {
      // Run multiple patterns
      const patterns = args[1].split(',');
      await runner.runTestPatterns(patterns);
    } else if (args[0] === 'list') {
      // List available options
      console.log('\n📋 Available Test Options:');
      console.log('\nSuites:');
      Object.keys(TEST_SUITES).forEach(suite => {
        console.log(`  ${suite}: ${TEST_SUITES[suite].description}`);
      });
      console.log('\nPatterns:');
      TEST_PATTERNS.forEach(pattern => {
        console.log(`  ${pattern}`);
      });
      console.log('\nUsage:');
      console.log('  node test-runner.js                    # Run all tests');
      console.log('  node test-runner.js suite backend      # Run backend suite');
      console.log('  node test-runner.js pattern auth       # Run auth tests');
      console.log('  node test-runner.js patterns auth,api  # Run multiple patterns');
      console.log('  node test-runner.js list               # List options');
    } else {
      console.error('❌ Invalid arguments. Use "node test-runner.js list" for options.');
      process.exit(1);
    }

    // Generate report
    runner.generateReport();

  } catch (error) {
    logger.error('💥 Test runner failed', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = TestRunner; 