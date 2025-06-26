# Quick Start: Enhanced Test Logging

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install chalk winston jest-junit jest-watch-typeahead
```

### 2. Run Tests with Enhanced Logging
```bash
# Run all tests with comprehensive logging
node test-runner.js

# Or use the comprehensive script
node run-tests-with-logging.js
```

### 3. View Logs
```bash
# View real-time logs
tail -f logs/test-execution.log

# View error logs
tail -f logs/test-errors.log

# View daily summary
cat logs/test-execution-$(date +%Y-%m-%d).json
```

## 📋 Common Commands

### Run Specific Test Suites
```bash
# Backend tests
node test-runner.js suite backend

# Frontend tests  
node test-runner.js suite frontend

# API tests
node test-runner.js suite api
```

### Run Tests by Pattern
```bash
# Auth tests
node test-runner.js pattern auth

# Booking tests
node test-runner.js pattern bookings

# Multiple patterns
node test-runner.js patterns auth,api,bookings
```

### List Available Options
```bash
node test-runner.js list
```

## 📊 Understanding the Output

### Console Output
- 🚀 Test execution started
- 🧪 Individual test started  
- ✅ Test passed
- ❌ Test failed
- 📊 Test summary
- 📈 Coverage information

### Log Files
- `logs/test-execution.log` - All test activities
- `logs/test-errors.log` - Error details
- `logs/test-execution-YYYY-MM-DD.json` - Daily summaries

## 🔧 Configuration

### Environment Variables
```bash
# Set log level
export LOG_LEVEL=debug

# Force colors
export FORCE_COLOR=1

# Set test environment
export NODE_ENV=test
```

### Custom Timeout
```bash
# Run with 10-minute timeout
node test-runner.js --timeout 600000
```

## 🆘 Troubleshooting

### Tests Not Running
```bash
# Check for running processes
ps aux | grep test-runner

# Kill existing processes
pkill -f test-runner

# Restart
node test-runner.js
```

### High Memory Usage
```bash
# Increase memory limit
node --max-old-space-size=4096 test-runner.js
```

### View Recent Errors
```bash
# Last 50 lines of errors
tail -50 logs/test-errors.log

# Search for specific errors
grep "FAIL" logs/test-execution.log
```

## 📈 Monitor Performance

### Check Test Duration
```bash
# Find slow tests
grep "duration" logs/test-execution.log | grep -E "[0-9]{5,}ms"
```

### Monitor Memory Usage
```bash
# Check memory logs
grep "memoryUsage" logs/test-execution.log
```

### View Coverage
```bash
# Open coverage report
open coverage/lcov-report/index.html
```

## 🎯 Next Steps

1. **Read the full documentation**: `ENHANCED_TEST_LOGGING.md`
2. **Explore log files**: Check the `logs/` directory
3. **Customize configuration**: Modify `jest.config.enhanced.js`
4. **Integrate with CI/CD**: See CI/CD examples in the main documentation

---

**Need help?** Check the full documentation or run `node test-runner.js list` for all available options. 