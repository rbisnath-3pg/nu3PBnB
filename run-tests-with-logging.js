#!/usr/bin/env node

/**
 * Enhanced Test Execution Script with Robust Logging
 * Demonstrates comprehensive test execution with detailed logging
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const winston = require('winston');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configure Winston logger for this script
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'test-execution-script' },
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
    // File transport
    new winston.transports.File({
      filename: path.join(logsDir, 'test-execution-script.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// Test execution configuration
const TEST_CONFIG = {
  timeout: 300000, // 5 minutes
  verbose: true,
  coverage: true,
  colors: true,
  detectOpenHandles: true,
  logHeapUsage: true,
  runInBand: true,
  forceExit: true
};

// Available test commands
const TEST_COMMANDS = {
  all: {
    command: 'npm',
    args: ['test'],
    description: 'All tests with coverage',
    timeout: 600000 // 10 minutes
  },
  backend: {
    command: 'npm',
    args: ['run', 'test:backend'],
    description: 'Backend tests only',
    timeout: 300000
  },
  frontend: {
    command: 'npm',
    args: ['run', 'test:frontend'],
    description: 'Frontend tests only',
    timeout: 300000
  },
  api: {
    command: 'npm',
    args: ['run', 'test:api'],
    description: 'API tests only',
    timeout: 180000
  },
  models: {
    command: 'npm',
    args: ['run', 'test:models'],
    description: 'Model tests only',
    timeout: 120000
  },
  unit: {
    command: 'npm',
    args: ['run', 'test:unit'],
    description: 'Unit tests only',
    timeout: 120000
  },
  integration: {
    command: 'npm',
    args: ['run', 'test:integration'],
    description: 'Integration tests only',
    timeout: 300000
  },
  ci: {
    command: 'npm',
    args: ['run', 'test:ci'],
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

class EnhancedTestRunner {
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
      errors: [],
      suites: {}
    };
  }

  /**
   * Log system information
   */
  logSystemInfo() {
    logger.info('🚀 Enhanced Test Runner Starting', {
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      memoryUsage: process.memoryUsage(),
      cwd: process.cwd(),
      env: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });

    // Log available test commands
    logger.info('📋 Available Test Commands', {
      commands: Object.keys(TEST_COMMANDS),
      patterns: TEST_PATTERNS
    });
  }

  /**
   * Run a test command with enhanced logging
   */
  async runTestCommand(commandConfig, description) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const testId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      logger.info(`🧪 Starting test execution: ${description}`, {
        testId,
        command: commandConfig.command,
        args: commandConfig.args,
        timeout: `${commandConfig.timeout / 1000}s`
      });

      // Create child process
      const child = spawn(commandConfig.command, commandConfig.args, {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          FORCE_COLOR: '1',
          CI: 'true',
          NODE_ENV: 'test'
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
          logger.error(`⏰ Test timeout after ${commandConfig.timeout / 1000}s`, {
            testId,
            description
          });
        }
      }, commandConfig.timeout);

      // Handle stdout with detailed logging
      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        
        // Log important lines
        const lines = output.split('\n');
        lines.forEach(line => {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            if (trimmedLine.includes('PASS') || trimmedLine.includes('✓')) {
              logger.info(`✅ Test passed: ${trimmedLine}`, { testId });
            } else if (trimmedLine.includes('FAIL') || trimmedLine.includes('✗')) {
              logger.error(`❌ Test failed: ${trimmedLine}`, { testId });
            } else if (trimmedLine.includes('Test Suites:') || trimmedLine.includes('Tests:')) {
              logger.info(`📊 Test summary: ${trimmedLine}`, { testId });
            } else if (trimmedLine.includes('All files') && trimmedLine.includes('|')) {
              logger.info(`📈 Coverage: ${trimmedLine}`, { testId });
            } else if (trimmedLine.includes('Jest did not exit')) {
              logger.warn(`⚠️ Jest cleanup issue: ${trimmedLine}`, { testId });
            }
          }
        });
      });

      // Handle stderr with detailed logging
      child.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        
        // Log errors and warnings
        if (output.trim()) {
          const lines = output.split('\n');
          lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine) {
              if (trimmedLine.includes('Error:') || trimmedLine.includes('FAIL')) {
                logger.error(`💥 Test error: ${trimmedLine}`, { testId });
              } else if (trimmedLine.includes('Warning:') || trimmedLine.includes('WARN')) {
                logger.warn(`⚠️ Test warning: ${trimmedLine}`, { testId });
              } else {
                logger.debug(`🔍 Test debug: ${trimmedLine}`, { testId });
              }
            }
          });
        }
      });

      // Handle process completion
      child.on('close', (code, signal) => {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        
        if (killed) {
          const error = new Error(`Test timed out after ${commandConfig.timeout / 1000}s`);
          logger.error(`❌ Test execution failed: ${description}`, {
            testId,
            duration: `${duration}ms`,
            error: error.message
          });
          reject(error);
          return;
        }

        const success = code === 0;
        const result = {
          testId,
          command: commandConfig.command,
          args: commandConfig.args,
          description,
          success,
          code,
          signal,
          duration,
          stdout: stdout.substring(0, 10000), // Limit output size
          stderr: stderr.substring(0, 5000), // Limit error size
          timestamp: new Date().toISOString()
        };

        if (success) {
          logger.info(`✅ Test execution completed: ${description}`, {
            testId,
            duration: `${duration}ms`,
            code
          });
        } else {
          logger.error(`❌ Test execution failed: ${description}`, {
            testId,
            duration: `${duration}ms`,
            code,
            signal,
            stderr: stderr.substring(0, 1000)
          });
        }

        resolve(result);
      });

      // Handle process errors
      child.on('error', (error) => {
        clearTimeout(timeoutId);
        logger.error(`💥 Process error: ${description}`, {
          testId,
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
    
    logger.info('🎯 Starting comprehensive test suite execution');
    this.logSystemInfo();

    try {
      const result = await this.runTestCommand(
        TEST_COMMANDS.all,
        TEST_COMMANDS.all.description
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
      
      logger.error('💥 Test suite execution failed', {
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
    if (!TEST_COMMANDS[suiteName]) {
      throw new Error(`Unknown test suite: ${suiteName}`);
    }

    const suite = TEST_COMMANDS[suiteName];
    logger.info(`🎯 Running test suite: ${suiteName}`, {
      description: suite.description,
      command: suite.command,
      args: suite.args
    });

    return await this.runTestCommand(suite, suite.description);
  }

  /**
   * Run test with specific pattern
   */
  async runTestPattern(pattern) {
    const commandConfig = {
      command: 'npm',
      args: ['test', '--', '--testPathPatterns', pattern],
      description: `Tests matching pattern: ${pattern}`,
      timeout: 180000
    };
    
    logger.info(`🎯 Running test pattern: ${pattern}`);
    
    return await this.runTestCommand(commandConfig, commandConfig.description);
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

    logger.info('📊 Test execution summary', summary);

    // Log to daily results file
    const today = new Date().toISOString().split('T')[0];
    const dailyResultsFile = path.join(logsDir, `test-execution-${today}.json`);
    
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
        stdout: result.stdout.substring(0, 2000),
        stderr: result.stderr.substring(0, 1000)
      }
    });

    fs.writeFileSync(dailyResultsFile, JSON.stringify(dailyResults, null, 2));
  }

  /**
   * Generate test execution report
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

    const reportFile = path.join(logsDir, `test-execution-report-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    logger.info('📄 Test execution report generated', { reportFile });
    return report;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const runner = new EnhancedTestRunner();

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
    } else if (args[0] === 'list') {
      // List available options
      console.log('\n📋 Available Test Options:');
      console.log('\nSuites:');
      Object.keys(TEST_COMMANDS).forEach(suite => {
        console.log(`  ${suite}: ${TEST_COMMANDS[suite].description}`);
      });
      console.log('\nPatterns:');
      TEST_PATTERNS.forEach(pattern => {
        console.log(`  ${pattern}`);
      });
      console.log('\nUsage:');
      console.log('  node run-tests-with-logging.js                    # Run all tests');
      console.log('  node run-tests-with-logging.js suite backend      # Run backend suite');
      console.log('  node run-tests-with-logging.js pattern auth       # Run auth tests');
      console.log('  node run-tests-with-logging.js list               # List options');
    } else {
      console.error('❌ Invalid arguments. Use "node run-tests-with-logging.js list" for options.');
      process.exit(1);
    }

    // Generate report
    runner.generateReport();

  } catch (error) {
    logger.error('💥 Test execution script failed', {
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

module.exports = EnhancedTestRunner; 