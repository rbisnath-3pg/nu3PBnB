# nu3PBnB Database Schema Documentation

## Overview

The nu3PBnB application uses MongoDB with Mongoose ODM. The database schema is designed to support a comprehensive property booking platform with user management, messaging, payments, analytics, and content management.

## Database Schema Diagram

```mermaid
erDiagram
    User {
        ObjectId _id PK
        String name
        String email UK
        String password
        String role "admin|host|guest"
        Boolean onboardingCompleted
        String themePreference "light|dark"
        Array wishlist "ObjectId[] -> Listing"
        String language "en|fr|es"
        Boolean onboarded
        String profilePicture
        Buffer profilePictureData
        String profilePictureType
        String bio
        String location
        Date createdAt
        Date updatedAt
    }

    Listing {
        ObjectId _id PK
        String title
        String description
        String location
        String city
        String country
        Number price
        String type
        Array photos "String[]"
        Array availability "DateRange[]"
        ObjectId host FK "-> User"
        Number latitude
        Number longitude
        Number averageRating
        Array reviews "ObjectId[] -> Review"
        Array amenities "String[]"
        Number maxGuests
        Number bedrooms
        Number bathrooms
        Boolean available
        Boolean featured
        String language "en|fr|es"
        Date createdAt
        Date updatedAt
    }

    BookingRequest {
        ObjectId _id PK
        ObjectId guest FK "-> User"
        ObjectId host FK "-> User"
        ObjectId listing FK "-> Listing"
        Date startDate
        Date endDate
        Number guests
        Number totalPrice
        String status "pending|approved|declined|cancelled|confirmed"
        String message
        String paymentStatus "pending|paid|failed"
        Date createdAt
        Date updatedAt
    }

    Payment {
        ObjectId _id PK
        ObjectId booking FK "-> BookingRequest"
        ObjectId user FK "-> User"
        Number amount
        String currency
        String paymentMethod "apple_pay|google_pay|paypal|credit_card|system_generated"
        String paymentStatus "pending|processing|completed|failed|refunded"
        String transactionId UK
        Object metadata
        Date refundedAt
        Number refundAmount
        String refundReason
        Date createdAt
        Date updatedAt
    }

    Message {
        ObjectId _id PK
        ObjectId sender FK "-> User"
        ObjectId recipient FK "-> User"
        String content
        String subject
        ObjectId booking FK "-> BookingRequest"
        ObjectId listing FK "-> Listing"
        Boolean read
        String messageType "regular|reply|forward"
        ObjectId parentMessage FK "-> Message"
        ObjectId forwardedFrom FK "-> Message"
        Date createdAt
        Date updatedAt
    }

    Review {
        ObjectId _id PK
        ObjectId guest FK "-> User"
        ObjectId listing FK "-> Listing"
        Number rating "1-5"
        String review
        Date createdAt
    }

    Content {
        ObjectId _id PK
        String key UK
        String title
        String content
        String type "text|html|markdown|json"
        String section "hero|about|footer|legal|help|homepage|general"
        String language "en|fr|es"
        Boolean isActive
        Object metadata
        Number version
        Array history "ContentHistory[]"
        Date createdAt
        Date updatedAt
    }

    UserActivity {
        ObjectId _id PK
        ObjectId userId FK "-> User"
        String sessionId
        String eventType "page_view|click|session_start|session_end|bounce"
        String page
        String element
        String elementType
        String elementId
        String elementText
        Number timeSpent
        String referrer
        String userAgent
        String ipAddress
        Date timestamp
        Object metadata
        Date createdAt
        Date updatedAt
    }

    Feedback {
        ObjectId _id PK
        ObjectId user FK "-> User"
        String message
        String topic
        Number rating "1-5"
        Date createdAt
    }

    %% Relationships
    User ||--o{ Listing : "hosts"
    User ||--o{ BookingRequest : "guests"
    User ||--o{ BookingRequest : "hosts"
    User ||--o{ Payment : "makes"
    User ||--o{ Message : "sends"
    User ||--o{ Message : "receives"
    User ||--o{ Review : "writes"
    User ||--o{ UserActivity : "generates"
    User ||--o{ Feedback : "submits"
    User ||--o{ Content : "modifies"

    Listing ||--o{ BookingRequest : "booked_in"
    Listing ||--o{ Review : "reviewed"
    Listing ||--o{ Message : "referenced_in"

    BookingRequest ||--o{ Payment : "has"
    BookingRequest ||--o{ Message : "discussed_in"

    Message ||--o{ Message : "replies_to"
    Message ||--o{ Message : "forwards_from"

    Content ||--o{ Content : "versioned_as"
```

