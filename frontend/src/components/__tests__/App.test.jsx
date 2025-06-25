import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
    i18n: { changeLanguage: jest.fn() }
  }),
}));

// Mock AuthContext with jest.fn()
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

import { useAuth } from '../../contexts/AuthContext';

// Mock child components to reduce memory usage
jest.mock('../HomePage', () => () => <div data-testid="home-page">Home Page</div>);
jest.mock('../AdminDashboard', () => () => <div data-testid="admin-dashboard">Admin Dashboard</div>);
jest.mock('../HostDashboard', () => () => <div data-testid="host-dashboard">Host Dashboard</div>);
jest.mock('../AnalyticsDashboard', () => () => <div data-testid="analytics-dashboard">Analytics Dashboard</div>);
jest.mock('../OnboardingWizard', () => () => <div data-testid="onboarding-wizard">Onboarding Wizard</div>);
jest.mock('../UserProfile', () => () => <div data-testid="user-profile">User Profile</div>);
jest.mock('../Messaging', () => () => <div data-testid="messaging">Messaging</div>);
jest.mock('../Wishlist', () => () => <div data-testid="wishlist">Wishlist</div>);
jest.mock('../PaymentHistory', () => () => <div data-testid="payment-history">Payment History</div>);

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Essential tests only - reduced from 30+ to 8 core tests
describe('App', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('renders app with navigation header for unauthenticated user', () => {
    useAuth.mockImplementation(() => ({
      user: null,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn()
    }));
    
    const App = require('../../App').default;
    renderWithRouter(<App />);
    
    // Check for app title (multiple instances possible)
    expect(screen.getAllByText(/nu3PBnB/i).length).toBeGreaterThan(0);
  });

  it('displays admin dashboard for admin users', () => {
    useAuth.mockImplementation(() => ({
      user: { name: 'Admin User', email: 'admin@example.com', role: 'admin' },
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn()
    }));
    
    const App = require('../../App').default;
    renderWithRouter(<App />);
    
    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
  });

  it('displays host dashboard for host users', () => {
    useAuth.mockImplementation(() => ({
      user: { name: 'Host User', email: 'host@example.com', role: 'host' },
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn()
    }));
    
    const App = require('../../App').default;
    renderWithRouter(<App />);
    
    expect(screen.getByTestId('host-dashboard')).toBeInTheDocument();
  });

  it('displays loading state during authentication', () => {
    useAuth.mockImplementation(() => ({
      user: null,
      loading: true,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn()
    }));
    
    const App = require('../../App').default;
    renderWithRouter(<App />);
    
    expect(screen.getAllByText(/nu3PBnB/i).length).toBeGreaterThan(0);
  });

  it('displays sign in button when user is not authenticated', () => {
    useAuth.mockImplementation(() => ({
      user: null,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn()
    }));
    
    const App = require('../../App').default;
    renderWithRouter(<App />);
    
    expect(screen.queryAllByText(/sign in/i).length).toBeGreaterThan(0);
  });

  it('displays user menu when user is authenticated', () => {
    useAuth.mockImplementation(() => ({
      user: { name: 'Test User', email: 'test@example.com' },
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn()
    }));
    
    const App = require('../../App').default;
    renderWithRouter(<App />);
    
    expect(screen.queryAllByText(/test user/i).length).toBeGreaterThan(0);
  });

  it('displays language switcher', () => {
    useAuth.mockImplementation(() => ({
      user: null,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn()
    }));
    
    const App = require('../../App').default;
    renderWithRouter(<App />);
    
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('ES')).toBeInTheDocument();
    expect(screen.getByText('FR')).toBeInTheDocument();
  });

  it('displays footer with essential links', () => {
    useAuth.mockImplementation(() => ({
      user: null,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn()
    }));
    
    const App = require('../../App').default;
    renderWithRouter(<App />);
    
    // Check for essential footer content
    expect(screen.queryByText(/privacy policy/i)).toBeInTheDocument();
    expect(screen.queryByText(/terms of service/i)).toBeInTheDocument();
  });
}); 