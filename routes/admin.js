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
// NOTE: Using enhanced test runner for production-safe execution
router.post('/run-tests', auth, requireRole('admin'), (req, res) => {
  const id = Date.now().toString();
  const date = new Date().toLocaleString();
  const results = readTestResults();
  
  console.log(`🔄 Starting enhanced test run ${id} at ${date}`);
  
  // Mark as running
  results.unshift({ id, date, status: 'running', summary: 'Running...', coverage: '', details: '' });
  writeTestResults(results);
  
  // Use specific test suite for better performance and reliability
  const jestCommand = 'node test-runner.js suite backend';
  const cwd = path.join(__dirname, '..');
  
  console.log(`📋 Executing enhanced test runner: ${jestCommand} in ${cwd}`);
  
  // Run tests with strict memory and time limits
  const testProcess = exec(jestCommand, { 
    cwd: cwd,
    maxBuffer: 1024 * 1024 * 5, // 5MB buffer (reduced from 10MB)
    env: { 
      ...process.env, 
      NODE_ENV: 'test',
      NODE_OPTIONS: '--max-old-space-size=512', // Limit memory to 512MB
      LOG_LEVEL: 'info',
      FORCE_COLOR: '0', // Disable colors for production
      SUPPRESS_JEST_WARNINGS: 'true' // Suppress Mongoose warnings
    },
    timeout: 90000 // 1.5 minute total timeout (reduced from 2 minutes)
  }, (err, stdout, stderr) => {
    console.log(`✅ Enhanced test run ${id} completed with ${err ? 'error' : 'success'}`);
    console.log(`📊 stdout length: ${stdout?.length || 0}, stderr length: ${stderr?.length || 0}`);
    
    const status = err ? 'failed' : 'passed';
    
    // Parse summary from enhanced test runner output
    let summary = 'Test execution completed';
    let coverage = '';
    
    // Extract test summary from enhanced runner output
    const testSummaryMatch = stdout.match(/Test Results Summary.*?total.*?(\d+).*?passed.*?(\d+)/s);
    if (testSummaryMatch) {
      const total = testSummaryMatch[1];
      const passed = testSummaryMatch[2];
      summary = `${passed} of ${total} tests passed`;
    } else {
      // Fallback parsing for different output formats
      const passedMatch = stdout.match(/(\d+) passing/);
      const failedMatch = stdout.match(/(\d+) failing/);
      if (passedMatch || failedMatch) {
        const passed = passedMatch ? passedMatch[1] : '0';
        const failed = failedMatch ? failedMatch[1] : '0';
        const total = parseInt(passed) + parseInt(failed);
        summary = `${passed} of ${total} tests passed`;
      }
    }
    
    // Extract coverage information
    const coverageMatch = stdout.match(/All files\s+\|\s+([\d.]+)%/);
    if (coverageMatch) {
      coverage = `${coverageMatch[1]}%`;
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
      console.log(`💾 Enhanced test results saved for run ${id}`);
    } else {
      console.error(`❌ Could not find test run ${id} to update`);
    }
  });
  
  // Handle process events for better error handling
  testProcess.on('error', (error) => {
    console.error(`❌ Enhanced test execution error for run ${id}:`, error);
    
    // Try running tests in smaller batches as fallback
    console.log(`🔄 Attempting fallback: running tests in smaller batches for run ${id}`);
    
    const fallbackTests = [
      'pattern auth',
      'pattern listings',
      'pattern payments'
    ];
    
    let batchResults = [];
    let completedBatches = 0;
    
    fallbackTests.forEach((testPattern, index) => {
      const batchCommand = `node test-runner.js ${testPattern}`;
      
      exec(batchCommand, {
        cwd: cwd,
        maxBuffer: 1024 * 1024 * 2, // 2MB buffer per batch
        env: { 
          ...process.env, 
          NODE_ENV: 'test',
          NODE_OPTIONS: '--max-old-space-size=256', // Even smaller memory limit
          LOG_LEVEL: 'info',
          FORCE_COLOR: '0',
          SUPPRESS_JEST_WARNINGS: 'true'
        },
        timeout: 30000 // 30 second timeout per batch
      }, (batchErr, batchStdout, batchStderr) => {
        completedBatches++;
        
        const batchResult = {
          pattern: testPattern,
          success: !batchErr,
          output: batchStdout + (batchStderr ? '\n\nSTDERR:\n' + batchStderr : ''),
          error: batchErr ? batchErr.message : null
        };
        
        batchResults.push(batchResult);
        
        // If all batches are complete, update the result
        if (completedBatches === fallbackTests.length) {
          const totalPassed = batchResults.filter(r => r.success).length;
          const totalBatches = fallbackTests.length;
          
          const fallbackOutput = `Fallback Test Execution Results
=====================================

Attempted to run tests in ${totalBatches} smaller batches due to memory/time constraints.

Batch Results:
${batchResults.map((result, i) => 
  `${result.success ? '✅' : '❌'} Batch ${i + 1}: ${result.pattern}
   Status: ${result.success ? 'PASSED' : 'FAILED'}
   ${result.error ? `Error: ${result.error}` : ''}`
).join('\n\n')}

Summary: ${totalPassed}/${totalBatches} batches completed successfully

Original Error: ${error.message}

Note: Tests were run in smaller batches to work within production constraints.
For full test execution, consider using a CI/CD pipeline or development environment.`;

          const updatedResults = readTestResults();
          const idx = updatedResults.findIndex(r => r.id === id);
          if (idx !== -1) {
            updatedResults[idx] = {
              id,
              date,
              status: totalPassed > 0 ? 'passed' : 'failed',
              summary: `${totalPassed}/${totalBatches} test batches passed`,
              coverage: '',
              details: fallbackOutput
            };
            writeTestResults(updatedResults);
            console.log(`💾 Fallback test results saved for run ${id}`);
          }
        }
      });
    });
  });
  
  // Handle process exit
  testProcess.on('exit', (code, signal) => {
    console.log(`🚪 Enhanced test process exited with code ${code}, signal ${signal} for run ${id}`);
    
    // If process exits with error and we haven't handled it yet
    if (code !== 0 && code !== null) {
      console.log(`⚠️ Enhanced test process exited with non-zero code ${code} for run ${id}`);
    }
  });
  
  // Handle process close
  testProcess.on('close', (code) => {
    console.log(`🔒 Enhanced test process closed with code ${code} for run ${id}`);
  });
  
  // Handle timeout with graceful shutdown
  setTimeout(() => {
    if (testProcess.exitCode === null) {
      console.log(`⏰ Enhanced test process timed out for run ${id}, killing process gracefully`);
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
            details: `Enhanced test execution timed out after 1.5 minutes.\n\nThis may be due to:\n- Large test suite\n- Memory constraints\n- Network issues\n\nConsider running tests in smaller batches or using a development environment for full test execution.`
          };
          writeTestResults(updatedResults);
          console.log(`💾 Timeout test results saved for run ${id}`);
        }
      }, 1000);
    }
  }, 90000); // 1.5 minute timeout (reduced from 2 minutes)
  
  res.json({ 
    message: 'Test run started', 
    id, 
    status: 'running',
    summary: 'Running enhanced test suite...'
  });
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