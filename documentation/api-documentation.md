# nu3PBnB - API Documentation

## 📋 Overview

This document provides comprehensive API documentation for the nu3PBnB application. **Updated January 2025 to include React 19, enhanced content management, admin testing, analytics, multilingual endpoints, and advanced user experience features.**

## 🔗 Base URL

```
Development: http://localhost:3000/api
Production: https://nu3pbnb-api.onrender.com/api
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
      "role": "guest",
      "onboardingCompleted": false
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

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "guest",
      "preferences": {
        "theme": "light",
        "language": "en",
        "notifications": true
      }
    },
    "token": "jwt_token"
  }
}
```

### POST /auth/logout
Logout user (invalidate token).

### GET /auth/profile
Get current user profile.

### PUT /auth/profile
Update user profile.

**Request Body:**
```json
{
  "name": "John Doe",
  "profile": {
    "bio": "Travel enthusiast",
    "phone": "+1234567890",
    "location": "New York, NY"
  },
  "preferences": {
    "theme": "dark",
    "language": "fr",
    "notifications": true
  }
}
```

### POST /auth/profile-picture
Upload profile picture.

**Request:** Multipart form data with image file.

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
- `type` - Property type (apartment, house, villa, cabin)
- `amenities` - Comma-separated amenities
- `page` - Page number
- `limit` - Items per page
- `language` - Content language (en, fr, es)

### GET /listings/featured
Get featured property listings.

**Query Parameters:**
- `language` - Content language (en, fr, es)

### GET /listings/:id
Get specific property listing.

### POST /listings
Create new property listing (Host only).

**Request Body:**
```json
{
  "title": "Beautiful Beach House",
  "description": "Amazing ocean view with private pool",
  "price": 150,
  "location": {
    "address": "123 Beach St",
    "coordinates": [longitude, latitude],
    "city": "Miami",
    "state": "FL",
    "country": "USA",
    "zipCode": "33101"
  },
  "type": "house",
  "maxGuests": 6,
  "bedrooms": 3,
  "bathrooms": 2,
  "amenities": ["wifi", "parking", "pool", "kitchen"],
  "photos": ["url1", "url2"]
}
```

### PUT /listings/:id
Update property listing.

### DELETE /listings/:id
Delete property listing.

### POST /listings/:id/photos
Upload property photos.

**Request:** Multipart form data with image files.

## 📅 Bookings

### GET /bookings
Get user's bookings.

**Query Parameters:**
- `role` - User role (guest/host)
- `status` - Booking status filter
- `page` - Page number
- `limit` - Items per page

### POST /bookings
Create booking request.

**Request Body:**
```json
{
  "listingId": "listing_id",
  "checkIn": "2024-01-01",
  "checkOut": "2024-01-05",
  "guests": 2,
  "totalPrice": 600,
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

### DELETE /bookings/:id
Cancel booking (Guest only).

### GET /bookings/listing/:listingId
Get bookings for a specific listing.

## 💳 Payments

### GET /payments/history
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

### POST /payments/:id/refund
Process refund.

**Request Body:**
```json
{
  "refundAmount": 750,
  "refundReason": "Guest cancellation"
}
```

## 💬 Messaging

### GET /messages
Get user's messages.

**Query Parameters:**
- `conversationId` - Filter by conversation
- `unread` - Show only unread messages
- `page` - Page number
- `limit` - Items per page

### POST /messages
Send message.

**Request Body:**
```json
{
  "recipientId": "user_id",
  "listingId": "listing_id",
  "subject": "Question about the property",
  "content": "Hi, I have a question about the check-in time.",
  "attachments": []
}
```

### POST /messages/:id/attachments
Upload message attachments.

**Request:** Multipart form data with files.

### PUT /messages/:id/read
Mark message as read.

### GET /messages/unread-count
Get unread message count.

### DELETE /messages/:id
Delete message.

## ⭐ Reviews

### GET /reviews/listing/:listingId
Get reviews for a listing.

### POST /reviews
Create review.

**Request Body:**
```json
{
  "listingId": "listing_id",
  "bookingId": "booking_id",
  "rating": 5,
  "comment": "Amazing stay! Highly recommended.",
  "categories": {
    "cleanliness": 5,
    "communication": 5,
    "checkIn": 5,
    "accuracy": 5,
    "location": 5,
    "value": 5
  }
}
```

### PUT /reviews/:id
Update review.

### DELETE /reviews/:id
Delete review.

## 👥 User Management

### GET /users
Get all users (Admin only).

**Query Parameters:**
- `role` - Filter by role
- `isActive` - Filter by active status
- `page` - Page number
- `limit` - Items per page

### GET /users/:id
Get specific user (Admin only).

### PUT /users/:id
Update user (Admin only).

### DELETE /users/:id
Delete user (Admin only).

### GET /users/me/wishlist
Get user's wishlist.

### POST /users/me/wishlist
Add item to wishlist.

**Request Body:**
```json
{
  "listingId": "listing_id",
  "notes": "Perfect for summer vacation",
  "category": "beach"
}
```

### DELETE /users/me/wishlist/:listingId
Remove item from wishlist.

### GET /users/me/activity
Get user activity history.

## 📝 Content Management

### GET /content
Get content items.

**Query Parameters:**
- `section` - Content section (hero, about, footer, etc.)
- `language` - Content language (en, fr, es)
- `isActive` - Filter by active status

### POST /content
Create content item.

**Request Body:**
```json
{
  "key": "hero_title",
  "title": "Hero Section Title",
  "content": "Welcome to nu3PBnB",
  "type": "text",
  "section": "hero",
  "language": "en",
  "metadata": {
    "author": "admin",
    "tags": ["hero", "title"],
    "seo": {
      "title": "Welcome to nu3PBnB",
      "description": "Find your perfect vacation rental",
      "keywords": ["vacation", "rental", "booking"]
    }
  }
}
```

### PUT /content/:id
Update content item.

### DELETE /content/:id
Delete content item.

### GET /content/:id/history
Get content version history.

### POST /content/:id/restore/:version
Restore content to specific version.

### POST /content/bulk
Bulk create/update content items.

**Request Body:**
```json
{
  "items": [
    {
      "key": "hero_title_en",
      "title": "Welcome to nu3PBnB",
      "content": "Find your perfect vacation rental",
      "type": "text",
      "section": "hero",
      "language": "en"
    },
    {
      "key": "hero_title_fr",
      "title": "Bienvenue sur nu3PBnB",
      "content": "Trouvez votre location de vacances parfaite",
      "type": "text",
      "section": "hero",
      "language": "fr"
    }
  ]
}
```

## 📊 Analytics

### GET /analytics/dashboard
Get analytics dashboard data.

**Query Parameters:**
- `period` - Time period (day, week, month, year)
- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "revenue": {
      "total": 15000,
      "growth": 12.5,
      "trend": "up"
    },
    "bookings": {
      "total": 150,
      "pending": 25,
      "completed": 120,
      "cancelled": 5
    },
    "users": {
      "total": 500,
      "new": 50,
      "active": 300
    },
    "properties": {
      "total": 100,
      "active": 85,
      "featured": 10
    }
  }
}
```

