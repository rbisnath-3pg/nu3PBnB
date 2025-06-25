# nu3PBnB - System Architecture

## 📋 Overview

This document outlines the high-level system architecture for the nu3PBnB application. **Updated January 2025 to reflect React 19, enhanced content management, admin testing, analytics, multilingual architecture, and advanced user experience features.**

## 🏗️ System Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React 19)    │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Static    │    │   File Storage  │    │   Analytics     │
│   Assets        │    │   (Images)      │    │   (Winston)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Testing       │    │   Content       │    │   Monitoring    │
│   Automation    │    │   Management    │    │   & Alerts      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Architecture Principles

1. **Microservices-Ready**: Modular design for future scalability
2. **API-First**: RESTful API as the primary interface
3. **Security-First**: Authentication, authorization, and data protection
4. **Performance-Optimized**: Caching, indexing, and optimization
5. **Multilingual**: Internationalization support throughout
6. **Content-Managed**: Dynamic content management system with versioning
7. **Test-Driven**: Automated testing and quality assurance
8. **Analytics-Driven**: Comprehensive monitoring and reporting
9. **User-Centric**: Modern UI/UX with responsive design
10. **Real-Time**: Live updates and notifications

## 🔧 Technology Stack

### Frontend (React 19)
- **Framework**: React 19.1.0 with Vite 6.3.5
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: React Context API with hooks
- **Routing**: React Router DOM 7.6.2
- **Internationalization**: i18next 25.2.1 with browser language detection
- **Maps**: React Leaflet 5.0.0 with Leaflet 1.9.4
- **Charts**: Chart.js 4.5.0 with React Chart.js 2 5.3.0
- **Rich Text**: TipTap 2.22.3 with React integration
- **PDF Generation**: jsPDF 3.0.1 with auto-table 5.0.2
- **Icons**: React Icons 5.5.0
- **Date Handling**: date-fns 4.1.0

### Backend (Node.js)
- **Runtime**: Node.js with Express 5.1.0
- **Database**: MongoDB 5.7.0 with Mongoose 7.6.3
- **Authentication**: JWT with bcryptjs 3.0.2
- **File Upload**: Multer 2.0.1 with validation
- **Logging**: Winston 3.17.0 with structured logging
- **Rate Limiting**: express-rate-limit 7.5.1
- **Internationalization**: i18next-fs-backend 2.6.0
- **Scheduling**: node-cron 4.1.1 for automated tasks
- **Data Generation**: @faker-js/faker 9.8.0 for testing

### Development & Testing
- **Testing**: Jest 30.0.2 with React Testing Library 16.3.0
- **API Testing**: Supertest 7.1.1
- **Linting**: ESLint 9.25.0 with React plugins
- **Build Tool**: Vite 6.3.5 with React plugin
- **Package Manager**: npm
- **Memory Database**: mongodb-memory-server 8.12.2

## 🗄️ Data Architecture

