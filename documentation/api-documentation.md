# nu3PBnB - API Documentation

## 📋 Overview

This document provides comprehensive API documentation for the nu3PBnB application. **Updated June 2025 to include new content management, admin testing, analytics, and multilingual endpoints.**

## 🔗 Base URL

```
Development: http://localhost:3000/api
Production: https://api.nu3pbnb.com/api
```

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## 🏠 Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "guest"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "guest"
    },
    "token": "jwt_token"
  }
}
```

### POST /auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### POST /auth/logout
Logout user (invalidate token).

### GET /auth/profile
Get current user profile.

### PUT /auth/profile
Update user profile.

## 🏘️ Property Listings

### GET /listings
Get all property listings with filters.

**Query Parameters:**
- `location` - Search by location
- `checkIn` - Check-in date (YYYY-MM-DD)
- `checkOut` - Check-out date (YYYY-MM-DD)
- `guests` - Number of guests
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `page` - Page number
- `limit` - Items per page

### GET /listings/:id
Get specific property listing.

### POST /listings
Create new property listing (Host only).

**Request Body:**
```json
{
  "title": "Beautiful Beach House",
  "description": "Amazing ocean view",
  "price": 150,
  "location": {
    "address": "123 Beach St",
    "coordinates": [longitude, latitude]
  },
  "amenities": ["wifi", "parking", "pool"],
  "images": ["url1", "url2"]
}
```

### PUT /listings/:id
Update property listing.

### DELETE /listings/:id
Delete property listing.

## 📅 Bookings

### GET /bookings
Get user's bookings.

### POST /bookings
Create booking request.

**Request Body:**
```json
{
  "listingId": "listing_id",
  "checkIn": "2024-01-01",
  "checkOut": "2024-01-05",
  "guests": 2,
  "message": "Looking forward to staying!"
}
```

### PUT /bookings/:id/status
Update booking status (Host only).

**Request Body:**
```json
{
  "status": "approved" // or "rejected", "cancelled"
}
```

## 💳 Payments

### GET /payments
Get payment history.

### POST /payments
Process payment for booking.

**Request Body:**
```json
{
  "bookingId": "booking_id",
  "amount": 750,
  "paymentMethod": "credit_card",
  "cardDetails": {
    "number": "****",
    "expiry": "12/25",
    "cvv": "***"
  }
}
```

### GET /payments/:id/receipt
Generate payment receipt (PDF).

## 💬 Messaging

### GET /messages
Get user's messages.

### POST /messages
Send message.

**Request Body:**
```json
{
  "recipientId": "user_id",
  "subject": "Booking inquiry",
  "content": "Hello, I'm interested in your property"
}
```

### GET /messages/unread-count
Get unread message count.

### PUT /messages/:id/read
Mark message as read.

## 📝 Reviews

### GET /reviews/listing/:listingId
Get reviews for a listing.

### POST /reviews
Create review.

**Request Body:**
```json
{
  "listingId": "listing_id",
  "rating": 5,
  "comment": "Great stay, highly recommended!"
}
```

## 🎯 Content Management

### GET /content
Get all content (Admin only).

**Query Parameters:**
- `section` - Filter by section (hero, about, footer, etc.)
- `language` - Filter by language (en, fr, es)
- `page` - Page number
- `limit` - Items per page

### GET /content/:key
Get content by key and language.

**Query Parameters:**
- `language` - Language code (default: en)

### POST /content
Create new content (Admin only).

**Request Body:**
```json
{
  "key": "homepage_hero_title",
  "title": "Homepage Hero Title",
  "content": "Welcome to nu3PBnB",
  "type": "html",
  "section": "hero",
  "language": "en",
  "metadata": {
    "description": "Main hero title",
    "keywords": "homepage, hero"
  }
}
```

### PUT /content/:id
Update content (Admin only).

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "isActive": true,
  "comment": "Content update"
}
```

### DELETE /content/:id
Delete content (Admin only).

### GET /content/:id/history
Get content version history (Admin only).

### POST /content/:id/restore/:version
Restore content to previous version (Admin only).

## 📊 Analytics

### GET /analytics/dashboard
Get analytics dashboard data (Admin only).

### GET /analytics/bookings
Get booking analytics.

