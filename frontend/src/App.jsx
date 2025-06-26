import React from 'react'
import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import './App.css'
import MapView from './components/MapView'
import SearchBar from './components/SearchBar'
import SearchResults from './components/SearchResults'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import AdminDashboard from './components/AdminDashboard'
import OnboardingWizard from './components/OnboardingWizard'
import PaymentModal from './components/PaymentModal'
import NotificationModal from './components/NotificationModal'
import ConfirmationModal from './components/ConfirmationModal'
import LoginModal from './components/LoginModal'
import RegisterModal from './components/RegisterModal'
import Messaging from './components/Messaging'
import UserProfile from './components/UserProfile'
import PropertyCalendar from './components/PropertyCalendar'
import { useAuth } from './contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './components/LanguageSwitcher'
import Footer from './components/Footer'
import analyticsService from './services/analytics'
import HostDashboard from './components/HostDashboard'
import EditListing from './components/EditListing'
import HomePage from './components/HomePage'
import Spinner from './components/Spinner'
import { FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'
import getApiBase from './services/getApiBase'
import frontendAuthLogger from './services/authLogger'
import testLogins from './services/testLogins'

/**
 * Main App component that handles the entire application state and routing
 * Manages user authentication, listings, bookings, payments, and UI state
 */
function AppRoutes(props) {
  const navigate = useNavigate();
  const location = useLocation();

  // Move the host role navigation effect here
  useEffect(() => {
    console.log('[Host Navigation] User:', props.user);
    console.log('[Host Navigation] Current path:', location.pathname);
    console.log('[Host Navigation] User role:', props.user?.role);
    
    // Only redirect to dashboard if not already on an edit page
    if (
      props.user?.role === 'host' &&
      !/^\/host\/listings\/[^/]+\/edit$/.test(location.pathname)
    ) {
      console.log('[Host Navigation] Redirecting host to dashboard');
      navigate('/host/dashboard');
    }
  }, [props.user, navigate, location.pathname]);

  // Add admin role navigation effect
  useEffect(() => {
    console.log('[Admin Navigation] User:', props.user);
    console.log('[Admin Navigation] Current path:', location.pathname);
    console.log('[Admin Navigation] User role:', props.user?.role);
    
    // Redirect admin users to admin dashboard
    if (
      props.user?.role === 'admin' &&
      location.pathname !== '/admin/dashboard'
    ) {
      console.log('[Admin Navigation] Redirecting admin to dashboard');
      navigate('/admin/dashboard');
    }
  }, [props.user, navigate, location.pathname]);

  // Pass navigate and all props down as needed
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Routes>
        <Route path="/" element={<HomePage {...props} />} />
        <Route path="/host/dashboard" element={<HostDashboard fetchListings={props.fetchListings} />} />
        <Route path="/host/listings/:id/edit" element={<EditListing />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="*" element={<HomePage {...props} />} />
      </Routes>
    </main>
  );
}

function AppHeader({ user, onLogin, onRegister, onLanguageChange, onLogout }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-black bg-opacity-60 backdrop-blur-md border-b border-black/10 flex items-center justify-between px-8 py-3 h-20">
      {/* Logo and Brand */}
      <div className="flex items-center space-x-2">
        <FaMapMarkerAlt className="text-white text-xl mr-1" />
        <span className="text-2xl font-extrabold text-white tracking-tight">3PnB</span>
      </div>
      {/* Navigation */}
      <nav className="flex items-center space-x-6">
        {user && (
          <span className="text-white text-base font-semibold">
            Welcome, {user.name || user.email}
          </span>
        )}
        <div className="relative">
          <button
            className="text-white text-2xl ml-2 focus:outline-none"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Open menu"
          >
            <span className="sr-only">Menu</span>☰
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 animate-fade-in">
              {!user ? (
                <>
                  <button
                    onClick={() => { setMenuOpen(false); onLogin(); }}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onRegister(); }}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setMenuOpen(false); onLanguageChange(); }}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Language
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onLogout(); }}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              )}
              <div className="px-4 py-2 border-t border-gray-200">
                <LanguageSwitcher />
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

