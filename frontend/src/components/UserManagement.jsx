import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { faker } from '@faker-js/faker';
import NotificationModal from './NotificationModal';
import getApiBase from '../services/getApiBase';

const API_BASE = getApiBase();

const UserManagement = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState([]);
  const [modalType, setModalType] = useState(''); // 'listings' or 'bookings'
  const [modalLoading, setModalLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'guest',
    language: 'en'
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'info' });

  // Helper function to show notifications
  const showNotification = (title, message, type = 'info') => {
    setNotification({ show: true, title, message, type });
  };

  const closeNotification = () => {
    setNotification({ show: false, title: '', message: '', type: 'info' });
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [refresh]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE}/api/users`;
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setRefresh(r => !r);
    } catch (err) {
      showNotification('Error', err.message, 'error');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      if (!res.ok) throw new Error('Failed to update user role');
      setRefresh(r => !r);
    } catch (err) {
      showNotification('Error', err.message, 'error');
    }
  };

  const handleViewListings = async (user) => {
    setModalOpen(true);
    setModalTitle(`Listings for ${user.name}`);
    setModalType('listings');
    setModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/listings?host=${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch listings');
      const data = await res.json();
      setModalData(data.data || data); // support both {data:[]} and []
    } catch (err) {
      setModalData([]);
      showNotification('Error', err.message, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewBookings = async (user) => {
    setModalOpen(true);
    setModalTitle(`Bookings for ${user.name}`);
    setModalType('bookings');
    setModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/bookings?guest=${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setModalData(data.data || data); // support both {data:[]} and []
    } catch (err) {
      setModalData([]);
      showNotification('Error', err.message, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const openCreateModal = () => {
    setCreateForm({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: 'test123',
      role: 'guest',
      language: 'en'
    });
    setCreateError('');
    setCreateModalOpen(true);
  };

  const handleCreateChange = (e) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createForm)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to create user');
      }
      setCreateModalOpen(false);
      setRefresh(r => !r);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('admin.users.title', 'User Management')}</h1>
          <p className="text-gray-600 dark:text-gray-400">View, create, and manage all users on the platform.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-wrap gap-4 mb-4 items-center justify-between">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="host">Host</option>
                <option value="guest">Guest</option>
              </select>
            </div>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
            >
              + Create User
            </button>
          </div>
          {loading ? (
            <div>Loading users...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-2 whitespace-nowrap text-gray-900 dark:text-white">{user.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-900 dark:text-white">{user.email}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user._id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          disabled={user.role === 'admin' && user.email === 'admin@nu3pbnb.com'}
                        >
                          <option value="admin">Admin</option>
                          <option value="host">Host</option>
                          <option value="guest">Guest</option>
                        </select>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex justify-end gap-2 min-w-[240px]">
                          {user.role === 'host' && (
                            <button
                              onClick={() => handleViewListings(user)}
                              className="w-32 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                              View Listings
                            </button>
                          )}
                          {user.role === 'guest' && (
                            <button
                              onClick={() => handleViewBookings(user)}
                              className="w-32 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                            >
                              View Bookings
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="w-32 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
                            disabled={user.role === 'admin' && user.email === 'admin@nu3pbnb.com'}
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
          )}

          {/* Modal for Listings/Bookings */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
                <button
                  onClick={() => setModalOpen(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                >
                  ✕
                </button>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{modalTitle}</h3>
                {modalLoading ? (
                  <div>Loading...</div>
                ) : modalType === 'listings' ? (
                  <div>
                    {modalData.length === 0 ? (
                      <div>No listings found for this host.</div>
                    ) : (
                      <ul className="space-y-2">
                        {modalData.map(listing => (
                          <li key={listing._id} className="border-b pb-2">
                            <div className="font-semibold">{listing.title}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">{listing.location}</div>
                            <div className="text-sm">Price: ${listing.price}</div>
                            <div className="text-xs text-gray-400">ID: {listing._id}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div>
                    {modalData.length === 0 ? (
                      <div>No bookings found for this guest.</div>
                    ) : (
                      <ul className="space-y-2">
                        {modalData.map(booking => (
                          <li key={booking._id} className="border-b pb-2">
                            <div className="font-semibold">Listing: {booking.listing?.title || booking.listing}</div>
                            <div className="text-sm">Check-in: {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : ''}</div>
                            <div className="text-sm">Check-out: {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : ''}</div>
                            <div className="text-sm">Guests: {booking.guests}</div>
                            <div className="text-xs text-gray-400">ID: {booking._id}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Create User Modal */}
          {createModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 relative">
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                >
                  ✕
                </button>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create New User</h3>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={createForm.name}
                      onChange={handleCreateChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={createForm.email}
                      onChange={handleCreateChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Password</label>
                    <input
                      type="text"
                      name="password"
                      value={createForm.password}
                      onChange={handleCreateChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Role</label>
                    <select
                      name="role"
                      value={createForm.role}
                      onChange={handleCreateChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="guest">Guest</option>
                      <option value="host">Host</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Language</label>
                    <select
                      name="language"
                      value={createForm.language}
                      onChange={handleCreateChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                  {createError && <div className="text-red-600 text-sm">{createError}</div>}
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold disabled:opacity-50"
                    disabled={createLoading}
                  >
                    {createLoading ? 'Creating...' : 'Create User'}
                  </button>
                </form>
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

export default UserManagement; 