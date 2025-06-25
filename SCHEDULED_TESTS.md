# Scheduled Tests for nu3PBnB

This system automatically runs tests throughout the day to ensure the application remains stable and functional.

## 🚀 Quick Start

### Start Scheduled Tests
```bash
# Start the scheduled tests
npm run test:scheduled

# Or use the wrapper script
npm run test:scheduled:start
```

### View Test Results
```bash
# View all test results
npm run test:results

# View today's results only
npm run test:results:today

# View summary only
npm run test:results:summary
```

## 📅 Test Schedule

### Hourly Tests
- **Every hour**: Random test from the test suite
- **Time-based selection**: Tests are chosen based on the time of day

### Comprehensive Tests
- **Every 6 hours** (2 AM, 8 AM, 2 PM, 8 PM): Full test suite with coverage

### Business Hours Tests
- **Every 30 minutes** (9 AM - 6 PM, Mon-Fri): Quick tests during peak usage

### Off-Hours Tests
- **Every 2 hours** (12 AM - 8 AM, 7 PM - 11 PM): Regular tests during low usage

### Weekend Tests
- **Every 4 hours** (Saturday & Sunday): Reduced frequency on weekends

## 🎯 Test Categories

### Morning Tests (6 AM - 12 PM)
- HomePage
- SearchBar
- SearchResults
- Map
- MapView

### Afternoon Tests (12 PM - 6 PM)
- bookings
- payments
- listings
- users
- reviews

### Evening Tests (6 PM - 10 PM)
- AdminDashboard
- AnalyticsDashboard
- admin
- analytics
- UserManagement

### Night Tests (10 PM - 6 AM)
- auth
- messages
- content
- feedback
- onboarding

## 📊 Test Results

### Log Files
- **Main log**: `logs/scheduled-tests.log`
- **Daily results**: `logs/test-results-YYYY-MM-DD.json`

### Result Format
```json
{
  "timestamp": "2025-06-25T18:00:00.000Z",
  "testCommand": "npm test -- --testPathPattern=AdminDashboard",
  "success": true,
  "duration": 2500,
  "output": "Test output...",
  "error": null
}
```

## 🛠️ Configuration

### Test Suites
The system includes 40+ different test patterns covering:
- Frontend components
- Backend routes
- API endpoints
- Database models
- Authentication
- User management
- Payment processing
- Booking system

### Time-Based Selection
- **70% chance**: Uses time-appropriate tests
- **30% chance**: Uses random test from full suite

## 📈 Monitoring

### Success Metrics
- Test pass rate
- Average test duration
- Number of tests run per day
- Coverage trends

### Alert Thresholds
- Success rate below 90%
- Test duration above 10 seconds
- Consecutive failures

## 🔧 Troubleshooting

### Common Issues

#### Tests Not Running
```bash
# Check if the process is running
ps aux | grep scheduled-tests

# Restart the scheduled tests
pkill -f scheduled-tests
npm run test:scheduled
```

#### High Failure Rate
```bash
# Check recent failures
npm run test:results:today

# Run a manual test
npm test -- --testPathPattern=AdminDashboard
```

#### Log File Issues
```bash
# Check log directory permissions
ls -la logs/

# Clear old logs (optional)
rm logs/scheduled-tests.log
```

### Manual Testing
```bash
# Run a specific test
npm test -- --testPathPatterns=AdminDashboard

# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

## 📋 Maintenance

### Daily Tasks
- Review test results: `npm run test:results:today`
- Check for failures in logs
- Monitor test performance

### Weekly Tasks
- Analyze success rate trends
- Review test coverage
- Update test patterns if needed

### Monthly Tasks
- Clean up old log files
- Review and update test schedule
- Performance optimization

## 🔒 Security

### Access Control
- Tests run with limited permissions
- No sensitive data in logs
- Secure token handling

### Data Protection
- Test data is isolated
- No production data used
- Secure cleanup after tests

## 📞 Support

### Getting Help
1. Check the logs: `logs/scheduled-tests.log`
2. View recent results: `npm run test:results`
3. Run manual tests to isolate issues
4. Check system resources and dependencies

### Reporting Issues
- Include timestamp of failure
- Provide test command that failed
- Share relevant log entries
- Describe any recent changes

---

**Last Updated**: June 2025  
**Version**: 1.0  
**Maintainer**: nu3PBnB Development Team 