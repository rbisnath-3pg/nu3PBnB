/**
 * Nu3PBnB API Client
 * A complete JavaScript client for the Nu3PBnB API
 */

class Nu3PBnBAPI {
  constructor(apiKey, baseURL = 'http://localhost:3000/api') {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.userToken = null;
  }

  /**
   * Make an API request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add user token if available
    if (this.userToken) {
      config.headers['Authorization'] = `Bearer ${this.userToken}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  /**
   * Set user authentication token
   */
  setUserToken(token) {
    this.userToken = token;
  }

  /**
   * Clear user authentication token
   */
  clearUserToken() {
    this.userToken = null;
  }

  // ===== AUTHENTICATION METHODS =====

  /**
   * Register a new user
   */
  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (data.token) {
      this.setUserToken(data.token);
    }
    
    return data;
  }

  /**
   * Login user
   */
  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (data.token) {
      this.setUserToken(data.token);
    }
    
    return data;
  }

  /**
   * Get user profile
   */
  async getProfile() {
    return this.request('/auth/profile');
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // ===== LISTINGS METHODS =====

  /**
   * Get all listings with optional filters
   */
  async getListings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/listings?${queryString}` : '/listings';
    return this.request(endpoint);
  }

  /**
   * Get a specific listing by ID
   */
  async getListing(id) {
    return this.request(`/listings/${id}`);
  }

  /**
   * Create a new listing (requires host role)
   */
  async createListing(listingData) {
    return this.request('/listings', {
      method: 'POST',
      body: JSON.stringify(listingData)
    });
  }

  /**
   * Update a listing (requires host role)
   */
  async updateListing(id, listingData) {
    return this.request(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listingData)
    });
  }

  /**
   * Delete a listing (requires host role)
   */
  async deleteListing(id) {
    return this.request(`/listings/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Search listings
   */
  async searchListings(searchParams) {
    const queryString = new URLSearchParams(searchParams).toString();
    return this.request(`/listings/search?${queryString}`);
  }

  /**
   * Get popular listings
   */
  async getPopularListings() {
    return this.request('/listings/popular');
  }

  // ===== BOOKINGS METHODS =====

  /**
   * Get user bookings
   */
  async getBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/bookings?${queryString}` : '/bookings';
    return this.request(endpoint);
  }

  /**
   * Create a booking request
   */
  async createBooking(bookingData) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  /**
   * Update booking status
   */
  async updateBooking(id, status) {
    return this.request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(id) {
    return this.request(`/bookings/${id}`, {
      method: 'DELETE'
    });
  }

  // ===== REVIEWS METHODS =====

  /**
   * Get reviews for a listing
   */
  async getListingReviews(listingId) {
    return this.request(`/reviews/listing/${listingId}`);
  }

  /**
   * Create a review
   */
  async createReview(reviewData) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  /**
   * Update a review
   */
  async updateReview(id, reviewData) {
    return this.request(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData)
    });
  }

  /**
   * Delete a review
   */
  async deleteReview(id) {
    return this.request(`/reviews/${id}`, {
      method: 'DELETE'
    });
  }

  // ===== MESSAGES METHODS =====

  /**
   * Get user messages
   */
  async getMessages() {
    return this.request('/messages');
  }

  /**
   * Send a message
   */
  async sendMessage(messageData) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(id) {
    return this.request(`/messages/${id}/read`, {
      method: 'PUT'
    });
  }

  // ===== PAYMENTS METHODS =====

  /**
   * Get payment methods
   */
  async getPaymentMethods() {
    return this.request('/payments/methods');
  }

  /**
   * Process a payment
   */
  async processPayment(paymentData) {
    return this.request('/payments/process', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  /**
   * Get payment history
   */
  async getPaymentHistory() {
    return this.request('/payments/history');
  }
}

// ===== USAGE EXAMPLES =====

async function runExamples() {
  console.log('🚀 Nu3PBnB API Client Examples\n');

  // Initialize API client
  const api = new Nu3PBnBAPI('nu3pbnb_api_key_2024');

  try {
    // Example 1: Get all listings
    console.log('📋 Example 1: Getting all listings...');
    const listings = await api.getListings({ limit: 5 });
    console.log(`Found ${listings.listings.length} listings\n`);

    // Example 2: Search listings
    console.log('🔍 Example 2: Searching listings...');
    const searchResults = await api.searchListings({
      location: 'New York',
      maxPrice: 200
    });
    console.log(`Found ${searchResults.listings.length} listings in New York under $200\n`);

    // Example 3: Register a new user
    console.log('👤 Example 3: Registering a new user...');
    const newUser = await api.register({
      email: 'testuser@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'guest'
    });
    console.log(`Registered user: ${newUser.user.firstName} ${newUser.user.lastName}\n`);

    // Example 4: Get user profile
    console.log('👤 Example 4: Getting user profile...');
    const profile = await api.getProfile();
    console.log(`User profile: ${profile.user.email}\n`);

    // Example 5: Get a specific listing
    if (listings.listings.length > 0) {
      const firstListing = listings.listings[0];
      console.log('🏠 Example 5: Getting specific listing...');
      const listing = await api.getListing(firstListing._id);
      console.log(`Listing: ${listing.listing.title} - $${listing.listing.price}/night\n`);

      // Example 6: Get reviews for the listing
      console.log('⭐ Example 6: Getting listing reviews...');
      const reviews = await api.getListingReviews(firstListing._id);
      console.log(`Found ${reviews.reviews.length} reviews\n`);

      // Example 7: Create a booking (if user is logged in)
      console.log('📅 Example 7: Creating a booking request...');
      const booking = await api.createBooking({
        listingId: firstListing._id,
        checkIn: '2024-02-15',
        checkOut: '2024-02-20',
        guests: 2,
        totalPrice: 750,
        message: 'Looking forward to our stay!'
      });
      console.log(`Created booking: ${booking.booking.status}\n`);

      // Example 8: Send a message to the host
      console.log('💬 Example 8: Sending a message...');
      const message = await api.sendMessage({
        recipientId: firstListing.host._id,
        listingId: firstListing._id,
        content: 'Hi! I\'m interested in your property. Is it available for the dates I requested?'
      });
      console.log(`Message sent successfully\n`);

      // Example 9: Get user bookings
      console.log('📋 Example 9: Getting user bookings...');
      const userBookings = await api.getBookings();
      console.log(`User has ${userBookings.bookings.length} bookings\n`);

      // Example 10: Get payment methods
      console.log('💳 Example 10: Getting payment methods...');
      const paymentMethods = await api.getPaymentMethods();
      console.log(`Supported payment methods: ${paymentMethods.supportedMethods.join(', ')}\n`);
    }

    // Example 11: Get popular listings
    console.log('🔥 Example 11: Getting popular listings...');
    const popularListings = await api.getPopularListings();
    console.log(`Found ${popularListings.listings.length} popular listings\n`);

    console.log('✅ All examples completed successfully!');

  } catch (error) {
    console.error('❌ Error running examples:', error.message);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Nu3PBnBAPI;
}

// Run examples if this file is executed directly
if (typeof window === 'undefined') {
  runExamples();
} 