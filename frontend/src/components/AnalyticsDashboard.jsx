import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import getApiBase from '../services/getApiBase';

const API_BASE = getApiBase();

const AnalyticsDashboard = ({ hostId, profileId, userRole }) => {
  const { user, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d
  const [selectedMetric, setSelectedMetric] = useState('overview');
  
  // Cache for analytics data
  const cache = useRef(new Map());
  const lastFetchTime = useRef(0);
  const CACHE_DURATION = 30000; // 30 seconds cache

  // Debounced fetch function
  const debouncedFetch = useCallback((url) => {
    const cacheKey = url;
    const now = Date.now();
    
    // Check cache first
    if (cache.current.has(cacheKey)) {
      const cached = cache.current.get(cacheKey);
      if (now - cached.timestamp < CACHE_DURATION) {
        return Promise.resolve(cached.data);
      }
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then(async (res) => {
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error('Failed to fetch analytics');
      }
      const data = await res.json();
      
      // Cache the response
      cache.current.set(cacheKey, {
        data,
        timestamp: now
      });
      
      return data;
    });
  }, []);

  const fetchAnalytics = async () => {
    // Don't fetch if auth is still loading or user is not authenticated
    if (authLoading || !user) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Clear cache when timeRange changes to ensure fresh data
      cache.current.clear();
      
      // Ensure we have authentication
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      let url = `${API_BASE}/api/analytics?timeRange=${timeRange}`;
      if (profileId) {
        url += `&profileId=${profileId}`;
      } else if (hostId) {
        url += `&hostId=${hostId}`;
      }
      
      const data = await debouncedFetch(url);
      if (data) {
        setAnalytics(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch when auth is ready and user is authenticated
    if (!authLoading && user) {
      fetchAnalytics();
    }
  }, [timeRange, hostId, profileId, authLoading, user]);

  // Clear cache when timeRange changes
  useEffect(() => {
    cache.current.clear();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600 dark:text-gray-400">No analytics data available</p>
        </div>
      </div>
    );
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatPercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive user activity and behavior insights
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex space-x-2">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Selector */}
        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'user-activity', label: 'User Activity' },
              { key: 'page-views', label: 'Page Views' },
              { key: 'user-behavior', label: 'User Behavior' },
              { key: 'engagement', label: 'Engagement' }
            ].map((metric) => (
              <button
                key={metric.key}
                onClick={() => setSelectedMetric(metric.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedMetric === metric.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {metric.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Metrics */}
        {selectedMetric === 'overview' && (
          <>
            <div className={`grid grid-cols-1 md:grid-cols-${user?.role === 'admin' ? '5' : '4'} gap-6 mb-8`}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {user?.role === 'admin' ? 'Total Users' : 'My Properties'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(analytics.listingCount)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(analytics.bookingCount)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${formatNumber(analytics.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Sessions (24h)</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(analytics.uniqueSessions24h || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              {user?.role === 'admin' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">App Profitability</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${formatNumber(analytics.appProfitability)}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Revenue and Booking Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Revenue</span>
                    <span className="font-semibold text-gray-900 dark:text-white">${formatNumber(analytics.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Bookings</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(analytics.bookingCount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Average Booking Value</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${analytics.bookingCount > 0 ? formatNumber(analytics.totalRevenue / analytics.bookingCount) : '0'}
                    </span>
                  </div>
                  {user?.role === 'admin' && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">App Profitability (2%)</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">${formatNumber(analytics.appProfitability)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Status Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Status</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.bookingStatusDistribution || {}).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">{status}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Recent Bookings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Bookings</h3>
              {analytics.topRecentBookings && analytics.topRecentBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Property</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Guest</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {analytics.topRecentBookings.slice(0, 5).map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{booking.listing}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{booking.guest}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${booking.totalPrice || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent bookings</p>
              )}
            </div>

            {/* Property Visit Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Most Visited Properties */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Visited Properties</h3>
                {analytics.mostVisitedProperties && analytics.mostVisitedProperties.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.mostVisitedProperties.slice(0, 5).map((property, index) => (
                      <div key={property._id} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">{index + 1}.</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{property.listing?.title || 'Unknown Property'}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{property.visits} visits</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No property visit data</p>
                )}
              </div>

              {/* Property Visit Trends */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Property Visit Trends</h3>
                {analytics.propertyVisitTrends && analytics.propertyVisitTrends.length > 0 ? (
                  <div className="space-y-2">
                    {analytics.propertyVisitTrends.map((trend) => (
                      <div key={trend.date} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{trend.date}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{trend.visits} visits</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No visit trend data</p>
                )}
              </div>
            </div>

            {/* Booking Trends Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Trends (Last 7 Days)</h3>
              {analytics.bookingTrends && analytics.bookingTrends.length > 0 ? (
                <div className="grid grid-cols-7 gap-2">
                  {analytics.bookingTrends.map((trend) => (
                    <div key={trend.date} className="text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="bg-blue-100 dark:bg-blue-900 rounded p-2">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{trend.bookings}</div>
                        <div className="text-xs text-blue-500 dark:text-blue-300">bookings</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No booking trend data</p>
              )}
            </div>
          </>
        )}

        {/* User Activity Details */}
        {selectedMetric === 'user-activity' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent User Activity</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Page</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {analytics.recentActivity?.map((activity, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {activity.userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          activity.eventType === 'page_view' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                          activity.eventType === 'click' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {activity.eventType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {activity.page}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {new Date(activity.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {activity.duration ? formatDuration(activity.duration) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* User Behavior Analysis */}
        {selectedMetric === 'user-behavior' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Engagement</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">High Engagement</span>
                    <span className="text-gray-900 dark:text-white font-medium">{analytics.userEngagement?.high}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${analytics.userEngagement?.high}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Medium Engagement</span>
                    <span className="text-gray-900 dark:text-white font-medium">{analytics.userEngagement?.medium}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${analytics.userEngagement?.medium}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Low Engagement</span>
                    <span className="text-gray-900 dark:text-white font-medium">{analytics.userEngagement?.low}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${analytics.userEngagement?.low}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Clicked Elements</h3>
              <div className="space-y-3">
                {analytics.mostClickedElements?.slice(0, 5).map((element, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{element.element}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{element.page}</p>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{element.clicks}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Engagement Metrics */}
        {selectedMetric === 'engagement' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Session Analytics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Sessions</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatNumber(analytics.sessionAnalytics?.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Avg Pages per Session</span>
                  <span className="font-medium text-gray-900 dark:text-white">{analytics.sessionAnalytics?.avgPagesPerSession?.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Returning Users</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatNumber(analytics.sessionAnalytics?.returningUsers)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">New Users</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatNumber(analytics.sessionAnalytics?.newUsers)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Time on Site</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Average Time</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatDuration(analytics.timeOnSite?.average)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Median Time</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatDuration(analytics.timeOnSite?.median)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Users &gt; 5 min</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatPercentage(analytics.timeOnSite?.usersOver5Min, analytics.userCount)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Users &gt; 10 min</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatPercentage(analytics.timeOnSite?.usersOver10Min, analytics.userCount)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 