import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AnalyticsDashboard from './AnalyticsDashboard';
import { useTranslation } from 'react-i18next';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaUpload, FaHome } from 'react-icons/fa';
import getApiBase from '../services/getApiBase';

const API_BASE = getApiBase();

const UserProfile = () => {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ profilePicture: '', bio: '', location: '' });
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetch(`${API_BASE}/api/users/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setForm({
          profilePicture: data.profilePicture || '',
          bio: data.bio || '',
          location: data.location || ''
        });
      })
      .catch(() => setError('Failed to load profile'));
    fetch(`${API_BASE}/api/listings?host=${user._id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setListings(data.data || data))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [user]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('profilePicture', selectedFile);

      const response = await fetch(`${API_BASE}/api/users/me/profile-picture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      // Refresh user data to get updated profile
      const userResponse = await fetch(`${API_BASE}/api/users/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const updatedUser = await userResponse.json();
      
      login(updatedUser, localStorage.getItem('token'));
      setProfile(updatedUser);
      setSelectedFile(null);
      
      // Clear the file input
      const fileInput = document.getElementById('profilePictureFile');
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async e => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updated = await res.json();
      setProfile(updated);
      login(updated, localStorage.getItem('token'));
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const getProfilePictureUrl = () => {
    if (profile?.profilePictureData) {
      return `${API_BASE}/api/users/me/profile-picture?t=${Date.now()}`; // Add timestamp to prevent caching
    }
    if (profile?.profilePicture) {
      return profile.profilePicture;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&size=200`;
  };

  if (!user) return <div className="p-4 text-center">Sign in to view your profile.</div>;
  if (loading) return <div className="p-4 text-center">Loading profile...</div>;
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <img
          src={getProfilePictureUrl()}
          alt="Profile"
          className="w-20 h-20 rounded-full border-2 border-blue-500 object-cover shadow"
          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&size=200`; }}
        />
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{profile?.name}</h2>
          <div className="text-gray-600 dark:text-gray-300 mb-1">{profile?.email}</div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">{profile?.role}</div>
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700"
          onClick={() => setEditMode(e => !e)}
        >
          {editMode ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>
      
      {editMode && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          {/* Profile Picture Upload */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">Profile Picture</label>
            <div className="space-y-3">
              <input
                id="profilePictureFile"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
              {selectedFile && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleUploadProfilePicture}
                    disabled={uploading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload Picture'}
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF. Max size: 5MB.</p>
            </div>
          </div>

          {/* External URL (fallback) */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Or use external image URL</label>
            <input
              name="profilePicture"
              value={form.profilePicture}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="Paste an image URL (jpg/png)"
            />
            <p className="text-xs text-gray-500 mt-1">Use this if you prefer to link to an external image.</p>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white min-h-[60px]"
              placeholder="Tell us about yourself"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="City, Country"
            />
          </div>
          <button type="button" onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700">Save Changes</button>
        </div>
      )}
      
      {!editMode && (
        <div className="space-y-4">
          {profile?.bio && (
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Bio</h3>
              <p className="text-gray-600 dark:text-gray-300">{profile.bio}</p>
            </div>
          )}
          {profile?.location && (
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Location</h3>
              <p className="text-gray-600 dark:text-gray-300">{profile.location}</p>
            </div>
          )}
        </div>
      )}
      
      {user?.role === 'host' && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">My Listings</h3>
          {listings.length === 0 ? (
            <div className="text-gray-500 text-center py-4">You have no listings yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 max-h-60 overflow-y-auto">
              {listings.map(listing => (
                <div key={listing._id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{listing.title}</h4>
                  <div className="text-gray-600 dark:text-gray-300 text-sm mb-1">{listing.city}, {listing.country}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">Type: {listing.type} | Price: ${listing.price}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile; 