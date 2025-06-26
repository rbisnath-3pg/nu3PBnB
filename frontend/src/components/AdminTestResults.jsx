import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaPlay, FaCheck, FaTimes, FaClock, FaEye, FaTimesCircle, FaTrash, FaBroom, FaDownload, FaTerminal, FaInfoCircle, FaExclamationTriangle, FaBug } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import getApiBase from '../services/getApiBase';

const API_BASE = getApiBase();

// Enhanced logging system
class TestResultsLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs
    this.logLevels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3
    };
    this.currentLevel = this.logLevels.INFO;
  }

  log(level, message, data = null, context = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp,
      level,
      message,
      data,
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    };

    this.logs.push(logEntry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with appropriate styling
    const levelColors = {
      DEBUG: 'color: #6B7280',
      INFO: 'color: #3B82F6',
      WARN: 'color: #F59E0B',
      ERROR: 'color: #EF4444'
    };

    const levelIcons = {
      DEBUG: '🐛',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌'
    };

    console.log(
      `%c${levelIcons[level]} [AdminTestResults] ${message}`,
      levelColors[level],
      data || '',
      context
    );

    return logEntry;
  }

  debug(message, data = null, context = {}) {
    if (this.currentLevel <= this.logLevels.DEBUG) {
      return this.log('DEBUG', message, data, context);
    }
  }

  info(message, data = null, context = {}) {
    if (this.currentLevel <= this.logLevels.INFO) {
      return this.log('INFO', message, data, context);
    }
  }

  warn(message, data = null, context = {}) {
    if (this.currentLevel <= this.logLevels.WARN) {
      return this.log('WARN', message, data, context);
    }
  }

  error(message, error = null, context = {}) {
    if (this.currentLevel <= this.logLevels.ERROR) {
      const errorData = error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : null;
      return this.log('ERROR', message, errorData, context);
    }
  }

  getLogs(level = null, limit = null) {
    let filteredLogs = this.logs;
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level);
    }
    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }
    return filteredLogs;
  }

  clearLogs() {
    this.logs = [];
    this.info('Logs cleared');
  }

  exportLogs() {
    const logData = {
      exportTime: new Date().toISOString(),
      totalLogs: this.logs.length,
      logs: this.logs
    };
    return JSON.stringify(logData, null, 2);
  }

  setLogLevel(level) {
    this.currentLevel = this.logLevels[level] || this.logLevels.INFO;
    this.info(`Log level set to ${level}`);
  }
}

