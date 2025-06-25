import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import PaymentDashboard from './PaymentDashboard';
import AnalyticsDashboard from './AnalyticsDashboard';
import Messaging from './Messaging';
import { FaPlus, FaCheck, FaTimes, FaCalendarAlt, FaHeart } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import getApiBase from '../services/getApiBase';

const API_BASE = getApiBase();

// Helper to generate random property data
function getRandomPropertyData(hostId) {
  const propertyTypes = ['Apartment', 'House', 'Condo', 'Villa', 'Cabin', 'Loft'];
  const locations = [
    { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
    { city: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437 },
    { city: 'Chicago', country: 'USA', lat: 41.8781, lng: -87.6298 },
    { city: 'Miami', country: 'USA', lat: 25.7617, lng: -80.1918 },
    { city: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194 },
    { city: 'Seattle', country: 'USA', lat: 47.6062, lng: -122.3321 },
    { city: 'Austin', country: 'USA', lat: 30.2672, lng: -97.7431 },
    { city: 'Denver', country: 'USA', lat: 39.7392, lng: -104.9903 },
    { city: 'Boston', country: 'USA', lat: 42.3601, lng: -71.0589 },
    { city: 'Portland', country: 'USA', lat: 45.5152, lng: -122.6784 }
  ];
  const amenities = [
    'WiFi', 'Kitchen', 'Free parking', 'Air conditioning', 'Heating',
    'Washer', 'Dryer', 'TV', 'Pool', 'Gym', 'Balcony', 'Garden'
  ];
  const adjectives = ['Cozy', 'Modern', 'Luxurious', 'Charming', 'Spacious', 'Elegant', 'Stylish', 'Comfortable'];
  const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const price = Math.floor(Math.random() * 400) + 50;
  const randomAmenities = amenities.sort(() => 0.5 - Math.random()).slice(0, 5);
  const latitude = location.lat + (Math.random() - 0.5) * 0.1;
  const longitude = location.lng + (Math.random() - 0.5) * 0.1;
  // Set availability to a random 2-week period in the next 60 days
  const start = new Date();
  start.setDate(start.getDate() + Math.floor(Math.random() * 60));
  const end = new Date(start);
  end.setDate(start.getDate() + 14);
  return {
    title: `${adjective} ${propertyType} in ${location.city}`,
    description: `Beautiful ${propertyType.toLowerCase()} located in the heart of ${location.city}. This ${adjective.toLowerCase()} property offers all the amenities you need for a comfortable stay. Perfect for both business and leisure travelers.`,
    location: `${location.city}, ${location.country}`,
    city: location.city,
    country: location.country,
    price,
    type: propertyType,
    photos: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&h=600&fit=crop'
    ],
    latitude,
    longitude,
    amenities: randomAmenities,
    maxGuests: Math.floor(Math.random() * 6) + 2,
    bedrooms: Math.floor(Math.random() * 4) + 1,
    bathrooms: Math.floor(Math.random() * 3) + 1,
    available: true,
    availability: [{ start: start.toISOString(), end: end.toISOString() }],
    language: 'en',
    host: hostId
  };
}

// Helper function to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id) {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
}