### Database Schema

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (guest|host|admin),
  profile: {
    avatar: String,
    bio: String,
    phone: String,
    location: String,
    profilePicture: String,
    profilePictureData: Buffer
  },
  preferences: {
    theme: String (light|dark),
    language: String (en|fr|es),
    notifications: Boolean,
    emailNotifications: Boolean
  },
  onboardingCompleted: Boolean,
  onboardingData: {
    preferences: Object,
    interests: [String],
    travelStyle: String
  },
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Listings Collection
```javascript
{
  _id: ObjectId,
  hostId: ObjectId (ref: User),
  title: String,
  description: String,
  price: Number,
  location: {
    address: String,
    coordinates: [Number, Number], // [longitude, latitude]
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  amenities: [String],
  photos: [String],
  type: String (apartment|house|villa|cabin),
  maxGuests: Number,
  bedrooms: Number,
  bathrooms: Number,
  status: String (active|inactive|draft),
  featured: Boolean,
  averageRating: Number,
  reviewCount: Number,
  availability: [{
    date: Date,
    available: Boolean,
    price: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### BookingRequests Collection
```javascript
{
  _id: ObjectId,
  listingId: ObjectId (ref: Listing),
  guestId: ObjectId (ref: User),
  hostId: ObjectId (ref: User),
  checkIn: Date,
  checkOut: Date,
  guests: Number,
  totalPrice: Number,
  status: String (pending|approved|rejected|cancelled|completed),
  message: String,
  paymentStatus: String (pending|paid|refunded),
  cancellationReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Payments Collection
```javascript
{
  _id: ObjectId,
  bookingId: ObjectId (ref: BookingRequest),
  userId: ObjectId (ref: User),
  amount: Number,
  currency: String (USD),
  status: String (pending|completed|failed|refunded),
  paymentMethod: String (credit_card|paypal|stripe),
  transactionId: String,
  receipt: {
    url: String,
    generatedAt: Date,
    receiptNumber: String
  },
  refundAmount: Number,
  refundReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Messages Collection
```javascript
{
  _id: ObjectId,
  senderId: ObjectId (ref: User),
  recipientId: ObjectId (ref: User),
  listingId: ObjectId (ref: Listing),
  subject: String,
  content: String,
  read: Boolean,
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  conversationId: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Reviews Collection
```javascript
{
  _id: ObjectId,
  listingId: ObjectId (ref: Listing),
  reviewerId: ObjectId (ref: User),
  bookingId: ObjectId (ref: BookingRequest),
  rating: Number (1-5),
  comment: String,
  categories: {
    cleanliness: Number,
    communication: Number,
    checkIn: Number,
    accuracy: Number,
    location: Number,
    value: Number
  },
  helpful: Number,
  reported: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Content Collection
```javascript
{
  _id: ObjectId,
  key: String (unique),
  title: String,
  content: String,
  type: String (text|html|markdown|json),
  section: String (hero|about|footer|legal|help|homepage|general),
  language: String (en|fr|es),
  version: Number,
  isActive: Boolean,
  metadata: {
    author: String,
    tags: [String],
    seo: {
      title: String,
      description: String,
      keywords: [String]
    }
  },
  history: [{
    version: Number,
    content: String,
    author: String,
    timestamp: Date,
    changes: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### Wishlist Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  listingId: ObjectId (ref: Listing),
  addedAt: Date,
  notes: String,
  category: String
}
```

#### UserActivity Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  action: String,
  resource: String,
  resourceId: ObjectId,
  metadata: Object,
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}
```

#### TestResults Collection
```javascript
{
  _id: ObjectId,
  testSuite: String,
  status: String (passed|failed|skipped),
  duration: Number,
  coverage: {
    statements: Number,
    branches: Number,
    functions: Number,
    lines: Number
  },
  results: {
    total: Number,
    passed: Number,
    failed: Number,
    skipped: Number
  },
  output: String,
  error: String,
  timestamp: Date,
  environment: String
}
```

## 🔄 Application Flow

### 1. User Authentication Flow
```
User Registration/Login → JWT Token Generation → Role-based Access Control → Protected Routes
```

### 2. Property Booking Flow
```
Property Search → Date Selection → Booking Request → Host Approval → Payment → Confirmation
```

### 3. Content Management Flow
```
Content Creation → WYSIWYG Editing → Version Control → Approval → Publishing → Multilingual Sync
```

### 4. Messaging Flow
```
Message Composition → File Attachment → Real-time Delivery → Notification → Conversation Threading
```

### 5. Analytics Flow
```
Data Collection → Real-time Processing → Dashboard Updates → Reporting → Insights
```

## 🔐 Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Role-based Access Control**: Guest, Host, Admin permissions
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: Token expiration and refresh
- **Rate Limiting**: API endpoint protection

### Data Protection
- **Input Validation**: Comprehensive validation and sanitization
- **SQL Injection Prevention**: Parameterized queries with Mongoose
- **XSS Protection**: Content Security Policy and sanitization
- **File Upload Security**: Validation, scanning, and secure storage
- **HTTPS Enforcement**: TLS 1.3 encryption in transit

### API Security
- **CORS Configuration**: Cross-origin resource sharing
- **Request Validation**: Middleware-based validation
- **Error Handling**: Secure error responses
- **Audit Logging**: Security event tracking

## 📊 Performance Architecture

### Frontend Optimization
- **Code Splitting**: Dynamic imports and lazy loading
- **Bundle Optimization**: Vite build optimization
- **Image Optimization**: Responsive images and lazy loading
- **Caching**: Browser caching and service workers
- **CDN Integration**: Static asset delivery

### Backend Optimization
- **Database Indexing**: Optimized queries and indexes
- **Caching Strategy**: Redis caching for frequently accessed data
- **Connection Pooling**: MongoDB connection management
- **Compression**: Gzip compression for responses
- **Load Balancing**: Horizontal scaling preparation

### Monitoring & Analytics
- **Real-time Metrics**: Performance monitoring
- **Error Tracking**: Comprehensive error logging
- **User Analytics**: Behavior tracking and insights
- **System Health**: Automated health checks

## 🌍 Internationalization Architecture

### Language Support
- **Supported Languages**: English (en), French (fr), Spanish (es)
- **Language Detection**: Browser-based and user preference
- **Content Translation**: Dynamic content management
- **Date/Time Localization**: Culture-specific formatting
- **Currency Localization**: Multi-currency support

### Implementation
- **i18next Framework**: React integration with hooks
- **Translation Files**: JSON-based translation management
- **Dynamic Loading**: On-demand language loading
- **Fallback Strategy**: Default language fallback

## 🧪 Testing Architecture

### Test Strategy
- **Unit Testing**: Component and function testing
- **Integration Testing**: API endpoint testing
- **End-to-End Testing**: User workflow testing
- **Performance Testing**: Load and stress testing
- **Security Testing**: Vulnerability assessment

### Automated Testing
- **Scheduled Tests**: Hourly automated test runs
- **Test Coverage**: Comprehensive coverage reporting
- **Test Results**: Real-time monitoring and reporting
- **Failure Handling**: Automated alerts and notifications

## 📱 Responsive Design Architecture

### Mobile-First Approach
- **Breakpoints**: Tailwind CSS responsive breakpoints
- **Touch Optimization**: Mobile-friendly interactions
- **Performance**: Optimized for mobile networks
- **Accessibility**: WCAG 2.1 AA compliance

### Progressive Enhancement
- **Core Functionality**: Works without JavaScript
- **Enhanced Features**: Progressive enhancement
- **Graceful Degradation**: Fallback for unsupported features

## 🔄 Deployment Architecture

### Development Environment
- **Local Development**: Vite dev server with hot reload
- **Database**: MongoDB with local or cloud connection
- **Environment Variables**: Configuration management
- **Hot Reloading**: Real-time code updates

### Production Environment
- **Build Process**: Optimized production builds
- **Static Assets**: CDN delivery for performance
- **Database**: MongoDB Atlas cloud database
- **Monitoring**: Real-time performance monitoring
- **Backup Strategy**: Automated backup and recovery

## 🚀 Scalability Considerations

### Horizontal Scaling
- **Load Balancing**: Multiple server instances
- **Database Sharding**: Distributed data storage
- **Microservices**: Service decomposition
- **API Gateway**: Centralized API management

### Vertical Scaling
- **Resource Optimization**: Memory and CPU optimization
- **Database Optimization**: Query optimization and indexing
- **Caching Strategy**: Multi-level caching
- **CDN Integration**: Global content delivery

---

*Last Updated: January 2025*  
*Version: 2.0 - Enhanced with React 19, Content Management, Admin Testing, Analytics, and Multilingual Features* 