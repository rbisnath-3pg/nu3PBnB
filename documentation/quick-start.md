# nu3PBnB - Quick Start Guide

## 📋 Overview

This quick start guide provides essential information to get up and running with the nu3PBnB application. **Updated June 2025 to include new content management, admin testing, analytics, and multilingual features.**

## 🚀 Prerequisites

### System Requirements
- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **MongoDB**: Version 5.0 or higher
- **Git**: Version control system
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### Development Tools
- **Code Editor**: VS Code (recommended)
- **API Testing**: Postman or Insomnia
- **Database GUI**: MongoDB Compass
- **Git Client**: GitHub Desktop or CLI

## ⚡ Quick Setup

### 1. Clone and Install
```bash
# Clone the repository
git clone https://github.com/your-org/nu3pbnb.git
cd nu3pbnb

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/nu3pbnb

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
ENABLE_VERBOSE_LOGGING=true

# Internationalization
DEFAULT_LANGUAGE=en
SUPPORTED_LANGUAGES=en,fr,es
```

### 3. Database Setup
```bash
# Start MongoDB (if using local instance)
mongod

# In a new terminal, run database setup
npm run db:setup

# Seed initial data
npm run db:seed
```

### 4. Start Development Servers
```bash
# Start backend server
npm run dev

# In a new terminal, start frontend
cd frontend
npm run dev

# Or run both concurrently
npm run dev:full
```

### 5. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs

## 🎯 Essential Commands

### Development
```bash
# Start development servers
npm run dev              # Backend only
cd frontend && npm run dev  # Frontend only
npm run dev:full         # Both servers

# Build for production
cd frontend && npm run build

# Preview production build
cd frontend && npm run preview
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm test -- --testPathPattern=bookings
npm test -- --testPathPattern=payments

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend
```

### Database Operations
```bash
# Setup database
npm run db:setup

# Seed test data
npm run db:seed

# Reset database
npm run db:reset

# Create admin user
node create-admin-user.js

# List admin users
node list-admin-users.js
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check code coverage
npm run coverage
```

## 🔧 New Features Setup

### Content Management System

#### Backend Setup
```bash
# Content management is automatically available
# Access via: http://localhost:3000/api/content

# Create initial content
node seed-content.js
```

#### Frontend Access
1. Log in as an administrator
2. Navigate to Admin Dashboard
3. Click "Content Manager"
4. Create and manage content using the WYSIWYG editor

#### Content Types
- **HTML**: Rich text content with formatting
- **Text**: Plain text content
- **Markdown**: Markdown-formatted content
- **JSON**: Structured data content

#### Content Sections
- **Hero**: Main landing page content
- **About**: Company information
- **Footer**: Footer links and information
- **Legal**: Terms, privacy, legal content
- **Help**: FAQ and support content
- **Homepage**: General homepage content
- **General**: Miscellaneous content

### Admin Testing Dashboard

#### Setup
```bash
# Testing framework is automatically configured
# Access via: http://localhost:3000/api/admin/test-results

# Run initial tests
npm test
```

#### Usage
1. Log in as an administrator
2. Navigate to Admin Dashboard
3. Click "Test Results"
4. View automated test results
5. Trigger new test runs
6. Monitor test performance

#### Test Categories
- **Unit Tests**: Component and function testing
- **Integration Tests**: API endpoint testing
- **End-to-End Tests**: Complete user flow testing
- **Performance Tests**: Load and stress testing

### Analytics Dashboard

#### Setup
```bash
# Analytics tracking is automatically enabled
# Access via: http://localhost:3000/api/analytics

# Seed analytics data
node seed-analytics.js
```

#### Usage
1. Log in as administrator or host
2. Navigate to Analytics Dashboard
3. View real-time metrics
4. Generate custom reports
5. Export data in various formats

#### Available Metrics
- **User Analytics**: Registration, activity, retention
- **Booking Analytics**: Bookings, revenue, trends
- **Property Analytics**: Performance, ratings, views
- **System Analytics**: Performance, errors, uptime