const HostDashboard = ({ fetchListings }) => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');
  const [lastCreatedId, setLastCreatedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const listingsPerPage = 10;
  const [favoritesCounts, setFavoritesCounts] = useState({});

  // Bookings
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);
  const [bookingFilter, setBookingFilter] = useState('all');

  // Messaging
  const [showMessaging, setShowMessaging] = useState(false);

  // Section visibility state for host dashboard customization
  const [sectionVisibility, setSectionVisibility] = useState({
    properties: true,
    bookings: true,
    payments: true,
    analytics: true,
    messaging: true
  });

  // Redirect to homepage if not logged in or not a host
  useEffect(() => {
    if (!user || user.role !== 'host') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Fetch favorites counts for all properties
  const fetchFavoritesCounts = async (listingIds) => {
    if (!listingIds || listingIds.length === 0) return;
    
    try {
      const counts = {};
      await Promise.all(
        listingIds.map(async (listingId) => {
          try {
            const response = await fetch(`${API_BASE}/users/wishlist/count/${listingId}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
              const data = await response.json();
              counts[listingId] = data.count || 0;
            } else {
              counts[listingId] = 0;
            }
          } catch (error) {
            console.error(`Error fetching favorites for listing ${listingId}:`, error);
            counts[listingId] = 0;
          }
        })
      );
      setFavoritesCounts(counts);
    } catch (error) {
      console.error('Error fetching favorites counts:', error);
    }
  };

  // Fetch listings for this host
  useEffect(() => {
    if (!user) return;
    if (!isValidObjectId(user._id)) {
      console.error('Invalid user ID:', user._id);
      setError('Your user ID is not valid. Please log out and log in again, or contact support. (ID: ' + user._id + ')');
      setLoading(false);
      return;
    }
    console.log('HostDashboard user:', user);
    const url = `${API_BASE}/listings?host=${user._id}`;
    console.log('Fetching host listings from:', url);
    setLoading(true);
    setError(null);
    fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(async res => {
        if (!res.ok) {
          let backendError = '';
          try {
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const errData = await res.json();
              backendError = errData.message || errData.error || res.statusText;
            } else {
              backendError = await res.text();
            }
          } catch (e) {
            backendError = res.statusText;
          }
          console.error('[HostDashboard] Failed to fetch listings:', backendError);
          throw new Error('Failed to fetch listings: ' + backendError);
        }
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        } else {
          throw new Error('Unexpected response format from server.');
        }
      })
      .then(data => {
        console.log('[HostDashboard] Listings loaded:', data.listings || data.data || []);
        const listingsData = data.listings || data.data || [];
        setListings(listingsData);
        
        // Fetch favorites counts for all listings
        const listingIds = listingsData.map(listing => listing._id);
        fetchFavoritesCounts(listingIds);
        
        setLoading(false);
      })
      .catch(err => {
        let message = 'Failed to load listings: ' + (err.message || err.toString());
        if (err.name === 'TypeError') {
          message = 'Network error: Could not connect to server.';
        }
        setError(message);
        setLoading(false);
        console.error('[HostDashboard] Fetch error:', err);
      });
  }, [user]);

  // Create a new property with random data
  const handleCreateProperty = async () => {
    setCreating(true);
    setError(null);
    setSuccessMessage('');
    const property = getRandomPropertyData(user._id);
    console.log('Creating property with payload:', property);
    try {
      const res = await fetch(`${API_BASE}/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(property)
      });
      console.log('POST /api/listings response:', res);
      if (!res.ok) {
        let backendError = '';
        try {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errData = await res.json();
            backendError = errData.message || errData.error || res.statusText;
          } else {
            backendError = await res.text();
          }
        } catch (e) {
          backendError = res.statusText;
        }
        throw new Error('Failed to create property: ' + backendError);
      }
      const created = await res.json();
      setLastCreatedId(created.listing?._id || null);
      // Refresh host listings
      setLoading(true);
      fetch(`${API_BASE}/listings?host=${user._id}&sortBy=createdAt&sortOrder=desc`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(async res => {
          console.log('GET /api/listings?host= response:', res);
          if (!res.ok) {
            let backendError = '';
            try {
              const contentType = res.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                const errData = await res.json();
                backendError = errData.message || errData.error || res.statusText;
              } else {
                backendError = await res.text();
              }
            } catch (e) {
              backendError = res.statusText;
            }
            throw new Error('Failed to fetch listings: ' + backendError);
          }
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return res.json();
          } else {
            throw new Error('Unexpected response format from server.');
          }
        })
        .then(data => {
          // Sort listings by createdAt descending
          const allListings = data.listings || data.data || [];
          const sorted = allListings.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setListings(sorted);
          setLoading(false);
          setSuccessMessage('Property created successfully!');
          if (fetchListings) fetchListings();
        })
        .catch(err => {
          let message = 'Failed to load listings: ' + (err.message || err.toString());
          if (err.name === 'TypeError') {
            message = 'Network error: Could not connect to server.';
          }
          setError(message);
          setLoading(false);
          setSuccessMessage('');
          console.error('HostDashboard fetch error:', err);
        });
    } catch (err) {
      let message = 'Failed to create property: ' + (err.message || err.toString());
      if (err.name === 'TypeError') {
        message = 'Network error: Could not connect to server.';
      }
      setError(message);
      setSuccessMessage('');
      console.error('HostDashboard create property error:', err);
    }
    setCreating(false);
  };

  // Navigate to edit page
  const handleEditClick = (listing) => {
    navigate(`/host/listings/${listing._id}/edit`);
  };

  // Add to HostDashboard component:
  const handleDeleteProperty = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    setError(null);
    setSuccessMessage('');
    try {
      const res = await fetch(`${API_BASE}/listings/${listingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) {
        let backendError = '';
        try {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errData = await res.json();
            backendError = errData.message || errData.error || res.statusText;
          } else {
            backendError = await res.text();
          }
        } catch (e) {
          backendError = res.statusText;
        }
        throw new Error('Failed to delete property: ' + backendError);
      }
      setListings(listings.filter(l => l._id !== listingId));
      setSuccessMessage('Property deleted successfully!');
      if (fetchListings) fetchListings();
    } catch (err) {
      let message = 'Failed to delete property: ' + (err.message || err.toString());
      setError(message);
      setSuccessMessage('');
      console.error('HostDashboard delete property error:', err);
    }
  };

  // Fetch bookings for this host
  const fetchBookings = async () => {
    if (!user) return;
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const response = await fetch(`${API_BASE}/host/bookings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setBookingsError('Failed to load bookings: ' + err.message);
      console.error('Fetch bookings error:', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  // Handle booking approval
  const handleApproveBooking = async (bookingId) => {
    try {
      const response = await fetch(`${API_BASE}/host/bookings/${bookingId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to approve booking');
      }
      const data = await response.json();
      setSuccessMessage(data.message || 'Booking approved successfully!');
      fetchBookings(); // Refresh bookings
    } catch (err) {
      setError('Failed to approve booking: ' + err.message);
      console.error('Approve booking error:', err);
    }
  };

  // Handle booking decline
  const handleDeclineBooking = async (bookingId) => {
    try {
      const response = await fetch(`${API_BASE}/host/bookings/${bookingId}/decline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to decline booking');
      }
      const data = await response.json();
      setSuccessMessage(data.message || 'Booking declined successfully!');
      fetchBookings(); // Refresh bookings
    } catch (err) {
      setError('Failed to decline booking: ' + err.message);
      console.error('Decline booking error:', err);
    }
  };

  // Filter bookings based on status
  const filteredBookings = bookings.filter(booking => bookingFilter === 'all' ? true : booking.status === bookingFilter);
  const bookingStats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    declined: bookings.filter(b => b.status === 'declined').length
  };

  // Toggle section visibility
  const toggleSection = (sectionName) => {
    setSectionVisibility(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Dashboard controls component
  const DashboardControls = () => {
    const visibleSections = Object.values(sectionVisibility).filter(Boolean).length;
    const totalSections = Object.keys(sectionVisibility).length;
    
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🎛️ Host Dashboard Controls
          </h3>
          <div className="flex space-x-2">
            {visibleSections === 0 && (
              <button
                onClick={() => setSectionVisibility({
                  properties: true,
                  bookings: true,
                  payments: true,
                  analytics: true,
                  messaging: true
                })}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Show All Sections
              </button>
            )}
            {visibleSections > 0 && (
              <button
                onClick={() => setSectionVisibility({
                  properties: true,
                  bookings: true,
                  payments: true,
                  analytics: true,
                  messaging: true
                })}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Show All
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {[
            { key: 'properties', label: 'Properties' },
            { key: 'bookings', label: 'Bookings' },
            { key: 'payments', label: 'Payments' },
            { key: 'analytics', label: 'Analytics' },
            { key: 'messaging', label: 'Messaging' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleSection(key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sectionVisibility[key]
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800' 
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
              }`}
            >
              {sectionVisibility[key] ? '✓' : '✗'} {label}
            </button>
          ))}
        </div>
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          {visibleSections === 0 ? (
            <span className="text-red-600 dark:text-red-400">All sections are hidden. Click "Show All Sections" to restore them.</span>
          ) : (
            <span>{visibleSections} of {totalSections} sections visible</span>
          )}
        </div>
      </div>
    );
  };

  // Only show listings created by the current host
  const myListings = listings.filter(l => {
    if (!l.host) return false;
    if (typeof l.host === 'string') return l.host === user._id;
    if (typeof l.host === 'object' && l.host._id) return l.host._id === user._id;
    return false;
  });
  const totalPages = Math.ceil(myListings.length / listingsPerPage);
  const paginatedListings = myListings.slice((currentPage - 1) * listingsPerPage, currentPage * listingsPerPage);

  if (loading) return <div className="text-center py-12">Loading your properties...</div>;
  if (error) return <div className="text-center py-12 text-red-600 dark:text-red-400">{error}</div>;

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 flex items-center gap-4">
          {user && user.profilePicture && (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="w-16 h-16 rounded-full border-2 border-blue-500 object-cover shadow"
              onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'User'); }}
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Host Dashboard</h1>
            <div className="text-gray-600 dark:text-gray-400">Welcome, {user?.name}</div>
          </div>
        </div>

        {/* Create Property Button */}
        <button
          onClick={handleCreateProperty}
          disabled={creating}
          className="mb-8 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          {creating ? 'Creating...' : 'Create New Property (Random)'}
        </button>

        {/* Dashboard Controls */}
        <DashboardControls />

        {/* My Listings Section */}
        {sectionVisibility.properties && (
          <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-800 py-12 rounded-3xl mb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🏠 My Listings</h2>
                <button
                  onClick={() => toggleSection('properties')}
                  className="px-3 py-2 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-xl hover:bg-blue-300 dark:hover:bg-blue-700 transition-colors text-sm font-medium"
                  title="Hide properties section"
                >
                  Hide
                </button>
              </div>
              {myListings.length === 0 ? (
                <div className="text-gray-600 dark:text-gray-400 text-center py-8">No properties found. Click above to create one!</div>
              ) : (
                <>
                  <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedListings.map(listing => (
                      <li
                        key={listing._id}
                        className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col justify-between border hover:shadow-lg transition-shadow ${listing._id === lastCreatedId ? 'border-4 border-green-500 ring-2 ring-green-300' : 'border-gray-200 dark:border-gray-700'}`}
                      >
                        <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          {listing.photos && listing.photos.length > 0 ? (
                            <img
                              src={listing.photos[0]}
                              alt={listing.title}
                              className="w-full h-full object-cover"
                              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'; }}
                            />
                          ) : (
                            <span className="text-gray-400">No image</span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{listing.title}</h3>
                          <div className="text-gray-600 dark:text-gray-400 mb-1">{listing.city}, {listing.country}</div>
                          <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                            Type: {listing.type} | Price: ${listing.price} | Max Guests: {listing.maxGuests}
                          </div>
                          <div className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">{listing.description}</div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center text-pink-600 dark:text-pink-400">
                              <FaHeart className="w-4 h-4 mr-1" />
                              <span className="text-sm font-medium">
                                {favoritesCounts[listing._id] || 0} favorites
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end mt-4 gap-2">
                          <button
                            onClick={() => {
                              console.log('[HostDashboard] Edit button clicked for listing:', listing._id);
                              navigate(`/host/listings/${listing._id}/edit`);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(listing._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8 gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {[...Array(totalPages)].map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(idx + 1)}
                          className={`px-3 py-1 rounded border ${currentPage === idx + 1 ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        {/* My Bookings Section */}
        {sectionVisibility.bookings && (
          <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-800 py-12 rounded-3xl mb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-100">📅 My Bookings</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setBookingFilter('all')}
                    className={`px-4 py-2 rounded-xl font-semibold transition-colors ${bookingFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setBookingFilter('pending')}
                    className={`px-4 py-2 rounded-xl font-semibold transition-colors ${bookingFilter === 'pending' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setBookingFilter('approved')}
                    className={`px-4 py-2 rounded-xl font-semibold transition-colors ${bookingFilter === 'approved' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => setBookingFilter('declined')}
                    className={`px-4 py-2 rounded-xl font-semibold transition-colors ${bookingFilter === 'declined' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                  >
                    Declined
                  </button>
                  <button
                    onClick={() => toggleSection('bookings')}
                    className="px-3 py-2 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-xl hover:bg-blue-300 dark:hover:bg-blue-700 transition-colors text-sm font-medium"
                    title="Hide bookings section"
                  >
                    Hide
                  </button>
                </div>
              </div>
              {/* Booking Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{bookingStats.total}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Total Bookings</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{bookingStats.pending}</div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Pending</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{bookingStats.approved}</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Approved</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{bookingStats.declined}</div>
                  <div className="text-sm text-red-600 dark:text-red-400">Declined</div>
                </div>
              </div>
              {/* Bookings List */}
              {bookingsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : bookingsError ? (
                <div className="text-center py-8 text-red-600 dark:text-red-400">{bookingsError}</div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-blue-100 text-lg mb-4">No bookings found</div>
                  <div className="text-blue-200 text-sm">You have no bookings for your properties yet.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-blue-200 dark:border-blue-600"
                    >
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {booking.listing?.title || 'Property'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {booking.listing?.location || 'Location not available'}
                        </p>
                        <dl className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex justify-between">
                            <dt>Guest:</dt>
                            <dd>{booking.guest?.name || 'Unknown'}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>Email:</dt>
                            <dd>{booking.guest?.email || 'N/A'}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>Check-in:</dt>
                            <dd>{new Date(booking.startDate).toLocaleDateString()}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>Check-out:</dt>
                            <dd>{new Date(booking.endDate).toLocaleDateString()}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>Total Nights:</dt>
                            <dd>{Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>Status:</dt>
                            <dd>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</dd>
                          </div>
                        </dl>
                        {booking.message && (
                          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900 rounded-xl text-xs text-gray-600 dark:text-gray-400">
                            <strong>Message:</strong> {booking.message}
                          </div>
                        )}
                        <div className="mt-4 flex space-x-2">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveBooking(booking._id)}
                                className="px-3 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700 transition-colors"
                              >
                                <FaCheck className="inline mr-1" /> Approve
                              </button>
                              <button
                                onClick={() => handleDeclineBooking(booking._id)}
                                className="px-3 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 transition-colors"
                              >
                                <FaTimes className="inline mr-1" /> Decline
                              </button>
                            </>
                          )}
                          {booking.status === 'approved' && (
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                              <FaCheck className="w-4 h-4" /> Approved
                            </span>
                          )}
                          {booking.status === 'declined' && (
                            <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
                              <FaTimes className="w-4 h-4" /> Declined
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* My Payments Section */}
        {sectionVisibility.payments && (
          <section className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900 dark:to-amber-800 py-12 rounded-3xl mb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">💰 My Payments</h2>
                <button
                  onClick={() => toggleSection('payments')}
                  className="px-3 py-2 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-xl hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors text-sm font-medium"
                  title="Hide payments section"
                >
                  Hide
                </button>
              </div>
              <PaymentDashboard userRole="host" />
            </div>
          </section>
        )}

        {/* Analytics Section */}
        {sectionVisibility.analytics && (
          <section className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-800 py-12 rounded-3xl mb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-green-900 dark:text-green-100">📊 Analytics</h2>
                <button
                  onClick={() => toggleSection('analytics')}
                  className="px-3 py-2 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-xl hover:bg-green-300 dark:hover:bg-green-700 transition-colors text-sm font-medium"
                  title="Hide analytics section"
                >
                  Hide
                </button>
              </div>
              <AnalyticsDashboard hostId={user?._id} />
            </div>
          </section>
        )}

        {/* Messaging Section */}
        {sectionVisibility.messaging && (
          <section className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900 dark:to-indigo-800 py-12 rounded-3xl mb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-purple-900 dark:text-purple-100">💬 Messages</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowMessaging(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Open Messages
                  </button>
                  <button
                    onClick={() => toggleSection('messaging')}
                    className="px-3 py-2 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-xl hover:bg-purple-300 dark:hover:bg-purple-700 transition-colors text-sm font-medium"
                    title="Hide messaging section"
                  >
                    Hide
                  </button>
                </div>
              </div>
              {showMessaging && (
                <Messaging isOpen={showMessaging} onClose={() => setShowMessaging(false)} />
              )}
            </div>
          </section>
        )}

        {successMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 rounded shadow-lg px-6 py-4 z-50 flex items-center gap-4 min-w-[300px] max-w-[90vw]">
            <span className="flex-1">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage('')}
              className="text-green-800 hover:text-green-900 font-bold text-lg ml-4 focus:outline-none"
              aria-label="Dismiss success message"
            >
              ×
            </button>
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>
        )}
      </div>
    </div>
  );
};

export default HostDashboard; 