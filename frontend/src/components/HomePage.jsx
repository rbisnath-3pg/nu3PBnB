import React, { useState, useEffect } from 'react';
import MapView from './MapView';
import Spinner from './Spinner';
import { FaMapMarkerAlt, FaStar, FaHeart, FaShare, FaCalendarAlt, FaUsers, FaBed, FaBath, FaWifi, FaParking, FaSnowflake, FaUtensils, FaTv, FaSwimmingPool, FaDumbbell, FaDog, FaSmoking, FaWheelchair, FaBaby, FaShieldAlt, FaCreditCard, FaReceipt, FaDownload, FaEye, FaTimes, FaCheck, FaClock, FaExclamationTriangle, FaInfoCircle, FaQuestionCircle, FaCog, FaBell, FaEnvelope, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaHome, FaSearch, FaFilter, FaSort, FaSortAmountDown, FaSortAmountUp, FaThumbsUp, FaThumbsDown, FaEdit, FaTrash, FaPlus, FaMinus, FaExpand, FaCompress, FaArrowLeft, FaArrowRight, FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown, FaAngleLeft, FaAngleRight, FaAngleUp, FaAngleDown, FaEllipsisH, FaEllipsisV, FaBars, FaTimes as FaTimesIcon } from 'react-icons/fa';
import ReceiptModal from './ReceiptModal';

/**
 * HomePage component - Main landing page for the application
 * Displays featured properties, user bookings, payments, and property listings
 * Handles different view modes (list/map) and user-specific content
 */