### Multilingual Support

#### Setup
```bash
# Translation files are automatically loaded
# Available languages: English (en), French (fr), Spanish (es)

# Seed multilingual content
node seed-multilingual.js
```

#### Usage
1. Users can change language via language switcher
2. Content is automatically displayed in selected language
3. Admin can manage content in multiple languages
4. System detects user's preferred language

#### Translation Files
```
locales/
├── en/
│   └── translation.json
├── fr/
│   └── translation.json
└── es/
    └── translation.json
```

## 🧪 Testing New Features

### Content Management Tests
```bash
# Test content management API
npm test -- --testPathPattern=content

# Test WYSIWYG editor component
cd frontend && npm test -- --testPathPattern=WYSIWYGEditor
```

### Admin Testing Tests
```bash
# Test admin testing dashboard
npm test -- --testPathPattern=admin

# Test test results API
npm test -- --testPathPattern=test-results
```

### Analytics Tests
```bash
# Test analytics API
npm test -- --testPathPattern=analytics

# Test analytics dashboard component
cd frontend && npm test -- --testPathPattern=AnalyticsDashboard
```

### Multilingual Tests
```bash
# Test internationalization
npm test -- --testPathPattern=i18n

# Test language switching
cd frontend && npm test -- --testPathPattern=LanguageSwitcher
```

## 🔍 API Testing

### Using Postman
1. Import the API collection
2. Set up environment variables
3. Test endpoints with authentication

### Using curl
```bash
# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Test content management
curl -X GET http://localhost:3000/api/content \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test analytics
curl -X GET http://localhost:3000/api/analytics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test admin testing
curl -X POST http://localhost:3000/api/admin/run-tests \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Monitoring and Debugging

### Logs
```bash
# View application logs
tail -f logs/combined.log

# View error logs
tail -f logs/error.log

# View test results
cat logs/test-results.json
```

### Database Monitoring
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/nu3pbnb

# View collections
show collections

# Query data
db.users.find()
db.content.find()
db.testresults.find()
```

### Performance Monitoring
```bash
# Monitor API performance
npm run test:performance

# Check database performance
npm run db:analyze

# Monitor memory usage
npm run monitor
```

## 🚀 Deployment

### Development Deployment
```bash
# Build frontend
cd frontend && npm run build

# Start production server
NODE_ENV=production npm start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t nu3pbnb .

# Run with Docker Compose
docker-compose up -d
```

### Environment Variables for Production
```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://production-db:27017/nu3pbnb
JWT_SECRET=your-production-secret
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
LOG_LEVEL=warn
ENABLE_VERBOSE_LOGGING=false
```

## 🆘 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check connection string
echo $MONGODB_URI
```

#### Port Conflicts
```bash
# Check port usage
lsof -i :3000
lsof -i :5173

# Kill process using port
kill -9 PID
```

#### Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Test Failures
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific failing test
npm test -- --testNamePattern="specific test name"

# Check test environment
npm run test:env
```

### Getting Help
1. Check the logs in `logs/` directory
2. Review the troubleshooting guide
3. Check GitHub issues
4. Contact the development team

## 📚 Next Steps

### For Developers
1. Read the [Development Guide](./development-guide.md)
2. Review the [API Documentation](./api-documentation.md)
3. Study the [Architecture Document](./architecture.md)
4. Run the test suite and ensure all tests pass

### For Administrators
1. Read the [User Manual](./user-manual.md)
2. Set up admin accounts and permissions
3. Configure content management
4. Set up analytics and monitoring

### For Users
1. Complete user registration and onboarding
2. Explore the platform features
3. Test booking and payment flows
4. Provide feedback and report issues

---

*Last Updated: June 2025*
*Version: 2.0 - Enhanced with Content Management, Admin Testing, Analytics, and Multilingual Quick Start Guide* 