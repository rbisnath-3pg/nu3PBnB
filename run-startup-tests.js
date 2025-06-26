#!/usr/bin/env node

const { runStartupTests } = require('./startup-tests');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

console.log('🚀 Starting Nu3PBnB Startup Tests...');
console.log('='.repeat(60));

// Set environment variables if not already set
if (!process.env.API_BASE) {
  process.env.API_BASE = 'https://nu3pbnb-api.onrender.com';
}

// Run the tests
runStartupTests()
  .then(() => {
    console.log('\n✅ Startup tests completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Startup tests failed:', error);
    process.exit(1);
  }); 