import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Messaging = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  
  // Compose form state
  const [composeForm, setComposeForm] = useState({
    recipient: '',
    subject: '',
    content: ''
  });
  
  // Reply form state
  const [replyForm, setReplyForm] = useState({
    content: ''
  });
  
  // Forward form state
  const [forwardForm, setForwardForm] = useState({
    recipient: '',
    content: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'inbox') {
        await loadInbox();
      } else if (activeTab === 'sent') {
        await loadSentMessages();
      } else if (activeTab === 'conversations') {
        await loadConversations();
      }
      await loadAvailableUsers();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInbox = async () => {
    try {
      const response = await fetch(`/api/messages/inbox?page=${pagination.page}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.data) {
        setMessages(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error loading inbox:', error);
    }
  };

  const loadSentMessages = async () => {
    try {
      const response = await fetch(`/api/messages/sent?page=${pagination.page}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.data) {
        setMessages(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error loading sent messages:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.data) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const response = await fetch('/api/messages/users/available', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.data) {
        setAvailableUsers(data.data);
      }
    } catch (error) {
      console.error('Error loading available users:', error);
    }
  };

  const loadConversation = async (userId) => {
    try {
      const response = await fetch(`/api/messages/with/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.data) {
        setMessages(data.data);
        setSelectedConversation(userId);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const sendMessage = async (formData, messageType = 'regular', parentMessage = null) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          messageType,
          parentMessage
        })
      });
      
      if (response.ok) {
        // Reset forms and reload data
        setComposeForm({ recipient: '', subject: '', content: '' });
        setReplyForm({ content: '' });
        setForwardForm({ recipient: '', content: '' });
        setComposeOpen(false);
        setReplyOpen(false);
        setForwardOpen(false);
        loadData();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
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

  const markAsRead = async (messageId) => {
    try {
      await fetch(`/api/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Trigger unread count refresh in parent component
      window.dispatchEvent(new CustomEvent('refreshUnreadCount'));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleComposeSubmit = (e) => {
    e.preventDefault();
    sendMessage(composeForm);
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    sendMessage(
      { content: replyForm.content },
      'reply',
      selectedMessage._id
    );
  };

  const handleForwardSubmit = (e) => {
    e.preventDefault();
    sendMessage(
      { 
        recipient: forwardForm.recipient,
        content: forwardForm.content,
        subject: `Fwd: ${selectedMessage.subject || 'Message'}`
      },
      'forward',
      selectedMessage._id
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getUnreadCount = () => {
    return messages.filter(msg => !msg.read && msg.recipient._id === user.id).length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Messages</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setComposeOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Compose
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('inbox')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'inbox'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Inbox {getUnreadCount() > 0 && `(${getUnreadCount()})`}
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'sent'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Sent
              </button>
              <button
                onClick={() => setActiveTab('conversations')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'conversations'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Conversations
              </button>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : activeTab === 'conversations' ? (
                // Conversations list
                <div>
                  {conversations.map((conv) => (
                    <div
                      key={conv._id}
                      onClick={() => loadConversation(conv._id)}
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedConversation === conv._id ? 'bg-blue-50 dark:bg-blue-900' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {conv.user?.name || 'Unknown User'}
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {conv.lastMessage.content}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(conv.lastMessage.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Messages list
                <div>
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (!message.read && message.recipient._id === user.id) {
                          markAsRead(message._id);
                        }
                      }}
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedMessage?._id === message._id ? 'bg-blue-50 dark:bg-blue-900' : ''
                      } ${!message.read && message.recipient._id === user.id ? 'bg-yellow-50 dark:bg-yellow-900' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {activeTab === 'inbox' ? message.sender.name : message.recipient.name}
                        </div>
                        <div className="flex items-center space-x-2">
                          {message.messageType !== 'regular' && (
                            <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded">
                              {message.messageType}
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMessage(message._id);
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {message.subject && <span className="font-medium">{message.subject}: </span>}
                        {message.content}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(message.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message Content */}
          <div className="flex-1 flex flex-col">
            {selectedMessage ? (
              <>
                {/* Message Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedMessage.subject || 'No Subject'}
                      </h3>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        From: {selectedMessage.sender.name} • To: {selectedMessage.recipient.name}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setReplyOpen(true)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => setForwardOpen(true)}
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Forward
                      </button>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="prose dark:prose-invert max-w-none">
                    {selectedMessage.parentMessage && (
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded border-l-4 border-gray-300">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Original message:</strong> {selectedMessage.parentMessage.content}
                        </div>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{selectedMessage.content}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                Select a message to view
              </div>
            )}
          </div>
        </div>

        {/* Compose Modal */}
        {composeOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Compose Message</h3>
              <form onSubmit={handleComposeSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    To:
                  </label>
                  <select
                    value={composeForm.recipient}
                    onChange={(e) => setComposeForm({ ...composeForm, recipient: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select recipient</option>
                    {availableUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject:
                  </label>
                  <input
                    type="text"
                    value={composeForm.subject}
                    onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message:
                  </label>
                  <textarea
                    value={composeForm.content}
                    onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg h-32 resize-none dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setComposeOpen(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reply Modal */}
        {replyOpen && selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Reply to Message</h3>
              <form onSubmit={handleReplySubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    To: {selectedMessage.sender.name}
                  </label>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message:
                  </label>
                  <textarea
                    value={replyForm.content}
                    onChange={(e) => setReplyForm({ content: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg h-32 resize-none dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setReplyOpen(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Send Reply
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Forward Modal */}
        {forwardOpen && selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Forward Message</h3>
              <form onSubmit={handleForwardSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    To:
                  </label>
                  <select
                    value={forwardForm.recipient}
                    onChange={(e) => setForwardForm({ ...forwardForm, recipient: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select recipient</option>
                    {availableUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Message (optional):
                  </label>
                  <textarea
                    value={forwardForm.content}
                    onChange={(e) => setForwardForm({ ...forwardForm, content: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg h-32 resize-none dark:bg-gray-700 dark:text-white"
                    placeholder="Add a note to the forwarded message..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setForwardOpen(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Forward
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging; 