import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { FaPaperPlane, FaTimes, FaUser, FaEnvelope, FaClock, FaCheck, FaCheckDouble, FaEye } from 'react-icons/fa';
import getApiBase from '../services/getApiBase';

const API_BASE = getApiBase();

const AdminMessaging = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [viewingConversation, setViewingConversation] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab, pagination.page]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'all') {
        await loadAllMessages();
      } else if (activeTab === 'conversations') {
        await loadAllConversations();
      }
    } catch (error) {
      setError('Failed to load messages');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllMessages = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/messages?page=${pagination.page}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setPagination(data.pagination || { page: 1, total: 0, pages: 0 });
      } else {
        setError('Failed to load messages');
      }
    } catch (error) {
      setError('Failed to load messages');
    }
  };

  const loadAllConversations = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        setError('Failed to load conversations');
      }
    } catch (error) {
      setError('Failed to load conversations');
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/messages/conversation/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setSelectedConversation(conversationId);
        setViewingConversation(true);
        if (data.participants && data.participants.length >= 2) {
          setConversationTitle(`${data.participants[0]?.name || 'Unknown'} ↔ ${data.participants[1]?.name || 'Unknown'}`);
        } else {
          setConversationTitle('Conversation');
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleBackToConversations = () => {
    setViewingConversation(false);
    setSelectedConversation(null);
    setConversationTitle('');
    setMessages([]);
    loadAllConversations();
  };

  const deleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/admin/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        loadData();
        // Trigger unread count refresh in parent component
        window.dispatchEvent(new CustomEvent('refreshUnreadCount'));
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!confirm('Are you sure you want to mark all messages as read?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/admin/messages/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        loadData();
        // Trigger unread count refresh in parent component
        window.dispatchEvent(new CustomEvent('refreshUnreadCount'));
      }
    } catch (error) {
      console.error('Error marking all messages as read:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUnreadCount = (conversation) => {
    return conversation.unreadCount || 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Message Management</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage all user messages and conversations.</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              All Messages
            </button>
            <button
              onClick={() => setActiveTab('conversations')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'conversations'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Conversations
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-2">
            {activeTab === 'all' && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Mark All as Read
              </button>
            )}
          </div>
          {viewingConversation && (
            <button
              onClick={handleBackToConversations}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Conversations
            </button>
          )}
        </div>

        {/* Content */}
        {viewingConversation ? (
          // Conversation View
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{conversationTitle}</h2>
            </div>
            <div className="p-6">
              {messages.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No messages in this conversation</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`p-4 rounded-lg border ${
                        message.read
                          ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-600'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {message.sender?.name || message.sender?.email || 'Unknown'}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 mx-2">→</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {message.recipient?.name || message.recipient?.email || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(message.createdAt)}
                          </span>
                          {!message.read && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                              Unread
                            </span>
                          )}
                        </div>
                      </div>
                      {message.subject && (
                        <div className="mb-2">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Subject:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{message.subject}</span>
                        </div>
                      )}
                      <div className="text-gray-900 dark:text-white">{message.content}</div>
                      <div className="mt-3 flex space-x-2">
                        {!message.read && (
                          <button
                            onClick={() => markMessageAsRead(message._id)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Mark as Read
                          </button>
                        )}
                        <button
                          onClick={() => deleteMessage(message._id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'conversations' ? (
          // Conversations List
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              {conversations.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No conversations found</p>
              ) : (
                <div className="space-y-4">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.conversationId}
                      onClick={() => loadConversation(conversation.conversationId)}
                      className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {conversation.sender?.name || conversation.sender?.email || 'Unknown'}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">↔</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {conversation.recipient?.name || conversation.recipient?.email || 'Unknown'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {conversation.lastMessage?.content?.substring(0, 100)}...
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>{conversation.messageCount} messages</span>
                            <span>{formatDate(conversation.lastMessage?.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {getUnreadCount(conversation) > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                              {getUnreadCount(conversation)} unread
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // All Messages List
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              {messages.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No messages found</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`p-4 rounded-lg border ${
                        message.read
                          ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-600'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {message.sender?.name || message.sender?.email || 'Unknown'}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 mx-2">→</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {message.recipient?.name || message.recipient?.email || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(message.createdAt)}
                          </span>
                          {!message.read && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                              Unread
                            </span>
                          )}
                        </div>
                      </div>
                      {message.subject && (
                        <div className="mb-2">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Subject:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{message.subject}</span>
                        </div>
                      )}
                      <div className="text-gray-900 dark:text-white">{message.content}</div>
                      <div className="mt-3 flex space-x-2">
                        {!message.read && (
                          <button
                            onClick={() => markMessageAsRead(message._id)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Mark as Read
                          </button>
                        )}
                        <button
                          onClick={() => deleteMessage(message._id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {activeTab === 'all' && pagination.pages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPagination({ ...pagination, page })}
                  className={`px-3 py-2 rounded ${
                    page === pagination.page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessaging; 