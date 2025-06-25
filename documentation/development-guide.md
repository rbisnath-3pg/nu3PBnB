# nu3PBnB - Development Guide

## 📋 Overview

This guide provides comprehensive development instructions for the nu3PBnB application. **Updated January 2025 to include React 19, enhanced content management, admin testing, analytics, multilingual development features, and advanced user experience improvements.**

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Environment](#development-environment)
4. [Coding Standards](#coding-standards)
5. [API Development](#api-development)
6. [Frontend Development](#frontend-development)
7. [Database Development](#database-development)
8. [Testing Strategy](#testing-strategy)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

## 🚀 Getting Started

### Prerequisites

Before starting development, ensure you have:

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher) or **yarn**
- **MongoDB** (v5.0 or higher)
- **Git** (v2.30 or higher)
- **VS Code** (recommended) with extensions:
  - ESLint
  - Prettier
  - MongoDB for VS Code
  - REST Client
  - React Developer Tools
  - Tailwind CSS IntelliSense

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-username/nu3PBnB.git
cd nu3PBnB

# Install dependencies
npm install
cd frontend && npm install && cd ..

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Initialize database
npm run init-db

# Seed the database
npm run seed

# Start development servers
npm run dev
```

## 🏗️ Project Structure

```
nu3PBnB/
├── frontend/                 # React 19 frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API services
│   │   ├── locales/         # Internationalization files
│   │   └── assets/          # Static assets
│   ├── public/              # Public assets
│   └── package.json
├── models/                  # Database models
├── routes/                  # API routes
├── middleware/              # Express middleware
├── scripts/                 # Database and utility scripts
├── logs/                    # Application logs
├── documentation/           # Project documentation
├── tests/                   # Test files
├── index.js                 # Application entry point
└── package.json
```

### Key Directories

#### Backend Structure
- **`models/`**: Mongoose schemas and models
- **`routes/`**: Express route handlers
- **`middleware/`**: Express middleware functions
- **`scripts/`**: Database initialization and utility scripts
- **`logs/`**: Application logs and error tracking

#### Frontend Structure
- **`components/`**: Reusable React components
- **`contexts/`**: React context providers
- **`services/`**: API integration and external services
- **`locales/`**: Internationalization files (en, fr, es)
- **`assets/`**: Images, icons, and static files

## 🔧 Development Environment

### Environment Variables

Create a `.env` file in the root directory:

```env
# Development Configuration
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/nu3pbnb_dev

# JWT
JWT_SECRET=your-development-secret-key
JWT_EXPIRES_IN=7d

# Email (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Payment (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key

# File Upload (Optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Logging
LOG_LEVEL=debug

# Analytics (Optional)
ANALYTICS_ENABLED=true
ANALYTICS_TRACKING_ID=your_tracking_id

# Testing
TEST_DATABASE_URI=mongodb://localhost:27017/nu3pbnb_test
```

### Development Scripts

```bash
# Start development servers
npm run dev              # Frontend with Vite
npm run server           # Backend with nodemon
npm start                # Production backend

# Database operations
npm run init-db          # Initialize database
npm run reset-db         # Reset database
npm run seed             # Seed database with test data
npm run seed:content     # Seed content data
npm run seed:users       # Seed user data
npm run seed:payments    # Seed payment data
npm run seed:analytics   # Seed analytics data

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:frontend    # Run frontend tests only
npm run test:backend     # Run backend tests only
npm run test:scheduled   # Start automated testing

# Linting and formatting
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues

# Build and deployment
npm run build            # Build frontend
npm run preview          # Preview production build

# Utilities
npm run create-admin     # Create admin user
npm run list-users       # List all users
npm run reset-passwords  # Reset user passwords
```

## 📝 Coding Standards

### JavaScript/Node.js Standards

#### Code Style
- Use **ES6+** features
- Prefer **const** and **let** over **var**
- Use **arrow functions** for callbacks
- Use **template literals** for string concatenation
- Use **destructuring** for object/array assignment
- Use **async/await** for asynchronous operations

#### Naming Conventions
```javascript
// Variables and functions: camelCase
const userName = 'john';
const getUserData = () => {};

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;

// Classes: PascalCase
class UserService {
  constructor() {}
}

// Files: kebab-case
// user-service.js, booking-controller.js
```

#### Error Handling
```javascript
// Use try-catch for async operations
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  logger.error('Operation failed:', error);
  throw new Error('Operation failed');
}

// Use custom error classes
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Consistent error responses
const errorResponse = (res, status, message, code = null) => {
  return res.status(status).json({
    success: false,
    error: message,
    code: code
  });
};
```

### React Standards

#### Component Structure
```jsx
// Functional components with hooks
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const UserProfile = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdate(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <div className="user-profile">
      {/* Component JSX */}
    </div>
  );
};

UserProfile.propTypes = {
  user: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default UserProfile;
```

#### Hooks Usage
```jsx
// Custom hooks for reusable logic
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

// Usage in components
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

#### State Management
```jsx
// Use Context for global state
import { createContext, useContext, useReducer } from 'react';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false
  });

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## 🔌 API Development

### Route Structure
```javascript
// routes/users.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateUser } = require('../middleware/validation');

// GET /api/users - Get all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/users - Create new user
router.post('/', validateUser, async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### Middleware Development
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid token.' 
    });
  }
};

module.exports = auth;
```

### Validation Middleware
```javascript
// middleware/validation.js
const { body, validationResult } = require('express-validator');

const validateUser = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

module.exports = { validateUser };
```

## 🎨 Frontend Development

### Component Development
```jsx
// components/PropertyCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const PropertyCard = ({ property, onBook, onWishlist }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={property.photos[0]}
          alt={property.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = '/images/placeholder.jpg';
          }}
        />
        <div className="absolute top-2 right-2">
          <button
            onClick={() => onWishlist(property._id)}
            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          >
            ❤️
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {property.title}
        </h3>
        <p className="text-gray-600 text-sm mb-2">
          {property.location.city}, {property.location.country}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-blue-600">
            ${property.price}/night
          </span>
          <button
            onClick={() => onBook(property)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {t('common.bookNow')}
          </button>
        </div>
      </div>
    </div>
  );
};

