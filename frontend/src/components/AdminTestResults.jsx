import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaPlay, FaCheck, FaTimes, FaClock, FaEye, FaTimesCircle, FaTrash, FaBroom, FaDownload, FaTerminal, FaInfoCircle, FaExclamationTriangle, FaBug, FaNetworkWired, FaChartLine, FaFilter, FaSearch, FaCog, FaExclamationCircle, FaCheckCircle, FaPause, FaPlayCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import getApiBase from '../services/getApiBase';

const API_BASE = getApiBase();

// Enhanced debugging system
class TestResultsLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 2000; // Increased to 2000 logs
    this.logLevels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3
    };
    this.currentLevel = this.logLevels.INFO;
    
    // Enhanced debugging features
    this.networkRequests = [];
    this.performanceMetrics = new Map();
    this.errorTracker = {
      errors: [],
      errorCount: 0,
      lastError: null
    };
    this.debugMode = false;
    this.filters = {
      level: null,
      search: '',
      timeRange: null,
      component: null
    };
    
    // Auto-save logs to localStorage
    this.autoSave = true;
    this.loadFromStorage();
    
    // Performance monitoring
    this.startTime = Date.now();
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('adminTestResults_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.logs = parsed.logs || [];
        this.networkRequests = parsed.networkRequests || [];
        this.errorTracker = parsed.errorTracker || this.errorTracker;
      }
    } catch (error) {
      console.warn('Failed to load logs from storage:', error);
    }
  }

  saveToStorage() {
    if (!this.autoSave) return;
    
    try {
      const data = {
        logs: this.logs.slice(-500), // Save last 500 logs
        networkRequests: this.networkRequests.slice(-100),
        errorTracker: this.errorTracker,
        timestamp: Date.now()
      };
      localStorage.setItem('adminTestResults_logs', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save logs to storage:', error);
    }
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
        url: window.location.href,
        sessionId: this.sessionId,
        component: 'AdminTestResults',
        memoryUsage: this.getMemoryUsage(),
        networkStatus: navigator.onLine ? 'online' : 'offline'
      }
    };

    this.logs.push(logEntry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Enhanced console output with better formatting
    this.outputToConsole(level, message, data, context);

    // Track errors
    if (level === 'ERROR') {
      this.trackError(logEntry);
    }

    // Auto-save
    this.saveToStorage();

    return logEntry;
  }

  outputToConsole(level, message, data, context) {
    const levelColors = {
      DEBUG: 'color: #6B7280; font-weight: bold;',
      INFO: 'color: #3B82F6; font-weight: bold;',
      WARN: 'color: #F59E0B; font-weight: bold;',
      ERROR: 'color: #EF4444; font-weight: bold;'
    };

    const levelIcons = {
      DEBUG: '🐛',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌'
    };

    const timestamp = new Date().toLocaleTimeString();
    
    console.groupCollapsed(
      `%c${levelIcons[level]} [${timestamp}] ${level} - ${message}`,
      levelColors[level]
    );
    
    if (data) {
      console.log('Data:', data);
    }
    
    if (Object.keys(context).length > 0) {
      console.log('Context:', context);
    }
    
    console.groupEnd();
  }

  trackError(logEntry) {
    this.errorTracker.errors.push(logEntry);
    this.errorTracker.errorCount++;
    this.errorTracker.lastError = logEntry;
    
    // Keep only last 50 errors
    if (this.errorTracker.errors.length > 50) {
      this.errorTracker.errors = this.errorTracker.errors.slice(-50);
    }
  }

  trackNetworkRequest(url, method, startTime, endTime, status, responseSize) {
    const request = {
      id: Date.now() + Math.random(),
      url,
      method,
      startTime,
      endTime,
      duration: endTime - startTime,
      status,
      responseSize,
      timestamp: new Date().toISOString()
    };
    
    this.networkRequests.push(request);
    
    // Keep only last 100 requests
    if (this.networkRequests.length > 100) {
      this.networkRequests = this.networkRequests.slice(-100);
    }
    
    this.info('Network request completed', request);
  }

  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }

  getPerformanceMetrics() {
    const metrics = {};
    this.performanceMetrics.forEach((value, key) => {
      metrics[key] = value;
    });
    return metrics;
  }

  getFilteredLogs(filters = {}) {
    let filtered = this.logs;
    
    if (filters.level) {
      filtered = filtered.filter(log => log.level === filters.level);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        (log.data && JSON.stringify(log.data).toLowerCase().includes(searchLower))
      );
    }
    
    if (filters.timeRange) {
      const { start, end } = filters.timeRange;
      filtered = filtered.filter(log => {
        const logTime = new Date(log.timestamp);
        return logTime >= start && logTime <= end;
      });
    }
    
    return filtered;
  }

  getErrorSummary() {
    const errors = this.errorTracker.errors;
    const summary = {
      total: errors.length,
      byLevel: {},
      byMessage: {},
      recent: errors.slice(-10)
    };
    
    errors.forEach(error => {
      summary.byLevel[error.level] = (summary.byLevel[error.level] || 0) + 1;
      summary.byMessage[error.message] = (summary.byMessage[error.message] || 0) + 1;
    });
    
    return summary;
  }

  getNetworkSummary() {
    const requests = this.networkRequests;
    const summary = {
      total: requests.length,
      byStatus: {},
      averageDuration: 0,
      totalSize: 0,
      recent: requests.slice(-10)
    };
    
    if (requests.length > 0) {
      const totalDuration = requests.reduce((sum, req) => sum + req.duration, 0);
      summary.averageDuration = totalDuration / requests.length;
      summary.totalSize = requests.reduce((sum, req) => sum + (req.responseSize || 0), 0);
      
      requests.forEach(req => {
        summary.byStatus[req.status] = (summary.byStatus[req.status] || 0) + 1;
      });
    }
    
    return summary;
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
        name: error.name,
        cause: error.cause
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
    this.networkRequests = [];
    this.errorTracker = {
      errors: [],
      errorCount: 0,
      lastError: null
    };
    this.performanceMetrics.clear();
    this.info('All logs and metrics cleared');
    this.saveToStorage();
  }

  exportLogs() {
    const logData = {
      exportTime: new Date().toISOString(),
      sessionId: this.sessionId,
      totalLogs: this.logs.length,
      logs: this.logs,
      networkRequests: this.networkRequests,
      errorSummary: this.getErrorSummary(),
      networkSummary: this.getNetworkSummary(),
      performanceMetrics: this.getPerformanceMetrics(),
      filters: this.filters,
      systemInfo: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        memoryUsage: this.getMemoryUsage(),
        sessionDuration: Date.now() - this.startTime
      }
    };
    return JSON.stringify(logData, null, 2);
  }

  setLogLevel(level) {
    this.currentLevel = this.logLevels[level] || this.logLevels.INFO;
    this.info(`Log level set to ${level}`);
  }

  setDebugMode(enabled) {
    this.debugMode = enabled;
    this.info(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  setFilters(filters) {
    this.filters = { ...this.filters, ...filters };
    this.info('Filters updated', filters);
  }

  // Performance tracking methods
  startPerformanceTimer(name) {
    this.performanceMetrics.set(name, {
      startTime: performance.now(),
      name
    });
    this.debug(`Performance timer started: ${name}`);
  }

  endPerformanceTimer(name) {
    const timer = this.performanceMetrics.get(name);
    if (timer) {
      const duration = performance.now() - timer.startTime;
      timer.duration = duration;
      timer.endTime = performance.now();
      this.info(`Performance timer completed: ${name}`, { duration: `${duration.toFixed(2)}ms` });
      return duration;
    }
    return null;
  }

  // Network monitoring wrapper
  async monitorNetworkRequest(url, options = {}) {
    const startTime = performance.now();
    this.startPerformanceTimer(`network_${url}`);
    
    try {
      const response = await fetch(url, options);
      const endTime = performance.now();
      
      // Get response size if possible
      let responseSize = 0;
      try {
        const clone = response.clone();
        const text = await clone.text();
        responseSize = new Blob([text]).size;
      } catch (e) {
        // Response might not be cloneable
      }
      
      this.endPerformanceTimer(`network_${url}`);
      this.trackNetworkRequest(url, options.method || 'GET', startTime, endTime, response.status, responseSize);
      
      return response;
    } catch (error) {
      const endTime = performance.now();
      this.endPerformanceTimer(`network_${url}`);
      this.trackNetworkRequest(url, options.method || 'GET', startTime, endTime, 'ERROR', 0);
      this.error(`Network request failed: ${url}`, error);
      throw error;
    }
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
  
  // Enhanced debugging state
  const [debugMode, setDebugMode] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [logFilters, setLogFilters] = useState({
    level: null,
    search: '',
    timeRange: null
  });
  const [performanceData, setPerformanceData] = useState({});
  const [networkData, setNetworkData] = useState({});
  const [errorSummary, setErrorSummary] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  
  // Enhanced logging instance
  const logger = useRef(new TestResultsLogger());
  
  // Cache for API responses
  const cache = useRef(new Map());
  const lastFetchTime = useRef(0);
  const CACHE_DURATION = 5000; // 5 seconds cache
  const progressInterval = useRef(null);
  const performanceTimers = useRef(new Map());
  const autoRefreshInterval = useRef(null);

  // Helper to get auth token
  const getToken = () => localStorage.getItem('token');

  // Enhanced performance monitoring
  const startTimer = (name) => {
    performanceTimers.current.set(name, performance.now());
    logger.current.startPerformanceTimer(name);
    logger.current.debug(`Timer started: ${name}`);
  };

  const endTimer = (name) => {
    const startTime = performanceTimers.current.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      logger.current.endPerformanceTimer(name);
      logger.current.info(`Timer completed: ${name}`, { duration: `${duration.toFixed(2)}ms` });
      performanceTimers.current.delete(name);
      return duration;
    }
    return null;
  };

  // Update debug data periodically
  useEffect(() => {
    const updateDebugData = () => {
      setPerformanceData(logger.current.getPerformanceMetrics());
      setNetworkData(logger.current.getNetworkSummary());
      setErrorSummary(logger.current.getErrorSummary());
    };

    const interval = setInterval(updateDebugData, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && !loading) {
      autoRefreshInterval.current = setInterval(() => {
        logger.current.info('Auto-refresh triggered');
        fetchTestRuns();
      }, refreshInterval);
    } else if (autoRefreshInterval.current) {
      clearInterval(autoRefreshInterval.current);
      autoRefreshInterval.current = null;
    }

    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    };
  }, [autoRefresh, refreshInterval, loading]);

  // Debug mode effect
  useEffect(() => {
    logger.current.setDebugMode(debugMode);
    if (debugMode) {
      logger.current.info('Debug mode enabled');
    }
  }, [debugMode]);

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
    startTimer('fetchTestRuns');
    setLoading(true);
    setError(null);
    
    // Check cache first
    const cacheKey = 'testRuns';
    const cached = cache.current.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - lastFetchTime.current) < CACHE_DURATION) {
      logger.current.info('Using cached test runs data', { 
        cacheAge: now - lastFetchTime.current,
        cacheSize: JSON.stringify(cached).length 
      });
      setTestRuns(cached);
      setLoading(false);
      endTimer('fetchTestRuns');
      return;
    }

    const url = `${API_BASE}/api/admin/test-results`;
    const options = { 
      method: 'GET', 
      headers: { 
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      } 
    };
    
    logger.current.info('Fetching test runs from API', { url, method: 'GET' });
    
    try {
      const response = await logger.current.monitorNetworkRequest(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      logger.current.info('Test runs fetched successfully', { 
        count: data.length,
        responseSize: JSON.stringify(data).length 
      });
      
      // Update cache
      cache.current.set(cacheKey, data);
      lastFetchTime.current = now;
      
      setTestRuns(data);
      setError(null);
    } catch (err) {
      logger.current.error('Failed to fetch test runs', err, { url });
      setError(`Failed to load test results: ${err.message}`);
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
    if (running) {
      logger.current.warn('Test run already in progress, ignoring request');
      return;
    }
    
    startTimer('runAllTests');
    setRunning(true);
    setError(null);
    setProgress(0);
    setCurrentTest('Initializing test suite...');
    
    logger.current.info('Starting test run', { 
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      memoryUsage: logger.current.getMemoryUsage()
    });
    
    const url = `${API_BASE}/api/admin/test-results/run`;
    const options = { 
      method: 'POST', 
      headers: { 
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        debugMode: debugMode,
        includePerformance: true,
        includeNetworkLogs: true
      })
    };
    
    logger.current.info('Initiating test run request', { url, method: 'POST' });
    
    try {
      // Start progress simulation
      startProgressSimulation();
      
      const response = await logger.current.monitorNetworkRequest(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      logger.current.info('Test run initiated successfully', { 
        testRunId: data.id,
        estimatedDuration: data.estimatedDuration,
        totalTests: data.totalTests 
      });
      
      // Update progress with real data if available
      if (data.progress) {
        setProgress(data.progress);
        setCurrentTest(data.currentTest || 'Running tests...');
      }
      
      // Clear cache to force refresh
      cache.current.clear();
      lastFetchTime.current = 0;
      
      // Fetch updated test runs
      await fetchTestRuns();
      
    } catch (err) {
      logger.current.error('Failed to start test run', err, { url });
      setError(`Failed to start tests: ${err.message}`);
      stopProgressSimulation();
    } finally {
      setRunning(false);
      endTimer('runAllTests');
      
      // Stop progress simulation after a delay
      setTimeout(() => {
        stopProgressSimulation();
        setProgress(0);
        setCurrentTest('');
      }, 2000);
    }
  };

  // Export logs
  const handleExportLogs = () => {
    const logData = logger.current.exportLogs();
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-test-results-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    logger.current.info('Logs exported successfully', { 
      fileName: a.download,
      logCount: logger.current.logs.length,
      exportSize: logData.length 
    });
  };

  // Clear logs
  const handleClearLogs = () => {
    logger.current.clearLogs();
    setPerformanceData({});
    setNetworkData({});
    setErrorSummary({});
  };

  // Handle log level change
  const handleLogLevelChange = (newLevel) => {
    setLogLevel(newLevel);
    logger.current.setLogLevel(newLevel);
  };

  // Enhanced debugging helpers
  const generateDebugReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      sessionId: logger.current.sessionId,
      systemInfo: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        memoryUsage: logger.current.getMemoryUsage(),
        sessionDuration: Date.now() - logger.current.startTime,
        online: navigator.onLine,
        cacheSize: cache.current.size
      },
      performance: {
        metrics: logger.current.getPerformanceMetrics(),
        timers: Array.from(performanceTimers.current.keys())
      },
      network: logger.current.getNetworkSummary(),
      errors: logger.current.getErrorSummary(),
      logs: {
        total: logger.current.logs.length,
        byLevel: logger.current.logs.reduce((acc, log) => {
          acc[log.level] = (acc[log.level] || 0) + 1;
          return acc;
        }, {}),
        recent: logger.current.logs.slice(-20)
      },
      testRuns: {
        total: testRuns.length,
        byStatus: testRuns.reduce((acc, run) => {
          acc[run.status] = (acc[run.status] || 0) + 1;
          return acc;
        }, {}),
        recent: testRuns.slice(0, 5)
      }
    };
    
    return report;
  };

  const exportDebugReport = () => {
    const report = generateDebugReport();
    const reportData = JSON.stringify(report, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    logger.current.info('Debug report exported', { 
      fileName: a.download,
      reportSize: reportData.length 
    });
  };

  const clearCache = () => {
    cache.current.clear();
    lastFetchTime.current = 0;
    logger.current.info('Cache cleared');
  };

  const testNetworkConnectivity = async () => {
    logger.current.info('Testing network connectivity');
    const testUrls = [
      `${API_BASE}/api/admin/test-results`,
      `${API_BASE}/api/health`,
      'https://httpbin.org/get'
    ];
    
    const results = [];
    
    for (const url of testUrls) {
      try {
        const startTime = performance.now();
        const response = await fetch(url, { 
          method: 'GET',
          headers: url.includes(API_BASE) ? { 'Authorization': `Bearer ${getToken()}` } : {}
        });
        const endTime = performance.now();
        
        results.push({
          url,
          status: response.status,
          duration: endTime - startTime,
          success: response.ok
        });
        
        logger.current.info(`Network test: ${url}`, { 
          status: response.status,
          duration: `${(endTime - startTime).toFixed(2)}ms`,
          success: response.ok 
        });
      } catch (error) {
        results.push({
          url,
          status: 'ERROR',
          duration: 0,
          success: false,
          error: error.message
        });
        
        logger.current.error(`Network test failed: ${url}`, error);
      }
    }
    
    return results;
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
            
            {/* Debug Panel Toggle */}
            <button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className={`px-4 py-2 rounded-lg font-semibold shadow flex items-center gap-2 transition-all duration-200 ${
                showDebugPanel 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              <FaBug className="w-4 h-4" />
              {showDebugPanel ? 'Hide Debug' : 'Show Debug'}
            </button>
            
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
            
            {/* Log Filters */}
            <div className="mb-4 flex flex-wrap gap-3">
              <select
                value={logFilters.level || ''}
                onChange={(e) => setLogFilters(prev => ({ ...prev, level: e.target.value || null }))}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
              >
                <option value="">All Levels</option>
                <option value="DEBUG">Debug</option>
                <option value="INFO">Info</option>
                <option value="WARN">Warn</option>
                <option value="ERROR">Error</option>
              </select>
              
              <input
                type="text"
                placeholder="Search logs..."
                value={logFilters.search}
                onChange={(e) => setLogFilters(prev => ({ ...prev, search: e.target.value }))}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 flex-1 min-w-48"
              />
            </div>
            
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-xs">
              {logger.current.getFilteredLogs(logFilters).slice(-50).map((log) => (
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

        {/* Enhanced Debug Panel */}
        {showDebugPanel && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FaBug className="w-4 h-4" />
                Debug Panel
              </h3>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={debugMode}
                    onChange={(e) => setDebugMode(e.target.checked)}
                    className="rounded"
                  />
                  Debug Mode
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded"
                  />
                  Auto-refresh
                </label>
                {autoRefresh && (
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700"
                  >
                    <option value={2000}>2s</option>
                    <option value={5000}>5s</option>
                    <option value={10000}>10s</option>
                    <option value={30000}>30s</option>
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Performance Metrics */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <FaChartLine className="w-4 h-4" />
                  Performance
                </h4>
                <div className="space-y-1 text-sm">
                  <div>Timers: {Object.keys(performanceData).length}</div>
                  <div>Memory: {performanceData.memoryUsage?.used || 'N/A'} MB</div>
                  <div>Session: {Math.round((Date.now() - logger.current.startTime) / 1000)}s</div>
                </div>
              </div>

              {/* Network Metrics */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <FaNetworkWired className="w-4 h-4" />
                  Network
                </h4>
                <div className="space-y-1 text-sm">
                  <div>Requests: {networkData.total || 0}</div>
                  <div>Avg Duration: {networkData.averageDuration ? `${networkData.averageDuration.toFixed(0)}ms` : 'N/A'}</div>
                  <div>Total Size: {networkData.totalSize ? `${Math.round(networkData.totalSize / 1024)}KB` : 'N/A'}</div>
                </div>
              </div>

              {/* Error Summary */}
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                  <FaExclamationCircle className="w-4 h-4" />
                  Errors
                </h4>
                <div className="space-y-1 text-sm">
                  <div>Total: {errorSummary.total || 0}</div>
                  <div>Recent: {errorSummary.recent?.length || 0}</div>
                  <div>Last: {errorSummary.lastError ? new Date(errorSummary.lastError.timestamp).toLocaleTimeString() : 'N/A'}</div>
                </div>
              </div>

              {/* System Info */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <FaInfoCircle className="w-4 h-4" />
                  System
                </h4>
                <div className="space-y-1 text-sm">
                  <div>Online: {navigator.onLine ? 'Yes' : 'No'}</div>
                  <div>Cache: {cache.current.size} items</div>
                  <div>Logs: {logger.current.logs.length}</div>
                </div>
              </div>
            </div>

            {/* Recent Network Requests */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recent Network Requests</h4>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 max-h-32 overflow-y-auto">
                {networkData.recent?.map((req, index) => (
                  <div key={index} className="text-xs mb-1 flex justify-between">
                    <span className={`${req.status >= 400 ? 'text-red-600' : 'text-green-600'}`}>
                      {req.method} {req.url.split('/').pop()}
                    </span>
                    <span className="text-gray-500">
                      {req.duration.toFixed(0)}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Errors */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recent Errors</h4>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 max-h-32 overflow-y-auto">
                {errorSummary.recent?.map((error, index) => (
                  <div key={index} className="text-xs mb-1 text-red-600">
                    {error.message}
                  </div>
                ))}
              </div>
            </div>

            {/* Debug Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Debug Actions</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={testNetworkConnectivity}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <FaNetworkWired className="w-3 h-3" />
                  Test Network
                </button>
                
                <button
                  onClick={clearCache}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 transition-colors flex items-center gap-1"
                >
                  <FaBroom className="w-3 h-3" />
                  Clear Cache
                </button>
                
                <button
                  onClick={exportDebugReport}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors flex items-center gap-1"
                >
                  <FaDownload className="w-3 h-3" />
                  Export Report
                </button>
                
                <button
                  onClick={() => {
                    logger.current.setLogLevel('DEBUG');
                    setLogLevel('DEBUG');
                    setDebugMode(true);
                  }}
                  className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors flex items-center gap-1"
                >
                  <FaBug className="w-3 h-3" />
                  Enable Debug
                </button>
              </div>
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

            {/* Debug Information (shown when debug mode is enabled) */}
            {debugMode && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Debug Information</label>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Performance Context</h5>
                      <div className="space-y-1">
                        <div>Memory Usage: {performanceData.memoryUsage?.used || 'N/A'} MB</div>
                        <div>Active Timers: {Object.keys(performanceData).length}</div>
                        <div>Network Requests: {networkData.total || 0}</div>
                        <div>Session Duration: {Math.round((Date.now() - logger.current.startTime) / 1000)}s</div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Error Context</h5>
                      <div className="space-y-1">
                        <div>Total Errors: {errorSummary.total || 0}</div>
                        <div>Recent Errors: {errorSummary.recent?.length || 0}</div>
                        <div>Cache Size: {cache.current.size} items</div>
                        <div>Log Count: {logger.current.logs.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTestResults; 