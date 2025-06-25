import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaymentHistory from '../PaymentHistory';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
    i18n: { changeLanguage: jest.fn() }
  }),
}));

// Mock ReceiptModal
jest.mock('../ReceiptModal', () => {
  return function MockReceiptModal({ isOpen, onClose }) {
    if (!isOpen) return null;
    return (
      <div data-testid="receipt-modal">
        <button onClick={onClose}>Close Receipt</button>
      </div>
    );
  };
});

// Mock fetch for API calls
global.fetch = jest.fn();

describe('PaymentHistory', () => {
  const mockPayments = [
    {
      _id: 'payment1',
      amount: 150.00,
      paymentStatus: 'completed',
      paymentMethod: 'credit_card',
      transactionId: 'txn_123456789',
      createdAt: '2024-01-15T10:30:00Z',
      booking: {
        listing: {
          title: 'Beautiful Apartment',
          location: 'Downtown, City'
        }
      },
      paymentDetails: {
        last4: '1234'
      }
    },
    {
      _id: 'payment2',
      amount: 200.00,
      paymentStatus: 'pending',
      paymentMethod: 'paypal',
      transactionId: 'txn_987654321',
      createdAt: '2024-01-16T14:20:00Z',
      booking: {
        listing: {
          title: 'Cozy House',
          location: 'Suburbs, City'
        }
      }
    },
    {
      _id: 'payment3',
      amount: 100.00,
      paymentStatus: 'refunded',
      paymentMethod: 'apple_pay',
      transactionId: 'txn_456789123',
      createdAt: '2024-01-10T09:15:00Z',
      refundAmount: 100.00,
      refundReason: 'Guest cancellation',
      refundedAt: '2024-01-12T11:00:00Z',
      booking: {
        listing: {
          title: 'Mountain Cabin',
          location: 'Mountain View, City'
        }
      }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  it('renders payment history with title', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ payments: mockPayments })
    });

    render(<PaymentHistory />);
    
    await waitFor(() => {
      expect(screen.getByText('Payment Management')).toBeInTheDocument();
      expect(screen.getByText('View and manage all payment transactions on the platform.')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    render(<PaymentHistory />);
    
    // Check for the loading spinner div
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('displays error state when API call fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<PaymentHistory />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load payment history')).toBeInTheDocument();
    });
  });

  it('displays payments when API call succeeds', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ payments: mockPayments })
    });

    render(<PaymentHistory />);
    
    await waitFor(() => {
      expect(screen.getByText('Beautiful Apartment')).toBeInTheDocument();
      expect(screen.getByText('Cozy House')).toBeInTheDocument();
      expect(screen.getByText('Mountain Cabin')).toBeInTheDocument();
    });
  });

  it('displays payment amounts correctly', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ payments: mockPayments })
    });

    render(<PaymentHistory />);
    
    await waitFor(() => {
      expect(screen.getByText('$150.00')).toBeInTheDocument();
      expect(screen.getByText('$200.00')).toBeInTheDocument();
      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });
  });

  it('displays payment status with correct styling', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ payments: mockPayments })
    });

    render(<PaymentHistory />);
    
    await waitFor(() => {
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Refunded')).toBeInTheDocument();
    });
  });

  it('displays payment method icons correctly', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ payments: mockPayments })
    });

    render(<PaymentHistory />);
    
    await waitFor(() => {
      // The component uses emoji icons, so we need to check for the actual emoji characters
      const creditCardIcons = screen.getAllByText('💳');
      expect(creditCardIcons.length).toBeGreaterThan(0);
      expect(screen.getByText('🍎')).toBeInTheDocument(); // apple_pay
    });
  });

  it('displays transaction IDs', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ payments: mockPayments })
    });

    render(<PaymentHistory />);
    
    await waitFor(() => {
      expect(screen.getByText('txn_123456789')).toBeInTheDocument();
      expect(screen.getByText('txn_987654321')).toBeInTheDocument();
      expect(screen.getByText('txn_456789123')).toBeInTheDocument();
    });
  });

  it('displays payment method names', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ payments: mockPayments })
    });

    render(<PaymentHistory />);
    
    await waitFor(() => {
      expect(screen.getByText('credit card')).toBeInTheDocument();
      expect(screen.getByText('paypal')).toBeInTheDocument();
      expect(screen.getByText('apple pay')).toBeInTheDocument();
    });
  });

  it('displays card last 4 digits when available', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ payments: mockPayments })
    });

    render(<PaymentHistory />);
    
    await waitFor(() => {
      expect(screen.getByText('•••• 1234')).toBeInTheDocument();
    });
  });

  it('displays refund information when available', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ payments: mockPayments })
    });

    render(<PaymentHistory />);
    
    await waitFor(() => {
      expect(screen.getByText('Refunded: $100.00')).toBeInTheDocument();
      expect(screen.getByText(/Refund Reason:/)).toBeInTheDocument();
      expect(screen.getByText(/Guest cancellation/)).toBeInTheDocument();
    });
  });

  it('handles view receipt functionality', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ payments: mockPayments })
    });

    render(<PaymentHistory />);
    
    await waitFor(() => {
      const viewReceiptButtons = screen.getAllByText('View Receipt');
      fireEvent.click(viewReceiptButtons[0]);
    });
    
    expect(screen.getByTestId('receipt-modal')).toBeInTheDocument();
  });

  it('closes receipt modal when close button is clicked', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ payments: mockPayments })
    });

    render(<PaymentHistory />);
    
    await waitFor(() => {
      const viewReceiptButtons = screen.getAllByText('View Receipt');
      fireEvent.click(viewReceiptButtons[0]);
    });
    
    expect(screen.getByTestId('receipt-modal')).toBeInTheDocument();
    
    const closeButton = screen.getByText('Close Receipt');
    fireEvent.click(closeButton);
    
    expect(screen.queryByTestId('receipt-modal')).not.toBeInTheDocument();
  });

  it('displays empty state when no payments exist', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ payments: [] })
    });

    render(<PaymentHistory />);
    
    await waitFor(() => {
      expect(screen.getByText('No payment history found')).toBeInTheDocument();
    });
  });

  it('handles API error response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    render(<PaymentHistory />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load payment history')).toBeInTheDocument();
    });
  });

  it('formats dates correctly', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ payments: mockPayments })
    });

    render(<PaymentHistory />);
    
    await waitFor(() => {
      // Check that dates are formatted (the exact format may vary based on locale)
      expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
      expect(screen.getByText(/Jan 16, 2024/)).toBeInTheDocument();
      expect(screen.getByText(/Jan 10, 2024/)).toBeInTheDocument();
    });
  });

  it('fetches payment history on component mount', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ payments: mockPayments })
    });

    render(<PaymentHistory />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/payments/history',
        {
          headers: {
            'Authorization': 'Bearer mock-token'
          }
        }
      );
    });
  });

  it('handles missing booking data gracefully', async () => {
    const paymentsWithMissingData = [
      {
        _id: 'payment1',
        amount: 150.00,
        paymentStatus: 'completed',
        paymentMethod: 'credit_card',
        transactionId: 'txn_123456789',
        createdAt: '2024-01-15T10:30:00Z',
        booking: null
      }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ payments: paymentsWithMissingData })
    });

    render(<PaymentHistory />);
    
    await waitFor(() => {
      expect(screen.getByText('Unknown Property')).toBeInTheDocument();
      expect(screen.getByText('Unknown Location')).toBeInTheDocument();
    });
  });
}); 