# Technology Stack Documentation

## Overview

nu3PBnB is a full-stack JavaScript application built using the MERN stack (MongoDB, Express.js, React, Node.js) with modern web development practices and comprehensive testing infrastructure.

## Architecture

### Application Type
- **Full-Stack JavaScript/Node.js Application**
- **MERN Stack** (MongoDB, Express.js, React, Node.js)
- **Monorepo Structure** (Backend + Frontend in single repository)
- **RESTful API** with JWT authentication
- **Single Page Application (SPA)** with client-side routing

### Project Structure
```
nu3PBnB/
├── frontend/          # React frontend application
├── routes/           # Express.js API routes
├── models/           # Mongoose data models
├── middleware/       # Express.js middleware
├── scripts/          # Database and utility scripts
├── documentation/    # Project documentation
└── package.json      # Root dependencies
```

## Backend Technologies

### Core Framework & Runtime
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework for Node.js
- **MongoDB** - NoSQL document database
- **Mongoose** - MongoDB object modeling for Node.js

### Authentication & Security
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing and verification
- **express-rate-limit** - Rate limiting middleware for API protection
- **CORS** - Cross-Origin Resource Sharing middleware

### File Handling & Media
- **Multer** - File upload middleware for handling multipart/form-data
- **Image processing** for profile pictures and listing photos
- **File system operations** for storing and serving static assets

### Internationalization (i18n)
- **i18next** - Internationalization framework
- **i18next-fs-backend** - File system backend for translations
- **i18next-http-backend** - HTTP backend for dynamic translations
- **i18next-http-middleware** - Express middleware for i18n

### Utilities & Libraries
- **Axios** - HTTP client for making API requests
- **UUID** - Unique identifier generation
- **Winston** - Logging library for structured logging
- **Node-cron** - Task scheduling for automated processes
- **@faker-js/faker** - Test data generation for development and testing
- **dotenv** - Environment variable management

## Frontend Technologies

### Core Framework
- **React 19.1.0** - UI library for building user interfaces
- **React Router DOM 7.6.2** - Client-side routing
- **Vite 6.3.5** - Build tool and development server

### Styling & UI
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **PostCSS 8.5.6** - CSS processing and transformation
- **Autoprefixer 10.4.21** - CSS vendor prefixing
- **React Icons 5.5.0** - Icon library with popular icon sets

### Maps & Visualization
- **Leaflet 1.9.4** - Interactive maps library
- **React Leaflet 5.0.0** - React wrapper for Leaflet
- **Chart.js 4.5.0** - Charting library for data visualization
- **React Chart.js 2 5.3.0** - React wrapper for Chart.js

### Rich Text & Document Generation
- **TipTap 2.22.3** - Rich text editor framework
- **TipTap Starter Kit 2.22.3** - Essential extensions for TipTap
- **jsPDF 3.0.1** - PDF generation library
- **jsPDF AutoTable 5.0.2** - PDF table generation plugin

### Date Handling
- **date-fns 4.1.0** - Modern JavaScript date utility library

### Internationalization
- **react-i18next 15.5.3** - React internationalization
- **i18next-browser-languagedetector 8.2.0** - Language detection

## Testing & Development

### Testing Framework
- **Jest 30.0.2** - JavaScript testing framework
- **React Testing Library 16.3.0** - React component testing utilities
- **@testing-library/jest-dom 6.6.3** - Custom Jest matchers for DOM testing
- **@testing-library/user-event 14.6.1** - User event simulation
- **Supertest 7.1.1** - HTTP assertion library for API testing
- **MongoDB Memory Server 8.12.2** - In-memory MongoDB for testing

### Development Tools
- **ESLint 9.25.0** - Code linting and formatting
- **ESLint React Hooks Plugin 5.2.0** - React Hooks linting rules
- **ESLint React Refresh Plugin 0.4.19** - React Refresh linting
- **Babel 7.24.0** - JavaScript transpiler
- **Nodemon 3.1.10** - Development server with auto-restart

### Build Tools
- **Vite** - Frontend build tool and dev server
- **Babel** - JavaScript compilation and transpilation
- **Identity Object Proxy 3.0.0** - CSS module mocking for tests

## Deployment & Infrastructure

### Hosting Platform
- **Render** - Cloud hosting platform
  - Static site hosting for frontend
  - Web service hosting for backend
  - MongoDB database hosting

### Environment Management
- **dotenv** - Environment variable management
- **Process environment variables** for configuration
- **Render environment variables** for production settings

### Build & Deployment
- **Vite build** - Frontend production build
- **Node.js production server** - Backend deployment
- **Static file serving** - Frontend assets
- **API proxy configuration** - Development environment

## Key Features & Integrations

### Payment Processing
- Custom payment modal implementation
- Booking and payment management system
- Payment history tracking
- Receipt generation

### Real-time Features
- Messaging system between users
- Notification system with real-time updates
- Unread message counting
- Live booking status updates

### Analytics & Tracking
- Custom analytics service implementation
- User behavior tracking
- Booking analytics
- Performance monitoring

### Multi-language Support
- English, Spanish, French translations
- Dynamic language switching
- Locale-specific content
- RTL language support preparation

### Role-based Access Control
- **Guest** - Browse listings, make bookings, manage profile
- **Host** - Manage listings, view bookings, host dashboard
- **Admin** - System administration, user management, analytics

### User Management
- User registration and authentication
- Profile management with image uploads
- Password reset functionality
- Email verification system

## Modern Web Features

### Progressive Web App (PWA)
- Service worker implementation ready
- Offline functionality support
- App-like experience
- Push notification capabilities

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Responsive breakpoints for all devices
- Touch-friendly interface
- Optimized for tablets and desktops

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

### Performance Optimization
- Code splitting with React Router
- Lazy loading of components
- Image optimization
- Bundle size optimization

### SEO Optimization
- Meta tags management
- Open Graph tags
- Structured data markup
- Sitemap generation ready

## Development Workflow

### Version Control
- Git for source code management
- Feature branch workflow
- Pull request reviews
- Automated testing on commits

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- Type checking with JSDoc
- Code review process

### Testing Strategy
- Unit tests for components and utilities
- Integration tests for API endpoints
- End-to-end testing preparation
- Test coverage reporting

### Continuous Integration/Deployment
- Automated testing on push
- Build verification
- Deployment to staging/production
- Environment-specific configurations

## Security Features

### Authentication & Authorization
- JWT token-based authentication
- Secure password hashing with bcrypt
- Role-based access control
- Session management

### API Security
- Rate limiting to prevent abuse
- CORS configuration
- Input validation and sanitization
- SQL injection prevention (MongoDB)

### Data Protection
- Environment variable management
- Secure API key handling
- HTTPS enforcement in production
- Data encryption at rest

## Monitoring & Logging

### Application Monitoring
- Winston logging framework
- Error tracking and reporting
- Performance monitoring
- User analytics

### Database Monitoring
- MongoDB connection monitoring
- Query performance tracking
- Database health checks
- Backup and recovery procedures

## Future Technology Considerations

### Potential Upgrades
- TypeScript migration for type safety
- GraphQL API for more efficient data fetching
- WebSocket implementation for real-time features
- Microservices architecture for scalability

### Performance Enhancements
- Redis caching layer
- CDN integration for static assets
- Database indexing optimization
- Image CDN for media files

### Advanced Features
- Machine learning for recommendations
- Blockchain integration for payments
- IoT integration for smart home features
- Mobile app development (React Native)

---

*This documentation is maintained as part of the nu3PBnB project and should be updated as the technology stack evolves.* 