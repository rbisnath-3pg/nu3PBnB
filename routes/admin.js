const express = require('express');
const User = require('../models/User');
const Listing = require('../models/Listing');
const { auth, requireRole } = require('../middleware/auth');
const Message = require('../models/Message');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { initializeDatabase } = require('../scripts/init-database');

const router = express.Router();

const TEST_RESULTS_FILE = path.join(__dirname, '../logs/test-results.json');

// Helper to read test results
function readTestResults() {
  // Ensure logs directory exists
  const logsDir = path.dirname(TEST_RESULTS_FILE);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  if (!fs.existsSync(TEST_RESULTS_FILE)) {
    return [];
  }
  
  try {
    const data = fs.readFileSync(TEST_RESULTS_FILE, 'utf8');
    if (!data.trim()) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading test results file:', error);
    return [];
  }
}

// Helper to write test results
function writeTestResults(results) {
  try {
    // Ensure logs directory exists
    const logsDir = path.dirname(TEST_RESULTS_FILE);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    fs.writeFileSync(TEST_RESULTS_FILE, JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Error writing test results file:', error);
  }
}

// Admin: View all users
router.get('/users', auth, requireRole('admin'), async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// Admin: View all listings
router.get('/listings', auth, requireRole('admin'), async (req, res) => {
  const listings = await Listing.find();
  res.json(listings);
});

// Admin: Get all messages (paginated)
router.get('/messages', auth, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const messages = await Message.find()
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Message.countDocuments();
    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load messages' });
  }
});

// Admin: Get all conversations
router.get('/messages/conversations', auth, requireRole('admin'), async (req, res) => {
  try {
    // Get unique conversation pairs
    const conversations = await Message.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              { $lt: ['$sender', '$recipient'] },
              { sender: '$sender', recipient: '$recipient' },
              { sender: '$recipient', recipient: '$sender' }
            ]
          },
          lastMessage: { $last: '$$ROOT' },
          messageCount: { $sum: 1 },
          unreadCount: {
            $sum: {
              $cond: [
                { $eq: ['$read', false] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);
    
    // Populate user details for each conversation
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const sender = await User.findById(conv._id.sender).select('name email');
        const recipient = await User.findById(conv._id.recipient).select('name email');
        return {
          ...conv,
          sender,
          recipient,
          conversationId: `${conv._id.sender}-${conv._id.recipient}`
        };
      })
    );
    
    res.json({
      conversations: populatedConversations
    });
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ message: 'Failed to load conversations' });
  }
});

// Admin: Get specific conversation
router.get('/messages/conversation/:conversationId', auth, requireRole('admin'), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const [senderId, recipientId] = conversationId.split('-');
    
    const messages = await Message.find({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId }
      ]
    })
    .populate('sender', 'name email')
    .populate('recipient', 'name email')
    .sort('createdAt');
    
    const sender = await User.findById(senderId).select('name email');
    const recipient = await User.findById(recipientId).select('name email');
    
    res.json({
      messages,
      participants: [sender, recipient]
    });
  } catch (err) {
    console.error('Get conversation error:', err);
    res.status(500).json({ message: 'Failed to load conversation' });
  }
});

// Admin: Get unread messages count
router.get('/messages/unread-count', auth, requireRole('admin'), async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({ read: false });
    res.json({ unreadCount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get unread count' });
  }
});

// Admin: Mark message as read
router.put('/messages/:id/read', auth, requireRole('admin'), async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Message marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark message as read' });
  }
});

// Admin: Mark all messages as read
router.put('/messages/mark-all-read', auth, requireRole('admin'), async (req, res) => {
  try {
    await Message.updateMany({ read: false }, { read: true });
    res.json({ message: 'All messages marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
});

// Admin: Delete a message
router.delete('/messages/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete message' });
  }
});

// List all test runs
router.get('/test-results', auth, requireRole('admin'), (req, res) => {
  try {
    const results = readTestResults();
    // Ensure each result has all required fields
    const formattedResults = results.map(result => ({
      id: result.id || Date.now().toString(),
      date: result.date || new Date().toLocaleString(),
      status: result.status || 'unknown',
      summary: result.summary || 'No summary available',
      coverage: result.coverage || '',
      details: result.details || 'No details available'
    }));
    res.json(formattedResults);
  } catch (err) {
    console.error('Error reading test results:', err);
    res.status(500).json({ message: 'Failed to load test results' });
  }
});

// Get a specific test run
router.get('/test-results/:id', auth, requireRole('admin'), (req, res) => {
  try {
    const results = readTestResults();
    const run = results.find(r => r.id === req.params.id);
    if (!run) {
      return res.status(404).json({ error: 'Test run not found' });
    }
    
    // Ensure the run has all required fields
    const formattedRun = {
      id: run.id || req.params.id,
      date: run.date || new Date().toLocaleString(),
      status: run.status || 'unknown',
      summary: run.summary || 'No summary available',
      coverage: run.coverage || '',
      details: run.details || 'No details available'
    };
    
    res.json(formattedRun);
  } catch (err) {
    console.error('Error reading test result:', err);
    res.status(500).json({ message: 'Failed to load test result' });
  }
});

