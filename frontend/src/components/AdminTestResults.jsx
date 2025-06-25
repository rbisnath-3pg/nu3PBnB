import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaPlay, FaCheck, FaTimes, FaClock, FaEye, FaTimesCircle, FaTrash, FaBroom } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import getApiBase from '../services/getApiBase';

const API_BASE = getApiBase();

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
  
  // Cache for API responses
  const cache = useRef(new Map());
  const lastFetchTime = useRef(0);
  const CACHE_DURATION = 5000; // 5 seconds cache
  const progressInterval = useRef(null);

  // Helper to get auth token
  const getToken = () => localStorage.getItem('token');

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
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/test-results`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to clear test history');
      setTestRuns([]);
      setSelectedRun(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setShowClearConfirm(false);
    }
  };

  // Delete specific test run
  const handleDeleteRun = async (id) => {
    if (!confirm('Are you sure you want to delete this test run?')) {
      return;
    }
    
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/test-results/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to delete test run');
      setTestRuns(runs => runs.filter(r => r.id !== id));
      if (selectedRun && selectedRun.id === id) {
        setSelectedRun(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Debounced fetch function
  const debouncedFetch = useCallback((url, options = {}) => {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    const now = Date.now();
    
    // Check cache first
    if (cache.current.has(cacheKey)) {
      const cached = cache.current.get(cacheKey);
      if (now - cached.timestamp < CACHE_DURATION) {
        return Promise.resolve(cached.data);
      }
    }
    
    // Rate limiting - don't fetch too frequently
    if (now - lastFetchTime.current < 1000) {
      return Promise.resolve(null);
    }
    
    lastFetchTime.current = now;
    
    return fetch(url, options).then(async (res) => {
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      
      // Cache the response
      cache.current.set(cacheKey, {
        data,
        timestamp: now
      });
      
      return data;
    });
  }, []);

  // Fetch all test runs
  const fetchTestRuns = async () => {
    // Don't fetch if auth is still loading or user is not authenticated
    if (authLoading || !user) {
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await debouncedFetch(`${API_BASE}/test-results`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (data) {
        setTestRuns(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch details for a specific run
  const fetchRunDetails = async (id) => {
    // Don't fetch if auth is still loading or user is not authenticated
    if (authLoading || !user) {
      return;
    }
    
    setError(null);
    try {
      const data = await debouncedFetch(`${API_BASE}/test-results/${id}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (data) {
        setSelectedRun(data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Start progress simulation
  const startProgressSimulation = () => {
    setProgress(0);
    setCurrentTest('Initializing test environment...');
    
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
          return 100;
        }
        
        // Update current test phase
        const phaseProgress = (newProgress / 100) * testPhases.length;
        const currentPhase = Math.floor(phaseProgress);
        if (currentPhase < testPhases.length && currentPhase !== phaseIndex) {
          phaseIndex = currentPhase;
          setCurrentTest(testPhases[currentPhase]);
        }
        
        return newProgress;
      });
    }, 1000);
  };

  // Stop progress simulation
  const stopProgressSimulation = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    setProgress(0);
    setCurrentTest('');
  };

  // Trigger a new test run
  const handleRunTests = async () => {
    // Don't run if auth is still loading or user is not authenticated
    if (authLoading || !user) {
      return;
    }
    
    setRunning(true);
    setError(null);
    startProgressSimulation();
    
    try {
      const res = await fetch(`${API_BASE}/run-tests`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to start test run');
      // Add the new running test to the top
      const newRun = await res.json();
      setTestRuns(runs => [newRun, ...runs]);
      
      // Poll for completion with reduced frequency
      let done = false;
      let pollCount = 0;
      while (!done && pollCount < 30) { // up to ~30s
        await new Promise(r => setTimeout(r, 2000)); // Increased from 1s to 2s
        const pollData = await debouncedFetch(`${API_BASE}/test-results/${newRun.id}`, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (pollData && pollData.status !== 'running') {
          setTestRuns(runs => runs.map(r => r.id === pollData.id ? pollData : r));
          done = true;
        }
        pollCount++;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
      stopProgressSimulation();
    }
  };

  useEffect(() => {
    // Only fetch when auth is ready and user is authenticated
    if (!authLoading && user) {
      fetchTestRuns();
    }
  }, [authLoading, user]);

  // Cleanup progress interval on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Test Results</h1>
            <p className="text-gray-600 dark:text-gray-400">View and manage automated test runs for the platform.</p>
          </div>
          <div className="flex items-center gap-3">
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