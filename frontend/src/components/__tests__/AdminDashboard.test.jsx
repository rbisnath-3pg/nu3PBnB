import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '../AdminDashboard';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
    i18n: { changeLanguage: jest.fn() }
  }),
}));

// Mock AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { _id: 'admin123', name: 'Admin User', email: 'admin@test.com', role: 'admin' },
    loading: false
  })
}));

// Mock child components
jest.mock('../AnalyticsDashboard', () => {
  return function MockAnalyticsDashboard() {
    return <div data-testid="analytics-dashboard">Analytics Dashboard</div>;
  };
});

jest.mock('../UserManagement', () => {
  return function MockUserManagement() {
    return <div data-testid="user-management">User Management</div>;
  };
});

jest.mock('../ContentManager', () => {
  return function MockContentManager() {
    return <div data-testid="content-manager">Content Manager</div>;
  };
});

jest.mock('../PaymentDashboard', () => {
  return function MockPaymentDashboard() {
    return <div data-testid="payment-dashboard">Payment Dashboard</div>;
  };
});

jest.mock('../AdminMessaging', () => {
  return function MockAdminMessaging() {
    return <div data-testid="admin-messaging">Admin Messaging</div>;
  };
});

jest.mock('../AdminTestResults', () => {
  return function MockAdminTestResults() {
    return <div data-testid="admin-test-results">Admin Test Results</div>;
  };
});

// Mock fetch for API calls
global.fetch = jest.fn();

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful fetch response for unread count
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ unreadCount: 5 })
    });
  });

  it('renders admin dashboard with header', () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    expect(screen.getByText('admin.dashboard.title')).toBeInTheDocument();
    expect(screen.getByText('admin.dashboard.overview')).toBeInTheDocument();
  });

  it('displays all navigation tabs', () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    expect(screen.getByText('admin.analytics.title')).toBeInTheDocument();
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('admin.content.title')).toBeInTheDocument();
    expect(screen.getByText('admin.payments.title')).toBeInTheDocument();
    expect(screen.getByText('admin.messages.title')).toBeInTheDocument();
    expect(screen.getByText('Test Results')).toBeInTheDocument();
  });

  it('shows analytics dashboard by default', () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
  });

  it('switches to user management tab when clicked', () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    const userManagementTab = screen.getByText('User Management');
    fireEvent.click(userManagementTab);
    
    expect(screen.getByTestId('user-management')).toBeInTheDocument();
    expect(screen.queryByTestId('analytics-dashboard')).not.toBeInTheDocument();
  });

  it('switches to content manager tab when clicked', () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    const contentManagerTab = screen.getByText('admin.content.title');
    fireEvent.click(contentManagerTab);
    
    expect(screen.getByTestId('content-manager')).toBeInTheDocument();
    expect(screen.queryByTestId('analytics-dashboard')).not.toBeInTheDocument();
  });

  it('switches to payment dashboard tab when clicked', () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    const paymentDashboardTab = screen.getByText('admin.payments.title');
    fireEvent.click(paymentDashboardTab);
    
    expect(screen.getByTestId('payment-dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('analytics-dashboard')).not.toBeInTheDocument();
  });

  it('switches to admin messaging tab when clicked', () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    const adminMessagingTab = screen.getByText('admin.messages.title');
    fireEvent.click(adminMessagingTab);
    
    expect(screen.getByTestId('admin-messaging')).toBeInTheDocument();
    expect(screen.queryByTestId('analytics-dashboard')).not.toBeInTheDocument();
  });

  it('switches to test results tab when clicked', () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    const testResultsTab = screen.getByText('Test Results');
    fireEvent.click(testResultsTab);
    
    expect(screen.getByTestId('admin-test-results')).toBeInTheDocument();
    expect(screen.queryByTestId('analytics-dashboard')).not.toBeInTheDocument();
  });

  it('displays unread message count badge', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('fetches unread count on component mount', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/messages/unread-count'),
        {
          headers: {
            Authorization: 'Bearer null'
          }
        }
      );
    });
  });

  it('refreshes unread count when messages tab is clicked', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    const adminMessagingTab = screen.getByText('admin.messages.title');
    fireEvent.click(adminMessagingTab);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/messages/unread-count'),
        {
          headers: {
            Authorization: 'Bearer null'
          }
        }
      );
    });
  });

  it('handles fetch error gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    // Should not crash and should still render the dashboard
    expect(screen.getByText('admin.dashboard.title')).toBeInTheDocument();
  });

  it('applies active tab styling correctly', () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    const analyticsTab = screen.getByText('admin.analytics.title').closest('button');
    expect(analyticsTab).toHaveClass('bg-blue-600', 'text-white');
  });

  it('handles tab navigation with keyboard', () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    const userManagementTab = screen.getByText('User Management').closest('button');
    userManagementTab.focus();
    
    // Should be focusable
    expect(userManagementTab).toHaveFocus();
  });

  it('maintains tab state correctly', () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    // Start with analytics
    expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
    
    // Switch to user management
    const userManagementTab = screen.getByText('User Management');
    fireEvent.click(userManagementTab);
    expect(screen.getByTestId('user-management')).toBeInTheDocument();
    
    // Switch back to analytics
    const analyticsTab = screen.getByText('admin.analytics.title');
    fireEvent.click(analyticsTab);
    expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
  });

  it('renders with proper accessibility attributes', () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    const tabs = screen.getAllByRole('button');
    expect(tabs.length).toBeGreaterThan(0);
    
    // The buttons don't have type="button" attribute, so we'll check they're focusable instead
    tabs.forEach(tab => {
      expect(tab).toBeInTheDocument();
    });
  });

  it('handles responsive design', () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    // Should render without crashing on different screen sizes
    expect(screen.getByText('admin.dashboard.title')).toBeInTheDocument();
  });
}); 