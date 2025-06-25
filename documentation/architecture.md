# nu3PBnB - System Architecture

## 📋 Overview

This document outlines the high-level system architecture for the nu3PBnB application. **Updated June 2025 to reflect new content management, admin testing, analytics, and multilingual architecture.**

## 🏗️ System Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Static    │    │   File Storage  │    │   Analytics     │
│   Assets        │    │   (Images)      │    │   (Winston)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Architecture Principles

1. **Microservices-Ready**: Modular design for future scalability
2. **API-First**: RESTful API as the primary interface
3. **Security-First**: Authentication, authorization, and data protection
4. **Performance-Optimized**: Caching, indexing, and optimization
5. **Multilingual**: Internationalization support throughout
6. **Content-Managed**: Dynamic content management system
7. **Test-Driven**: Automated testing and quality assurance
8. **Analytics-Driven**: Comprehensive monitoring and reporting

## 🔧 Technology Stack

### Frontend
- **Framework**: React 19.1.0 with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router DOM 7.6.2
- **Internationalization**: i18next 25.2.1
- **Maps**: React Leaflet 5.0.0
- **Charts**: Chart.js 4.5.0 with React Chart.js 2
- **Rich Text**: TipTap 2.22.3
- **PDF Generation**: jsPDF 3.0.1

### Backend
- **Runtime**: Node.js with Express 5.1.0
- **Database**: MongoDB 5.7.0 with Mongoose 7.6.3
- **Authentication**: JWT with bcryptjs 3.0.2
- **File Upload**: Multer 2.0.1
- **Logging**: Winston 3.17.0
- **Rate Limiting**: express-rate-limit 7.5.1
- **Internationalization**: i18next-fs-backend 2.6.0

### Development & Testing
- **Testing**: Jest 30.0.2 with React Testing Library
- **Linting**: ESLint 9.25.0
- **Build Tool**: Vite 6.3.5
- **Package Manager**: npm

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
    location: String
  },
  preferences: {
    theme: String (light|dark),
    language: String (en|fr|es),
    notifications: Boolean
  },
  onboardingCompleted: Boolean,
  isActive: Boolean,
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
    country: String
  },
  amenities: [String],
  images: [String],
  status: String (active|inactive|draft),
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
  status: String (pending|approved|rejected|cancelled),
  message: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Payments Collection
```javascript
{
  _id: ObjectId,
  bookingId: ObjectId (ref: BookingRequest),
  amount: Number,
  currency: String,
  status: String (pending|completed|failed|refunded),
  paymentMethod: String,
  transactionId: String,
  receipt: {
    url: String,
    generatedAt: Date
  },
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
  subject: String,
  content: String,
  read: Boolean,
  attachments: [String],
  createdAt: Date
}
```

#### Reviews Collection
```javascript
{
  _id: ObjectId,
  listingId: ObjectId (ref: Listing),
  reviewerId: ObjectId (ref: User),
  rating: Number,
  comment: String,
  categories: {
    cleanliness: Number,
    communication: Number,
    checkIn: Number,
    accuracy: Number,
    location: Number,
    value: Number
  },
  createdAt: Date
}
```

#### Content Collection (NEW)
```javascript
{
  _id: ObjectId,
  key: String,
  title: String,
  content: String,
  type: String (text|html|markdown|json),
  section: String (hero|about|footer|legal|help|homepage|general),
  language: String (en|fr|es),
  isActive: Boolean,
  metadata: {
    description: String,
    keywords: String,
    author: String,
    lastModified: Date
  },
  version: Number,
  history: [{
    content: String,
    modifiedBy: ObjectId (ref: User),
    modifiedAt: Date,
    version: Number,
    comment: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### UserActivity Collection (NEW)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  action: String,
  details: Object,
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}
```

#### TestResults Collection (NEW)
```javascript
{
  _id: ObjectId,
  runId: String,
  status: String (running|passed|failed),
  startTime: Date,
  endTime: Date,
  duration: Number,
  results: [{
    testName: String,
    status: String (passed|failed|skipped),
    duration: Number,
    error: String,
    details: Object
  }],
  summary: {
    total: Number,
    passed: Number,
    failed: Number,
    skipped: Number
  },
  triggeredBy: ObjectId (ref: User),
  createdAt: Date
}
```

