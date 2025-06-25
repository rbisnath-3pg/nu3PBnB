# nu3PBnB Frontend

## 📋 Overview

This is the frontend application for nu3PBnB, a modern vacation rental platform built with React 19, Vite, and Tailwind CSS. **Updated January 2025 to include React 19, enhanced content management, admin testing, analytics, multilingual features, and advanced user experience improvements.**

## 🚀 Features

### Core Features
- **React 19.1.0**: Latest React with improved performance
- **Vite 6.3.5**: Fast build tooling and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Complete dark mode support
- **Internationalization**: Multi-language support (EN, ES, FR)

### Advanced Features
- **WYSIWYG Editor**: Rich text editing with TipTap
- **Interactive Maps**: Property location with Leaflet
- **Analytics Dashboard**: Real-time charts with Chart.js
- **Payment Integration**: Apple Pay, Google Pay, PayPal
- **File Upload**: Profile pictures and message attachments
- **Real-time Updates**: Live data updates and notifications

### Admin Features
- **Admin Dashboard**: Comprehensive admin interface
- **Test Results Dashboard**: Automated testing monitoring
- **Content Management**: Dynamic content editing
- **User Management**: Advanced user administration
- **Analytics Dashboard**: Real-time analytics and reporting

## 🛠️ Tech Stack

### Core Technologies
- **React 19.1.0**: Latest React with improved performance
- **Vite 6.3.5**: Fast build tooling and development server
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **React Router DOM 7.6.2**: Client-side routing

### UI & UX
- **React Icons 5.5.0**: Comprehensive icon library
- **React Testing Library**: Component testing
- **ESLint 9.25.0**: Code linting and formatting

### Data Visualization
- **Chart.js 4.5.0**: Interactive charts and graphs
- **React Chart.js 2 5.3.0**: React wrapper for Chart.js

### Maps & Location
- **Leaflet 1.9.4**: Interactive maps
- **React Leaflet 5.0.0**: React wrapper for Leaflet

### Rich Text Editing
- **TipTap 2.22.3**: Rich text editor
- **@tiptap/react**: React integration for TipTap
- **@tiptap/starter-kit**: Essential TipTap extensions

### Internationalization
- **i18next 25.2.1**: Internationalization framework
- **react-i18next 15.5.3**: React integration for i18next
- **i18next-browser-languagedetector 8.2.0**: Language detection

### Utilities
- **date-fns 4.1.0**: Date manipulation library
- **jsPDF 3.0.1**: PDF generation
- **jspdf-autotable 5.0.2**: PDF table generation

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Backend API running

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Development

### Available Scripts
```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Linting
npm run lint             # Run ESLint
```

### Environment Variables
Create a `.env` file in the frontend directory:
```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_MAPS=true
VITE_ENABLE_PAYMENTS=true

# Internationalization
VITE_DEFAULT_LANGUAGE=en
VITE_SUPPORTED_LANGUAGES=en,fr,es
```

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── __tests__/      # Component tests
│   │   ├── AdminDashboard.jsx
│   │   ├── AnalyticsDashboard.jsx
│   │   ├── HomePage.jsx
│   │   ├── PaymentHistory.jsx
│   │   └── ...
│   ├── contexts/           # React contexts
│   │   └── AuthContext.jsx
│   ├── services/           # API services
│   │   └── analytics.js
│   ├── locales/            # Internationalization
│   │   ├── en/
│   │   ├── es/
│   │   └── fr/
│   ├── assets/             # Static assets
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # App entry point
│   └── index.css           # Global styles
├── public/                 # Public assets
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── eslint.config.js        # ESLint configuration
```

## 🧪 Testing

### Component Testing
```bash
# Run all tests
npm test

# Run specific component tests
npm test -- PropertyCard.test.jsx

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **Accessibility Tests**: WCAG compliance testing

## 🌍 Internationalization

### Supported Languages
- **English (en)**: Default language
- **French (fr)**: Français
- **Spanish (es)**: Español

### Adding New Languages
1. Create translation file in `src/locales/[lang]/translation.json`
2. Add language to supported languages in `i18n.js`
3. Update language switcher component

## 🎨 Styling

### Tailwind CSS
- Utility-first CSS framework
- Custom design system
- Responsive breakpoints
- Dark mode support

### Custom Components
- Reusable component library
- Consistent design patterns
- Accessibility compliance
- Mobile-first approach

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Optimization
- Touch-friendly interactions
- Optimized performance
- Progressive enhancement
- Offline capabilities

## 🚀 Performance

### Optimization Features
- **Code Splitting**: Dynamic imports
- **Lazy Loading**: Component lazy loading
- **Image Optimization**: Responsive images
- **Caching**: Browser caching strategies
- **Bundle Optimization**: Vite build optimization

### Performance Monitoring
- **Lighthouse**: Performance auditing
- **Bundle Analyzer**: Bundle size analysis
- **Real User Monitoring**: Performance tracking

## 🔒 Security

### Security Features
- **Content Security Policy**: XSS protection
- **HTTPS Enforcement**: Secure connections
- **Input Validation**: Client-side validation
- **Token Management**: Secure authentication

## 📊 Analytics

### Analytics Integration
- **User Behavior**: Page views and interactions
- **Performance Metrics**: Load times and errors
- **Conversion Tracking**: Booking conversions
- **Real-time Dashboard**: Live analytics

## 🚀 Deployment

### Build Process
```bash
# Build for production
npm run build

# Preview build
npm run preview
```

### Deployment Options
- **Vercel**: Recommended for frontend
- **Netlify**: Static site hosting
- **GitHub Pages**: Free hosting
- **AWS S3**: Scalable hosting

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

### Code Standards
- Follow ESLint configuration
- Use Prettier for formatting
- Write comprehensive tests
- Document new features

## 📚 Documentation

- [Main Project README](../README.md)
- [API Documentation](../documentation/api-documentation.md)
- [Development Guide](../documentation/development-guide.md)
- [User Manual](../documentation/user-manual.md)

## 🆘 Support

For support and questions:
- Check the [Troubleshooting Guide](../documentation/troubleshooting.md)
- Review the [User Manual](../documentation/user-manual.md)
- Consult the [API Documentation](../documentation/api-documentation.md)

---

**Last Updated**: January 2025  
**Version**: 2.0 - Enhanced with React 19, Content Management, Admin Testing, Analytics, and Multilingual Features