// Trigger a new test run
// NOTE: Using actual test execution to run ALL tests in the project
router.post('/run-tests', auth, requireRole('admin'), (req, res) => {
  const id = Date.now().toString();
  const date = new Date().toLocaleString();
  const results = readTestResults();
  
  console.log(`🔄 Starting comprehensive test run ${id} at ${date}`);
  
  // Mark as running
  results.unshift({ id, date, status: 'running', summary: 'Running...', coverage: '', details: '' });
  writeTestResults(results);
  
  // Use actual test execution to run ALL tests
  const testCommand = 'npm test';
  const cwd = path.join(__dirname, '..');
  
  console.log(`📋 Executing comprehensive test suite: ${testCommand} in ${cwd}`);
  
  // Run tests with production-optimized configuration
  const testProcess = exec(testCommand, { 
    cwd: cwd,
    maxBuffer: 1024 * 1024, // 1MB buffer
    env: { 
      ...process.env, 
      NODE_ENV: 'test',
      NODE_OPTIONS: '--max-old-space-size=512', // Increased memory limit
      LOG_LEVEL: 'error', // Only errors
      FORCE_COLOR: '0', // Disable colors
      SUPPRESS_JEST_WARNINGS: 'true', // Suppress warnings
      CI: 'true' // CI mode for better output
    },
    timeout: 300000 // 5 minute timeout for comprehensive tests
  }, (err, stdout, stderr) => {
    console.log(`✅ Comprehensive test run ${id} completed with ${err ? 'error' : 'success'}`);
    console.log(`📊 stdout length: ${stdout?.length || 0}, stderr length: ${stderr?.length || 0}`);
    
    const status = err ? 'failed' : 'passed';
    
    // Parse comprehensive test results
    let summary = 'Test execution completed';
    let coverage = '';
    
    // Extract test summary from output
    const passedMatch = stdout.match(/(\d+) passing/);
    const failedMatch = stdout.match(/(\d+) failing/);
    const testMatch = stdout.match(/(\d+) tests?/);
    const coverageMatch = stdout.match(/All files\s+\|\s+(\d+\.\d+)%/);
    
    if (passedMatch || failedMatch || testMatch) {
      const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      const total = testMatch ? parseInt(testMatch[1]) : (passed + failed);
      summary = `${passed} of ${total} tests passed`;
    } else if (stdout.includes('PASS') || stdout.includes('✓')) {
      summary = 'All tests passed successfully';
    } else if (stdout.includes('FAIL') || stdout.includes('✕')) {
      summary = 'Some tests failed';
    }
    
    // Extract coverage information
    if (coverageMatch) {
      coverage = `${coverageMatch[1]}%`;
    } else if (stdout.includes('All files')) {
      const coverageLines = stdout.split('\n').filter(line => line.includes('All files'));
      if (coverageLines.length > 0) {
        const coverageLine = coverageLines[0];
        const match = coverageLine.match(/(\d+\.\d+)%/);
        if (match) {
          coverage = `${match[1]}%`;
        }
      }
    }
    
    // Combine stdout and stderr for complete output
    const fullOutput = stdout + (stderr ? '\n\nSTDERR:\n' + stderr : '');
    
    // Update result
    const updatedResults = readTestResults();
    const idx = updatedResults.findIndex(r => r.id === id);
    if (idx !== -1) {
      updatedResults[idx] = {
        id,
        date,
        status,
        summary,
        coverage,
        details: fullOutput
      };
      writeTestResults(updatedResults);
      console.log(`💾 Comprehensive test results saved for run ${id}`);
    } else {
      console.error(`❌ Could not find test run ${id} to update`);
    }
  });
  
  // Handle process events for better error handling
  testProcess.on('error', (error) => {
    console.error(`❌ Comprehensive test execution error for run ${id}:`, error);
    
    // Update result with error status
    const updatedResults = readTestResults();
    const idx = updatedResults.findIndex(r => r.id === id);
    if (idx !== -1) {
      updatedResults[idx] = {
        id,
        date,
        status: 'failed',
        summary: 'Test execution failed',
        coverage: '',
        details: `Comprehensive test execution failed: ${error.message}\n\nThis may be due to:\n- Memory constraints\n- Timeout issues\n- Environment problems\n\nConsider running tests in a development environment for full test execution.`
      };
      writeTestResults(updatedResults);
      console.log(`💾 Error test results saved for run ${id}`);
    }
  });
  
  // Handle process exit
  testProcess.on('exit', (code, signal) => {
    console.log(`🚪 Comprehensive test process exited with code ${code}, signal ${signal} for run ${id}`);
    
    // If process exits with error and we haven't handled it yet
    if (code !== 0 && code !== null) {
      console.log(`⚠️ Comprehensive test process exited with non-zero code ${code} for run ${id}`);
    }
  });
  
  // Handle process close
  testProcess.on('close', (code) => {
    console.log(`🔒 Comprehensive test process closed with code ${code} for run ${id}`);
  });
  
  // Handle timeout with graceful shutdown
  setTimeout(() => {
    if (testProcess.exitCode === null) {
      console.log(`⏰ Comprehensive test process timed out for run ${id}, killing process gracefully`);
      testProcess.kill('SIGTERM');
      
      // Update result with timeout status
      setTimeout(() => {
        const updatedResults = readTestResults();
        const idx = updatedResults.findIndex(r => r.id === id);
        if (idx !== -1) {
          updatedResults[idx] = {
            id,
            date,
            status: 'failed',
            summary: 'Test execution timed out',
            coverage: '',
            details: `Comprehensive test execution timed out after 5 minutes.\n\nThis may be due to:\n- Memory constraints\n- Network issues\n- Environment problems\n\nConsider running tests in a development environment for full test execution.`
          };
          writeTestResults(updatedResults);
          console.log(`💾 Timeout test results saved for run ${id}`);
        }
      }, 1000);
    }
  }, 300000); // 5 minute timeout for comprehensive tests
  
  res.json({ 
    message: 'Test run started', 
    id, 
    status: 'running',
    summary: 'Running comprehensive test suite...'
  });
});