### Database Indexes

#### Performance Indexes
```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ createdAt: -1 });

// Listings
db.listings.createIndex({ hostId: 1 });
db.listings.createIndex({ status: 1 });
db.listings.createIndex({ createdAt: -1 });
db.listings.createIndex({ location: "2dsphere" });

// Bookings
db.bookingrequests.createIndex({ guestId: 1 });
db.bookingrequests.createIndex({ listingId: 1 });
db.bookingrequests.createIndex({ status: 1 });
db.bookingrequests.createIndex({ startDate: 1 });
db.bookingrequests.createIndex({ createdAt: -1 });

// Payments
db.payments.createIndex({ bookingId: 1 });
db.payments.createIndex({ status: 1 });
db.payments.createIndex({ createdAt: -1 });

// Messages
db.messages.createIndex({ senderId: 1 });
db.messages.createIndex({ recipientId: 1 });
db.messages.createIndex({ read: 1 });
db.messages.createIndex({ createdAt: -1 });

// Content
db.content.createIndex({ key: 1, language: 1 }, { unique: true });
db.content.createIndex({ section: 1, language: 1 });
db.content.createIndex({ isActive: 1 });

// UserActivity
db.useractivities.createIndex({ userId: 1 });
db.useractivities.createIndex({ action: 1 });
db.useractivities.createIndex({ timestamp: -1 });

// TestResults
db.testresults.createIndex({ runId: 1 }, { unique: true });
db.testresults.createIndex({ status: 1 });
db.testresults.createIndex({ createdAt: -1 });
```

## 🔐 Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication
- **Role-Based Access Control**: Guest, Host, Admin roles
- **Password Hashing**: bcrypt with salt rounds
- **Token Expiration**: Configurable expiration times
- **Refresh Tokens**: Secure token refresh mechanism

### Data Protection
- **HTTPS Only**: All communications encrypted
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: Token-based CSRF protection

### Rate Limiting
- **API Rate Limiting**: 1000 requests per minute
- **Authentication Rate Limiting**: 5 requests per minute
- **File Upload Rate Limiting**: 10 requests per minute
- **Admin Endpoint Rate Limiting**: 100 requests per minute

## 🌐 Internationalization Architecture

### Language Support
- **Supported Languages**: English (en), French (fr), Spanish (es)
- **Language Detection**: Browser language detection
- **Fallback Language**: English as default
- **Dynamic Language Switching**: Real-time language changes

### Translation Management
- **Translation Files**: JSON-based translation files
- **Content Localization**: Language-specific content management
- **Date/Time Localization**: Localized date and time formats
- **Currency Localization**: Localized currency display

### Implementation
```javascript
// i18n Configuration
i18next
  .use(Backend)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en',
    preload: ['en', 'fr', 'es'],
    backend: {
      loadPath: '/locales/{{lng}}/translation.json'
    },
    detection: {
      order: ['querystring', 'header'],
      lookupQuerystring: 'lng',
      caches: false
    }
  });
```

## 📊 Analytics Architecture

### Data Collection
- **User Activity Tracking**: Comprehensive user behavior tracking
- **Performance Monitoring**: Response times and error rates
- **Business Metrics**: Booking, revenue, and user metrics
- **System Health**: Server performance and availability

### Analytics Components
- **Real-Time Dashboard**: Live analytics display
- **Historical Data**: Long-term trend analysis
- **Custom Reports**: Configurable reporting
- **Data Export**: CSV/PDF export capabilities

### Implementation
```javascript
// Analytics Middleware
const trackPageView = (req, res, next) => {
  const userActivity = new UserActivity({
    userId: req.user?.id,
    action: 'page_view',
    details: {
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent')
    },
    ipAddress: req.ip,
    timestamp: new Date()
  });
  userActivity.save();
  next();
};
```

## 🎯 Content Management Architecture

### Content Types
- **Static Content**: HTML, text, markdown content
- **Dynamic Content**: JSON-based structured content
- **Multilingual Content**: Language-specific versions
- **Versioned Content**: Content history and rollback

