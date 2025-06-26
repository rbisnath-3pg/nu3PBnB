# nu3PBnB

**Copyright (c) 2025 Robbie Bisnath (robbie.bisnath@3pillarglobal.com). All rights reserved.**

A modern, full-stack vacation rental platform built with React 19, Node.js, and MongoDB. Features include real-time analytics, multi-language support, comprehensive admin tools, automated testing, content management, and advanced user experience features.

## 🚀 Features

### Core Functionality
- **Property Listings**: Browse and search vacation rentals with advanced filtering
- **Booking System**: Complete booking workflow with payment processing and calendar management
- **User Management**: Guest and host profiles with role-based access control
- **Real-time Messaging**: Communication between guests and hosts with file attachments
- **Reviews & Ratings**: User feedback system with moderation
- **Multi-language Support**: Internationalization (EN, ES, FR) with language switching
- **Wishlist Management**: Save and manage favorite properties
- **Onboarding Wizard**: Guided setup for new users

### Admin Features
- **Analytics Dashboard**: Real-time revenue and user analytics with interactive charts
- **Content Management**: Dynamic content editing with WYSIWYG editor and versioning
- **User Management**: Admin tools for user oversight with bulk operations
- **Payment Processing**: Payment history and management with receipt generation
- **Test Results Dashboard**: Automated testing monitoring with real-time status
- **Admin Messaging**: Centralized messaging interface for administrators
- **System Health Monitoring**: Automated test scheduling and health checks

### Technical Features
- **Automated Testing**: Scheduled tests running every hour with comprehensive coverage
- **Real-time Analytics**: User behavior tracking and insights with performance metrics
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Security**: JWT authentication, rate limiting, input validation, role-based access
- **Performance**: Caching, optimization, monitoring, and database indexing
- **Content Versioning**: Track and restore previous content versions
- **File Upload**: Profile pictures and message attachments

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js 5.1.0
- **MongoDB** with Mongoose ODM 7.6.3
- **JWT** for authentication
- **Winston** for logging
- **Jest** for testing
- **Multer** for file uploads
- **Node-cron** for scheduled tasks

### Frontend
- **React 19.1.0** with Vite 6.3.5
- **Tailwind CSS** for styling
- **React Icons** for UI elements
- **React Testing Library** for component testing
- **i18next** for internationalization
- **Chart.js** for analytics visualization
- **Leaflet** for maps
- **TipTap** for WYSIWYG editing

### DevOps & Testing
- **Automated Testing**: Scheduled tests every hour with 23 test suites
- **Coverage Reporting**: Jest coverage reports with detailed metrics
- **Logging**: Comprehensive logging system with Winston
- **Monitoring**: Real-time application monitoring and health checks
- **Performance**: Database optimization and caching strategies

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nu3PBnB
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Create environment file
   cp .env.example .env
   
   # Configure your environment variables
   # See .env.example for required variables
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if not already running)
   mongod
   
   # Initialize database
   npm run init-db
   
   # Seed the database with test data
   npm run seed
   ```

5. **Start the application**
   ```bash
   # Start backend server
   npm start
   
   # Start frontend development server (in another terminal)
   npm run dev
   ```

## 🧪 Testing

### Manual Testing
```bash
# Run all tests
npm test

# Run specific test suites
npm test -- --testPathPatterns=AdminDashboard
npm test -- --testPathPatterns=auth
npm test -- --testPathPatterns=bookings

# Run with coverage
npm test -- --coverage

# Run frontend tests only
npm run test:frontend

# Run backend tests only
npm run test:backend
```

### Automated Testing
```bash
# Start scheduled tests (runs every hour)
npm run test:scheduled

# View test results
npm run test:results

# View today's results
npm run test:results:today

