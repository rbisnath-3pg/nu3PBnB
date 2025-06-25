import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import WYSIWYGEditor from './WYSIWYGEditor';
import NotificationModal from './NotificationModal';
import { FaEdit, FaSave, FaTimes, FaHistory, FaUndo, FaEye, FaEyeSlash } from 'react-icons/fa';

const API_BASE = import.meta.env.PROD 
  ? 'https://nu3pbnb-api.onrender.com/api'
  : '/api';

const ContentManager = () => {
  const { t, i18n } = useTranslation();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'info' });
  const [filters, setFilters] = useState({
    section: '',
    language: (i18n.language || 'en').split('-')[0],
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const sections = [
    { value: 'hero', label: 'Hero Section' },
    { value: 'about', label: 'About Section' },
    { value: 'footer', label: 'Footer' },
    { value: 'legal', label: 'Legal Pages' },
    { value: 'help', label: 'Help & Support' },
    { value: 'homepage', label: 'Homepage' },
    { value: 'general', label: 'General' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'es', label: 'Spanish' }
  ];

  const contentTypes = [
    { value: 'html', label: 'HTML' },
    { value: 'text', label: 'Plain Text' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'json', label: 'JSON' }
  ];

  useEffect(() => {
    fetchContent();
  }, [filters, pagination.page]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await fetch(`${API_BASE}/content?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = editingContent._id ? 'PUT' : 'POST';
      const url = editingContent._id 
        ? `${API_BASE}/content/${editingContent._id}`
        : `${API_BASE}/content`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          key: editingContent.key,
          title: editingContent.title,
          content: editingContent.content,
          type: editingContent.type,
          section: editingContent.section,
          language: editingContent.language,
          isActive: editingContent.isActive,
          comment: editingContent.comment || 'Content updated'
        })
      });

      if (response.ok) {
        setShowEditor(false);
        setEditingContent(null);
        fetchContent();
        showNotification('Content Saved', 'Content saved successfully!');
      } else {
        const error = await response.json();
        showNotification('Error', error.message, 'error');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      showNotification('Error', 'Failed to save content', 'error');
    }
  };

  const handleDelete = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/content/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchContent();
        showNotification('Content Deleted', 'Content deleted successfully!');
      } else {
        const error = await response.json();
        showNotification('Error', error.message, 'error');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      showNotification('Error', 'Failed to delete content', 'error');
    }
  };

  const handleViewHistory = async (contentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/content/${contentId}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
        setShowHistory(true);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      showNotification('Error', 'Failed to fetch content history', 'error');
    }
  };

  const handleRestore = async (contentId, version) => {
    if (!window.confirm('Are you sure you want to restore this version?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/content/${contentId}/restore/${version}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchContent();
        setShowHistory(false);
        showNotification('Content Restored', 'Content restored successfully!');
      } else {
        const error = await response.json();
        showNotification('Error', error.message, 'error');
      }
    } catch (error) {
      console.error('Error restoring content:', error);
      showNotification('Error', 'Failed to restore content', 'error');
    }
  };

  const openEditor = (content = null) => {
    if (content) {
      setEditingContent({ ...content });
    } else {
      setEditingContent({
        key: '',
        title: '',
        content: '',
        type: 'html',
        section: 'general',
        language: (i18n.language || 'en').split('-')[0],
        isActive: true,
        comment: ''
      });
    }
    setShowEditor(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Helper function to show notifications
  const showNotification = (title, message, type = 'info') => {
    setNotification({ show: true, title, message, type });
  };

  const closeNotification = () => {
    setNotification({ show: false, title: '', message: '', type: 'info' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('admin.content.title', 'Content Management')}</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage platform content, articles, and static pages.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Content Management
            </h2>
            <button
              onClick={() => openEditor()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add New Content
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Section
                </label>
                <select
                  value={filters.section}
                  onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Sections</option>
                  {sections.map(section => (
                    <option key={section.value} value={section.value}>
                      {section.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Language
                </label>
                <select
                  value={filters.language}
                  onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search content..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setPagination({ ...pagination, page: 1 })}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Content List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-visible mt-4">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {content.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">{item.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 truncate max-w-xs">{sections.find(s => s.value === item.section)?.label || item.section}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 truncate max-w-xs">{languages.find(l => l.value === item.language)?.label || item.language}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(item.updatedAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 text-right min-w-[240px]">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditor(item)}
                          className="w-24 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleViewHistory(item._id)}
                          className="w-24 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          History
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="w-24 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setPagination({ ...pagination, page })}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pagination.page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Editor Modal */}
          {showEditor && editingContent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {editingContent._id ? 'Edit Content' : 'Add New Content'}
                    </h3>
                    <button
                      onClick={() => setShowEditor(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editingContent.title}
                          onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Key
                        </label>
                        <input
                          type="text"
                          value={editingContent.key}
                          onChange={(e) => setEditingContent({ ...editingContent, key: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Section
                        </label>
                        <select
                          value={editingContent.section}
                          onChange={(e) => setEditingContent({ ...editingContent, section: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          {sections.map(section => (
                            <option key={section.value} value={section.value}>
                              {section.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Language
                        </label>
                        <select
                          value={editingContent.language}
                          onChange={(e) => setEditingContent({ ...editingContent, language: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          {languages.map(lang => (
                            <option key={lang.value} value={lang.value}>
                              {lang.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Type
                        </label>
                        <select
                          value={editingContent.type}
                          onChange={(e) => setEditingContent({ ...editingContent, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          {contentTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <select
                          value={editingContent.isActive}
                          onChange={(e) => setEditingContent({ ...editingContent, isActive: e.target.value === 'true' })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value={true}>Active</option>
                          <option value={false}>Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Content
                      </label>
                      <WYSIWYGEditor
                        value={editingContent.content}
                        onChange={(content) => setEditingContent({ ...editingContent, content })}
                        height="400px"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Change Comment (Optional)
                      </label>
                      <input
                        type="text"
                        value={editingContent.comment || ''}
                        onChange={(e) => setEditingContent({ ...editingContent, comment: e.target.value })}
                        placeholder="Describe what you changed..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowEditor(false)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Modal */}
          {showHistory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Content History
                    </h3>
                    <button
                      onClick={() => setShowHistory(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4">
                    {history.map((entry, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Version {entry.version}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-300">
                              {entry.modifiedBy?.name || 'Unknown'} - {formatDate(entry.modifiedAt)}
                            </p>
                            {entry.comment && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {entry.comment}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRestore(selectedContent?._id, entry.version)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Restore
                          </button>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm">
                          <div dangerouslySetInnerHTML={{ __html: entry.content }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Notification Modal */}
      {notification.show && (
        <NotificationModal
          isOpen={notification.show}
          onClose={closeNotification}
          title={notification.title}
          message={notification.message}
          type={notification.type}
        />
      )}
    </div>
  );
};

export default ContentManager; 