### GET /analytics/revenue
Get revenue analytics.

### GET /analytics/bookings
Get booking analytics.

### GET /analytics/users
Get user analytics.

### GET /analytics/properties
Get property analytics.

### POST /analytics/track
Track user activity.

**Request Body:**
```json
{
  "action": "page_view",
  "resource": "listing",
  "resourceId": "listing_id",
  "metadata": {
    "page": "/listings/123",
    "referrer": "google.com"
  }
}
```

## 🧪 Admin Testing

### GET /admin/test-results
Get automated test results.

**Query Parameters:**
- `status` - Filter by status (passed, failed, skipped)
- `testSuite` - Filter by test suite
- `page` - Page number
- `limit` - Items per page

### POST /admin/test-results/run
Run all tests manually.

### DELETE /admin/test-results
Clear all test results.

### DELETE /admin/test-results/:id
Delete specific test result.

### GET /admin/test-results/:id
Get detailed test result.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "test_result_id",
    "testSuite": "auth",
    "status": "passed",
    "duration": 1500,
    "coverage": {
      "statements": 95.5,
      "branches": 90.2,
      "functions": 92.1,
      "lines": 94.8
    },
    "results": {
      "total": 15,
      "passed": 15,
      "failed": 0,
      "skipped": 0
    },
    "output": "Test output...",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## 🎯 Onboarding

### GET /onboarding/progress
Get user onboarding progress.

### POST /onboarding/step
Complete onboarding step.

**Request Body:**
```json
{
  "step": "preferences",
  "data": {
    "interests": ["beach", "mountains", "city"],
    "travelStyle": "adventure",
    "budget": "medium"
  }
}
```

### POST /onboarding/complete
Complete onboarding process.

## 🔍 Search

### GET /search
Advanced search with filters.

**Query Parameters:**
- `q` - Search query
- `location` - Location filter
- `checkIn` - Check-in date
- `checkOut` - Check-out date
- `guests` - Number of guests
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `type` - Property type
- `amenities` - Amenities filter
- `sortBy` - Sort field (price, rating, distance)
- `sortOrder` - Sort order (asc, desc)
- `page` - Page number
- `limit` - Items per page

### GET /search/suggestions
Get search suggestions.

**Query Parameters:**
- `q` - Search query
- `type` - Suggestion type (location, amenity)

## 📱 Notifications

### GET /notifications
Get user notifications.

### POST /notifications
Create notification.

### PUT /notifications/:id/read
Mark notification as read.

### DELETE /notifications/:id
Delete notification.

## 🔧 System

### GET /health
System health check.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "uptime": 86400,
    "version": "2.0.0",
    "database": "connected",
    "memory": {
      "used": 512,
      "total": 1024
    }
  }
}
```

### GET /config
Get system configuration.

## 📄 Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_TOKEN` | Invalid or expired token |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `VALIDATION_ERROR` | Request validation failed |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `DUPLICATE_ENTRY` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| `INTERNAL_ERROR` | Internal server error |

## 🔒 Rate Limiting

- **General endpoints**: 1000 requests per 15 minutes
- **Authentication endpoints**: 5 requests per 15 minutes
- **File upload endpoints**: 10 requests per 15 minutes
- **Admin endpoints**: 100 requests per 15 minutes

## 📝 Pagination

All list endpoints support pagination with the following parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response format:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 🌍 Internationalization

All endpoints support internationalization through the `language` query parameter:

- `en` - English (default)
- `fr` - French
- `es` - Spanish

Content will be returned in the specified language when available.

## 📊 Webhooks

### POST /webhooks/payment
Payment webhook for external payment processors.

### POST /webhooks/booking
Booking webhook for external booking systems.

---

*Last Updated: January 2025*  
*Version: 2.0 - Enhanced with React 19, Content Management, Admin Testing, Analytics, and Multilingual Features* 