# View demo/overview
npm run test:scheduled:demo
```

### Test Schedule
- **Every hour**: Random test from 23 available test suites
- **Every 6 hours**: Comprehensive test with coverage
- **Business hours**: Every 30 minutes (9 AM - 6 PM, Mon-Fri)
- **Off-hours**: Every 2 hours (12 AM - 8 AM, 7 PM - 11 PM)
- **Weekends**: Every 4 hours

## 📊 Analytics & Monitoring

### Admin Dashboard
- Real-time revenue tracking with interactive charts
- User activity analytics and behavior insights
- Booking statistics and trends
- Payment processing metrics
- App profitability calculations
- System health monitoring

### Test Monitoring
- Automated test execution with real-time status
- Success rate tracking and failure analysis
- Performance metrics and coverage reporting
- Historical test data and trends
- Email notifications for test failures

## 🔧 Development

### Project Structure
```
nu3PBnB/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API services
│   │   └── locales/         # Internationalization files
│   └── public/              # Static assets
├── models/                  # MongoDB models
├── routes/                  # Express.js routes
├── middleware/              # Custom middleware
├── logs/                    # Application logs
├── documentation/           # Project documentation
├── scripts/                 # Database and utility scripts
└── tests/                   # Test files
```

### Available Scripts
```bash
# Development
npm start                    # Start backend server
npm run dev                  # Start frontend development server
npm run server              # Start with nodemon (auto-restart)

# Testing
npm test                     # Run all tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run tests with coverage
npm run test:scheduled      # Start automated testing
npm run test:results        # View test results

# Database
npm run init-db             # Initialize database
npm run reset-db            # Reset database
npm run seed                # Seed database with test data
npm run seed:payments       # Seed payment data
npm run seed:analytics      # Seed analytics data

# Utilities
npm run create-admin        # Create admin user
npm run list-users          # List all users
npm run reset-passwords     # Reset user passwords
```

## 🌐 API Documentation

The API provides comprehensive endpoints for:
- **Authentication**: Login, registration, password management
- **Listings**: CRUD operations for property listings
- **Bookings**: Booking management and calendar integration
- **Payments**: Payment processing and history
- **Messaging**: Real-time messaging system
- **Reviews**: Rating and review system
- **Users**: User management and profiles
- **Content**: Dynamic content management
- **Analytics**: Data analytics and reporting

See [API Documentation](./API_DOCUMENTATION.md) for detailed endpoint specifications.

## 📚 Documentation

Comprehensive documentation is available in the `documentation/` folder:
- [Requirements](./documentation/requirements.md) - Functional and non-functional requirements
- [Architecture](./documentation/architecture.md) - System design and architecture
- [Development Guide](./documentation/development-guide.md) - Development setup and guidelines
- [User Manual](./documentation/user-manual.md) - End-user instructions
- [API Documentation](./documentation/api-documentation.md) - API specifications
- [Testing Strategy](./documentation/testing-strategy.md) - Testing approach and procedures

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for guests, hosts, and admins
- **Rate Limiting**: Protection against abuse and DDoS attacks
- **Input Validation**: Comprehensive validation for all user inputs
- **Password Hashing**: Secure password storage with bcrypt
- **CORS Protection**: Cross-origin resource sharing configuration
- **File Upload Security**: Secure file upload with validation

## 🌍 Internationalization

The platform supports multiple languages:
- **English (EN)** - Default language
- **Spanish (ES)** - Complete translation
- **French (FR)** - Complete translation

Language switching is available throughout the application with persistent user preferences.

## 📱 Responsive Design

The application is built with a mobile-first approach:
- **Mobile**: Optimized for smartphones and tablets
- **Desktop**: Full-featured desktop experience
- **Tablet**: Optimized tablet layout
- **Accessibility**: WCAG compliance and screen reader support

## 🚀 Deployment

### Production Deployment
```bash
# Build frontend for production
cd frontend
npm run build
cd ..

# Start production server
npm start
```

### Environment Variables
Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the [Troubleshooting Guide](./documentation/troubleshooting.md)
- Review the [User Manual](./documentation/user-manual.md)
- Consult the [API Documentation](./documentation/api-documentation.md)

---

**Last Updated**: January 2025  
**Version**: 2.0 - Enhanced with Content Management, Admin Testing, Analytics, and Multilingual Features # Redeployment trigger - Wed Jun 25 21:01:04 EDT 2025
