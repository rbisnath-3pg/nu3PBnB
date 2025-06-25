# nu3PBnB - Development Guide

## 📋 Overview

This guide provides comprehensive development instructions for the nu3PBnB application. **Updated June 2025 to include new content management, admin testing, analytics, and multilingual development features.**

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

# Start development servers
npm run dev
```

## 🏗️ Project Structure

```
nu3PBnB/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API services
│   │   └── assets/          # Static assets
│   ├── public/              # Public assets
│   └── package.json
├── models/                  # Database models
├── routes/                  # API routes
├── middleware/              # Express middleware
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
- **`logs/`**: Application logs and error tracking

#### Frontend Structure
- **`components/`**: Reusable React components
- **`contexts/`**: React context providers
- **`services/`**: API integration and external services
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
```

### Development Scripts

```bash
# Start development servers
npm run dev              # Backend with nodemon
npm run dev:frontend     # Frontend with Vite

# Database operations
npm run seed             # Seed database
npm run seed:content     # Seed content data
npm run seed:users       # Seed user data

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Linting and formatting
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier

# Build and deployment
npm run build            # Build frontend
npm run start            # Start production server
```

## 📝 Coding Standards

### JavaScript/Node.js Standards

#### Code Style
- Use **ES6+** features
- Prefer **const** and **let** over **var**
- Use **arrow functions** for callbacks
- Use **template literals** for string concatenation
- Use **destructuring** for object/array assignment

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
```

#### API Response Format
```javascript
// Success response
{
  success: true,
  data: { /* response data */ },
  message: 'Operation successful'
}

// Error response
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input data',
    details: { /* error details */ }
  }
}
```

### React Standards

#### Component Structure
```jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ComponentName = ({ prop1, prop2 }) => {
  // Hooks at the top
  const [state, setState] = useState(initialValue);
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};

ComponentName.defaultProps = {
  prop2: 0
};

export default ComponentName;
```

#### State Management
- Use **useState** for local component state
- Use **useContext** for shared state across components
- Use **useReducer** for complex state logic
- Consider **Redux** for large applications

#### Styling
- Use **Tailwind CSS** for styling
- Follow **BEM** methodology for custom CSS
- Use **CSS modules** for component-specific styles
- Maintain consistent spacing and typography

## 🔌 API Development

### Route Structure

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateUser } = require('../middleware/validation');

// GET /api/users - Get all users
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/users - Create user
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
    res.status(401).json({ success: false, error: 'Invalid token.' });
  }
};

module.exports = auth;
```

### Validation

```javascript
// middleware/validation.js
const Joi = require('joi');

const validateUser = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required()
  });
  
  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  
  next();
};

module.exports = { validateUser };
```

## ⚛️ Frontend Development

### Component Development

#### Functional Components
```jsx
// components/UserCard.jsx
import React from 'react';
import PropTypes from 'prop-types';

const UserCard = ({ user, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-4">
        <img 
          src={user.avatar} 
          alt={user.name}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <h3 className="text-lg font-semibold">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>
      <div className="mt-4 flex space-x-2">
        <button 
          onClick={() => onEdit(user)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(user.id)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    avatar: PropTypes.string
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default UserCard;
```

#### Custom Hooks
```jsx
// hooks/useApi.js
import { useState, useEffect } from 'react';

const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

export default useApi;
```

### State Management

#### Context API
```jsx
// contexts/AuthContext.jsx
import React, { createContext, useContext, useReducer } from 'react';

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

  const login = (user) => {
    dispatch({ type: 'LOGIN', payload: user });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
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

## 🗄️ Database Development

### Model Development

```javascript
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['guest', 'host', 'admin'],
    default: 'guest'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profile: {
    avatar: String,
    bio: String,
    phone: String,
    location: String
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Pre-save middleware
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model('User', userSchema);
```

### Database Operations

```javascript
// Database utilities
const mongoose = require('mongoose');

// Connection with options
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Transaction example
const createBookingWithPayment = async (bookingData, paymentData) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const booking = new Booking(bookingData);
      await booking.save({ session });
      
      const payment = new Payment({
        ...paymentData,
        bookingId: booking._id
      });
      await payment.save({ session });
    });
  } finally {
    await session.endSession();
  }
};

module.exports = { connectDB, createBookingWithPayment };
```

## 🧪 Testing Strategy

### Unit Testing

```javascript
// tests/models/User.test.js
const mongoose = require('mongoose');
const User = require('../../models/User');

describe('User Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const user = new User(userData);
      await user.save();

      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.password).not.toBe(userData.password); // Should be hashed
    });

    it('should not create user with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });
  });
});
```

### Integration Testing

```javascript
// tests/routes/auth.test.js
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
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.password).toBeUndefined();
    });
  });
});
```

### Frontend Testing

```jsx
// tests/components/UserCard.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserCard from '../../components/UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg'
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user information correctly', () => {
    render(
      <UserCard 
        user={mockUser} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByAltText('John Doe')).toHaveAttribute('src', mockUser.avatar);
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <UserCard 
        user={mockUser} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );

    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });
});
```

## 🚀 Deployment

### Production Build

```bash
# Build frontend
cd frontend
npm run build
cd ..

# Set production environment
export NODE_ENV=production

# Start production server
npm start
```

### Environment Configuration

```env
# Production Configuration
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://production-db:27017/nu3pbnb
JWT_SECRET=your-production-secret-key
LOG_LEVEL=error
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

## 🛠️ Troubleshooting

### Common Development Issues

#### Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongodb

# Restart MongoDB
sudo systemctl restart mongodb

# Check connection string
echo $MONGODB_URI
```

#### Port Conflicts
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Use different port
PORT=3001 npm run dev
```

#### Node Modules Issues
```bash
# Clear cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### Frontend Build Issues
```bash
# Clear build cache
cd frontend
rm -rf dist node_modules/.vite

# Reinstall and rebuild
npm install
npm run build
```

### Debugging

#### Backend Debugging
```javascript
// Add debug logging
const debug = require('debug')('app:auth');

debug('User authentication attempt:', { email: user.email });

// Use Node.js inspector
node --inspect index.js
```

#### Frontend Debugging
```javascript
// Add console logging
console.log('Component state:', state);

// Use React DevTools
// Install React Developer Tools browser extension
```

### Performance Optimization

#### Database Optimization
```javascript
// Add indexes
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Use lean queries for read-only operations
const users = await User.find().lean();

// Implement pagination
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

const users = await User.find()
  .skip(skip)
  .limit(limit)
  .lean();
```

#### Frontend Optimization
```jsx
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* component logic */}</div>;
});

// Implement lazy loading
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

---

*This development guide should be updated as the project evolves.*

*Last Updated: June 2025*
*Version: 1.0* 