## Entity Relationships

### Core Entities

#### 1. **User** (Central Entity)
- **Purpose**: Represents all users in the system (guests, hosts, admins)
- **Key Features**: 
  - Role-based access control (admin, host, guest)
  - Multi-language support
  - Profile management with image uploads
  - Wishlist functionality
  - Theme preferences

#### 2. **Listing** (Property Entity)
- **Purpose**: Represents properties available for booking
- **Key Features**:
  - Geographic location with coordinates
  - Multi-language content
  - Photo galleries
  - Availability calendar
  - Amenities and property details
  - Rating system integration

#### 3. **BookingRequest** (Booking Entity)
- **Purpose**: Manages booking requests and confirmations
- **Key Features**:
  - Date range booking
  - Guest count management
  - Status tracking (pending, approved, declined, etc.)
  - Payment status integration

### Supporting Entities

#### 4. **Payment** (Financial Entity)
- **Purpose**: Handles all payment transactions
- **Key Features**:
  - Multiple payment methods
  - Transaction tracking
  - Refund management
  - Receipt generation

#### 5. **Message** (Communication Entity)
- **Purpose**: Enables communication between users
- **Key Features**:
  - Direct messaging
  - Booking-related conversations
  - Message threading (replies, forwards)
  - Read status tracking

#### 6. **Review** (Feedback Entity)
- **Purpose**: Manages property reviews and ratings
- **Key Features**:
  - Star rating system (1-5)
  - Text reviews
  - Guest-only reviews

#### 7. **Content** (CMS Entity)
- **Purpose**: Manages dynamic website content
- **Key Features**:
  - Multi-language content management
  - Version control with history
  - Section-based organization
  - Rich content types (HTML, Markdown, JSON)

#### 8. **UserActivity** (Analytics Entity)
- **Purpose**: Tracks user behavior for analytics
- **Key Features**:
  - Session tracking
  - Page view analytics
  - Click tracking
  - User journey analysis

#### 9. **Feedback** (Support Entity)
- **Purpose**: Collects user feedback and support requests
- **Key Features**:
  - Topic categorization
  - Rating system
  - Support ticket management

## Indexes and Performance

### Primary Indexes
- All collections have `_id` as primary key
- User: `email` (unique)
- Payment: `transactionId` (unique)
- Content: `key + language` (compound unique)

### Secondary Indexes
- UserActivity: `userId + timestamp`, `sessionId + timestamp`, `eventType + timestamp`
- Content: `section + language`, `isActive`
- Message: `sender + recipient`, `read status`
- Listing: `host`, `location`, `availability`

## Data Integrity Constraints

### Required Fields
- User: name, email, password, role
- Listing: title, description, location, city, country, price, type, host, coordinates
- BookingRequest: guest, host, listing, dates, guests, totalPrice
- Payment: booking, user, amount, paymentMethod
- Message: sender, recipient, content
- Review: guest, listing, rating

### Enumerated Values
- User roles: admin, host, guest
- Booking status: pending, approved, declined, cancelled, confirmed
- Payment status: pending, processing, completed, failed, refunded
- Payment methods: apple_pay, google_pay, paypal, credit_card, system_generated
- Languages: en, fr, es
- Content types: text, html, markdown, json

### Validation Rules
- Email addresses must be unique
- Ratings must be between 1-5
- Prices must be positive numbers
- Dates must be valid and logical (start < end)
- Transaction IDs must be unique

## Scalability Considerations

### Horizontal Scaling
- MongoDB supports horizontal scaling through sharding
- Collections can be sharded by key fields (e.g., userId, location)

### Performance Optimization
- Indexes on frequently queried fields
- Compound indexes for complex queries
- Aggregation pipelines for analytics
- Caching strategies for frequently accessed data

### Data Archival
- UserActivity can be archived after retention period
- Payment history can be moved to cold storage
- Content versions can be limited to recent history

## Security Considerations

### Data Protection
- Passwords are hashed using bcrypt
- Sensitive data (payment info) is encrypted
- API keys and secrets are stored securely
- User sessions are managed with JWT tokens

### Access Control
- Role-based permissions at application level
- Database-level access controls
- Audit trails for sensitive operations
- Data anonymization for analytics

## Backup and Recovery

### Backup Strategy
- Regular automated backups
- Point-in-time recovery capabilities
- Cross-region backup replication
- Backup integrity verification

### Disaster Recovery
- Multi-region deployment
- Automated failover procedures
- Data consistency checks
- Recovery time objectives (RTO) and recovery point objectives (RPO)

---

*This schema documentation is maintained as part of the nu3PBnB project and should be updated as the database structure evolves.* 