**Query Parameters:**
- `period` - Time period (daily, weekly, monthly, yearly)
- `startDate` - Start date
- `endDate` - End date

### GET /analytics/revenue
Get revenue analytics.

### GET /analytics/users
Get user analytics.

### GET /analytics/heartbeat
Get system health status.

## 👥 User Management

### GET /users
Get all users (Admin only).

### GET /users/:id
Get user profile.

### PUT /users/:id
Update user (Admin only).

### DELETE /users/:id
Delete user (Admin only).

### POST /users/:id/suspend
Suspend user (Admin only).

### POST /users/:id/activate
Activate user (Admin only).

## 🧪 Admin Testing

### GET /admin/test-results
Get automated test results (Admin only).

### GET /admin/test-results/:id
Get specific test run details (Admin only).

### POST /admin/run-tests
Trigger automated test run (Admin only).

### GET /admin/messages
Get admin messages (Admin only).

### POST /admin/messages
Send admin message (Admin only).

## 🚀 Onboarding

### POST /onboarding/complete
Mark onboarding as completed.

### POST /onboarding/theme
Set user theme preference.

**Request Body:**
```json
{
  "theme": "dark" // or "light"
}
```

## 🏠 Host Dashboard

### GET /host/dashboard
Get host dashboard data.

### GET /host/properties
Get host's properties.

### GET /host/bookings
Get host's booking requests.

### GET /host/earnings
Get host's earnings report.

## 🔍 Search and Discovery

### GET /api/search
Advanced property search.

**Query Parameters:**
- `q` - Search query
- `location` - Location filter
- `checkIn` - Check-in date
- `checkOut` - Check-out date
- `guests` - Number of guests
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `amenities` - Amenities filter (comma-separated)
- `propertyType` - Property type filter
- `sortBy` - Sort by (price, rating, distance)
- `sortOrder` - Sort order (asc, desc)

## ❤️ Wishlist

### GET /wishlist
Get user's wishlist.

### POST /wishlist
Add property to wishlist.

**Request Body:**
```json
{
  "listingId": "listing_id"
}
```

### DELETE /wishlist/:listingId
Remove property from wishlist.

## 📋 Feedback

### POST /feedback
Submit feedback.

**Request Body:**
```json
{
  "type": "bug", // or "feature", "general"
  "subject": "Issue with booking",
  "message": "Detailed description",
  "priority": "medium" // low, medium, high
}
```

## 🌐 Internationalization

### GET /locales/:language
Get translation file for specific language.

**Supported Languages:**
- `en` - English
- `fr` - French
- `es` - Spanish

## 🔧 Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_TOKEN` | Invalid or expired token |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `VALIDATION_ERROR` | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| `INTERNAL_ERROR` | Internal server error |

## 📝 Rate Limiting

- **General API**: 1000 requests per minute
- **Authentication**: 5 requests per minute
- **File Uploads**: 10 requests per minute
- **Admin Endpoints**: 100 requests per minute

## 🔒 Security Headers

All responses include security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## 📊 API Versioning

Current API version: `v1`

Version is included in the URL path: `/api/v1/endpoint`

## 🔄 Webhooks

### Available Webhooks

- `booking.created` - New booking created
- `booking.updated` - Booking status changed
- `payment.completed` - Payment processed
- `user.registered` - New user registered

### Webhook Format

```json
{
  "event": "booking.created",
  "timestamp": "2024-01-01T12:00:00Z",
  "data": {
    "bookingId": "booking_id",
    "guestId": "user_id",
    "listingId": "listing_id",
    "amount": 750
  }
}
```

## 📚 SDKs and Libraries

### JavaScript/Node.js
```bash
npm install nu3pbnb-sdk
```

### Python
```bash
pip install nu3pbnb-python
```

### PHP
```bash
composer require nu3pbnb/php-sdk
```

## 🔗 Related Documentation

- [Authentication Guide](./auth-guide.md)
- [Webhook Documentation](./webhooks.md)
- [SDK Documentation](./sdk-docs.md)
- [Rate Limiting Guide](./rate-limiting.md)

---

*Last Updated: June 2025*
*Version: 2.0 - Enhanced with Content Management, Admin Testing, Analytics, and Multilingual Endpoints* 