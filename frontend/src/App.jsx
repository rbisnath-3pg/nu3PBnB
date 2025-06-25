import React from 'react'
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
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
import { FaEnvelope } from 'react-icons/fa'

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

function App() {
  // Authentication and internationalization
  const { user, login, logout } = useAuth()
  const { t, i18n } = useTranslation()
  
  // API configuration
  const API_BASE = '/api'

  // Core application state
  const [listings, setListings] = useState([])
  const [originalListings, setOriginalListings] = useState([]) // Store original listings for filtering
  const [featuredListings, setFeaturedListings] = useState([]) // Store featured listings separately
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'map'
  const [darkMode, setDarkMode] = useState(false)

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
      const currentLanguage = i18n.language || 'en'
      const url = `${API_BASE}/listings?page=${page}&language=${currentLanguage}`
      
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
      const currentLanguage = i18n.language || 'en'
      const url = `${API_BASE}/listings/featured?language=${currentLanguage}`
      
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
      const response = await fetch(`${API_BASE}/bookings?role=guest`, {
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
      const response = await fetch(`${API_BASE}/payments/history`, {
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
      const response = await fetch(`${API_BASE}/users/me/wishlist`, {
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
      const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
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
    e.preventDefault()
    const formData = new FormData(e.target)
    const email = formData.get('email')
    const password = formData.get('password')

    // Log the login attempt (mask password)
    console.log('[handleSignIn] Attempting login with:', { email, password: password ? '***' : '' });

    try {
      const payload = { email, password };
      console.log('[handleSignIn] Sending payload:', { ...payload, password: payload.password ? '***' : '' });
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      // Log the raw response status
      console.log('[handleSignIn] Response status:', response.status);
      let data;
      try {
        data = await response.json();
        console.log('[handleSignIn] Response JSON:', data);
      } catch (parseErr) {
        console.error('[handleSignIn] Error parsing response JSON:', parseErr);
        data = {};
      }

      if (response.ok) {
        closeNotification() // Clear any existing notifications first
        localStorage.setItem('token', data.token)
        login(data.user, data.token)
        setShowSignIn(false)
        setShowSuccessMessage(true)
        setTimeout(() => setShowSuccessMessage(false), 3000)
        // Track login event
        analyticsService.track('user_login', { method: 'email' })
      } else {
        showNotification('Login Failed', data.message || 'Invalid credentials', 'error')
      }
    } catch (error) {
      console.error('[handleSignIn] Login error:', error)
      showNotification('Login Error', 'Network error. Please try again.', 'error')
    }
  }

  /**
   * Handle user sign up
   * Processes registration form submission and creates new user account
   * @param {Event} e - Form submission event
   */
  const handleSignUp = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const name = formData.get('name')
    const email = formData.get('email')
    const password = formData.get('password')

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        closeNotification() // Clear any existing notifications first
        localStorage.setItem('token', data.token)
        login(data.user, data.token)
        setShowSignUp(false)
        setShowSuccessMessage(true)
        setTimeout(() => setShowSuccessMessage(false), 3000)
        
        // Track registration event
        analyticsService.track('user_registration', { method: 'email' })
      } else {
        showNotification('Registration Failed', data.message || 'Registration failed', 'error')
      }
    } catch (error) {
      console.error('Registration error:', error)
      showNotification('Registration Error', 'Network error. Please try again.', 'error')
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
    // Track logout event
    analyticsService.track('user_logout')
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
    
    // Track search event
    analyticsService.track('search_performed', { query })
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
      const response = await fetch(`${API_BASE}/messages`, {
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
        
        // Track message event
        analyticsService.track('message_sent', { listingId: selectedListing._id })
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
      const response = await fetch(`${API_BASE}/reviews`, {
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
        
        // Track review event
        analyticsService.track('review_submitted', { 
          listingId: selectedListing._id,
          rating: newReview.rating 
        })
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
    
    // Track onboarding completion
    analyticsService.track('onboarding_completed', { userData })
  }

  /**
   * Handle payment success for new bookings
   * Processes successful payment and creates booking
   * @param {Object} payment - Payment details
   */
  const handlePaymentSuccess = async (payment) => {
    if (!currentBooking) return

    try {
      console.log('Creating booking with data:', currentBooking)
      
      const response = await fetch(`${API_BASE}/bookings`, {
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
      const response = await fetch(`${API_BASE}/users/me/wishlist`, {
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
        
        // Track wishlist event
        analyticsService.track('wishlist_added', { listingId })
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
      const response = await fetch(`${API_BASE}/users/me/wishlist/${listingId}`, {
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
        
        // Track wishlist event
        analyticsService.track('wishlist_removed', { listingId })
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
    
    // Track share event
    analyticsService.track('listing_shared', { listingId: listing._id })
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
      const response = await fetch(`${API_BASE}/bookings/listing/${listingId}`)
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
      const response = await fetch(`${API_BASE}/messages/unread-count`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count || 0)
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

  return (
    <div className={darkMode ? 'dark bg-gray-950 min-h-screen' : 'bg-white min-h-screen'}>
      {/* Global Loading Spinner */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
          <Spinner text="Loading..." size={64} />
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1
                className="text-2xl font-bold text-blue-600 dark:text-blue-400 cursor-pointer"
                onClick={() => navigate('/')}
              >
                nu3PBnB
              </h1>
              <LanguageSwitcher />
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              {/* Back to All Properties button - show when listings are filtered */}
              {listings.length !== originalListings.length && originalListings.length > 0 && (
                <button
                  onClick={restoreOriginalListings}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ← {t('common.back')} {t('navigation.properties')}
                </button>
              )}
              {/* Login and Get Started buttons (only if not logged in) */}
              {!user && (
                <>
                  <button
                    onClick={() => setShowSignIn(true)}
                    className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold rounded-lg"
                  >
                    {t('auth.login.signIn')}
                  </button>
                  <button
                    onClick={() => setShowOnboarding(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                  >
                    {t('home.cta.getStarted')}
                  </button>
                </>
              )}
              {/* Sign Out button (only if logged in) */}
              {user && (
                <>
                  {/* Messages button with badge */}
                  <button
                    onClick={() => setShowMessaging(true)}
                    className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Messages"
                  >
                    <FaEnvelope className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}
                  </button>
                  {/* Wishlist button with badge */}
                  {user.role === 'guest' && (
                    <button
                      onClick={() => {
                        setShowWishlist(!showWishlist);
                        setShowSearchResults(false);
                        setSelectedListing(null);
                        setShowListingDetail(false);
                        setShowAdminDashboard(false);
                        setShowAnalytics(false);
                        setShowHostDashboard(false);
                        setViewMode('list');
                      }}
                      className={`relative p-2 rounded-lg transition-colors ${
                        showWishlist 
                          ? 'bg-pink-100 dark:bg-pink-800 text-pink-600 dark:text-pink-300' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                      title="Wishlist"
                    >
                      <span className="text-lg">❤️</span>
                      {userWishlist && userWishlist.length > 0 && (
                        <div className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                          {userWishlist.length > 99 ? '99+' : userWishlist.length}
                        </div>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => setShowProfile(true)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors mr-3"
                    title="Profile"
                  >
                    {user.profilePictureData ? (
                      <img
                        src={`/api/users/me/profile-picture?t=${Date.now()}`}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <span className="text-lg font-semibold" style={{ display: (user.profilePicture || user.profilePictureData) ? 'none' : 'block' }}>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold"
                  >
                    {t('common.logout')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Search Bar */}
      {!showAdminDashboard && (
        <div className="bg-gray-50 dark:bg-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SearchBar
              onSearch={(data) => {
                setSearchResults(data.data || []);
                setShowSearchResults(true);
              }}
              onFiltersChange={() => {}}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <AppRoutes
        user={user}
        loading={loading}
        error={error}
        showSearchResults={showSearchResults}
        setShowSearchResults={setShowSearchResults}
        showAdminDashboard={showAdminDashboard}
        setShowAdminDashboard={setShowAdminDashboard}
        showHostDashboard={showHostDashboard}
        setShowHostDashboard={setShowHostDashboard}
        showAnalytics={showAnalytics}
        setShowAnalytics={setShowAnalytics}
        showWishlist={showWishlist}
        setShowWishlist={setShowWishlist}
        viewMode={viewMode}
        featuredProperty={featuredProperty}
        featuredIndex={featuredIndex}
        listings={listings}
        searchResults={searchResults}
        featuredListings={featuredListings}
        t={t}
        setFeaturedIndex={setFeaturedIndex}
        handleShareListing={handleShareListing}
        handleAddToWishlist={handleAddToWishlist}
        setSelectedListing={setSelectedListing}
        setShowListingDetail={setShowListingDetail}
        setShowOnboarding={setShowOnboarding}
        setShowSignIn={setShowSignIn}
        setViewMode={setViewMode}
        userBookings={userBookings}
        bookingsLoading={bookingsLoading}
        fetchBookings={fetchBookings}
        cancelBooking={cancelBooking}
        userPayments={userPayments}
        paymentsLoading={paymentsLoading}
        fetchPayments={fetchPayments}
        userWishlist={userWishlist}
        wishlistLoading={wishlistLoading}
        fetchWishlist={fetchWishlist}
        handleRemoveFromWishlist={handleRemoveFromWishlist}
        fetchListings={fetchListings}
      />

      {/* Listing Detail Modal */}
      {showListingDetail && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedListing.title}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => handleShareListing(selectedListing)}
                  >
                    🔗 Share
                  </button>
                  <button
                    onClick={() => setShowListingDetail(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  {selectedListing.photos && selectedListing.photos.length > 0 && (
                    <img
                      src={selectedListing.photos[0]}
                      alt={selectedListing.title}
                      className="w-full h-64 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop';
                      }}
                    />
                  )}
                </div>
                
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedListing.description}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    <strong>Location:</strong> {selectedListing.location}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    <strong>Price:</strong> ${selectedListing.price}/night
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    <strong>Guests:</strong> 4
                  </p>
                  {selectedListing.averageRating > 0 && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Rating:</strong> {getRatingStars(selectedListing.averageRating)} ({selectedListing.averageRating})
                    </p>
                  )}
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        if (!user) {
                          // If user is not logged in, prompt them to sign in
                          setShowSignIn(true);
                          return;
                        }
                        setShowReviews(true);
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      View Reviews
                    </button>
                    <button
                      onClick={() => {
                        if (!user) {
                          // If user is not logged in, prompt them to sign in
                          setShowSignIn(true);
                          return;
                        }
                        setShowMessaging(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Message Host
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Property Calendar for Date Selection */}
              <div className="mt-6">
                <PropertyCalendar
                  listingId={selectedListing._id}
                  onDateSelect={handleDateSelect}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  existingBookings={existingBookings}
                />
                
                {/* Book Now Button */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleBookNow}
                    disabled={!selectedStartDate || !selectedEndDate}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                  >
                    {selectedStartDate && selectedEndDate 
                      ? `Book Now - ${Math.ceil((selectedEndDate - selectedStartDate) / (1000 * 60 * 60 * 24))} nights`
                      : 'Select dates to book'
                    }
                  </button>
                </div>
              </div>

              {/* Similar Properties Section */}
              {(() => {
                const similarProperties = getSimilarProperties(selectedListing, listings)
                if (similarProperties.length > 0) {
                  return (
                    <div className="mt-8 border-t pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Similar properties you might like
                        </h3>
                        <button
                          onClick={() => {
                            // Filter listings to show similar ones in the main view
                            const similarIds = similarProperties.map(p => p._id)
                            const filteredListings = originalListings.filter(l => similarIds.includes(l._id))
                            setListings(filteredListings)
                            setShowListingDetail(false)
                            setShowSearchResults(false)
                          }}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          View all similar properties →
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {similarProperties.map((listing) => (
                          <div
                            key={listing._id}
                            className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => {
                              if (!user) {
                                // If user is not logged in, prompt them to sign in
                                setShowSignIn(true);
                                return;
                              }
                              setSelectedListing(listing)
                              // Keep the modal open but update the selected listing
                            }}
                          >
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
                              <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs font-medium">
                                ${listing.price}/night
                              </div>
                            </div>
                            <div className="p-3">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate">
                                {listing.title}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                {listing.location}
                              </p>
                              {listing.averageRating > 0 && (
                                <div className="text-yellow-500 text-xs">
                                  {getRatingStars(listing.averageRating)} ({listing.averageRating})
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                return null
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Sign In Modal */}
      {showSignIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sign In</h2>
              <button
                onClick={() => setShowSignIn(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSignIn}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sign Up Modal */}
      {showSignUp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sign Up</h2>
              <button
                onClick={() => setShowSignUp(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSignUp}>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <select
                name="role"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="guest">Guest</option>
                <option value="host">Host</option>
              </select>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Sign Up
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Messaging Component */}
      {showMessaging && (
        <Messaging
          isOpen={showMessaging}
          onClose={() => setShowMessaging(false)}
        />
      )}

      {/* Reviews Modal */}
      {showReviews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reviews</h2>
              <button
                onClick={() => setShowReviews(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating
                  </label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {[5, 4, 3, 2, 1].map(rating => (
                      <option key={rating} value={rating}>{rating} stars</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Write your review..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows="4"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Wizard */}
      {showOnboarding && (
        <OnboardingWizard
          onClose={() => setShowOnboarding(false)}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎉</span>
            <div>
              <h3 className="font-semibold">Welcome to nu3PBnB!</h3>
              <p className="text-sm">Your account has been created successfully.</p>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="text-white hover:text-green-100"
            >
              ×
            </button>
          </div>
        </div>
      )}

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

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h2>
                <button
                  onClick={() => setShowProfile(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
                >
                  ✕
                </button>
              </div>
              <UserProfile />
            </div>
          </div>
        </div>
      )}

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

      {/* Confirmation Modal */}
      {confirmation.show && (
        <ConfirmationModal
          isOpen={confirmation.show}
          onClose={closeConfirmation}
          onConfirm={confirmation.onConfirm}
          title={confirmation.title}
          message={confirmation.message}
          type="warning"
          confirmText="Cancel Booking"
          cancelText="Keep Booking"
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App