// Get test execution status
router.get('/test-status', auth, requireRole('admin'), (req, res) => {
  try {
    const results = readTestResults();
    const runningTests = results.filter(r => r.status === 'running');
    const recentTests = results.slice(0, 5); // Last 5 tests
    
    res.json({
      running: runningTests.length,
      recent: recentTests,
      total: results.length,
      lastUpdate: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error getting test status:', err);
    res.status(500).json({ message: 'Failed to get test status' });
  }
});

// Clear all test results
router.delete('/test-results', auth, requireRole('admin'), (req, res) => {
  try {
    // Clear the test results file
    writeTestResults([]);
    res.json({ message: 'Test history cleared successfully' });
  } catch (err) {
    console.error('Error clearing test results:', err);
    res.status(500).json({ message: 'Failed to clear test history' });
  }
});

// Clear specific test run
router.delete('/test-results/:id', auth, requireRole('admin'), (req, res) => {
  try {
    const results = readTestResults();
    const filteredResults = results.filter(r => r.id !== req.params.id);
    writeTestResults(filteredResults);
    res.json({ message: 'Test run deleted successfully' });
  } catch (err) {
    console.error('Error deleting test result:', err);
    res.status(500).json({ message: 'Failed to delete test run' });
  }
});

// Admin: Initialize database with sample data
router.post('/init-database', async (req, res) => {
  try {
    console.log('🔄 Admin database initialization requested');
    
    // Check if there's already data in the database
    const existingUsers = await User.countDocuments();
    const existingListings = await Listing.countDocuments();
    
    if (existingUsers > 0 || existingListings > 0) {
      return res.status(400).json({ 
        message: 'Database already contains data. Use force=true to reinitialize.',
        existingUsers,
        existingListings
      });
    }
    
    // Initialize database
    await initializeDatabase();
    
    // Get counts after initialization
    const userCount = await User.countDocuments();
    const listingCount = await Listing.countDocuments();
    
    res.json({ 
      message: 'Database initialized successfully',
      userCount,
      listingCount
    });
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    res.status(500).json({ 
      message: 'Database initialization failed',
      error: error.message 
    });
  }
});

// Admin: Force reinitialize database (clears existing data)
router.post('/init-database/force', async (req, res) => {
  try {
    console.log('🔄 Admin force database initialization requested');
    
    // Force reinitialize database
    await initializeDatabase(true);
    
    // Get counts after initialization
    const userCount = await User.countDocuments();
    const listingCount = await Listing.countDocuments();
    
    res.json({ 
      message: 'Database force reinitialized successfully',
      userCount,
      listingCount
    });
  } catch (error) {
    console.error('❌ Database force initialization failed:', error);
    res.status(500).json({ 
      message: 'Database force initialization failed',
      error: error.message 
    });
  }
});

// Admin: Get database status
router.get('/database-status', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const listingCount = await Listing.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const hostCount = await User.countDocuments({ role: 'host' });
    const guestCount = await User.countDocuments({ role: 'guest' });
    
    res.json({
      userCount,
      listingCount,
      adminCount,
      hostCount,
      guestCount,
      isInitialized: userCount > 0 || listingCount > 0
    });
  } catch (error) {
    console.error('❌ Database status check failed:', error);
    res.status(500).json({ 
      message: 'Database status check failed',
      error: error.message 
    });
  }
});

module.exports = router; 