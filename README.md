# nu3PBnB v1.0.0.0 🏠

**A comprehensive property booking platform with real-time availability, secure payments, and multi-language support**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-green?style=for-the-badge)](https://nu3pbnb.onrender.com)
[![API Status](https://img.shields.io/badge/API-Online-green?style=for-the-badge)](https://nu3pbnb-api.onrender.com)
[![Version](https://img.shields.io/badge/Version-1.0.0.0-blue?style=for-the-badge)](https://github.com/rbisnath-3pg/nu3pbnb/releases/tag/v1.0.0.0)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

## 🌟 Features

### 🏠 **Property Management**
- **Multi-property listings** with detailed descriptions and photos
- **Real-time availability calendar** with conflict detection
- **Advanced search and filtering** by location, price, amenities
- **Featured properties** with rotation system
- **Property categories** (Apartments, Houses, Cabins, etc.)

### 👥 **User Management**
- **Multi-role system**: Guests, Hosts, and Admins
- **Secure authentication** with JWT tokens
- **User profiles** with preferences and history
- **Guest and host dashboards** with personalized views
- **Admin panel** for system management

### 📅 **Booking System**
- **Real-time availability checking** with conflict prevention
- **Flexible date selection** with minimum/maximum stay rules
- **Instant booking confirmation** with automatic approval
- **Booking status tracking** (Pending, Approved, Declined, Cancelled)
- **Guest count validation** per property

### 💳 **Payment Processing**
- **Secure payment processing** with multiple payment methods
- **Automatic booking approval** upon successful payment
- **Payment history tracking** with receipts
- **Refund processing** capabilities
- **Transaction security** with validation

### 🌍 **Internationalization**
- **Multi-language support**: English, Spanish, French
- **Dynamic language switching** without page reload
- **Localized content** and user interfaces
- **Cultural adaptation** for different regions

### 📊 **Analytics & Insights**
- **Real-time analytics** dashboard
- **User behavior tracking** and insights
- **Booking performance metrics**
- **Revenue analytics** for hosts
- **System health monitoring**

### 🔧 **Technical Features**
- **Responsive design** for all devices
- **Progressive Web App** capabilities
- **Real-time notifications** and messaging
- **Image optimization** and CDN support
- **SEO optimization** for better discoverability

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

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **MongoDB** (local or cloud)
- **Git**

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/rbisnath-3pg/nu3pbnb.git
cd nu3pbnb
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Configure your environment variables
MONGODB_URI=mongodb://localhost:27017/nu3pbnb
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

### 4. Initialize Database
```bash
# Initialize with sample data
npm run init-db
```

### 5. Start Development Servers
```bash
# Start backend server
npm run server

# Start frontend development server (in new terminal)
npm run dev
```

## 🏗️ Architecture

### Backend (Node.js/Express)
```
├── routes/           # API endpoints
├── models/           # MongoDB schemas
├── middleware/       # Authentication, validation
├── scripts/          # Database initialization
└── utils/            # Helper functions
```

### Frontend (React/Vite)
```
├── src/
│   ├── components/   # React components
│   ├── contexts/     # React contexts
│   ├── services/     # API services
│   └── locales/      # Internationalization
└── public/           # Static assets
```

## 🔌 API Endpoints

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

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Backend tests
npm run test:backend

# Frontend tests
npm run test:frontend

# API tests
npm run test:api
```

### Test Coverage
```bash
npm run test:ci
```

## 📦 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build
cd ..

# Start production server
npm start
```

### Environment Variables (Production)
```bash
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
NODE_ENV=production
PORT=3000
```

## 🔧 Configuration

### Database Configuration
- **MongoDB** with Mongoose ODM
- **Connection pooling** for performance
- **Index optimization** for queries
- **Data validation** at schema level

### Security Features
- **JWT authentication** with refresh tokens
- **Password hashing** with bcrypt
- **Rate limiting** on API endpoints
- **CORS configuration** for cross-origin requests
- **Input validation** and sanitization

### Performance Optimization
- **Image compression** and optimization
- **Lazy loading** for components
- **Caching strategies** for static content
- **Database query optimization**

## 📚 Documentation

### User Guides
- [User Manual](documentation/user-manual.md)
- [Host Guide](documentation/host-guide.md)
- [Admin Guide](documentation/admin-guide.md)

### Technical Documentation
- [API Documentation](documentation/api-documentation.md)
- [Database Schema](documentation/database-schema.md)
- [Architecture Overview](documentation/architecture.md)
- [Development Guide](documentation/development-guide.md)

### Deployment Guides
- [Installation Guide](documentation/installation-guide.md)
- [Deployment Guide](documentation/deployment.md)
- [Troubleshooting](documentation/troubleshooting.md)

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow **ESLint** configuration
- Write **comprehensive tests**
- Update **documentation** for new features
- Follow **conventional commits** format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **3Pillar Global** for project support
- **React** and **Node.js** communities
- **MongoDB** for database technology
- **Vite** for build tooling
- **Tailwind CSS** for styling

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/rbisnath-3pg/nu3pbnb/issues)
- **Email**: robbie.bisnath@3pillarglobal.com
- **Documentation**: [Full Documentation](documentation/)

## 🎉 Release Notes

### v1.0.0.0 (2025-01-26)
- ✅ **Initial production release**
- ✅ **Complete booking system** with payment integration
- ✅ **Multi-language support** (EN, ES, FR)
- ✅ **Real-time availability** and conflict detection
- ✅ **Comprehensive testing** suite with 90%+ coverage
- ✅ **Production deployment** on Render.com
- ✅ **Admin dashboard** with analytics
- ✅ **Responsive design** for all devices
- ✅ **Security hardening** and validation
- ✅ **Performance optimization** and caching

---

**Built with ❤️ by Robbie Bisnath at 3Pillar Global**