PropertyCard.propTypes = {
  property: PropTypes.object.isRequired,
  onBook: PropTypes.func.isRequired,
  onWishlist: PropTypes.func.isRequired
};

export default PropertyCard;
```

### Internationalization
```jsx
// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.json';
import frTranslation from './locales/fr/translation.json';
import esTranslation from './locales/es/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      fr: { translation: frTranslation },
      es: { translation: esTranslation }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

### Service Layer
```javascript
// services/api.js
import axios from 'axios';

const API_BASE = import.meta.env.PROD 
  ? 'https://nu3pbnb-api.onrender.com/api'
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## 🗄️ Database Development

### Model Development
```javascript
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['guest', 'host', 'admin'],
    default: 'guest'
  },
  profile: {
    avatar: String,
    bio: String,
    phone: String,
    location: String,
    profilePicture: String,
    profilePictureData: Buffer
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    language: {
      type: String,
      enum: ['en', 'fr', 'es'],
      default: 'en'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### Database Indexes
```javascript
// Create indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1 });

// Compound indexes for complex queries
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ email: 1, isActive: 1 });
```

## 🧪 Testing Strategy

### Unit Testing
```javascript
// __tests__/User.test.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('User Model', () => {
  it('should create a user with valid data', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'guest'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.role).toBe(userData.role);
    expect(savedUser.password).not.toBe(userData.password); // Should be hashed
  });

  it('should not create user with invalid email', async () => {
    const userData = {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'password123'
    };

    const user = new User(userData);
    await expect(user.save()).rejects.toThrow();
  });
});
```

### Integration Testing
```javascript
// routes/__tests__/auth.test.js
const request = require('supertest');
const app = require('../../index');
const User = require('../../models/User');

describe('Auth Routes', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(userData.name);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.token).toBeDefined();
    });
  });
});
```

### Component Testing
```jsx
// components/__tests__/PropertyCard.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import PropertyCard from '../PropertyCard';

const mockProperty = {
  _id: '1',
  title: 'Beautiful Apartment',
  photos: ['https://example.com/photo.jpg'],
  location: { city: 'Paris', country: 'France' },
  price: 100
};

const mockOnBook = jest.fn();
const mockOnWishlist = jest.fn();

const renderWithI18n = (component) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

describe('PropertyCard', () => {
  it('renders property information correctly', () => {
    renderWithI18n(
      <PropertyCard
        property={mockProperty}
        onBook={mockOnBook}
        onWishlist={mockOnWishlist}
      />
    );

    expect(screen.getByText('Beautiful Apartment')).toBeInTheDocument();
    expect(screen.getByText('Paris, France')).toBeInTheDocument();
    expect(screen.getByText('$100/night')).toBeInTheDocument();
  });

  it('calls onBook when book button is clicked', () => {
    renderWithI18n(
      <PropertyCard
        property={mockProperty}
        onBook={mockOnBook}
        onWishlist={mockOnWishlist}
      />
    );

    fireEvent.click(screen.getByText(/book now/i));
    expect(mockOnBook).toHaveBeenCalledWith(mockProperty);
  });
});
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend for production
cd frontend
npm run build
cd ..

# Start production server
npm start
```

### Environment Configuration
```env
# Production Configuration
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nu3pbnb

# JWT
JWT_SECRET=your-production-secret-key
JWT_EXPIRES_IN=7d

# Security
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000

# Logging
LOG_LEVEL=info
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN cd frontend && npm ci && npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check connection string
echo $MONGODB_URI
```

#### Frontend Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf frontend/node_modules/.vite
```

#### Test Issues
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- PropertyCard.test.jsx

# Check test coverage
npm run test:coverage
```

### Performance Optimization

#### Database Optimization
```javascript
// Use indexes for frequently queried fields
db.users.createIndex({ email: 1 });
db.listings.createIndex({ location: "2dsphere" });

// Use projection to limit returned fields
const users = await User.find().select('name email role');

// Use pagination for large datasets
const users = await User.find()
  .limit(10)
  .skip((page - 1) * 10);
```

#### Frontend Optimization
```jsx
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Component content */}</div>;
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Use useCallback for stable function references
const handleClick = useCallback(() => {
  // Handle click
}, [dependencies]);
```

---

*Last Updated: January 2025*  
*Version: 2.0 - Enhanced with React 19, Content Management, Admin Testing, Analytics, and Multilingual Features* 