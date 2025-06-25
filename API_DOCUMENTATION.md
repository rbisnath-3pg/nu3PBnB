# Nu3PBnB API Documentation

## Overview

The Nu3PBnB API provides comprehensive access to our Airbnb-like platform for third-party integrations. This API allows you to manage listings, bookings, reviews, messages, and payments programmatically.

## Base URL

```
https://your-domain.com/api
```

## Authentication

### API Key Authentication

All API requests require an API key to be included in the request headers:

```
X-API-Key: your_api_key_here
```

Or using the Authorization header:

```
Authorization: Bearer your_api_key_here
```

### JWT Token Authentication

For user-specific operations, you'll need to authenticate users and include their JWT token:

```
Authorization: Bearer user_jwt_token_here
```

## Rate Limiting

- **100 requests per hour** per API key
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Maximum requests per hour
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error type",
  "message": "Human-readable error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "role": "guest"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "guest"
  },
  "token": "jwt_token_here"
}
```

#### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "guest"
  },
  "token": "jwt_token_here"
}
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer user_jwt_token
```

#### Update User Profile
```http
PUT /api/auth/profile
Authorization: Bearer user_jwt_token
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "bio": "Travel enthusiast"
}
```

### Listings

#### Get All Listings
```http
GET /api/listings?page=1&limit=10&location=New York&minPrice=50&maxPrice=200&guests=2
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 50)
- `location` - Search by city, state, or country
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `guests` - Minimum guest capacity
- `amenities` - Comma-separated list of amenities
- `sortBy` - Sort field (createdAt, price, rating)
- `sortOrder` - Sort order (asc, desc)

#### Get Specific Listing
```http
GET /api/listings/{listing_id}
```

#### Create Listing (Host Only)
```http
POST /api/listings
Authorization: Bearer host_jwt_token
```

**Request Body:**
```json
{
  "title": "Cozy Downtown Apartment",
  "description": "Beautiful apartment in the heart of the city",
  "price": 150,
  "location": {
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  },
  "maxGuests": 4,
  "bedrooms": 2,
  "bathrooms": 1,
  "amenities": ["wifi", "kitchen", "parking"],
  "images": ["url1", "url2"]
}
```

#### Update Listing (Host Only)
```http
PUT /api/listings/{listing_id}
Authorization: Bearer host_jwt_token
```

#### Delete Listing (Host Only)
```http
DELETE /api/listings/{listing_id}
Authorization: Bearer host_jwt_token
```

#### Search Listings
```http
GET /api/listings/search?q=apartment&location=NYC&minPrice=100&maxPrice=300&guests=2
```

#### Get Popular Listings
```http
GET /api/listings/popular
```

### Bookings

#### Get User Bookings
```http
GET /api/bookings?status=pending&role=guest
Authorization: Bearer user_jwt_token
```

**Query Parameters:**
- `status` - Filter by booking status (pending, confirmed, cancelled, completed)
- `role` - Filter by user role (guest, host)

#### Create Booking Request
```http
POST /api/bookings
Authorization: Bearer user_jwt_token
```

**Request Body:**
```json
{
  "listingId": "listing_id",
  "checkIn": "2024-01-15",
  "checkOut": "2024-01-20",
  "guests": 2,
  "totalPrice": 750,
  "message": "Looking forward to our stay!"
}
```

#### Update Booking Status
```http
PUT /api/bookings/{booking_id}
Authorization: Bearer user_jwt_token
```

**Request Body:**
```json
{
  "status": "confirmed"
}
```

#### Cancel Booking
```http
DELETE /api/bookings/{booking_id}
Authorization: Bearer user_jwt_token
```

### Reviews

#### Get Listing Reviews
```http
GET /api/reviews/listing/{listing_id}
```

#### Create Review
```http
POST /api/reviews
Authorization: Bearer user_jwt_token
```

**Request Body:**
```json
{
  "listingId": "listing_id",
  "rating": 5,
  "comment": "Excellent stay! Highly recommended."
}
```

#### Update Review
```http
PUT /api/reviews/{review_id}
Authorization: Bearer user_jwt_token
```

#### Delete Review
```http
DELETE /api/reviews/{review_id}
Authorization: Bearer user_jwt_token
```

### Messages

#### Get User Messages
```http
GET /api/messages
Authorization: Bearer user_jwt_token
```

#### Send Message
```http
POST /api/messages
Authorization: Bearer user_jwt_token
```

**Request Body:**
```json
{
  "recipientId": "recipient_user_id",
  "listingId": "listing_id",
  "content": "Hi! I'm interested in your property."
}
```

#### Mark Message as Read
```http
PUT /api/messages/{message_id}/read
Authorization: Bearer user_jwt_token
```

### Payments

#### Get Payment Methods
```http
GET /api/payments/methods
Authorization: Bearer user_jwt_token
```

#### Process Payment
```http
POST /api/payments/process
Authorization: Bearer user_jwt_token
```

**Request Body:**
```json
{
  "bookingId": "booking_id",
  "amount": 750.00,
  "paymentMethod": "card",
  "currency": "USD"
}
```

#### Get Payment History
```http
GET /api/payments/history
Authorization: Bearer user_jwt_token
```

### Wishlist

#### Get Current User Wishlist
```http
GET /api/users/me/wishlist
Authorization: Bearer user_jwt_token
```

#### Add Listing to Wishlist
```http
POST /api/users/me/wishlist
Authorization: Bearer user_jwt_token
```
**Request Body:**
```json
{
  "listingId": "listing_id"
}
```

#### Remove Listing from Wishlist
```http
DELETE /api/users/me/wishlist/{listingId}
Authorization: Bearer user_jwt_token
```

#### Get Any User Wishlist (Third-Party API)
```http
GET /api/users/{user_id}/wishlist
X-API-Key: your_api_key
```

#### Add Listing to Any User Wishlist (Third-Party API)
```http
POST /api/users/{user_id}/wishlist
X-API-Key: your_api_key
```
**Request Body:**
```json
{
  "listingId": "listing_id"
}
```

#### Remove Listing from Any User Wishlist (Third-Party API)
```http
DELETE /api/users/{user_id}/wishlist/{listingId}
X-API-Key: your_api_key
```

## Data Models

### User
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "guest|host|admin",
  "phone": "+1234567890",
  "bio": "User bio",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Listing
```json
{
  "id": "listing_id",
  "host": {
    "id": "host_id",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com"
  },
  "title": "Cozy Downtown Apartment",
  "description": "Beautiful apartment description",
  "price": 150,
  "location": {
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  },
  "maxGuests": 4,
  "bedrooms": 2,
  "bathrooms": 1,
  "amenities": ["wifi", "kitchen", "parking"],
  "images": ["image_url1", "image_url2"],
  "averageRating": 4.5,
  "reviewCount": 12,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Booking
```json
{
  "id": "booking_id",
  "listing": {
    "id": "listing_id",
    "title": "Cozy Downtown Apartment",
    "images": ["image_url"],
    "location": {
      "city": "New York",
      "state": "NY"
    },
    "price": 150
  },
  "guest": {
    "id": "guest_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  },
  "host": {
    "id": "host_id",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com"
  },
  "checkIn": "2024-01-15T00:00:00.000Z",
  "checkOut": "2024-01-20T00:00:00.000Z",
  "guests": 2,
  "totalPrice": 750,
  "status": "pending|confirmed|cancelled|completed",
  "message": "Booking message",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Review
```json
{
  "id": "review_id",
  "listing": "listing_id",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe"
  },
  "rating": 5,
  "comment": "Excellent stay!",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Message
```json
{
  "id": "message_id",
  "sender": {
    "id": "sender_id",
    "firstName": "John",
    "lastName": "Doe"
  },
  "recipient": {
    "id": "recipient_id",
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "listing": {
    "id": "listing_id",
    "title": "Cozy Downtown Apartment"
  },
  "content": "Message content",
  "read": false,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## SDK Examples

### JavaScript/Node.js

```javascript
class Nu3PBnBAPI {
  constructor(apiKey, baseURL = 'https://your-domain.com/api') {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

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

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // Authentication
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  // Listings
  async getListings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/listings?${queryString}`);
  }

  async getListing(id) {
    return this.request(`/listings/${id}`);
  }

  async createListing(listingData, token) {
    return this.request('/listings', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(listingData)
    });
  }

  // Bookings
  async getBookings(params = {}, token) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/bookings?${queryString}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  async createBooking(bookingData, token) {
    return this.request('/bookings', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(bookingData)
    });
  }

  // Reviews
  async getListingReviews(listingId) {
    return this.request(`/reviews/listing/${listingId}`);
  }

  async createReview(reviewData, token) {
    return this.request('/reviews', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(reviewData)
    });
  }
}

// Usage example
const api = new Nu3PBnBAPI('your_api_key_here');

// Get listings
const listings = await api.getListings({ location: 'New York', maxPrice: 200 });

// Register user
const user = await api.register({
  email: 'user@example.com',
  password: 'password',
  firstName: 'John',
  lastName: 'Doe'
});

// Login
const loginResult = await api.login({
  email: 'user@example.com',
  password: 'password'
});

// Create booking with user token
const booking = await api.createBooking({
  listingId: 'listing_id',
  checkIn: '2024-01-15',
  checkOut: '2024-01-20',
  guests: 2,
  totalPrice: 750
}, loginResult.token);
```

### Python

```python
import requests
import json

class Nu3PBnBAPI:
    def __init__(self, api_key, base_url='https://your-domain.com/api'):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'X-API-Key': api_key,
            'Content-Type': 'application/json'
        })

    def request(self, endpoint, method='GET', data=None, token=None):
        url = f"{self.base_url}{endpoint}"
        headers = {}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        response = self.session.request(
            method=method,
            url=url,
            headers=headers,
            json=data
        )
        
        response.raise_for_status()
        return response.json()

    def get_listings(self, params=None):
        query_string = '&'.join([f"{k}={v}" for k, v in (params or {}).items()])
        endpoint = f"/listings?{query_string}" if query_string else "/listings"
        return self.request(endpoint)

    def register(self, user_data):
        return self.request('/auth/register', method='POST', data=user_data)

    def login(self, credentials):
        return self.request('/auth/login', method='POST', data=credentials)

    def create_booking(self, booking_data, token):
        return self.request('/bookings', method='POST', data=booking_data, token=token)

# Usage example
api = Nu3PBnBAPI('your_api_key_here')

# Get listings
listings = api.get_listings({'location': 'New York', 'maxPrice': 200})

# Register user
user = api.register({
    'email': 'user@example.com',
    'password': 'password',
    'firstName': 'John',
    'lastName': 'Doe'
})

# Login
login_result = api.login({
    'email': 'user@example.com',
    'password': 'password'
})

# Create booking
booking = api.create_booking({
    'listingId': 'listing_id',
    'checkIn': '2024-01-15',
    'checkOut': '2024-01-20',
    'guests': 2,
    'totalPrice': 750
}, login_result['token'])
```

## Webhooks

Coming soon! We'll provide webhook support for real-time notifications about booking updates, new messages, and other events.

## Support

For API support and questions:
- Email: api-support@nu3pbnb.com
- Documentation: https://docs.nu3pbnb.com
- Status page: https://status.nu3pbnb.com

## Changelog

### v1.0.0 (Current)
- Initial API release
- Authentication endpoints
- Listings management
- Booking system
- Reviews and ratings
- Messaging system
- Payment processing
- Rate limiting
- Comprehensive error handling 