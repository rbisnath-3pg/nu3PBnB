#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function viewTestResults() {
  const logsDir = path.join(__dirname, 'logs');
  
  if (!fs.existsSync(logsDir)) {
    console.log('❌ No test logs found. Run scheduled tests first.');
    return;
  }

  console.log('📊 Test Results Viewer for nu3PBnB');
  console.log('==================================');

  // Show today's results
  const today = new Date().toISOString().split('T')[0];
  const todayFile = path.join(logsDir, `test-results-${today}.json`);
  
  if (fs.existsSync(todayFile)) {
    try {
      const results = JSON.parse(fs.readFileSync(todayFile, 'utf8'));
      
      console.log(`\n📅 Today's Test Results (${today}):`);
      console.log('================================');
      
      const totalTests = results.length;
      const passedTests = results.filter(r => r.success).length;
      const failedTests = totalTests - passedTests;
      const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
      
      console.log(`Total Tests: ${totalTests}`);
      console.log(`Passed: ${passedTests} ✅`);
      console.log(`Failed: ${failedTests} ❌`);
      console.log(`Success Rate: ${successRate}%`);
      
      if (totalTests > 0) {
        const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / totalTests;
        console.log(`Average Duration: ${avgDuration.toFixed(0)}ms`);
      }
      
      // Show recent test details
      console.log('\n🕒 Recent Tests:');
      console.log('----------------');
      results.slice(-5).reverse().forEach((result, index) => {
        const time = new Date(result.timestamp).toLocaleTimeString();
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        const duration = result.duration.toFixed(0) + 'ms';
        const testName = result.testCommand.replace('npm test -- --testPathPattern=', '');
        
        console.log(`${index + 1}. [${time}] ${status} - ${testName} (${duration})`);
        
        if (!result.success && result.error) {
          console.log(`   Error: ${result.error.substring(0, 100)}...`);
        }
      });
      
    } catch (error) {
      console.error('❌ Error reading today\'s results:', error.message);
    }
  } else {
    console.log('📅 No test results found for today.');
  }

  // Show available log files
  const logFiles = fs.readdirSync(logsDir)
    .filter(file => file.startsWith('test-results-') && file.endsWith('.json'))
    .sort()
    .reverse();

  if (logFiles.length > 1) {
    console.log('\n📁 Available Test Result Files:');
    console.log('--------------------------------');
    logFiles.slice(0, 7).forEach(file => {
      const date = file.replace('test-results-', '').replace('.json', '');
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      const size = (stats.size / 1024).toFixed(1) + 'KB';
      
      console.log(`📄 ${date} (${size})`);
    });
  }

  // Show summary from log file
  const logFile = path.join(logsDir, 'scheduled-tests.log');
  if (fs.existsSync(logFile)) {
    console.log('\n📋 Recent Log Entries:');
    console.log('----------------------');
    
    const logContent = fs.readFileSync(logFile, 'utf8');
    const lines = logContent.split('\n').filter(line => line.trim());
    
    lines.slice(-10).forEach(line => {
      if (line.includes('PASSED') || line.includes('FAILED')) {
        const status = line.includes('PASSED') ? '✅' : '❌';
        const time = line.match(/\[(.*?)\]/)?.[1] || '';
        const test = line.match(/test: (.*?)$/)?.[1] || '';
        
        if (time && test) {
          console.log(`${status} [${time}] ${test}`);
        }
      }
    });
  }

  console.log('\n💡 Tips:');
  console.log('- Run "node scheduled-tests.js" to start scheduled tests');
  console.log('- Check logs/scheduled-tests.log for detailed logs');
  console.log('- Each day\'s results are saved in logs/test-results-YYYY-MM-DD.json');
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('📊 Test Results Viewer');
  console.log('Usage: node view-test-results.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h    Show this help message');
  console.log('  --today       Show only today\'s results');
  console.log('  --summary     Show summary only');
  console.log('');
  console.log('Examples:');
  console.log('  node view-test-results.js');
  console.log('  node view-test-results.js --today');
  console.log('  node view-test-results.js --summary');
} else {
  viewTestResults();
} 