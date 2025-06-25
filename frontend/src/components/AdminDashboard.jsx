import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import AnalyticsDashboard from './AnalyticsDashboard';
import ContentManager from './ContentManager';
import PaymentDashboard from './PaymentDashboard';
import AdminMessaging from './AdminMessaging';
import UserManagement from './UserManagement';
import AdminTestResults from './AdminTestResults';
import { FaChartBar, FaUsers, FaFileAlt, FaCreditCard, FaEnvelope, FaVial } from 'react-icons/fa';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Cache and rate limiting for unread count
  const lastFetchTime = useRef(0);
  const CACHE_DURATION = 10000; // 10 seconds cache

  const fetchUnreadCount = async () => {
    // Don't fetch if auth is still loading or user is not authenticated
    if (authLoading || !user) {
      return;
    }
    
    const now = Date.now();
    
    // Rate limiting - don't fetch too frequently
    if (now - lastFetchTime.current < 2000) {
      return;
    }
    
    lastFetchTime.current = now;
    
    try {
      const response = await fetch('/api/admin/messages/unread-count', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    // Only start fetching when auth is ready and user is authenticated
    if (!authLoading && user) {
      fetchUnreadCount();
      // Refresh unread count every 60 seconds instead of 30
      const interval = setInterval(fetchUnreadCount, 60000);
      
      // Listen for custom event to refresh unread count
      const handleRefreshUnreadCount = () => {
        fetchUnreadCount();
      };
      window.addEventListener('refreshUnreadCount', handleRefreshUnreadCount);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('refreshUnreadCount', handleRefreshUnreadCount);
      };
    }
  }, [authLoading, user]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    // Refresh unread count when messages tab is clicked
    if (tabId === 'messages') {
      fetchUnreadCount();
    }
  };

  const tabs = [
    { id: 'analytics', label: t('admin.analytics.title'), component: <AnalyticsDashboard userRole="admin" /> },
    { id: 'users', label: t('admin.users.title', 'User Management'), component: <UserManagement /> },
    { id: 'content', label: t('admin.content.title'), component: <ContentManager /> },
    { id: 'payments', label: t('admin.payments.title'), component: <PaymentDashboard userRole="admin" /> },
    { id: 'messages', label: t('admin.messages.title'), component: <AdminMessaging /> },
    { id: 'tests', label: 'Test Results', component: <AdminTestResults /> }
  ];

  const tabIcons = {
    analytics: <FaChartBar className="w-8 h-8 mb-1" />,
    users: <FaUsers className="w-8 h-8 mb-1" />,
    content: <FaFileAlt className="w-8 h-8 mb-1" />,
    payments: <FaCreditCard className="w-8 h-8 mb-1" />,
    messages: <FaEnvelope className="w-8 h-8 mb-1" />,
    tests: <FaVial className="w-8 h-8 mb-1" />
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('admin.dashboard.title')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('admin.dashboard.overview')}
          </p>
        </div>

        {/* Large Icon Buttons Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10 w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center px-8 py-8 rounded-xl shadow-lg text-xl font-semibold transition-all duration-150 border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 relative
                ${activeTab === tab.id
                  ? 'bg-blue-600 text-white border-blue-600 scale-105 shadow-xl'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 hover:scale-105'}
              `}
            >
              <div className="text-4xl mb-2">
                {tabIcons[tab.id]}
              </div>
              <span className="text-lg font-bold text-center">{tab.label}</span>
              
              {/* Unread badge for messages */}
              {tab.id === 'messages' && unreadCount > 0 && (
                <div className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px] ${activeTab === 'messages' ? 'bg-red-400' : ''}`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 