#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

console.log('🧪 Testing Jest availability in production environment...');
console.log('📁 Current directory:', process.cwd());
console.log('🔧 Node version:', process.version);
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);

// Test if Jest is available
exec('npx jest --version', { cwd: process.cwd() }, (err, stdout, stderr) => {
  if (err) {
    console.error('❌ Jest not available:', err.message);
    console.error('📋 stderr:', stderr);
    process.exit(1);
  }
  
  console.log('✅ Jest version:', stdout.trim());
  
  // Test if we can run a simple test
  console.log('🧪 Running a simple test to verify Jest works...');
  
  exec('npx jest --testNamePattern="should have required fields" --testPathPattern="models/__tests__/User.test.js" --verbose', 
    { cwd: process.cwd(), timeout: 30000 }, (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Jest test failed:', err.message);
      console.error('📋 stderr:', stderr);
      console.log('📋 stdout:', stdout);
      process.exit(1);
    }
    
    console.log('✅ Jest test passed!');
    console.log('📋 stdout:', stdout);
    process.exit(0);
  });
}); 