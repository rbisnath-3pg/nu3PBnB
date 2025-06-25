const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Test suites to choose from randomly
const testSuites = [
  'npm test -- --testPathPatterns=AdminDashboard',
  'npm test -- --testPathPatterns=AnalyticsDashboard',
  'npm test -- --testPathPatterns=HomePage',
  'npm test -- --testPathPatterns=PaymentHistory',
  'npm test -- --testPathPatterns=SimpleComponent',
  'npm test -- --testPathPatterns=App',
  'npm test -- --testPathPatterns=auth',
  'npm test -- --testPathPatterns=bookings',
  'npm test -- --testPathPatterns=payments',
  'npm test -- --testPathPatterns=listings',
  'npm test -- --testPathPatterns=users',
  'npm test -- --testPathPatterns=reviews',
  'npm test -- --testPathPatterns=messages',
  'npm test -- --testPathPatterns=content',
  'npm test -- --testPathPatterns=feedback',
  'npm test -- --testPathPatterns=onboarding',
  'npm test -- --testPathPatterns=wishlist',
  'npm test -- --testPathPatterns=host',
  'npm test -- --testPathPatterns=admin',
  'npm test -- --testPathPatterns=analytics',
  'npm test -- --testPathPatterns=api',
  'npm test -- --testPathPatterns=User'
];

// Test scenarios for different times of day
const timeBasedTests = {
  morning: [
    'npm test -- --testPathPatterns=HomePage',
    'npm test -- --testPathPatterns=App',
    'npm test -- --testPathPatterns=SimpleComponent',
    'npm test -- --testPathPatterns=AnalyticsDashboard',
    'npm test -- --testPathPatterns=PaymentHistory'
  ],
  afternoon: [
    'npm test -- --testPathPatterns=bookings',
    'npm test -- --testPathPatterns=payments',
    'npm test -- --testPathPatterns=listings',
    'npm test -- --testPathPatterns=users',
    'npm test -- --testPathPatterns=reviews'
  ],
  evening: [
    'npm test -- --testPathPatterns=AdminDashboard',
    'npm test -- --testPathPatterns=AnalyticsDashboard',
    'npm test -- --testPathPatterns=admin',
    'npm test -- --testPathPatterns=analytics',
    'npm test -- --testPathPatterns=User'
  ],
  night: [
    'npm test -- --testPathPatterns=auth',
    'npm test -- --testPathPatterns=messages',
    'npm test -- --testPathPatterns=content',
    'npm test -- --testPathPatterns=feedback',
    'npm test -- --testPathPatterns=onboarding'
  ]
};

// Log file for test results
const logFile = path.join(__dirname, 'logs', 'scheduled-tests.log');

// Ensure logs directory exists
if (!fs.existsSync(path.dirname(logFile))) {
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
}

// Function to get random test command
function getRandomTest() {
  const hour = new Date().getHours();
  let testPool;
  
  if (hour >= 6 && hour < 12) {
    testPool = timeBasedTests.morning;
  } else if (hour >= 12 && hour < 18) {
    testPool = timeBasedTests.afternoon;
  } else if (hour >= 18 && hour < 22) {
    testPool = timeBasedTests.evening;
  } else {
    testPool = timeBasedTests.night;
  }
  
  // 70% chance to use time-based test, 30% chance to use random test
  if (Math.random() < 0.7) {
    return testPool[Math.floor(Math.random() * testPool.length)];
  } else {
    return testSuites[Math.floor(Math.random() * testSuites.length)];
  }
}

// Function to run a test
function runScheduledTest() {
  const testCommand = getRandomTest();
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] Running scheduled test: ${testCommand}\n`;
  
  console.log(logEntry.trim());
  fs.appendFileSync(logFile, logEntry);
  
  exec(testCommand, { cwd: __dirname }, (error, stdout, stderr) => {
    const endTime = new Date().toISOString();
    let result;
    
    if (error) {
      result = `[${endTime}] Test FAILED: ${testCommand}\nError: ${error.message}\n`;
      console.error(result.trim());
    } else {
      result = `[${endTime}] Test PASSED: ${testCommand}\nOutput: ${stdout.substring(0, 500)}...\n`;
      console.log(result.trim());
    }
    
    fs.appendFileSync(logFile, result);
    
    // Also log to a daily results file
    const today = new Date().toISOString().split('T')[0];
    const dailyLogFile = path.join(__dirname, 'logs', `test-results-${today}.json`);
    
    let dailyResults = [];
    if (fs.existsSync(dailyLogFile)) {
      try {
        dailyResults = JSON.parse(fs.readFileSync(dailyLogFile, 'utf8'));
      } catch (e) {
        dailyResults = [];
      }
    }
    
    dailyResults.push({
      timestamp: timestamp,
      testCommand: testCommand,
      success: !error,
      duration: new Date(endTime) - new Date(timestamp),
      output: stdout.substring(0, 1000),
      error: error ? error.message : null
    });
    
    fs.writeFileSync(dailyLogFile, JSON.stringify(dailyResults, null, 2));
  });
}

// Function to run a comprehensive test suite (for longer intervals)
function runComprehensiveTest() {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] Running comprehensive test suite\n`;
  
  console.log(logEntry.trim());
  fs.appendFileSync(logFile, logEntry);
  
  exec('npm test -- --coverage', { cwd: __dirname }, (error, stdout, stderr) => {
    const endTime = new Date().toISOString();
    let result;
    
    if (error) {
      result = `[${endTime}] Comprehensive test FAILED\nError: ${error.message}\n`;
      console.error(result.trim());
    } else {
      result = `[${endTime}] Comprehensive test PASSED\nCoverage report generated\n`;
      console.log(result.trim());
    }
    
    fs.appendFileSync(logFile, result);
  });
}

// Schedule tests
console.log('Setting up scheduled tests...');

// Run a test every hour
cron.schedule('0 * * * *', () => {
  console.log('\n--- Hourly Test Started ---');
  runScheduledTest();
});

// Run comprehensive test every 6 hours (at 2 AM, 8 AM, 2 PM, 8 PM)
cron.schedule('0 2,8,14,20 * * *', () => {
  console.log('\n--- Comprehensive Test Started ---');
  runComprehensiveTest();
});

// Run a quick test every 30 minutes during business hours (9 AM - 6 PM)
cron.schedule('*/30 9-18 * * 1-5', () => {
  console.log('\n--- Business Hours Quick Test ---');
  runScheduledTest();
});

// Run a test every 2 hours during off-hours
cron.schedule('0 */2 0-8,19-23 * * *', () => {
  console.log('\n--- Off-Hours Test ---');
  runScheduledTest();
});

// Run a test every 4 hours on weekends
cron.schedule('0 */4 * * 0,6', () => {
  console.log('\n--- Weekend Test ---');
  runScheduledTest();
});

// Initial test run
console.log('Running initial test...');
runScheduledTest();

console.log('Scheduled tests are now running:');
console.log('- Every hour: Random test');
console.log('- Every 6 hours: Comprehensive test with coverage');
console.log('- Every 30 minutes during business hours: Quick test');
console.log('- Every 2 hours during off-hours: Test');
console.log('- Every 4 hours on weekends: Test');
console.log(`- Logs saved to: ${logFile}`);
console.log('- Daily results saved to: logs/test-results-YYYY-MM-DD.json');

// Keep the process running
process.on('SIGINT', () => {
  console.log('\nShutting down scheduled tests...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down scheduled tests...');
  process.exit(0);
}); 