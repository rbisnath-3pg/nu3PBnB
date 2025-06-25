#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Scheduled Tests for nu3PBnB');
console.log('=====================================');

// Check if we're in the right directory
const packageJsonPath = path.join(__dirname, 'package.json');
if (!require('fs').existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Start the scheduled tests
const scheduledTests = spawn('node', ['scheduled-tests.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

scheduledTests.on('error', (error) => {
  console.error('❌ Failed to start scheduled tests:', error.message);
  process.exit(1);
});

scheduledTests.on('close', (code) => {
  console.log(`\n📊 Scheduled tests process exited with code ${code}`);
  if (code !== 0) {
    console.log('⚠️  Tests may have encountered errors. Check the logs for details.');
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping scheduled tests...');
  scheduledTests.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping scheduled tests...');
  scheduledTests.kill('SIGTERM');
}); 