const AdminTestResults = () => {
  const { user, loading: authLoading } = useAuth();
  const [testRuns, setTestRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRun, setSelectedRun] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [logLevel, setLogLevel] = useState('INFO');
  
  // Enhanced logging instance
  const logger = useRef(new TestResultsLogger());
  
  // Cache for API responses
  const cache = useRef(new Map());
  const lastFetchTime = useRef(0);
  const CACHE_DURATION = 5000; // 5 seconds cache
  const progressInterval = useRef(null);
  const performanceTimers = useRef(new Map());

  // Helper to get auth token
  const getToken = () => localStorage.getItem('token');

  // Performance monitoring
  const startTimer = (name) => {
    performanceTimers.current.set(name, performance.now());
    logger.current.debug(`Timer started: ${name}`);
  };

  const endTimer = (name) => {
    const startTime = performanceTimers.current.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      logger.current.info(`Timer completed: ${name}`, { duration: `${duration.toFixed(2)}ms` });
      performanceTimers.current.delete(name);
      return duration;
    }
    return null;
  };

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'passed':
        return { icon: <FaCheck className="w-4 h-4" />, color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'border-green-200' };
      case 'failed':
        return { icon: <FaTimes className="w-4 h-4" />, color: 'text-red-600', bgColor: 'bg-red-100', borderColor: 'border-red-200' };
      case 'running':
        return { icon: <FaClock className="w-4 h-4" />, color: 'text-yellow-600', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-200' };
      default:
        return { icon: <FaClock className="w-4 h-4" />, color: 'text-gray-600', bgColor: 'bg-gray-100', borderColor: 'border-gray-200' };
    }
  };

  // Clear test history
  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all test history? This action cannot be undone.')) {
      logger.current.info('Clear history cancelled by user');
      return;
    }
    
    startTimer('clearHistory');
    setLoading(true);
    setError(null);
    const url = `${API_BASE}/api/admin/test-results`;
    const options = { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } };
    
    logger.current.info('Clearing test history', { url, method: 'DELETE' });
    
    try {
      const res = await fetch(url, options);
      logger.current.info('Clear history response received', { 
        status: res.status, 
        ok: res.ok,
        statusText: res.statusText 
      });
      
      if (!res.ok) throw new Error('Failed to clear test history');
      
      setTestRuns([]);
      setSelectedRun(null);
      logger.current.info('Test history cleared successfully');
    } catch (err) {
      setError(err.message);
      logger.current.error('Error clearing test history', err, { url, options });
    } finally {
      setLoading(false);
      setShowClearConfirm(false);
      endTimer('clearHistory');
    }
  };

  // Delete specific test run
  const handleDeleteRun = async (id) => {
    if (!confirm('Are you sure you want to delete this test run?')) {
      logger.current.info('Delete test run cancelled by user', { testRunId: id });
      return;
    }
    
    startTimer(`deleteRun_${id}`);
    setError(null);
    const url = `${API_BASE}/api/admin/test-results/${id}`;
    const options = { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } };
    
    logger.current.info('Deleting test run', { testRunId: id, url, method: 'DELETE' });
    
    try {
      const res = await fetch(url, options);
      logger.current.info('Delete run response received', { 
        testRunId: id,
        status: res.status, 
        ok: res.ok,
        statusText: res.statusText 
      });
      
      if (!res.ok) throw new Error('Failed to delete test run');
      
      setTestRuns(runs => runs.filter(r => r.id !== id));
      if (selectedRun && selectedRun.id === id) {
        setSelectedRun(null);
      }
      logger.current.info('Test run deleted successfully', { testRunId: id });
    } catch (err) {
      setError(err.message);
      logger.current.error('Error deleting test run', err, { testRunId: id, url, options });
    } finally {
      endTimer(`deleteRun_${id}`);
    }
  };

  // Debounced fetch function with enhanced logging
  const debouncedFetch = useCallback((url, options = {}) => {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    const now = Date.now();
    
    // Check cache first
    if (cache.current.has(cacheKey)) {
      const cached = cache.current.get(cacheKey);
      if (now - cached.timestamp < CACHE_DURATION) {
        logger.current.debug('Returning cached data', { url, cacheAge: now - cached.timestamp });
        return Promise.resolve(cached.data);
      }
    }
    
    // Rate limiting - add delay if fetching too frequently, but don't skip
    const timeSinceLastFetch = now - lastFetchTime.current;
    if (timeSinceLastFetch < 1000) {
      const delay = 1000 - timeSinceLastFetch;
      logger.current.debug('Rate limiting fetch', { url, delay: `${delay}ms` });
      return new Promise(resolve => {
        setTimeout(() => {
          debouncedFetch(url, options).then(resolve);
        }, delay);
      });
    }
    
    lastFetchTime.current = now;
    startTimer(`fetch_${url}`);
    
    logger.current.info('Initiating fetch request', { url, options });
    
    return fetch(url, options).then(async (res) => {
      const duration = endTimer(`fetch_${url}`);
      logger.current.info('Fetch response received', { 
        url, 
        status: res.status, 
        ok: res.ok,
        duration: `${duration?.toFixed(2)}ms`,
        headers: Object.fromEntries(res.headers.entries())
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      
      const data = await res.json();
      logger.current.debug('Fetch data parsed', { url, dataSize: JSON.stringify(data).length });
      
      // Cache the response
      cache.current.set(cacheKey, {
        data,
        timestamp: now
      });
      
      return data;
    }).catch(err => {
      const duration = endTimer(`fetch_${url}`);
      logger.current.error('Fetch request failed', err, { 
        url, 
        options,
        duration: `${duration?.toFixed(2)}ms`
      });
      throw err;
    });
  }, []);

  // Fetch all test runs
  const fetchTestRuns = async () => {
    if (authLoading || !user) {
      logger.current.warn('Fetch test runs skipped', { authLoading, userAuthenticated: !!user });
      return;
    }
    
    startTimer('fetchTestRuns');
    setLoading(true);
    setError(null);
    const url = `${API_BASE}/api/admin/test-results`;
    const options = { headers: { 'Authorization': `Bearer ${getToken()}` } };
    
    logger.current.info('Fetching all test runs', { url, userId: user.id });
    
    try {
      const data = await debouncedFetch(url, options);
      if (data) {
        setTestRuns(data);
        logger.current.info('Test runs loaded successfully', { 
          count: data.length,
          runs: data.map(run => ({ id: run.id, status: run.status, date: run.date }))
        });
      }
    } catch (err) {
      setError(err.message);
      logger.current.error('Error fetching test runs', err, { url, userId: user.id });
    } finally {
      setLoading(false);
      endTimer('fetchTestRuns');
    }
  };

  // Fetch details for a specific run
  const fetchRunDetails = async (id) => {
    if (authLoading || !user) {
      logger.current.warn('Fetch run details skipped', { authLoading, userAuthenticated: !!user });
      return;
    }
    
    startTimer(`fetchRunDetails_${id}`);
    setError(null);
    const url = `${API_BASE}/api/admin/test-results/${id}`;
    const options = { headers: { 'Authorization': `Bearer ${getToken()}` } };
    
    logger.current.info('Fetching run details', { testRunId: id, url, userId: user.id });
    
    try {
      const data = await debouncedFetch(url, options);
      if (data) {
        setSelectedRun(data);
        logger.current.info('Run details loaded successfully', { 
          testRunId: id,
          status: data.status,
          summary: data.summary
        });
      }
    } catch (err) {
      setError(err.message);
      logger.current.error('Error fetching run details', err, { testRunId: id, url, userId: user.id });
    } finally {
      endTimer(`fetchRunDetails_${id}`);
    }
  };

  // Start progress simulation
  const startProgressSimulation = () => {
    setProgress(0);
    setCurrentTest('Initializing test environment...');
    logger.current.info('Starting progress simulation');
    
    const testPhases = [
      'Loading test configuration...',
      'Running authentication tests...',
      'Running booking tests...',
      'Running payment tests...',
      'Running listing tests...',
      'Running component tests...',
      'Generating coverage report...',
      'Finalizing results...'
    ];
    
    let phaseIndex = 0;
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(progressInterval.current);
          setProgress(100);
          setCurrentTest('Test execution completed');
          logger.current.info('Progress simulation completed');
          return 100;
        }
        // Update current test phase
        const phaseProgress = (newProgress / 100) * testPhases.length;
        const currentPhase = Math.floor(phaseProgress);
        if (currentPhase < testPhases.length && currentPhase !== phaseIndex) {
          phaseIndex = currentPhase;
          setCurrentTest(testPhases[currentPhase]);
          logger.current.debug('Progress phase updated', { 
            phase: testPhases[currentPhase], 
            progress: newProgress.toFixed(1) 
          });
        }
        return newProgress;
      });
    }, 500);
  };

  // Stop progress simulation
  const stopProgressSimulation = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
      logger.current.info('Progress simulation stopped');
    }
    setProgress(0);
    setCurrentTest('');
  };

  // Trigger a new test run
  const handleRunTests = async () => {
    // Don't run if auth is still loading or user is not authenticated
    if (authLoading || !user) {
      logger.current.warn('Run tests skipped', { authLoading, userAuthenticated: !!user });
      return;
    }
    
    startTimer('runTests');
    setRunning(true);
    setError(null);
    startProgressSimulation();
    
    logger.current.info('Starting new test run', { userId: user.id, userEmail: user.email });
    
    try {
      const res = await fetch(`${API_BASE}/api/admin/run-tests`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      
      logger.current.info('Test run API response received', { 
        status: res.status, 
        ok: res.ok,
        statusText: res.statusText 
      });
      
      if (!res.ok) throw new Error('Failed to start test run');
      
      // Add the new running test to the top
      const newRun = await res.json();
      setTestRuns(runs => [newRun, ...runs]);
      
      logger.current.info('New test run created', { 
        testRunId: newRun.id,
        status: newRun.status,
        summary: newRun.summary
      });
      
      // Add a small delay to ensure backend has time to write to file
      logger.current.info('Waiting for backend to initialize test run', { testRunId: newRun.id });
      await new Promise(r => setTimeout(r, 1000));
      
      // Poll for completion with reduced frequency
      let done = false;
      let pollCount = 0;
      const maxPolls = 30; // up to ~30s
      
      logger.current.info('Starting poll loop for test completion', { maxPolls });
      
      while (!done && pollCount < maxPolls) {
        await new Promise(r => setTimeout(r, 2000)); // Increased from 1s to 2s
        pollCount++;
        
        logger.current.debug('Polling test status', { pollCount, testRunId: newRun.id });
        
        try {
          const pollData = await debouncedFetch(`${API_BASE}/api/admin/test-results/${newRun.id}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
          });
          
          if (pollData && pollData.status !== 'running') {
            setTestRuns(runs => runs.map(r => r.id === pollData.id ? pollData : r));
            done = true;
            logger.current.info('Test run completed', { 
              testRunId: newRun.id,
              finalStatus: pollData.status,
              pollCount,
              summary: pollData.summary
            });
          } else if (!pollData) {
            logger.current.warn('Test run not found during polling', { 
              testRunId: newRun.id,
              pollCount 
            });
          }
        } catch (err) {
          logger.current.error('Error during polling', err, { 
            testRunId: newRun.id,
            pollCount 
          });
          // Continue polling even if there's an error
        }
      }
      
      if (!done) {
        logger.current.warn('Test run polling timeout', { 
          testRunId: newRun.id,
          pollCount: maxPolls 
        });
      }
    } catch (err) {
      setError(err.message);
      logger.current.error('Error during test run', err, { userId: user.id });
    } finally {
      setRunning(false);
      stopProgressSimulation();
      endTimer('runTests');
    }
  };

  // Export logs
  const handleExportLogs = () => {
    const logData = logger.current.exportLogs();
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    logger.current.info('Logs exported successfully');
  };

  // Clear logs
  const handleClearLogs = () => {
    logger.current.clearLogs();
  };

  // Handle log level change
  const handleLogLevelChange = (newLevel) => {
    setLogLevel(newLevel);
    logger.current.setLogLevel(newLevel);
  };

  useEffect(() => {
    // Only fetch when auth is ready and user is authenticated
    if (!authLoading && user) {
      logger.current.info('Component mounted, fetching test runs', { 
        userId: user.id,
        userEmail: user.email 
      });
      fetchTestRuns();
    }
  }, [authLoading, user]);

  // Cleanup progress interval on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        logger.current.info('Component unmounting, cleanup performed');
      }
    };
  }, []);

  // When a run is selected
  useEffect(() => {
    if (selectedRun) {
      logger.current.info('Test run selected for viewing', { 
        testRunId: selectedRun.id,
        status: selectedRun.status 
      });
    }
  }, [selectedRun]);

  // When error changes
  useEffect(() => {
    if (error) {
      logger.current.error('Error state updated', null, { error });
    }
  }, [error]);

  // When loading state changes
  useEffect(() => {
    logger.current.debug('Loading state changed', { loading });
  }, [loading]);

  // When running state changes
  useEffect(() => {
    logger.current.debug('Running state changed', { running });
  }, [running]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Test Results</h1>
            <p className="text-gray-600 dark:text-gray-400">View and manage automated test runs for the platform.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Log Level Selector */}
            <select
              value={logLevel}
              onChange={(e) => handleLogLevelChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="DEBUG">Debug</option>
              <option value="INFO">Info</option>
              <option value="WARN">Warn</option>
              <option value="ERROR">Error</option>
            </select>
            
            {/* Log Controls */}
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold shadow hover:bg-gray-700 flex items-center gap-2 transition-all duration-200"
            >
              <FaTerminal className="w-4 h-4" />
              {showLogs ? 'Hide Logs' : 'Show Logs'}
            </button>
            
            <button
              onClick={handleExportLogs}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 flex items-center gap-2 transition-all duration-200"
            >
              <FaDownload className="w-4 h-4" />
              Export Logs
            </button>
            
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={loading || testRuns.length === 0}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold shadow hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2 transition-all duration-200"
            >
              <FaBroom className="w-4 h-4" />
              Clear History
            </button>
            
            <button
              onClick={handleRunTests}
              disabled={running}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-all duration-200"
            >
              {running ? (
                <>
                  <FaClock className="w-4 h-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <FaPlay className="w-4 h-4" />
                  Run All Tests Now
                </>
              )}
            </button>
          </div>
        </div>

        {/* Log Viewer */}
        {showLogs && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FaTerminal className="w-4 h-4" />
                Application Logs
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {logger.current.logs.length} logs
                </span>
                <button
                  onClick={handleClearLogs}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-xs">
              {logger.current.logs.slice(-50).map((log) => (
                <div key={log.id} className="mb-1">
                  <span className="text-gray-500">[{log.timestamp}]</span>
                  <span className={`ml-2 ${
                    log.level === 'ERROR' ? 'text-red-400' :
                    log.level === 'WARN' ? 'text-yellow-400' :
                    log.level === 'INFO' ? 'text-blue-400' :
                    'text-gray-400'
                  }`}>
                    {log.level}
                  </span>
                  <span className="ml-2">{log.message}</span>
                  {log.data && (
                    <div className="ml-4 text-gray-500">
                      {typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : log.data}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Progress Bar for Running Tests */}
        {running && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Test Execution Progress</h3>
              <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{currentTest}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
            <FaTimesCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        
        {/* Clear History Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Clear Test History</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to clear all test history? This action cannot be undone and will remove all test run records.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearHistory}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <FaTrash className="w-4 h-4" />
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Test Run History</h2>
          {loading ? (
            <div className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <FaClock className="w-4 h-4 animate-spin" />
              Loading test results...
            </div>
          ) : testRuns.length === 0 ? (
            <div className="text-gray-600 dark:text-gray-300 text-center py-8">
              No test runs found. Click "Run All Tests Now" to start your first test run.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Summary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Coverage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {testRuns.map(run => {
                    const statusInfo = getStatusInfo(run.status);
                    return (
                      <tr key={run.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div className="font-medium">{run.date}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">ID: {run.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor}`}>
                            {statusInfo.icon}
                            {run.status === 'passed' ? 'Passed' : run.status === 'failed' ? 'Failed' : run.status === 'running' ? 'Running...' : run.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          <div className="font-medium">{run.summary}</div>
                          {run.status === 'running' && (
                            <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                              Test execution in progress...
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {run.coverage ? (
                            <span className="font-mono text-sm">{run.coverage}</span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => handleDeleteRun(run.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1"
                              title="Delete test run"
                            >
                              <FaTrash className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => fetchRunDetails(run.id)}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                            >
                              <FaEye className="w-3 h-3" />
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {selectedRun && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Test Run Details</h2>
              <button 
                onClick={() => setSelectedRun(null)} 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & Time</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedRun.date}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Test Run ID</label>
                  <p className="text-sm text-gray-900 dark:text-white font-mono">{selectedRun.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const statusInfo = getStatusInfo(selectedRun.status);
                      return (
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor}`}>
                          {statusInfo.icon}
                          {selectedRun.status === 'passed' ? 'Passed' : selectedRun.status === 'failed' ? 'Failed' : selectedRun.status === 'running' ? 'Running...' : selectedRun.status}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Summary</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedRun.summary}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code Coverage</label>
                  <p className="text-sm text-gray-900 dark:text-white font-mono">{selectedRun.coverage || 'Not available'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Test Execution Details</label>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed" style={{ maxHeight: '400px' }}>
                  {selectedRun.details ? (
                    selectedRun.details
                      // Remove ANSI color codes for better readability
                      .replace(/\x1b\[[0-9;]*m/g, '')
                      // Highlight test results
                      .replace(/(✓|PASS|PASSED)/g, '✅ $1')
                      .replace(/(✕|FAIL|FAILED)/g, '❌ $1')
                      .replace(/(RUNNING|RUNS)/g, '⏳ $1')
                      .replace(/(SKIP|SKIPPED)/g, '⏭️ $1')
                      // Highlight important sections
                      .replace(/(Test Suites:)/g, '\n📊 $1')
                      .replace(/(Tests:)/g, '\n🧪 $1')
                      .replace(/(Snapshots:)/g, '\n📸 $1')
                      .replace(/(Time:)/g, '\n⏱️ $1')
                      .replace(/(Ran all test suites\.)/g, '\n✅ $1')
                      // Highlight coverage section
                      .replace(/(----------\|---------|File.*%|All files)/g, '\n📈 $1')
                      // Highlight file paths
                      .replace(/(src\/.*\.test\.(js|jsx|ts|tsx))/g, '📁 $1')
                      // Highlight test descriptions
                      .replace(/(✓|✕)\s+(.+)/g, '$1 $2')
                  ) : 'No detailed output available'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTestResults; 