### Content Sections
- **Hero Section**: Main landing page content
- **About Section**: Company information
- **Footer**: Footer links and information
- **Legal Pages**: Terms, privacy, legal content
- **Help & Support**: FAQ and support content
- **Homepage**: General homepage content
- **General**: Miscellaneous content

### Implementation
```javascript
// Content Model
const contentSchema = new mongoose.Schema({
  key: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'html', 'markdown', 'json'] },
  section: { type: String, required: true },
  language: { type: String, enum: ['en', 'fr', 'es'] },
  isActive: { type: Boolean, default: true },
  version: { type: Number, default: 1 },
  history: [{
    content: String,
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    modifiedAt: { type: Date, default: Date.now },
    version: Number,
    comment: String
  }]
});
```

## 🧪 Testing Architecture

### Automated Testing
- **Unit Tests**: Component and function testing
- **Integration Tests**: API endpoint testing
- **End-to-End Tests**: Complete user flow testing
- **Performance Tests**: Load and stress testing

### Test Management
- **Test Execution**: Automated test runs
- **Result Tracking**: Test result history
- **Failure Analysis**: Detailed failure reporting
- **Test Dashboard**: Real-time test monitoring

### Implementation
```javascript
// Test Results Model
const testResultSchema = new mongoose.Schema({
  runId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['running', 'passed', 'failed'] },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  duration: Number,
  results: [{
    testName: String,
    status: { type: String, enum: ['passed', 'failed', 'skipped'] },
    duration: Number,
    error: String,
    details: Object
  }],
  summary: {
    total: Number,
    passed: Number,
    failed: Number,
    skipped: Number
  },
  triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
```

## 🔄 API Architecture

### RESTful Design
- **Resource-Based URLs**: Clear resource identification
- **HTTP Methods**: Proper use of GET, POST, PUT, DELETE
- **Status Codes**: Appropriate HTTP status codes
- **Error Handling**: Consistent error response format

### API Structure
```
/api
├── /auth          # Authentication endpoints
├── /listings      # Property management
├── /bookings      # Booking management
├── /payments      # Payment processing
├── /messages      # Messaging system
├── /reviews       # Review system
├── /content       # Content management (NEW)
├── /analytics     # Analytics and reporting (NEW)
├── /admin         # Admin functions (NEW)
├── /host          # Host dashboard (NEW)
├── /users         # User management (NEW)
├── /onboarding    # User onboarding (NEW)
├── /wishlist      # Wishlist management (NEW)
└── /feedback      # Feedback system (NEW)
```

### Response Format
```javascript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## 🚀 Deployment Architecture

### Development Environment
- **Local Development**: Docker containers
- **Hot Reloading**: Vite development server
- **Database**: MongoDB local instance
- **Testing**: Jest test runner

### Production Environment
- **Web Server**: Nginx reverse proxy
- **Application Server**: Node.js with PM2
- **Database**: MongoDB Atlas
- **File Storage**: Cloud storage (AWS S3)
- **CDN**: Content delivery network
- **Monitoring**: Application performance monitoring

### CI/CD Pipeline
- **Version Control**: Git with GitHub
- **Automated Testing**: Jest test suite
- **Code Quality**: ESLint and Prettier
- **Deployment**: Automated deployment pipeline
- **Monitoring**: Health checks and alerts

## 📈 Scalability Considerations

### Horizontal Scaling
- **Load Balancing**: Multiple application instances
- **Database Sharding**: Horizontal database scaling
- **CDN Distribution**: Global content delivery
- **Microservices**: Future service decomposition

### Performance Optimization
- **Database Indexing**: Optimized query performance
- **Caching**: Redis caching layer
- **Image Optimization**: Compressed and optimized images
- **Code Splitting**: Lazy loading of components

### Monitoring and Alerting
- **Application Monitoring**: Real-time performance tracking
- **Error Tracking**: Comprehensive error logging
- **User Analytics**: User behavior analysis
- **System Health**: Automated health checks

---

*Last Updated: June 2025*
*Version: 2.0 - Enhanced with Content Management, Analytics, Testing, and Multilingual Architecture* 