const HomePage = ({
  // User and authentication props
  user,
  
  // Loading and error states
  loading,
  error,
  
  // Dashboard visibility props
  showSearchResults,
  showAdminDashboard,
  showAnalytics,
  showHostDashboard,
  showWishlist,
  setShowWishlist,
  
  // View and display props
  viewMode,
  featuredProperty,
  featuredIndex,
  listings,
  featuredListings,
  
  // Translation and internationalization
  t,
  
  // Event handlers
  setFeaturedIndex,
  handleShareListing,
  handleAddToWishlist,
  setSelectedListing,
  setShowListingDetail,
  setShowOnboarding,
  setShowSignIn,
  setViewMode,
  
  // Booking and payment data
  userBookings,
  bookingsLoading,
  fetchBookings,
  cancelBooking,
  userPayments,
  paymentsLoading,
  fetchPayments,
  userWishlist,
  wishlistLoading,
  fetchWishlist,
  handleRemoveFromWishlist,
  loginTestError,
  
  // Payment handlers
  handleUnifiedPaymentSuccess,
  handlePaymentCancel,
}) => {
  console.log('[HomePage] listings:', listings, 'user:', user, 'loading:', loading, 'error:', error, 'showSearchResults:', showSearchResults);
  console.log('[HomePage] featuredProperty:', featuredProperty, 'featuredListings:', featuredListings, 'featuredIndex:', featuredIndex);

  // Local state for pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  
  // Section visibility state for dashboard customization
  const [sectionVisibility, setSectionVisibility] = useState({
    wishlist: true,
    bookings: true,
    payments: true,
    listings: true,
    featured: true
  });
  
  // Pagination configuration
  const itemsPerPage = 12;
  const totalPages = Math.ceil((listings?.length || 0) / itemsPerPage);
  const paginatedListings = listings ? listings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : [];

  // Receipt modal state
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setIsReceiptModalOpen(true);
  };

  const closeReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setSelectedPayment(null);
  };

  // Toggle section visibility
  const toggleSection = (sectionName) => {
    setSectionVisibility(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Collapsible section component
  const CollapsibleSection = ({ 
    title, 
    isVisible, 
    onToggle, 
    children, 
    icon = "📋",
    className = "",
    showToggle = true 
  }) => {
    if (!isVisible) return null;
    
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">{icon}</span>
            {title}
          </h2>
          {showToggle && (
            <button
              onClick={onToggle}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              title="Hide section"
            >
              Hide
            </button>
          )}
        </div>
        {children}
      </div>
    );
  };

  // Dashboard controls component
  const DashboardControls = () => {
    if (!user || user.role !== 'guest') return null;
    
    const visibleSections = Object.values(sectionVisibility).filter(Boolean).length;
    const totalSections = Object.keys(sectionVisibility).length;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🎛️ Dashboard Controls
          </h3>
          <div className="flex space-x-2">
            {visibleSections === 0 && (
              <button
                onClick={() => setSectionVisibility({
                  wishlist: true,
                  bookings: true,
                  payments: true,
                  listings: true,
                  featured: true
                })}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Show All Sections
              </button>
            )}
            {visibleSections > 0 && (
              <button
                onClick={() => setSectionVisibility({
                  wishlist: true,
                  bookings: true,
                  payments: true,
                  listings: true,
                  featured: true
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
            { key: 'featured', label: 'Featured' },
            { key: 'wishlist', label: 'Wishlist' },
            { key: 'listings', label: 'Listings' },
            { key: 'bookings', label: 'Bookings' },
            { key: 'payments', label: 'Payments' }
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

  /**
   * Reset pagination when listings change
   * Ensures users start from the first page when new data is loaded
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [listings]);

  // Show login test error banner if present
  if (loginTestError) {
    return (
      <div className="p-8 text-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900 dark:to-orange-900 text-red-800 dark:text-red-200 rounded-lg max-w-6xl mx-auto mt-12">
        <h2 className="text-3xl font-bold mb-4">🔍 Automatic Login Test Results</h2>
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">{loginTestError.tested}</div>
              <div className="text-sm">Total Tests</div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-300">{loginTestError.passed}</div>
              <div className="text-sm">Passed</div>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-300">{loginTestError.failed}</div>
              <div className="text-sm">Failed</div>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">{loginTestError.successRate}%</div>
              <div className="text-sm">Success Rate</div>
            </div>
          </div>
        </div>
        
        <p className="mb-4 text-lg">
          {loginTestError.success ? 
            '🎉 All login tests passed successfully!' : 
            '⚠️ Some login tests failed. Check the detailed results below and browser console for full logs.'
          }
        </p>
        
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left text-sm border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-3 py-2 border-b">Email</th>
                <th className="px-3 py-2 border-b">Role</th>
                <th className="px-3 py-2 border-b">Status</th>
                <th className="px-3 py-2 border-b">Response Time</th>
                <th className="px-3 py-2 border-b">Result</th>
                <th className="px-3 py-2 border-b">Details</th>
              </tr>
            </thead>
            <tbody>
              {loginTestError.results.map((r, i) => (
                <tr key={i} className={r.passed ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-red-900 font-semibold'}>
                  <td className="px-3 py-2 border-b font-mono text-xs">{r.email}</td>
                  <td className="px-3 py-2 border-b">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      r.role === 'admin' ? 'bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200' :
                      r.role === 'host' ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200' :
                      'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                    }`}>
                      {r.role}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-b">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      r.status === 200 ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' :
                      r.status === 'network-error' ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' :
                      'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
                    }`}>
                      {r.status} {r.statusText}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-b text-xs">
                    {r.responseTime ? `${r.responseTime}ms` : 'N/A'}
                  </td>
                  <td className="px-3 py-2 border-b">
                    {r.passed ? 
                      <span className="text-green-600 dark:text-green-400 font-bold">✅ Success</span> : 
                      <span className="text-red-600 dark:text-red-400 font-bold">❌ Failed</span>
                    }
                  </td>
                  <td className="px-3 py-2 border-b text-xs">
                    {r.error ? (
                      <details className="cursor-pointer">
                        <summary className="text-red-600 dark:text-red-400">Error Details</summary>
                        <div className="mt-1 p-2 bg-red-100 dark:bg-red-800 rounded text-xs">
                          <div><strong>Type:</strong> {r.error.type}</div>
                          <div><strong>Message:</strong> {r.error.message}</div>
                        </div>
                      </details>
                    ) : r.validation ? (
                      <details className="cursor-pointer">
                        <summary className="text-blue-600 dark:text-blue-400">Validation</summary>
                        <div className="mt-1 p-2 bg-blue-100 dark:bg-blue-800 rounded text-xs">
                          <div>Response OK: {r.validation.responseOk ? '✅' : '❌'}</div>
                          <div>Has User: {r.validation.hasUser ? '✅' : '❌'}</div>
                          <div>Has Token: {r.validation.hasToken ? '✅' : '❌'}</div>
                          <div>Email Match: {r.validation.emailMatch ? '✅' : '❌'}</div>
                          <div>Role Match: {r.validation.roleMatch ? '✅' : '❌'}</div>
                        </div>
                      </details>
                    ) : (
                      <span className="text-gray-500">No details</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="text-left">
          <h3 className="text-lg font-bold mb-2">📋 Test Configuration</h3>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono">
            <div><strong>API Base:</strong> {loginTestError.apiBase}</div>
            <div><strong>Timestamp:</strong> {loginTestError.timestamp}</div>
            <div><strong>Network Errors:</strong> {loginTestError.networkErrors}</div>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold mr-4"
          >
            🔄 Run Tests Again
          </button>
          <button
            onClick={() => window.open('https://nu3pbnb-api.onrender.com/api/test', '_blank')}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
          >
            🧪 Test API Directly
          </button>
        </div>
        
        <details className="mt-6 text-left">
          <summary className="cursor-pointer text-lg font-bold mb-2">📊 Full JSON Response</summary>
          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto text-left max-h-96 border">{JSON.stringify(loginTestError, null, 2)}</pre>
        </details>
      </div>
    );
  }

  return (
    <>
      {/* Dashboard Controls - Only show for logged-in users */}
      {user && user.role === 'guest' && !showSearchResults && !showAdminDashboard && !showAnalytics && !showHostDashboard && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <DashboardControls />
        </div>
      )}

      {/* Search Results Header */}
      {showSearchResults && !loading && !error && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Search Results
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {listings?.length || 0} properties found
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
              >
                Clear Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - Always show on landing page when not searching or in dashboard */}
      {!loading && !error && !showSearchResults && !showAdminDashboard && !showAnalytics && !showHostDashboard && (
        <section className="relative w-full h-[480px] flex flex-col justify-center items-center mb-12 overflow-hidden">
          {/* Background Image */}
          <img
            src={featuredProperty && featuredProperty.photos && featuredProperty.photos.length > 0 ? featuredProperty.photos[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=600&fit=crop'}
            alt={featuredProperty ? featuredProperty.title : 'Hero background'}
            className="absolute inset-0 w-full h-full object-cover object-center z-0"
            style={{ filter: 'brightness(0.6)' }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50 z-10" />
          {/* Content */}
          <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 text-center drop-shadow-lg">Find your perfect stay</h1>
            <p className="text-lg md:text-2xl text-white mb-8 text-center font-medium drop-shadow">Discover unique places to stay and connect with hosts around the world</p>
            {/* Search Bar */}
            <form className="flex flex-col md:flex-row items-center justify-center bg-white bg-opacity-95 rounded-2xl shadow-lg px-4 py-3 md:py-2 w-full max-w-2xl space-y-2 md:space-y-0 md:space-x-2">
              <input
                type="text"
                placeholder="Enter destination"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 text-base"
              />
              <input
                type="date"
                className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 text-base"
              />
              <input
                type="date"
                className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 text-base"
              />
              <button
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow transition-colors text-base flex items-center"
                type="submit"
              >
                <FaSearch className="mr-2" /> Search
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Featured Places Section */}
      {!loading && !error && !showSearchResults && !showAdminDashboard && !showAnalytics && !showHostDashboard && featuredListings && featuredListings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Featured Places to Stay</h2>
            <p className="text-lg text-gray-600">Discover handpicked accommodations for your next adventure</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredListings.slice(0, 3).map((listing) => (
              <div
                key={listing._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow border border-gray-100 flex flex-col"
              >
                {/* Property Image */}
                <div className="relative h-48 w-full">
                  <img
                    src={listing.photos && listing.photos.length > 0 ? listing.photos[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-semibold flex items-center shadow">
                    <FaStar className="text-yellow-400 mr-1" />
                    {listing.rating ? listing.rating.toFixed(1) : '4.8'}
                  </div>
                </div>
                {/* Property Details */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{listing.title}</h3>
                  <div className="text-gray-500 text-sm mb-2 flex items-center">
                    <FaMapMarkerAlt className="mr-1" /> {listing.location}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{listing.description || 'A wonderful place to stay.'}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-bold text-gray-900">${listing.price} <span className="text-base font-normal text-gray-500">/ night</span></span>
                    <button
                      className="px-4 py-2 bg-white border border-green-500 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors text-sm shadow"
                      onClick={() => { setSelectedListing(listing); setShowListingDetail(true); }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Wishlist Preview - Show when user has wishlist items but not in dedicated wishlist view */}
      {user && user.role === 'guest' && !showWishlist && userWishlist && userWishlist.length > 0 && !loading && !error && !showSearchResults && !showAdminDashboard && !showAnalytics && !showHostDashboard && sectionVisibility.wishlist && (
        <div className="bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900 dark:to-rose-800 py-8 rounded-2xl mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-pink-900 dark:text-pink-100">
                ❤️ Your Wishlist ({userWishlist.length} items)
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowWishlist(true)}
                  className="px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors font-semibold text-sm"
                >
                  View All
                </button>
                <button
                  onClick={() => toggleSection('wishlist')}
                  className="px-3 py-2 bg-pink-200 dark:bg-pink-800 text-pink-800 dark:text-pink-200 rounded-xl hover:bg-pink-300 dark:hover:bg-pink-700 transition-colors text-sm font-medium"
                  title="Hide wishlist section"
                >
                  Hide
                </button>
              </div>
            </div>
            
            {/* Quick Preview - Show first 3 items */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userWishlist.slice(0, 3).map((listing) => (
                <div
                  key={listing._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer border border-pink-200 dark:border-pink-600"
                  onClick={() => {
                    setSelectedListing(listing);
                    setShowListingDetail(true);
                  }}
                >
                  {/* Property Image */}
                  <div className="relative h-32">
                    {listing.photos && listing.photos.length > 0 && (
                      <img
                        src={listing.photos[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop';
                        }}
                      />
                    )}
                    {/* Price Badge */}
                    <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg text-xs font-medium shadow-sm">
                      ${listing.price}
                    </div>
                  </div>
                  
                  {/* Property Details */}
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                      {listing.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                      📍 {listing.location}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>👥 {listing.maxGuests || 4}</span>
                      <span>🛏️ {listing.bedrooms || 2}</span>
                      <span>🚿 {listing.bathrooms || 1}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Show more indicator if there are more than 3 items */}
              {userWishlist.length > 3 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-pink-200 dark:border-pink-600 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="text-2xl mb-2">❤️</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      +{userWishlist.length - 3} more
                    </p>
                    <button
                      onClick={() => setShowWishlist(true)}
                      className="mt-2 px-3 py-1 bg-pink-600 text-white rounded-lg text-xs hover:bg-pink-700 transition-colors"
                    >
                      View All
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All Listings Section - Moved to bottom */}
      {!loading && !error && !showSearchResults && sectionVisibility.listings && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-16" data-testid="homepage-listings">
          {/* Section Header with View Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🏠 {t('home.listingsTitle', 'All Listings')}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-xl font-semibold transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700'}`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-xl font-semibold transition-colors ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700'}`}
              >
                Map View
              </button>
              {user && user.role === 'guest' && (
                <button
                  onClick={() => toggleSection('listings')}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                  title="Hide listings section"
                >
                  Hide
                </button>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="text-center py-12">
              <div className="text-red-600 dark:text-red-400 text-lg mb-4">
                {error}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Map View */}
          {viewMode === 'map' && !loading && !error && (
            <div className="h-[600px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <MapView 
                listings={listings} 
                onListingClick={(listing) => {
                  if (!user) {
                    if (setShowSignIn) {
                      setShowSignIn(true);
                    }
                    return;
                  }
                  setSelectedListing(listing);
                  setShowListingDetail(true);
                }}
              />
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && !loading && !error && (
            <>
              {/* Properties Grid */}
              {listings && listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedListings.map((listing) => (
                    <div
                      key={listing._id}
                      className="bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer flex flex-col"
                      onClick={() => {
                        if (!user) {
                          // If user is not logged in, prompt them to sign in
                          if (setShowSignIn) {
                            setShowSignIn(true);
                          }
                          return;
                        }
                        setSelectedListing(listing);
                        setShowListingDetail(true);
                      }}
                    >
                      {/* Property Image */}
                      <div className="relative h-48">
                        {listing.photos && listing.photos.length > 0 && (
                          <img
                            src={listing.photos[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop';
                            }}
                          />
                        )}
                        {/* Price Badge */}
                        <div className="absolute top-2 right-2 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-xl text-sm font-medium shadow-lg text-gray-700 dark:text-gray-300">
                          ${listing.price}/night
                        </div>
                      </div>
                      
                      {/* Property Details */}
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                          {listing.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center">
                          <span className="mr-1">📍</span>
                          {listing.location}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {listing.description}
                        </p>
                        
                        {/* Property Features */}
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <span>👥 {listing.maxGuests || 4} guests</span>
                          <span>🛏️ {listing.bedrooms || 2} beds</span>
                          <span>🚿 {listing.bathrooms || 1} bath</span>
                        </div>
                        
                        {/* Rating Display */}
                        {listing.averageRating > 0 && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <span className="text-yellow-500 mr-1">⭐</span>
                            <span>{listing.averageRating}</span>
                            <span className="text-gray-400 ml-1">({listing.reviewCount || 0} reviews)</span>
                          </div>
                        )}
                        
                        {/* Action Buttons - Now at the bottom */}
                        <div className="flex space-x-2 mt-auto">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!user) {
                                // If user is not logged in, prompt them to sign in
                                if (setShowSignIn) {
                                  setShowSignIn(true);
                                }
                                return;
                              }
                              handleShareListing(listing);
                            }}
                            className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-xl text-sm hover:bg-gray-600 transition-colors"
                          >
                            Share
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!user) {
                                // If user is not logged in, prompt them to sign in
                                if (setShowSignIn) {
                                  setShowSignIn(true);
                                }
                                return;
                              }
                              const isInWishlist = userWishlist && userWishlist.some(item => item._id === listing._id);
                              if (isInWishlist) {
                                handleRemoveFromWishlist(listing._id);
                              } else {
                                handleAddToWishlist(listing._id);
                              }
                            }}
                            className={`px-3 py-2 rounded-xl text-sm transition-colors ${
                              user && userWishlist && userWishlist.some(item => item._id === listing._id)
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-gray-200 text-gray-600 border border-gray-300 hover:bg-gray-300'
                            }`}
                            title={
                              !user ? 'Sign in to add to wishlist' :
                              userWishlist && userWishlist.some(item => item._id === listing._id)
                                ? 'Remove from Wishlist'
                                : 'Add to Wishlist'
                            }
                          >
                            {user && userWishlist && userWishlist.some(item => item._id === listing._id) ? '❤️' : '🤍'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                    No properties found
                  </div>
                  <div className="text-gray-400 dark:text-gray-500 text-sm">
                    Try adjusting your search criteria or check back later
                  </div>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <span className="px-3 py-2 text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Guest Dashboard - Bookings Section */}
      {user && user.role === 'guest' && !loading && !error && !showSearchResults && !showAdminDashboard && !showAnalytics && !showHostDashboard && sectionVisibility.bookings && (
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-800 py-12 rounded-3xl mb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                📅 {t('bookings.myBookings', 'My Bookings')}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setBookingStatusFilter('all')}
                  className={`px-4 py-2 rounded-xl font-semibold transition-colors ${bookingStatusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setBookingStatusFilter('pending')}
                  className={`px-4 py-2 rounded-xl font-semibold transition-colors ${bookingStatusFilter === 'pending' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setBookingStatusFilter('approved')}
                  className={`px-4 py-2 rounded-xl font-semibold transition-colors ${bookingStatusFilter === 'approved' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                >
                  Booked
                </button>
                <button
                  onClick={() => setBookingStatusFilter('cancelled')}
                  className={`px-4 py-2 rounded-xl font-semibold transition-colors ${bookingStatusFilter === 'cancelled' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                >
                  Cancelled
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
            
            {/* Bookings List */}
            {bookingsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : userBookings && userBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBookings
                  .filter(booking => bookingStatusFilter === 'all' || booking.status === bookingStatusFilter)
                  .map((booking) => (
                    <article
                      key={booking._id}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow focus-within:ring-4 focus-within:ring-blue-300 dark:focus-within:ring-blue-600 border border-blue-200 dark:border-blue-600"
                    >
                      {/* Property Image */}
                      <div className="relative h-48">
                        {booking.listing?.photos && booking.listing.photos.length > 0 && (
                          <img
                            src={booking.listing.photos[0]}
                            alt={`${booking.listing.title} - ${booking.listing.location}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop';
                            }}
                          />
                        )}
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          <span 
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              booking.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                            role="status"
                            aria-label={`Booking status: ${booking.status}`}
                          >
                            {booking.status === 'approved' ? 'Booked' : 
                             booking.status === 'pending' ? 'Pending' : 
                             booking.status === 'cancelled' ? 'Cancelled' :
                             booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Booking Details */}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {booking.listing?.title || 'Unknown Property'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {booking.listing?.location || 'Location not available'}
                        </p>
                        
                        {/* Booking Information */}
                        <dl className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex justify-between">
                            <dt>Check-in:</dt>
                            <dd>{new Date(booking.startDate).toLocaleDateString()}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>Check-out:</dt>
                            <dd>{new Date(booking.endDate).toLocaleDateString()}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>Guests:</dt>
                            <dd>{booking.guests || 'N/A'}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>Total Price:</dt>
                            <dd className="font-semibold text-green-600 dark:text-green-400">
                              ${booking.totalPrice || 'N/A'}
                            </dd>
                          </div>
                        </dl>
                        
                        {/* Booking Message */}
                        {booking.message && (
                          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900 rounded-xl text-xs text-gray-600 dark:text-gray-400">
                            <strong>Message:</strong> {booking.message}
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedListing(booking.listing);
                              setShowListingDetail(true);
                            }}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            aria-label={`View details for ${booking.listing?.title || 'property'}`}
                          >
                            View Property
                          </button>
                          {(booking.status === 'pending' || booking.status === 'approved') && (
                            <button
                              onClick={() => cancelBooking(booking._id)}
                              className="px-3 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                              aria-label={`Cancel booking for ${booking.listing?.title || 'property'}`}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
            ) : (
              <div 
                className="text-center py-12"
                role="status"
                aria-live="polite"
              >
                <div className="text-blue-100 text-lg mb-4">
                  {bookingStatusFilter === 'all' ? 
                    t('bookings.noBookings', 'No bookings yet') :
                    `No ${bookingStatusFilter === 'pending' ? 'pending' : 
                          bookingStatusFilter === 'approved' ? 'booked' : 
                          bookingStatusFilter === 'cancelled' ? 'cancelled' :
                          'declined'} bookings found`
                  }
                </div>
                <div className="text-blue-200 text-sm">
                  {bookingStatusFilter === 'all' ? 
                    t('bookings.noBookingsSubtext', 'Start exploring properties to make your first booking!') :
                    'Try changing the filter or explore more properties'
                  }
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Guest Dashboard - Payments Section */}
      {user && user.role === 'guest' && !loading && !error && !showSearchResults && !showAdminDashboard && !showAnalytics && !showHostDashboard && sectionVisibility.payments && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900 dark:to-amber-800 py-12 rounded-3xl mb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                💰 {t('payments.myPayments', 'My Payments')}
              </h2>
              <button
                onClick={() => toggleSection('payments')}
                className="px-3 py-2 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-xl hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors text-sm font-medium"
                title="Hide payments section"
              >
                Hide
              </button>
            </div>
            
            {/* Payment Statistics Dashboard */}
            {userPayments && userPayments.length > 0 && (
              <div className="mb-6 space-y-6">
                {/* Main Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { 
                      label: t('payments.statistics.totalSpent', 'Total Spent'), 
                      value: `$${userPayments.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}`, 
                      color: 'green',
                      icon: '💰'
                    },
                    { 
                      label: t('payments.statistics.totalPayments', 'Total Payments'), 
                      value: userPayments.length, 
                      color: 'blue',
                      icon: '💳'
                    },
                    { 
                      label: t('payments.statistics.completed', 'Completed'), 
                      value: userPayments.filter(p => p.paymentStatus === 'completed').length, 
                      color: 'green',
                      icon: '✅'
                    },
                    { 
                      label: t('payments.statistics.pending', 'Pending'), 
                      value: userPayments.filter(p => p.paymentStatus === 'pending').length, 
                      color: 'yellow',
                      icon: '⏳'
                    }
                  ].map(card => (
                    <div
                      key={card.label}
                      className="bg-white dark:bg-gray-700 rounded-2xl p-4 shadow-sm border border-yellow-200 dark:border-yellow-600"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{card.label}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                        </div>
                        <div className="text-2xl">{card.icon}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Enhanced Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Average Payment Card */}
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-100 dark:from-yellow-900 dark:to-amber-800 rounded-2xl p-4 shadow-sm border border-yellow-200 dark:border-yellow-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">{t('payments.statistics.averagePayment', 'Average Payment')}</p>
                        <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                          ${(userPayments.reduce((sum, p) => sum + (p.amount || 0), 0) / userPayments.length).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-2xl">📊</div>
                    </div>
                  </div>
                  
                  {/* This Month's Spending Card */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-100 dark:from-amber-900 dark:to-orange-800 rounded-2xl p-4 shadow-sm border border-amber-200 dark:border-amber-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">{t('payments.statistics.thisMonth', 'This Month')}</p>
                        <p className="text-xl font-bold text-amber-900 dark:text-amber-100">
                          ${userPayments
                            .filter(p => {
                              const paymentDate = new Date(p.createdAt);
                              const now = new Date();
                              return paymentDate.getMonth() === now.getMonth() && 
                                     paymentDate.getFullYear() === now.getFullYear();
                            })
                            .reduce((sum, p) => sum + (p.amount || 0), 0)
                            .toFixed(2)}
                        </p>
                      </div>
                      <div className="text-2xl">📅</div>
                    </div>
                  </div>
                  
                  {/* Payment Methods Card */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-100 dark:from-orange-900 dark:to-red-800 rounded-2xl p-4 shadow-sm border border-orange-200 dark:border-orange-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">{t('payments.statistics.paymentMethods', 'Payment Methods')}</p>
                        <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                          {new Set(userPayments.map(p => p.paymentMethod)).size}
                        </p>
                        <p className="text-xs text-orange-500 dark:text-orange-300">
                          {Array.from(new Set(userPayments.map(p => p.paymentMethod))).join(', ')}
                        </p>
                      </div>
                      <div className="text-2xl">💳</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Payment History List */}
            {paymentsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
              </div>
            ) : userPayments && userPayments.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userPayments.map((payment) => (
                    <div
                      key={payment._id}
                      className="bg-white dark:bg-gray-700 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-yellow-200 dark:border-yellow-600"
                    >
                      <div className="p-4">
                        {/* Payment Header with Status */}
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {payment.booking?.listing?.title || 'Unknown Property'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            payment.paymentStatus === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            payment.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {payment.paymentStatus === 'completed' ? t('payments.status.completed', 'Completed') : 
                             payment.paymentStatus === 'pending' ? t('payments.status.pending', 'Pending') : 
                             payment.paymentStatus.charAt(0).toUpperCase() + payment.paymentStatus.slice(1)}
                          </span>
                        </div>
                        
                        {/* Payment Details */}
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex justify-between">
                            <span>{t('payments.details.amount', 'Amount')}:</span>
                            <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                              ${payment.amount?.toFixed(2) || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('payments.details.method', 'Method')}:</span>
                            <span>{payment.paymentMethod || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('payments.details.date', 'Date')}:</span>
                            <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                          </div>
                          {payment.booking?.startDate && (
                            <div className="flex justify-between">
                              <span>{t('payments.details.checkIn', 'Check-in')}:</span>
                              <span>{new Date(payment.booking.startDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {payment.booking?.endDate && (
                            <div className="flex justify-between">
                              <span>{t('payments.details.checkOut', 'Check-out')}:</span>
                              <span>{new Date(payment.booking.endDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Payment Description */}
                        {payment.metadata?.description && (
                          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900 rounded-xl text-xs text-gray-600 dark:text-gray-400">
                            <strong>{t('payments.details.description', 'Description')}:</strong> {payment.metadata.description}
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => {
                              if (payment.booking?.listing) {
                                setSelectedListing(payment.booking.listing);
                                setShowListingDetail(true);
                              }
                            }}
                            className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-xl text-sm hover:bg-yellow-700 transition-colors"
                          >
                            {t('payments.details.viewProperty', 'View Property')}
                          </button>
                          <button
                            onClick={() => handleViewReceipt(payment)}
                            className="px-3 py-2 bg-amber-600 text-white rounded-xl text-sm hover:bg-amber-700 transition-colors font-bold"
                          >
                            🧾 {t('payments.details.receipt', 'View Receipt')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                  {t('payments.noPayments', 'No payments yet')}
                </div>
                <div className="text-gray-400 dark:text-gray-500 text-sm">
                  {t('payments.noPaymentsSubtext', 'Your payment history will appear here after you make bookings')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dedicated Wishlist View */}
      {user && user.role === 'guest' && showWishlist && !loading && !error && (
        <div className="bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900 dark:to-rose-800 py-12 rounded-3xl mb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-pink-900 dark:text-pink-100">
                {t('wishlist.title', 'My Wishlist')}
              </h2>
              <button
                onClick={() => setShowWishlist(false)}
                className="px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors font-semibold"
              >
                Back to All Listings
              </button>
            </div>
            
            {/* Wishlist Statistics */}
            {userWishlist && userWishlist.length > 0 && (
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { 
                    label: 'Total Items', 
                    value: userWishlist.length, 
                    color: 'blue',
                    icon: '❤️'
                  },
                  { 
                    label: 'Average Price', 
                    value: `$${(userWishlist.reduce((sum, item) => sum + (item.price || 0), 0) / userWishlist.length).toFixed(2)}`, 
                    color: 'green',
                    icon: '💰'
                  },
                  { 
                    label: 'Total Value', 
                    value: `$${userWishlist.reduce((sum, item) => sum + (item.price || 0), 0).toFixed(2)}`, 
                    color: 'purple',
                    icon: '💎'
                  }
                ].map(card => (
                  <div
                    key={card.label}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-pink-200 dark:border-pink-600"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{card.label}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                      </div>
                      <div className="text-2xl">{card.icon}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Wishlist Items */}
            {wishlistLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
              </div>
            ) : userWishlist && userWishlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userWishlist.map((listing) => (
                  <div
                    key={listing._id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer flex flex-col border border-pink-200 dark:border-pink-600"
                    onClick={() => {
                      setSelectedListing(listing);
                      setShowListingDetail(true);
                    }}
                  >
                    {/* Property Image */}
                    <div className="relative h-48">
                      {listing.photos && listing.photos.length > 0 && (
                        <img
                          src={listing.photos[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop';
                          }}
                        />
                      )}
                      {/* Price Badge */}
                      <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 px-2 py-1 rounded-xl text-sm font-medium shadow-lg">
                        ${listing.price}/night
                      </div>
                    </div>
                    
                    {/* Property Details */}
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center">
                        <span className="mr-1">📍</span>
                        {listing.location}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {listing.description}
                      </p>
                      
                      {/* Property Features */}
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <span>👥 {listing.maxGuests || 4} guests</span>
                        <span>🛏️ {listing.bedrooms || 2} beds</span>
                        <span>🚿 {listing.bathrooms || 1} bath</span>
                      </div>
                      
                      {/* Rating Display */}
                      {listing.averageRating > 0 && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <span className="text-yellow-500 mr-1">⭐</span>
                          <span>{listing.averageRating}</span>
                          <span className="text-gray-400 ml-1">({listing.reviewCount || 0} reviews)</span>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2 mt-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareListing(listing);
                          }}
                          className="flex-1 px-3 py-2 bg-pink-600 text-white rounded-xl text-sm hover:bg-pink-700 transition-colors"
                        >
                          Share
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromWishlist(listing._id);
                          }}
                          className="px-3 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 transition-colors"
                          title="Remove from Wishlist"
                        >
                          ❤️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                  {t('wishlist.noItems', 'Your wishlist is empty')}
                </div>
                <div className="text-gray-400 dark:text-gray-500 text-sm">
                  {t('wishlist.noItemsSubtext', 'Start adding properties you love to your wishlist')}
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setShowWishlist(true);
                      setShowSearchResults(false);
                      setSelectedListing(null);
                      setShowListingDetail(false);
                      setViewMode('list');
                    }}
                    className="px-6 py-3 bg-pink-600 text-white rounded-2xl hover:bg-pink-700 transition-colors font-semibold"
                  >
                    View All Wishlist
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Call to Action Section - Only show for non-logged in users, now at the bottom */}
      {!user && !loading && !error && !showSearchResults && !showAdminDashboard && !showAnalytics && (
        <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 py-20 mt-16 mb-16 relative overflow-hidden rounded-3xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
                {t('home.cta.title')}
              </h2>
              <p className="text-xl text-purple-100 mb-12 leading-relaxed">
                {t('home.cta.subtitle')}
              </p>
              
              {/* Main CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <button
                  onClick={() => setShowOnboarding && setShowOnboarding(true)}
                  className="w-full sm:w-auto bg-white text-purple-700 px-12 py-4 rounded-2xl font-bold text-xl shadow-2xl hover:bg-purple-50 transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300"
                >
                  {t('home.cta.getStarted')}
                </button>
                <button
                  onClick={() => setShowSignIn && setShowSignIn(true)}
                  className="w-full sm:w-auto bg-transparent text-white border-2 border-white px-12 py-4 rounded-2xl font-bold text-xl hover:bg-white hover:text-purple-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white"
                >
                  {t('home.cta.signInInstead')}
                </button>
              </div>
              
              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Unique Stays */}
                <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-3xl group">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">🏠</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('home.cta.features.uniqueStays.title')}</h3>
                  <p className="text-gray-600 text-center leading-relaxed">{t('home.cta.features.uniqueStays.description')}</p>
                </div>
                
                {/* Secure Booking */}
                <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-3xl group">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">🔒</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('home.cta.features.secureBooking.title')}</h3>
                  <p className="text-gray-600 text-center leading-relaxed">{t('home.cta.features.secureBooking.description')}</p>
                </div>
                
                {/* Host Earnings */}
                <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-3xl group">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">💰</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('home.cta.features.hostEarnings.title')}</h3>
                  <p className="text-gray-600 text-center leading-relaxed">{t('home.cta.features.hostEarnings.description')}</p>
                </div>
                
                {/* Global Community */}
                <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-3xl group">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">🌍</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('home.cta.features.globalCommunity.title')}</h3>
                  <p className="text-gray-600 text-center leading-relaxed">{t('home.cta.features.globalCommunity.description')}</p>
                </div>
                
                {/* Smart Search */}
                <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-3xl group">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('home.cta.features.smartSearch.title')}</h3>
                  <p className="text-gray-600 text-center leading-relaxed">{t('home.cta.features.smartSearch.description')}</p>
                </div>
                
                {/* Mobile Experience */}
                <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-3xl group">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">📱</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('home.cta.features.mobileApp.title')}</h3>
                  <p className="text-gray-600 text-center leading-relaxed">{t('home.cta.features.mobileApp.description')}</p>
                </div>
              </div>
              
              {/* Bottom CTA */}
              <div className="mt-16">
                <p className="text-purple-100 text-lg mb-6">Ready to start your journey?</p>
                <button
                  onClick={() => setShowOnboarding && setShowOnboarding(true)}
                  className="bg-white text-purple-700 px-8 py-3 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all transform hover:scale-105 shadow-lg"
                >
                  Join nu3PBnB Today
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedPayment && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={closeReceiptModal}
          payment={selectedPayment}
          booking={selectedPayment.booking}
          listing={selectedPayment.booking?.listing}
          user={selectedPayment.user}
        />
      )}
    </>
  );
};

export default HomePage; 