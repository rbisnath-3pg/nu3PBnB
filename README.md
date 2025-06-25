# nu3PBnB - Next-Generation Vacation Rental Platform

A modern, full-stack vacation rental platform built with React, Node.js, and MongoDB. Features include real-time analytics, multi-language support, comprehensive admin tools, and automated testing.

## 🚀 Features

### Core Functionality
- **Property Listings**: Browse and search vacation rentals
- **Booking System**: Complete booking workflow with payment processing
- **User Management**: Guest and host profiles with role-based access
- **Real-time Messaging**: Communication between guests and hosts
- **Reviews & Ratings**: User feedback system
- **Multi-language Support**: Internationalization (EN, ES, FR)

### Admin Features
- **Analytics Dashboard**: Real-time revenue and user analytics
- **Content Management**: Dynamic content editing with WYSIWYG editor
- **User Management**: Admin tools for user oversight
- **Payment Processing**: Payment history and management
- **Test Results**: Automated testing monitoring

### Technical Features
- **Automated Testing**: Scheduled tests running every hour
- **Real-time Analytics**: User behavior tracking and insights
- **Responsive Design**: Mobile-first approach
- **Security**: JWT authentication, rate limiting, input validation
- **Performance**: Caching, optimization, and monitoring

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Winston** for logging
- **Jest** for testing

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Icons** for UI elements
- **React Testing Library** for component testing
- **i18next** for internationalization

### DevOps & Testing
- **Automated Testing**: Scheduled tests every hour
- **Coverage Reporting**: Jest coverage reports
- **Logging**: Comprehensive logging system
- **Monitoring**: Real-time application monitoring

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
- Real-time revenue tracking
- User activity analytics
- Booking statistics
- Payment processing metrics
- App profitability calculations

### Test Monitoring
- Automated test execution
- Success rate tracking
- Performance metrics
- Failure analysis
- Coverage reporting

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
npm run seed                # Seed database with test data
npm run seed:payments       # Seed payment data
npm run seed:analytics      # Seed analytics data

# Utilities
npm run create-admin        # Create admin user
npm run list-users          # List all users
```

## 🌐 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Listings
- `GET /api/listings` - Get all listings
- `POST /api/listings` - Create new listing
- `GET /api/listings/:id` - Get specific listing
- `PUT /api/listings/:id` - Update listing

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking status

### Admin
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/users` - Get all users
- `POST /api/admin/content` - Update content

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Secure password hashing

## 📈 Performance

- Database indexing
- Query optimization
- Caching strategies
- Lazy loading
- Code splitting
- Bundle optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
1. Check the documentation in `/documentation`
2. Review the test results: `npm run test:results`
3. Check the logs in `/logs`
4. Run the demo: `npm run test:scheduled:demo`

## 🗺️ Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Payment gateway integration
- [ ] Real-time notifications
- [ ] Advanced search filters
- [ ] Social media integration
- [ ] AI-powered recommendations

## 🧪 Automated Test Management (NEW)

### Admin Test Dashboard Features
- **Run All Tests Now**: Trigger a full test suite run from the admin dashboard.
- **Progress Bar & Real-Time Status**: See live progress and current phase as tests run.
- **Clear Test History**: Remove all previous test runs with a single click (confirmation required).
- **Delete Individual Runs**: Remove specific test runs from the history.
- **Detailed Results**: View summary, code coverage, and full output for each run.

> **Note:** All tests pass except for `App.test.jsx`, which is skipped due to memory issues. All other suites are green and reliable.

### How to Use
1. Log in as an admin.
2. Go to the **Test Results** section.
3. Click **Run All Tests Now** to start a new test run.
4. Watch the progress bar and status updates.
5. Use **Clear History** to remove all test runs, or the trash icon to delete individual runs.

## 🏆 Test Coverage & Reliability
- 21/22 test suites pass (208/216 tests)
- All backend and frontend features are covered
- New endpoints for test management: `DELETE /admin/test-results` and `DELETE /admin/test-results/:id`
- UI and API are robust and production-ready

## 📚 Documentation
- See `documentation/testing-strategy.md` for details on the test plan and best practices.
- See `documentation/project-plan.md` for project milestones and completed features.

---

For more, see the full documentation in the `documentation/` folder.

---

**Last Updated**: June 2025  
**Version**: 1.0.0  
**Maintainer**: nu3PBnB Development Team 