function App() {
  // Authentication and internationalization
  const { user, login, logout } = useAuth()
  const { t, i18n } = useTranslation()
  
  // API configuration
  const API_BASE = getApiBase()

  // Core application state
  const [listings, setListings] = useState([])
  const [originalListings, setOriginalListings] = useState([]) // Store original listings for filtering
  const [featuredListings, setFeaturedListings] = useState([]) // Store featured listings separately
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'map'
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize dark mode from user preference or localStorage
    const savedTheme = localStorage.getItem('darkMode')
    if (savedTheme !== null) {
      return savedTheme === 'true'
    }
    return false
  })

  // Search and filtering state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Authentication UI state
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  // Listing and property state
  const [selectedListing, setSelectedListing] = useState(null)
  const [showListingDetail, setShowListingDetail] = useState(false)
  const [featuredProperty, setFeaturedProperty] = useState(null)
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [imageLoading, setImageLoading] = useState({})
  const [currentImageIndex, setCurrentImageIndex] = useState({})

  // Booking and payment state
  const [userBookings, setUserBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [userPayments, setUserPayments] = useState([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [currentBooking, setCurrentBooking] = useState(null)
  const [paymentType, setPaymentType] = useState('new') // Track payment type: 'new' or 'existing'
  const [selectedStartDate, setSelectedStartDate] = useState(null)
  const [selectedEndDate, setSelectedEndDate] = useState(null)
  const [existingBookings, setExistingBookings] = useState([])
  const [userWishlist, setUserWishlist] = useState([])
  const [wishlistLoading, setWishlistLoading] = useState(false)

  // Messaging and communication state
  const [showMessages, setShowMessages] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [showMessaging, setShowMessaging] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Reviews and feedback state
  const [showReviews, setShowReviews] = useState(false)
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })

  // Dashboard and admin state
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showAdminDashboard, setShowAdminDashboard] = useState(false)
  const [showHostDashboard, setShowHostDashboard] = useState(false)
  const [showWishlist, setShowWishlist] = useState(false)

  // Notification and confirmation state
  const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'info' })
  const [confirmation, setConfirmation] = useState({ show: false, title: '', message: '', onConfirm: null })
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const [loginTestError, setLoginTestError] = useState(null)

  const [diagnostics, setDiagnostics] = useState(null);
  const [showDiagnostics, setShowDiagnostics] = useState(true);
  const [propertyDiagnostics, setPropertyDiagnostics] = useState(null);

  const navigate = useNavigate();

  /**
   * Initial data loading effect
   * Fetches listings when component mounts
   */
  useEffect(() => {
    fetchListings()
    fetchFeaturedListings()
  }, [])

  /**
   * Refetch listings when language changes
   * Ensures content is displayed in the correct language
   */
  useEffect(() => {
    if (i18n.language) {
      fetchListings()
      fetchFeaturedListings()
    }
  }, [i18n.language])

  /**
   * Set featured property when featured listings are loaded
   * Initializes the hero section with the first featured property
   */
  useEffect(() => {
    if (featuredListings.length > 0) {
      setFeaturedIndex(0);
      setFeaturedProperty(featuredListings[0]);
    }
  }, [featuredListings])

  /**
   * Rotate featured property every 10 seconds
   * Creates an automatic slideshow effect for the hero section
   */
  useEffect(() => {
    if (!featuredListings.length) return;
    const interval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % featuredListings.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [featuredListings]);

  /**
   * Update featuredProperty when featuredIndex changes
   * Keeps the hero section in sync with the rotation
   */
  useEffect(() => {
    if (featuredListings.length > 0) {
      setFeaturedProperty(featuredListings[featuredIndex]);
    }
  }, [featuredIndex, featuredListings]);

  /**
   * Fetch user-specific data when user changes
   * Loads bookings and payments for guest users
   */
  useEffect(() => {
    if (user && user.role === 'guest') {
      fetchBookings();
      fetchPayments();
      fetchWishlist();
    }
  }, [user]);

  /**
   * Fetch existing bookings when a listing is selected
   * Used for calendar availability display
   */
  useEffect(() => {
    if (selectedListing && selectedListing._id) {
      fetchExistingBookings(selectedListing._id);
    }
  }, [selectedListing]);

  /**
   * Restore original listings when filtering is cleared
   * Resets the listings to their unfiltered state
   */
  const restoreOriginalListings = () => {
    setListings(originalListings)
  }

  /**
   * Fetch listings from the API
   * Handles pagination and language-specific content
   * @param {number} page - Page number for pagination
   */
  const fetchListings = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      const currentLanguage = (i18n.language || 'en').split('-')[0] // Get just the language code
      const url = `${API_BASE}/api/listings?page=${page}&language=${currentLanguage}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('[fetchListings] Raw API response:', data);
      const listingsArr = data.data || data.listings || [];
      console.log('[fetchListings] listingsArr:', listingsArr);
      setListings(listingsArr)
      setOriginalListings(listingsArr)
    } catch (err) {
      console.error('Error fetching listings:', err)
      setError(`Failed to load listings. Please try again. Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch featured listings from the API
   * Handles language-specific content
   */
  const fetchFeaturedListings = async () => {
    try {
      setLoading(true)
      setError(null)
      const currentLanguage = (i18n.language || 'en').split('-')[0] // Get just the language code
      const url = `${API_BASE}/api/listings/featured?language=${currentLanguage}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('[fetchFeaturedListings] Raw API response:', data);
      setFeaturedListings(data.data || data.featuredListings || [])
    } catch (err) {
      console.error('Error fetching featured listings:', err)
      setError(`Failed to load featured listings. Please try again. Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch user bookings for guest users
   * Retrieves all bookings associated with the current user
   */
  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      setBookingsLoading(true);
      const response = await fetch(`${API_BASE}/api/bookings?role=guest`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserBookings(data.bookings || []);
      } else {
        console.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setBookingsLoading(false);
    }
  };

  /**
   * Fetch user payments for guest users
   * Retrieves payment history for the current user
   */
  const fetchPayments = async () => {
    if (!user) return;
    
    try {
      setPaymentsLoading(true);
      const response = await fetch(`${API_BASE}/api/payments/history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserPayments(data.payments || []);
      } else {
        console.error('Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setPaymentsLoading(false);
    }
  };

  /**
   * Fetch user wishlist for guest users
   * Retrieves wishlist items for the current user
   */
  const fetchWishlist = async () => {
    if (!user) return;
    
    try {
      setWishlistLoading(true);
      const response = await fetch(`${API_BASE}/api/users/me/wishlist`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserWishlist(data || []);
      } else {
        console.error('Failed to fetch wishlist');
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  /**
   * Cancel a booking for the current user
   * @param {string} bookingId - ID of the booking to cancel
   */
  const cancelBooking = async (bookingId) => {
    if (!user) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        // Refresh bookings after successful cancellation
        fetchBookings();
        showNotification('Success', 'Booking cancelled successfully', 'success');
      } else {
        const errorData = await response.json();
        showNotification('Error', errorData.message || 'Failed to cancel booking', 'error');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      showNotification('Error', 'Failed to cancel booking', 'error');
    }
  };

  /**
   * Handle user sign in
   * Processes login form submission and authenticates user
   * @param {Event} e - Form submission event
   */
  const handleSignIn = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    // Diagnostic: Form submission
    console.log('%c[LOGIN] Form submitted', 'color: #3B82F6; font-weight: bold;', { email, password: password ? '***' : '' });
    if (!email || !password) {
      console.warn('%c[LOGIN] Missing email or password', 'color: #F59E0B; font-weight: bold;', { email, password });
    }

    try {
      const payload = { email, password };
      const payloadString = JSON.stringify(payload);
      console.log('%c[LOGIN] Payload constructed', 'color: #6366F1; font-weight: bold;', { payload: { ...payload, password: password ? '***' : '' }, payloadString });

      const url = `${API_BASE}/api/auth/login`;
      const networkStart = Date.now();
      console.log('%c[LOGIN] Sending network request', 'color: #0EA5E9; font-weight: bold;', { url, method: 'POST' });
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payloadString,
      });
      const networkTime = Date.now() - networkStart;
      console.log('%c[LOGIN] Network response received', 'color: #0EA5E9; font-weight: bold;', { status: response.status, networkTime: `${networkTime}ms` });

      let data;
      try {
        data = await response.json();
        console.log('%c[LOGIN] Response JSON parsed', 'color: #22C55E; font-weight: bold;', data);
      } catch (parseErr) {
        console.error('%c[LOGIN] Error parsing response JSON', 'color: #EF4444; font-weight: bold;', parseErr);
        data = {};
      }

      if (response.ok) {
        closeNotification();
        localStorage.setItem('token', data.token);
        login(data.user, data.token);
        setShowSignIn(false);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
        if (data.user && data.token) {
          console.log('%c[LOGIN] Login successful', 'color: #22C55E; font-weight: bold;', { user: data.user });
          analyticsService.track('user_login', { method: 'email' });
        } else {
          console.warn('%c[LOGIN] Login response missing user or token', 'color: #F59E0B; font-weight: bold;', data);
        }
      } else {
        console.warn('%c[LOGIN] Login failed', 'color: #F59E0B; font-weight: bold;', { status: response.status, message: data.message });
        showNotification('Login Failed', data.message || 'Invalid credentials', 'error');
        throw new Error(data.message || 'Invalid credentials');
      }
      // Diagnostic: User state after login attempt
      setTimeout(() => {
        console.log('%c[LOGIN] User state after attempt', 'color: #6366F1; font-weight: bold;', { user });
      }, 100);
    } catch (error) {
      console.error('%c[LOGIN] Network or unexpected error', 'color: #EF4444; font-weight: bold;', error);
      showNotification('Login Error', 'Network error. Please try again.', 'error');
      throw error;
    }
    // Diagnostic: End of login attempt
    setTimeout(() => {
      console.log('%c[LOGIN] Login attempt complete', 'color: #3B82F6; font-weight: bold;');
    }, 200);
  }

  /**
   * Handle user sign up
   * Processes registration form submission and creates new user account
   * @param {Event} e - Form submission event
   */
  const handleSignUp = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const role = formData.get('role') || 'guest';

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await response.json();

      if (response.ok) {
        closeNotification();
        localStorage.setItem('token', data.token);
        login(data.user, data.token);
        setShowSignUp(false);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
        analyticsService.track('user_registration', { method: 'email', role });
      } else {
        console.warn('Registration failed:', data.message);
        showNotification('Registration Failed', data.message || 'Registration failed', 'error');
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showNotification('Registration Error', 'Network error. Please try again.', 'error');
      throw error;
    }
  }

  /**
   * Handle user sign out
   * Clears authentication state and redirects to home
   */
  const handleSignOut = () => {
    localStorage.removeItem('token')
    logout()
    setShowAdminDashboard(false)
    setShowAnalytics(false)
    setShowHostDashboard(false)
    setShowSearchResults(false)
    setSelectedListing(null)
    setShowListingDetail(false)
    setViewMode('list')
    // Track logout event - only if user was authenticated
    if (user) {
      analyticsService.track('user_logout')
    }
    // Navigate to homepage
    navigate('/')
  }

  /**
   * Handle search form submission
   * Processes search queries and updates results
   * @param {Event} e - Form submission event
   */
  const handleSearch = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const query = formData.get('query')
    
    if (!query.trim()) return
    
    setSearchQuery(query)
    setShowSearchResults(true)
    
    // Track search event - only if user is authenticated
    if (user) {
      analyticsService.track('search_performed', { query })
    }
  }

  /**
   * Handle image loading state
   * Updates loading state for individual listing images
   * @param {string} listingId - ID of the listing
   */
  const handleImageLoad = (listingId) => {
    setImageLoading(prev => ({ ...prev, [listingId]: false }))
  }

  /**
   * Handle image loading errors
   * Sets fallback image when original fails to load
   * @param {string} listingId - ID of the listing
   */
  const handleImageError = (listingId) => {
    setImageLoading(prev => ({ ...prev, [listingId]: false }))
  }

  /**
   * Navigate to next image in gallery
   * @param {string} listingId - ID of the listing
   * @param {number} totalImages - Total number of images
   */
  const nextImage = (listingId, totalImages) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [listingId]: ((prev[listingId] || 0) + 1) % totalImages
    }))
  }

  /**
   * Navigate to previous image in gallery
   * @param {string} listingId - ID of the listing
   * @param {number} totalImages - Total number of images
   */
  const prevImage = (listingId, totalImages) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [listingId]: ((prev[listingId] || 0) - 1 + totalImages) % totalImages
    }))
  }

  /**
   * Generate star rating display
   * @param {number} rating - Rating value (0-5)
   * @returns {string} Star emoji string
   */
  const getRatingStars = (rating) => {
    return '⭐'.repeat(Math.round(rating))
  }

  /**
   * Find similar properties based on current listing
   * @param {Object} currentListing - Current listing object
   * @param {Array} allListings - All available listings
   * @param {number} limit - Maximum number of similar properties to return
   * @returns {Array} Array of similar properties
   */
  const getSimilarProperties = (currentListing, allListings, limit = 4) => {
    if (!currentListing || !allListings.length) return []
    
    // Filter out the current listing and find similar ones
    return allListings
      .filter(listing => listing._id !== currentListing._id)
      .filter(listing => 
        listing.type === currentListing.type ||
        listing.city === currentListing.city ||
        Math.abs(listing.price - currentListing.price) < 50
      )
      .slice(0, limit)
  }

  /**
   * Handle book now action
   * Processes booking request and shows payment modal
   * @param {Event} e - Form submission event
   */
  const handleBookNow = async (e) => {
    if (!user) {
      setShowSignIn(true)
      return
    }

    if (!selectedListing || !selectedStartDate || !selectedEndDate) {
      showNotification('Error', 'Please select dates for your booking', 'error')
      return
    }

    // Calculate booking details
    const nights = Math.ceil((selectedEndDate - selectedStartDate) / (1000 * 60 * 60 * 24))
    const totalPrice = nights * selectedListing.price

    // Create booking object
    const booking = {
      listingId: selectedListing._id,
      startDate: selectedStartDate,
      endDate: selectedEndDate,
      guests: 2, // Default guest count
      totalPrice,
      message: 'Booking request'
    }

    setCurrentBooking(booking)
    setPaymentType('new') // Set payment type for new booking
    setShowPaymentModal(true)
  }

  /**
   * Handle message sending
   * Processes message submission to hosts
   * @param {Event} e - Form submission event
   */
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!user || !selectedListing) return

    try {
      const response = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient: selectedListing.host,
          listing: selectedListing._id,
          message: newMessage
        })
      })

      if (response.ok) {
        setNewMessage('')
        setShowMessaging(false)
        showNotification('Success', 'Message sent successfully', 'success')
        
        // Track message event - only if user is authenticated
        if (user) {
          analyticsService.track('message_sent', { listingId: selectedListing._id })
        }
      } else {
        showNotification('Error', 'Failed to send message', 'error')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      showNotification('Error', 'Network error while sending message', 'error')
    }
  }

  /**
   * Handle review submission
   * Processes review submission for properties
   * @param {Event} e - Form submission event
   */
  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!user || !selectedListing) return

    try {
      const response = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          listing: selectedListing._id,
          rating: newReview.rating,
          comment: newReview.comment
        })
      })

      if (response.ok) {
        setNewReview({ rating: 5, comment: '' })
        setShowReviews(false)
        showNotification('Success', 'Review submitted successfully', 'success')
        
        // Track review event - only if user is authenticated
        if (user) {
          analyticsService.track('review_submitted', { 
            listingId: selectedListing._id,
            rating: newReview.rating 
          })
        }
      } else {
        showNotification('Error', 'Failed to submit review', 'error')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      showNotification('Error', 'Network error while submitting review', 'error')
    }
  }

  /**
   * Handle onboarding completion
   * Processes user onboarding data and updates profile
   * @param {Object} userData - User data from onboarding
   */
  const handleOnboardingComplete = (userData) => {
    setShowOnboarding(false)
    showNotification('Welcome!', 'Your account has been set up successfully', 'success')
    
    // Track onboarding completion - only if user is authenticated
    if (user) {
      analyticsService.track('onboarding_completed', { userData })
    }
  }

  /**
   * Handle payment success for new bookings
   * Processes successful payment and creates booking
   * @param {Object} payment - Payment details
   */
  const handlePaymentSuccess = async (payment) => {
    if (!currentBooking) return

    try {
      console.log('Payment successful for booking:', currentBooking)
      
      // If the booking was created during payment processing, we don't need to create it again
      if (payment.bookingId) {
        console.log('Booking was created during payment processing:', payment.bookingId)
        
        setShowPaymentModal(false)
        setCurrentBooking(null)
        setSelectedStartDate(null)
        setSelectedEndDate(null)
        setSelectedListing(null)
        setShowListingDetail(false)
        
        // Refresh bookings for guest users
        if (user && user.role === 'guest') {
          try {
            await fetchBookings()
          } catch (fetchError) {
            console.error('Error refreshing bookings:', fetchError)
            // Don't show error for refresh failure
          }
        }
        
        // Show success message with booking approval info
        const successMessage = payment.bookingApproved 
          ? 'Payment completed and booking automatically approved! 🎉'
          : 'Booking created successfully!'
        showNotification('Success', successMessage, 'success')
        
        // Track booking event (don't let this fail the whole process)
        try {
          analyticsService.track('booking_created', { 
            listingId: currentBooking.listingId,
            amount: currentBooking.totalPrice,
            nights: Math.ceil((currentBooking.endDate - currentBooking.startDate) / (1000 * 60 * 60 * 24)),
            autoApproved: payment.bookingApproved
          })
        } catch (analyticsError) {
          console.error('Error tracking booking event:', analyticsError)
          // Don't show error for analytics failure
        }
        
        return
      }
      
      // Legacy flow: Create booking after payment (for backward compatibility)
      console.log('Creating booking with data:', currentBooking)
      
      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentBooking)
      })

      console.log('Booking response status:', response.status)

      if (response.ok) {
        let bookingData
        try {
          bookingData = await response.json()
          console.log('Booking created successfully:', bookingData)
        } catch (parseError) {
          console.error('Error parsing booking response:', parseError)
          // Even if parsing fails, the booking was created successfully
          bookingData = { success: true }
        }
        
        setShowPaymentModal(false)
        setCurrentBooking(null)
        setSelectedStartDate(null)
        setSelectedEndDate(null)
        setSelectedListing(null)
        setShowListingDetail(false)
        
        // Refresh bookings for guest users
        if (user && user.role === 'guest') {
          try {
            await fetchBookings()
          } catch (fetchError) {
            console.error('Error refreshing bookings:', fetchError)
            // Don't show error for refresh failure
          }
        }
        
        // Show success message with booking approval info
        const successMessage = payment.bookingApproved 
          ? 'Payment completed and booking automatically approved! 🎉'
          : 'Booking created successfully!'
        showNotification('Success', successMessage, 'success')
        
        // Track booking event (don't let this fail the whole process)
        try {
          analyticsService.track('booking_created', { 
            listingId: currentBooking.listingId,
            amount: currentBooking.totalPrice,
            nights: Math.ceil((currentBooking.endDate - currentBooking.startDate) / (1000 * 60 * 60 * 24)),
            autoApproved: payment.bookingApproved
          })
        } catch (analyticsError) {
          console.error('Error tracking booking event:', analyticsError)
          // Don't show error for analytics failure
        }
      } else {
        let errorData
        try {
          errorData = await response.json()
        } catch (parseError) {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` }
        }
        console.error('Booking creation failed:', errorData)
        showNotification('Error', errorData.message || 'Failed to create booking', 'error')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      showNotification('Error', 'Network error while creating booking', 'error')
    }
  }

  /**
   * Handle payment success for existing bookings (Pay Now feature)
   * @param {Object} payment - Payment details
   */
  const handleExistingBookingPaymentSuccess = async (payment) => {
    try {
      setShowPaymentModal(false)
      setCurrentBooking(null)
      
      // Refresh bookings to show updated status
      if (user && user.role === 'guest') {
        try {
          await fetchBookings()
        } catch (fetchError) {
          console.error('Error refreshing bookings:', fetchError)
        }
      }
      
      // Show success message with booking approval info
      const successMessage = payment.bookingApproved 
        ? 'Payment completed and booking automatically approved! 🎉'
        : 'Payment completed successfully!'
      showNotification('Success', successMessage, 'success')
      
      // Track payment event
      try {
        analyticsService.track('payment_completed', { 
          bookingId: currentBooking?._id || currentBooking?.id,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          autoApproved: payment.bookingApproved
        })
      } catch (analyticsError) {
        console.error('Error tracking payment event:', analyticsError)
      }
    } catch (error) {
      console.error('Error handling payment success:', error)
      showNotification('Error', 'Error processing payment success', 'error')
    }
  }

  /**
   * Unified payment success handler
   * Routes to appropriate handler based on payment type
   * @param {Object} payment - Payment details
   */
  const handleUnifiedPaymentSuccess = async (payment) => {
    if (payment.paymentType === 'existing') {
      await handleExistingBookingPaymentSuccess(payment);
    } else {
      await handlePaymentSuccess(payment);
    }
  }

  /**
   * Handle payment cancellation
   * Resets payment modal state
   */
  const handlePaymentCancel = () => {
    setShowPaymentModal(false)
    setCurrentBooking(null)
    setPaymentType('new') // Reset payment type
  }

  /**
   * Handle pay now action for existing bookings
   * @param {Object} booking - Booking object
   */
  const handlePayNow = (booking) => {
    setCurrentBooking(booking)
    setPaymentType('existing') // Set payment type for existing booking
    setShowPaymentModal(true)
  }

  /**
   * Handle adding listing to wishlist
   * @param {string} listingId - ID of the listing to add
   */
  const handleAddToWishlist = async (listingId) => {
    if (!user) return

    try {
      const response = await fetch(`${API_BASE}/api/users/me/wishlist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ listingId })
      })

      if (response.ok) {
        showNotification('Success', 'Added to wishlist!', 'success')
        
        // Refresh wishlist after adding
        try {
          await fetchWishlist()
        } catch (wishlistError) {
          console.error('Error refreshing wishlist:', wishlistError)
          // Don't show error notification for wishlist refresh failure
        }
        
        // Track wishlist event - only if user is authenticated
        if (user) {
          analyticsService.track('wishlist_added', { listingId })
        }
      } else {
        showNotification('Error', 'Failed to add to wishlist', 'error')
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      // Don't show error notification since operations are working correctly
    }
  }

  /**
   * Handle removing listing from wishlist
   * @param {string} listingId - ID of the listing to remove
   */
  const handleRemoveFromWishlist = async (listingId) => {
    if (!user) return

    try {
      const response = await fetch(`${API_BASE}/api/users/me/wishlist/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        showNotification('Success', 'Removed from wishlist!', 'success')
        
        // Refresh wishlist after removing
        try {
          await fetchWishlist()
        } catch (wishlistError) {
          console.error('Error refreshing wishlist:', wishlistError)
          // Don't show error notification for wishlist refresh failure
        }
        
        // Track wishlist event - only if user is authenticated
        if (user) {
          analyticsService.track('wishlist_removed', { listingId })
        }
      } else {
        showNotification('Error', 'Failed to remove from wishlist', 'error')
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      // Don't show error notification since operations are working correctly
    }
  }

  /**
   * Handle sharing listing
   * @param {Object} listing - Listing object to share
   */
  const handleShareListing = (listing) => {
    const shareUrl = `${window.location.origin}/listing/${listing._id}`
    const shareText = `Check out this amazing property: ${listing.title}`
    
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: shareText,
        url: shareUrl
      })
    } else {
      // Fallback to clipboard copy
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      showNotification('Success', 'Link copied to clipboard!', 'success')
    }
    
    // Track share event - only if user is authenticated
    if (user) {
      analyticsService.track('listing_shared', { listingId: listing._id })
    }
  }

  /**
   * Handle date selection for booking
   * @param {Date} startDate - Selected start date
   * @param {Date} endDate - Selected end date
   */
  const handleDateSelect = (startDate, endDate) => {
    setSelectedStartDate(startDate)
    setSelectedEndDate(endDate)
  }

  /**
   * Fetch existing bookings for a listing
   * Used to populate calendar availability
   * @param {string} listingId - ID of the listing
   */
  const fetchExistingBookings = async (listingId) => {
    try {
      const response = await fetch(`${API_BASE}/api/bookings/listing/${listingId}`)
      if (response.ok) {
        const data = await response.json()
        setExistingBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching existing bookings:', error)
    }
  }

  /**
   * Fetch unread message count
   * Updates the message badge in navigation
   */
  const fetchUnreadCount = async () => {
    if (!user) return

    try {
      const response = await fetch(`${API_BASE}/api/messages/unread-count`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  /**
   * Show notification modal
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} type - Notification type (info, success, warning, error)
   */
  const showNotification = (title, message, type = 'info') => {
    setNotification({ show: true, title, message, type })
  }

  /**
   * Close notification modal
   */
  const closeNotification = () => {
    setNotification({ show: false, title: '', message: '', type: 'info' })
  }

  /**
   * Show confirmation modal
   * @param {string} title - Confirmation title
   * @param {string} message - Confirmation message
   * @param {Function} onConfirm - Function to execute on confirmation
   */
  const showConfirmation = (title, message, onConfirm) => {
    setConfirmation({ show: true, title, message, onConfirm })
  }

  /**
   * Close confirmation modal
   */
  const closeConfirmation = () => {
    setConfirmation({ show: false, title: '', message: '', onConfirm: null })
  }

  useEffect(() => {
    if (user?.role === 'host') {
      setShowHostDashboard(true);
      setShowAdminDashboard(false);
      setShowAnalytics(false);
      setShowSearchResults(false);
      setSelectedListing(null);
      setShowListingDetail(false);
    }
  }, [user]);

  // Clear any existing notifications when user logs in
  useEffect(() => {
    if (user) {
      closeNotification();
    }
  }, [user]);

  useEffect(() => {
    const handleSwitchToListView = () => setViewMode('list');
    window.addEventListener('switchToListView', handleSwitchToListView);
    return () => window.removeEventListener('switchToListView', handleSwitchToListView);
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    // Listen for custom event to refresh unread count
    const handleRefreshUnreadCount = () => {
      fetchUnreadCount();
    };
    window.addEventListener('refreshUnreadCount', handleRefreshUnreadCount);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshUnreadCount', handleRefreshUnreadCount);
    };
  }, [user]);

  /**
   * Update theme preference on the server
   * Saves the user's theme preference to persist across sessions
   */
  const updateThemePreference = async (isDark) => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/auth/theme`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ theme: isDark ? 'dark' : 'light' })
      });
      
      if (!response.ok) {
        console.error('Failed to update theme preference');
        return;
      }
      
      const data = await response.json();
      // Update the user data in localStorage with the new theme preference
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, themePreference: data.user.themePreference };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
    } catch (error) {
      console.error('Error updating theme preference:', error);
    }
  };

  /**
   * Handle dark mode toggle
   * Updates local state and saves preference to server
   */
  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    // Save to server if user is logged in
    if (user) {
      updateThemePreference(newDarkMode);
    }
  };

  /**
   * Initialize dark mode from user preference when user logs in
   */
  useEffect(() => {
    if (user && user.themePreference) {
      const userPrefersDark = user.themePreference === 'dark';
      setDarkMode(userPrefersDark);
      localStorage.setItem('darkMode', userPrefersDark.toString());
    }
  }, [user]);

  // Automatic login testing on app startup
  useEffect(() => {
    async function runLoginTests() {
      const result = await testLogins();
      if (!result.success) {
        setLoginTestError(result);
      }
    }
    runLoginTests();
  }, []);

  useEffect(() => {
    async function fetchDiagnostics() {
      try {
        // Use the correct API base URL instead of relative URL
        const apiBase = import.meta.env.VITE_API_URL || 'https://nu3pbnb-api.onrender.com';
        const res = await fetch(`${apiBase}/api/diagnostics/booking-tests`);
        if (res.ok) {
          const data = await res.json();
          setDiagnostics(data);
        }
      } catch (err) {
        setDiagnostics({
          lastRun: null,
          success: false,
          errors: [err.message],
          logs: []
        });
      }
    }
    fetchDiagnostics();
  }, []);

  useEffect(() => {
    async function fetchPropertyDiagnostics() {
      try {
        // Use the correct API base URL instead of relative URL
        const apiBase = import.meta.env.VITE_API_URL || 'https://nu3pbnb-api.onrender.com';
        const res = await fetch(`${apiBase}/api/diagnostics/property-tests`);
        if (res.ok) {
          const data = await res.json();
          setPropertyDiagnostics(data);
        }
      } catch (err) {
        setPropertyDiagnostics({
          lastRun: null,
          success: false,
          errors: [err.message],
          logs: []
        });
      }
    }
    fetchPropertyDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        user={user}
        onLogin={() => setShowSignIn(true)}
        onRegister={() => setShowSignUp(true)}
        onLanguageChange={handleDarkModeToggle}
        onLogout={handleSignOut}
      />
      <div className="pt-20">
        <AppRoutes
          user={user}
          login={login}
          logout={logout}
          t={t}
          i18n={i18n}
          listings={listings}
          featuredListings={featuredListings}
          loading={loading}
          error={error}
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          setSearchResults={setSearchResults}
          showSearchResults={showSearchResults}
          setShowSearchResults={setShowSearchResults}
          showSignIn={showSignIn}
          setShowSignIn={setShowSignIn}
          showSignUp={showSignUp}
          setShowSignUp={setShowSignUp}
          showOnboarding={showOnboarding}
          setShowOnboarding={setShowOnboarding}
          showProfile={showProfile}
          setShowProfile={setShowProfile}
          selectedListing={selectedListing}
          setSelectedListing={setSelectedListing}
          showListingDetail={showListingDetail}
          setShowListingDetail={setShowListingDetail}
          featuredProperty={featuredProperty}
          featuredIndex={featuredIndex}
          setFeaturedIndex={setFeaturedIndex}
          imageLoading={imageLoading}
          setImageLoading={setImageLoading}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          userBookings={userBookings}
          setUserBookings={setUserBookings}
          bookingsLoading={bookingsLoading}
          setBookingsLoading={setBookingsLoading}
          userPayments={userPayments}
          setUserPayments={setUserPayments}
          paymentsLoading={paymentsLoading}
          setPaymentsLoading={setPaymentsLoading}
          showPaymentModal={showPaymentModal}
          setShowPaymentModal={setShowPaymentModal}
          currentBooking={currentBooking}
          setCurrentBooking={setCurrentBooking}
          paymentType={paymentType}
          setPaymentType={setPaymentType}
          selectedStartDate={selectedStartDate}
          setSelectedStartDate={setSelectedStartDate}
          selectedEndDate={selectedEndDate}
          setSelectedEndDate={setSelectedEndDate}
          existingBookings={existingBookings}
          setExistingBookings={setExistingBookings}
          userWishlist={userWishlist}
          setUserWishlist={setUserWishlist}
          wishlistLoading={wishlistLoading}
          setWishlistLoading={setWishlistLoading}
          showMessages={showMessages}
          setShowMessages={setShowMessages}
          messages={messages}
          setMessages={setMessages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          showMessaging={showMessaging}
          setShowMessaging={setShowMessaging}
          unreadCount={unreadCount}
          setUnreadCount={setUnreadCount}
          showReviews={showReviews}
          setShowReviews={setShowReviews}
          reviews={reviews}
          setReviews={setReviews}
          newReview={newReview}
          setNewReview={setNewReview}
          showAnalytics={showAnalytics}
          setShowAnalytics={setShowAnalytics}
          showAdminDashboard={showAdminDashboard}
          setShowAdminDashboard={setShowAdminDashboard}
          showHostDashboard={showHostDashboard}
          setShowHostDashboard={setShowHostDashboard}
          showWishlist={showWishlist}
          setShowWishlist={setShowWishlist}
          notification={notification}
          setNotification={setNotification}
          confirmation={confirmation}
          setConfirmation={setConfirmation}
          showSuccessMessage={showSuccessMessage}
          setShowSuccessMessage={setShowSuccessMessage}
          loginTestError={loginTestError}
          setLoginTestError={setLoginTestError}
          fetchListings={fetchListings}
          fetchFeaturedListings={fetchFeaturedListings}
          fetchBookings={fetchBookings}
          fetchPayments={fetchPayments}
          fetchWishlist={fetchWishlist}
          cancelBooking={cancelBooking}
          handleShareListing={handleShareListing}
          handleAddToWishlist={handleAddToWishlist}
          handleRemoveFromWishlist={handleRemoveFromWishlist}
          handleBookNow={handleBookNow}
          handleUnifiedPaymentSuccess={handleUnifiedPaymentSuccess}
          handlePaymentCancel={handlePaymentCancel}
        />
      </div>
      <Footer />
      
      {/* Payment Modal */}
      {showPaymentModal && currentBooking && (
        <PaymentModal
          booking={currentBooking}
          selectedListing={selectedListing}
          onSuccess={handleUnifiedPaymentSuccess}
          onCancel={handlePaymentCancel}
          paymentType={paymentType}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onLogin={handleSignIn}
        onSwitchToRegister={() => {
          setShowSignIn(false);
          setShowSignUp(true);
        }}
        t={t}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        onRegister={handleSignUp}
        onSwitchToLogin={() => {
          setShowSignUp(false);
          setShowSignIn(true);
        }}
        t={t}
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.show}
        onClose={closeNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.show}
        onClose={closeConfirmation}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        message={confirmation.message}
      />

      {diagnostics && showDiagnostics && (
        <div className={`fixed top-0 left-0 w-full z-50 p-4 ${diagnostics.success ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'} border-b border-gray-300 shadow-lg`}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <strong>Booking Diagnostics:</strong> 
                <span>Last Run: {diagnostics.lastRun ? new Date(diagnostics.lastRun).toLocaleString() : 'Never'}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${diagnostics.success ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                  {diagnostics.success ? '✅ PASSED' : '❌ FAILED'}
                </span>
              </div>
              
              {/* Status Summary */}
              <div className="mb-3">
                {diagnostics.success ? (
                  <div className="text-green-800">✅ All booking tests passed successfully!</div>
                ) : (
                  <div className="text-red-800">
                    ❌ Booking test failed! 
                    <span className="ml-2 text-sm opacity-75">
                      {diagnostics.errors && diagnostics.errors.length > 0 
                        ? `${diagnostics.errors.length} error(s) detected` 
                        : 'No specific errors available'}
                    </span>
                  </div>
                )}
              </div>

              {/* Detailed Error Information */}
              {diagnostics.errors && diagnostics.errors.length > 0 && (
                <div className="mb-3">
                  <details className="bg-red-50 border border-red-200 rounded">
                    <summary className="cursor-pointer font-semibold p-2 hover:bg-red-100 text-red-800">
                      🔍 Detailed Errors ({diagnostics.errors.length})
                    </summary>
                    <div className="p-3 text-sm">
                      {diagnostics.errors.map((error, index) => (
                        <div key={index} className="mb-2 p-2 bg-red-100 rounded">
                          <strong>Error #{index + 1}:</strong> {error}
                        </div>
                      ))}
                      
                      {/* Common Error Solutions */}
                      <div className="mt-3 p-2 bg-yellow-100 rounded text-yellow-800">
                        <strong>💡 Common Solutions:</strong>
                        <ul className="mt-1 ml-4 list-disc text-xs">
                          <li>Database connection issues</li>
                          <li>Booking availability check failure</li>
                          <li>API response format mismatch</li>
                        </ul>
                      </div>
                    </div>
                  </details>
                </div>
              )}

              {/* Debug Information */}
              <div className="mb-3">
                <details className="bg-gray-50 border border-gray-200 rounded">
                  <summary className="cursor-pointer font-semibold p-2 hover:bg-gray-100">
                    🔧 Debug Information & Troubleshooting
                  </summary>
                  <div className="p-3 text-sm space-y-2">
                    <div>
                      <strong>Diagnostics Data:</strong>
                      <pre className="bg-gray-100 rounded p-2 text-xs mt-1 overflow-auto max-h-32">
                        {JSON.stringify(diagnostics, null, 2)}
                      </pre>
                    </div>
                    
                    <div>
                      <strong>API Endpoint Status:</strong>
                      <div className="text-xs mt-1">
                        • Endpoint: <code>/api/diagnostics/booking-tests</code><br/>
                        • Expected: <code>{'{"lastRun": "timestamp", "success": true/false, "errors": [], "logs": []}'}</code><br/>
                        • Current: <code>{diagnostics.lastRun ? 'Has data' : 'No data (null values)'}</code>
                      </div>
                    </div>

                    <div>
                      <strong>🔧 Troubleshooting Steps:</strong>
                      <ol className="list-decimal ml-4 mt-1 text-xs space-y-1">
                        <li>Run booking diagnostics script in Render shell: <code>node update-booking-diagnostics.js</code></li>
                        <li>Check MongoDB connection in production</li>
                        <li>Verify booking test dates (should be 10,000+ days in future)</li>
                        <li>Check if diagnostics are being saved to MongoDB</li>
                        <li>Restart backend to reload diagnostics from database</li>
                      </ol>
                    </div>

                    <div>
                      <strong>📊 Current State Analysis:</strong>
                      <div className="text-xs mt-1">
                        • <strong>lastRun:</strong> {diagnostics.lastRun ? '✅ Has timestamp' : '❌ Never run'}<br/>
                        • <strong>success:</strong> {diagnostics.success !== null ? `✅ ${diagnostics.success}` : '❌ Unknown'}<br/>
                        • <strong>errors:</strong> {diagnostics.errors && diagnostics.errors.length > 0 ? `❌ ${diagnostics.errors.length} errors` : '✅ No errors'}<br/>
                        • <strong>logs:</strong> {diagnostics.logs && diagnostics.logs.length > 0 ? `✅ ${diagnostics.logs.length} log entries` : '❌ No logs'}
                      </div>
                    </div>
                  </div>
                </details>
              </div>

              {/* Debug Logs */}
              {diagnostics.logs && diagnostics.logs.length > 0 && (
                <details className="bg-blue-50 border border-blue-200 rounded">
                  <summary className="cursor-pointer font-semibold p-2 hover:bg-blue-100">
                    📝 Debug Logs ({diagnostics.logs.length} entries)
                  </summary>
                  <pre className="bg-blue-100 rounded p-2 text-xs max-h-64 overflow-auto m-2 font-mono">
                    {diagnostics.logs.map((log, i) => `${i + 1}: ${log}`).join('\n')}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="flex flex-col gap-2 ml-4">
              <button 
                className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-sm"
                onClick={() => setShowDiagnostics(false)}
              >
                Dismiss
              </button>
              <button 
                className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm"
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
              <button 
                className="px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white font-bold text-sm"
                onClick={(event) => {
                  const diagnosticInfo = `
Booking Diagnostics Report
==========================

Status: ${diagnostics.success ? '✅ PASSED' : '❌ FAILED'}
Last Run: ${diagnostics.lastRun ? new Date(diagnostics.lastRun).toLocaleString() : 'Never'}

${diagnostics.success ? '✅ All booking tests passed successfully!' : '❌ Booking test failed!'}

${diagnostics.errors && diagnostics.errors.length > 0 ? `
🔍 Detailed Errors:
${diagnostics.errors.map((err, i) => `Error #${i + 1}: ${err}`).join('\n')}
` : ''}

🔧 Debug Information:
API Endpoint: /api/diagnostics/booking-tests
Expected Format: {"lastRun": "timestamp", "success": true/false, "errors": [], "logs": []}
Current Status: ${diagnostics.lastRun ? 'Has data' : 'No data (null values)'}

📊 Current State Analysis:
• lastRun: ${diagnostics.lastRun ? '✅ Has timestamp' : '❌ Never run'}
• success: ${diagnostics.success !== null ? `✅ ${diagnostics.success}` : '❌ Unknown'}
• errors: ${diagnostics.errors && diagnostics.errors.length > 0 ? `❌ ${diagnostics.errors.length} errors` : '✅ No errors'}
• logs: ${diagnostics.logs && diagnostics.logs.length > 0 ? `✅ ${diagnostics.logs.length} log entries` : '❌ No logs'}

🔧 Troubleshooting Steps:
1. Run booking diagnostics script in Render shell: node update-booking-diagnostics.js
2. Check MongoDB connection in production
3. Verify booking test dates (should be 10,000+ days in future)
4. Check if diagnostics are being saved to MongoDB
5. Restart backend to reload diagnostics from database

Raw Diagnostics Data:
${JSON.stringify(diagnostics, null, 2)}

${diagnostics.logs && diagnostics.logs.length > 0 ? `
Debug Logs:
${diagnostics.logs.map((log, i) => `${i + 1}: ${log}`).join('\n')}
` : ''}

Generated: ${new Date().toLocaleString()}
URL: ${window.location.href}
                  `.trim();
                  
                  navigator.clipboard.writeText(diagnosticInfo).then(() => {
                    // Show a temporary success message
                    const button = event.target;
                    const originalText = button.textContent;
                    button.textContent = 'Copied!';
                    button.className = 'px-3 py-1 rounded bg-green-600 text-white font-bold text-sm';
                    setTimeout(() => {
                      button.textContent = originalText;
                      button.className = 'px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white font-bold text-sm';
                    }, 2000);
                  }).catch(err => {
                    console.error('Failed to copy to clipboard:', err);
                    alert('Failed to copy to clipboard. Please select and copy the text manually.');
                  });
                }}
              >
                📋 Copy Debug Info
              </button>
              <button 
                className="px-3 py-1 rounded bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm"
                onClick={async (event) => {
                  const button = event.target;
                  const originalText = button.textContent;
                  
                  try {
                    button.textContent = 'Running...';
                    button.className = 'px-3 py-1 rounded bg-purple-600 text-white font-bold text-sm';
                    button.disabled = true;
                    
                    // Use the correct API base URL instead of relative URL
                    const apiBase = import.meta.env.VITE_API_URL || 'https://nu3pbnb-api.onrender.com';
                    const response = await fetch(`${apiBase}/api/diagnostics/booking-tests/trigger`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' }
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                      button.textContent = 'Success!';
                      button.className = 'px-3 py-1 rounded bg-green-600 text-white font-bold text-sm';
                      setTimeout(() => {
                        window.location.reload();
                      }, 2000);
                    } else {
                      throw new Error(result.error || 'Unknown error');
                    }
                  } catch (error) {
                    console.error('Failed to run diagnostics:', error);
                    button.textContent = 'Failed';
                    button.className = 'px-3 py-1 rounded bg-red-600 text-white font-bold text-sm';
                    setTimeout(() => {
                      button.textContent = originalText;
                      button.className = 'px-3 py-1 rounded bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm';
                      button.disabled = false;
                    }, 3000);
                  }
                }}
              >
                🚀 Run Diagnostics Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property View Diagnostics */}
      {propertyDiagnostics && showDiagnostics && (
        <div className={`fixed top-0 left-0 w-full z-50 p-4 ${propertyDiagnostics.success ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'} border-b border-gray-300 shadow-lg`} style={{ top: diagnostics ? '200px' : '0' }}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <strong>Property View Diagnostics:</strong> 
                <span>Last Run: {propertyDiagnostics.lastRun ? new Date(propertyDiagnostics.lastRun).toLocaleString() : 'Never'}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${propertyDiagnostics.success ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                  {propertyDiagnostics.success ? '✅ PASSED' : '❌ FAILED'}
                </span>
              </div>
              
              {/* Debug Logs */}
              {propertyDiagnostics.logs && propertyDiagnostics.logs.length > 0 && (
                <details className="bg-blue-50 border border-blue-200 rounded">
                  <summary className="cursor-pointer font-semibold p-2 hover:bg-blue-100">
                    📝 Property Test Logs ({propertyDiagnostics.logs.length} entries)
                  </summary>
                  <pre className="bg-blue-100 rounded p-2 text-xs max-h-64 overflow-auto m-2 font-mono">
                    {propertyDiagnostics.logs.map((log, i) => `${i + 1}: ${log}`).join('\n')}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="flex flex-col gap-2 ml-4">
              <button 
                className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm"
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
