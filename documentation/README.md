# nu3PBnB Documentation v1.0.0.0

**Comprehensive documentation for the nu3PBnB property booking platform**

## 📚 Documentation Overview

This directory contains comprehensive documentation for nu3PBnB v1.0.0.0, a full-featured property booking platform with real-time availability, secure payments, and multi-language support.

## 🗂️ Documentation Structure

### 📖 User Documentation
- **[User Manual](user-manual.md)** - Complete guide for guests and hosts
- **[Host Guide](host-guide.md)** - Property management and optimization
- **[Admin Guide](admin-guide.md)** - System administration and monitoring
- **[Troubleshooting](troubleshooting.md)** - Common issues and solutions

### 🔧 Technical Documentation
- **[API Documentation](api-documentation.md)** - Complete API reference
- **[Database Schema](database-schema.md)** - Database design and relationships
- **[Architecture Overview](architecture.md)** - System design and patterns
- **[Development Guide](development-guide.md)** - Development setup and guidelines
- **[Installation Guide](installation-guide.md)** - Setup and configuration
- **[Deployment Guide](deployment.md)** - Production deployment instructions

### 📋 Project Documentation
- **[Requirements](requirements.md)** - Functional and non-functional requirements
- **[Project Plan](project-plan.md)** - Development roadmap and milestones
- **[Testing Strategy](testing-strategy.md)** - Testing approach and procedures
- **[Technology Stack](technology-stack.md)** - Technologies and frameworks used
- **[Quick Start](quick-start.md)** - Fast setup and getting started

### 🎨 Design Documentation
- **[Use Cases](use-cases.md)** - User scenarios and workflows
- **[Use Case Diagram](use-case-diagram.md)** - Visual representation of use cases
- **[Tech Quick Reference](tech-quick-reference.md)** - Technology overview

## 🚀 Quick Start

### Live Demo
- **Frontend**: https://nu3pbnb.onrender.com
- **API**: https://nu3pbnb-api.onrender.com

### Test Accounts
```
Admin: admin@nu3pbnb.com / admin123
Host: Raul50@gmail.com / password123
Guest: Evelyn_Feeney68@gmail.com / password123
```

## 🛠️ Installation

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **MongoDB** (local or cloud)
- **Git**

### Quick Setup
```bash
# Clone repository
git clone https://github.com/rbisnath-3pg/nu3pbnb.git
cd nu3pbnb

# Install dependencies
npm install
cd frontend && npm install && cd ..

# Setup environment
cp .env.example .env
# Configure your environment variables

# Initialize database
npm run init-db

# Start development servers
npm run server  # Backend
npm run dev     # Frontend
```

## 🔌 API Reference

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Properties
- `GET /api/listings` - Get all properties
- `GET /api/listings/:id` - Get property details
- `POST /api/listings` - Create property (hosts)
- `PUT /api/listings/:id` - Update property

### Bookings
- `POST /api/bookings` - Create booking request
- `GET /api/bookings` - Get user bookings
- `PUT /api/bookings/:id` - Update booking status

### Payments
- `POST /api/payments/process` - Process payment
- `GET /api/payments` - Get payment history

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/analytics` - Get analytics data

## 🧪 Testing

### Run Tests
```bash
# All tests
npm test

# Specific test suites
npm run test:backend
npm run test:frontend
npm run test:api

# With coverage
npm run test:ci
```

### Test Coverage
- **90%+ test coverage** across the application
- **Unit tests** for all components and functions
- **Integration tests** for API endpoints
- **End-to-end tests** for critical user flows

## 📊 Features

### Core Features
- ✅ **Complete booking system** with real-time availability
- ✅ **Payment processing** with automatic approval
- ✅ **Multi-language support** (EN, ES, FR)
- ✅ **User role management** (Guests, Hosts, Admins)
- ✅ **Property listing management** with advanced search
- ✅ **Real-time messaging** between users
- ✅ **Review and rating system** with moderation
- ✅ **Wishlist functionality** for favorites
- ✅ **Onboarding wizard** for new users

### Admin Features
- ✅ **Analytics dashboard** with real-time metrics
- ✅ **Content management system** with WYSIWYG editor
- ✅ **User management** with bulk operations
- ✅ **Payment history** and receipt generation
- ✅ **System health monitoring** with automated tests
- ✅ **Admin messaging interface** for support

### Technical Features
- ✅ **Responsive design** for all devices
- ✅ **Progressive Web App** capabilities
- ✅ **Real-time notifications** and updates
- ✅ **Image optimization** and CDN support
- ✅ **SEO optimization** for discoverability
- ✅ **Automated testing** with comprehensive coverage
- ✅ **Performance monitoring** and optimization

## 🔒 Security

### Authentication & Authorization
- **JWT token management** with refresh mechanisms
- **Role-based access control** (RBAC)
- **Password policies** with secure hashing
- **Session management** with timeouts

### Data Protection
- **Input validation** and sanitization
- **SQL injection prevention**
- **XSS protection** with CSP
- **CORS configuration** for security
- **File upload security** with validation

## 🌍 Internationalization

### Supported Languages
- **English** (default)
- **Spanish** (complete translation)
- **French** (complete translation)

### Features
- **Dynamic language switching** without reload
- **Localized content** and interfaces
- **Cultural adaptation** for regions
- **Persistent language preferences**

## 📱 Mobile Support

### Responsive Design
- **Mobile-first approach**
- **Touch-friendly interfaces**
- **Optimized performance** for mobile
- **Offline capabilities** with service workers

### Progressive Web App
- **Installable** on mobile devices
- **Offline functionality** for core features
- **Push notifications** for updates
- **App-like experience** on mobile

## 🚀 Deployment

### Production Environment
- **Live demo**: https://nu3pbnb.onrender.com
- **API endpoint**: https://nu3pbnb-api.onrender.com
- **Database**: MongoDB Atlas
- **CDN**: Static assets and images

### Environment Variables
```bash
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
NODE_ENV=production
PORT=3000
```

## 📈 Performance

### Optimization
- **Database indexing** for faster queries
- **Image compression** and optimization
- **Code splitting** for smaller bundles
- **Lazy loading** for better performance
- **Caching strategies** for static content

### Monitoring
- **Real-time performance** monitoring
- **Error tracking** and alerting
- **Resource utilization** tracking
- **User experience** metrics

## 🤝 Contributing

### Development Guidelines
- Follow **ESLint** configuration
- Write **comprehensive tests**
- Update **documentation** for new features
- Follow **conventional commits** format

### Getting Started
1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

## 📞 Support

### Contact Information
- **Issues**: [GitHub Issues](https://github.com/rbisnath-3pg/nu3pbnb/issues)
- **Email**: robbie.bisnath@3pillarglobal.com
- **Documentation**: [Full Documentation](documentation/)

### Resources
- **[User Manual](user-manual.md)** - End-user instructions
- **[API Documentation](api-documentation.md)** - Technical reference
- **[Troubleshooting](troubleshooting.md)** - Common issues
- **[Development Guide](development-guide.md)** - Developer setup

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- **3Pillar Global** for project support
- **React** and **Node.js** communities
- **MongoDB** for database technology
- **Vite** for build tooling
- **Tailwind CSS** for styling

---

**nu3PBnB v1.0.0.0 Documentation**  
**Built with ❤️ by Robbie Bisnath at 3Pillar Global** 