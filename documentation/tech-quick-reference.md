# Technology Quick Reference Guide

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas)

### Installation
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Start development servers
npm run dev          # Frontend (Vite)
npm run server       # Backend (Nodemon)
```

## 📋 Technology Stack Summary

### Backend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | Latest LTS | Runtime environment |
| Express.js | 5.1.0 | Web framework |
| MongoDB | 5.7.0 | Database |
| Mongoose | 7.6.3 | ODM |
| JWT | 9.0.2 | Authentication |
| bcryptjs | 3.0.2 | Password hashing |

### Frontend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.0 | UI library |
| Vite | 6.3.5 | Build tool |
| Tailwind CSS | 3.4.17 | Styling |
| React Router | 7.6.2 | Routing |
| Leaflet | 1.9.4 | Maps |

### Testing Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| Jest | 30.0.2 | Testing framework |
| React Testing Library | 16.3.0 | Component testing |
| Supertest | 7.1.1 | API testing |

## 🔧 Key Commands

### Development
```bash
npm run dev          # Start frontend dev server
npm run server       # Start backend with nodemon
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
```

### Building
```bash
cd frontend && npm run build  # Build frontend for production
npm start                     # Start production server
```

### Database
```bash
npm run init-db      # Initialize database
npm run reset-db     # Reset database
```

## 🌐 API Endpoints

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://nu3pbnb-api.onrender.com/api`

### Key Endpoints
```
GET    /listings              # Get all listings
POST   /auth/login            # User login
POST   /auth/register         # User registration
GET    /bookings              # Get user bookings
POST   /bookings              # Create booking
GET    /messages              # Get messages
POST   /messages              # Send message
```

## 🗄️ Database Models

### Core Models
- **User** - User accounts and profiles
- **Listing** - Property listings
- **Booking** - Booking requests and confirmations
- **Message** - User messaging system
- **Payment** - Payment records
- **Review** - Property reviews

### Relationships
```
User (1) ←→ (Many) Listing
User (1) ←→ (Many) Booking
User (1) ←→ (Many) Message
Listing (1) ←→ (Many) Review
```

## 🔐 Authentication

### JWT Token Structure
```javascript
{
  "userId": "user_id",
  "email": "user@example.com",
  "role": "guest|host|admin",
  "iat": "issued_at",
  "exp": "expiration_time"
}
```

### Protected Routes
- All routes except `/auth/login` and `/auth/register`
- Include `Authorization: Bearer <token>` header

## 🌍 Internationalization

### Supported Languages
- **English** (en) - Default
- **Spanish** (es)
- **French** (fr)

### Translation Files
```
locales/
├── en/translation.json
├── es/translation.json
└── fr/translation.json
```

### Usage in React
```javascript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
return <h1>{t('common.welcome')}</h1>;
```

## 🎨 Styling Guidelines

### Tailwind CSS Classes
```css
/* Common patterns */
.container { @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8; }
.button-primary { @apply px-4 py-2 bg-blue-600 text-white rounded-lg; }
.card { @apply bg-white dark:bg-gray-800 rounded-lg shadow-lg; }
```

### Dark Mode
- Uses `dark:` prefix for dark mode styles
- Toggle with `setDarkMode(!darkMode)`
- Stored in localStorage

## 🧪 Testing Patterns

### Component Testing
```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### API Testing
```javascript
import request from 'supertest';
import app from '../app';

test('GET /api/listings', async () => {
  const response = await request(app).get('/api/listings');
  expect(response.status).toBe(200);
});
```

## 📱 Responsive Design

### Breakpoints
```css
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
```

### Mobile-First Approach
- Start with mobile styles
- Add responsive modifiers for larger screens
- Use `flex` and `grid` for layouts

## 🔄 State Management

### React Context
- **AuthContext** - User authentication state
- **ThemeContext** - Dark/light mode
- **LanguageContext** - Internationalization

### Local State
- Use `useState` for component-level state
- Use `useEffect` for side effects
- Use `useCallback` for memoized functions

## 📊 Performance Optimization

### Code Splitting
- React Router lazy loading
- Dynamic imports for heavy components
- Bundle analysis with Vite

### Image Optimization
- Lazy loading with `loading="lazy"`
- WebP format support
- Responsive images with `srcset`

## 🚀 Deployment

### Environment Variables
```bash
# Backend
NODE_ENV=production
MONGODB_URI=mongodb://...
JWT_SECRET=your_secret_key
PORT=10000

# Frontend
VITE_API_URL=https://nu3pbnb-api.onrender.com
```

### Build Process
1. Frontend: `npm run build` (Vite)
2. Backend: `npm start` (Node.js)
3. Static files served from `frontend/dist`

## 🔍 Debugging

### Common Issues
- **CORS errors**: Check API_BASE configuration
- **JWT errors**: Verify token expiration
- **MongoDB connection**: Check MONGODB_URI
- **Build errors**: Clear node_modules and reinstall

### Debug Commands
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json && npm install
```

## 📚 Additional Resources

### Documentation
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

### Tools
- [Vite Documentation](https://vitejs.dev/)
- [Jest Testing Framework](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

*This quick reference guide is designed for developers working on the nu3PBnB project. For detailed documentation, see `technology-stack.md`.* 