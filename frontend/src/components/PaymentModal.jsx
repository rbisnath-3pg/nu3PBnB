import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { FaCreditCard, FaPaypal, FaLock, FaCheck, FaTimes } from 'react-icons/fa';

const API_BASE = import.meta.env.PROD 
  ? 'https://nu3pbnb-api.onrender.com/api'
  : '/api';

const PaymentForm = ({ booking, selectedListing, onSuccess, onCancel, paymentType = 'new' }) => {
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Use selectedListing if available, otherwise fallback to booking.listing
  const listing = selectedListing || booking.listing;

  // Calculate total amount
  const nights = Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24));
  const totalAmount = nights * (listing?.price || booking.totalPrice || 0);

  const handlePayment = async () => {
    setIsProcessing(true);

    // Defensive: Validate required fields
    const bookingId = booking._id || booking.id;
    const amount = totalAmount;
    if (!bookingId) {
      alert('Error: Booking ID is missing. Please try again or contact support.');
      setIsProcessing(false);
      return;
    }
    if (!paymentMethod) {
      alert('Error: Payment method is missing. Please select a payment method.');
      setIsProcessing(false);
      return;
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      alert('Error: Payment amount is invalid. Please try again or contact support.');
      setIsProcessing(false);
      return;
    }

    // Log payload for debugging
    console.log('Sending payment:', { bookingId, paymentMethod, amount });

    try {
      // Make API call to process payment
      const response = await fetch(`${API_BASE}/payments/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId,
          paymentMethod,
          amount
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Payment processed successfully:', result);
        // Call onSuccess with payment details and payment type
        onSuccess({
          paymentMethod: paymentMethod,
          amount: totalAmount,
          transactionId: result.payment?.transactionId || 'mock-' + Date.now(),
          bookingApproved: result.bookingApproved,
          paymentType: paymentType
        });
      } else {
        const errorData = await response.json();
        console.error('Payment failed:', errorData);
        alert(`Payment failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Complete Payment
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Booking Summary */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {listing?.title || 'Property Details'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {nights} nights • {listing?.location || 'Location'}
          </p>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Check-in:</span>
              <span>{new Date(booking.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Check-out:</span>
              <span>{new Date(booking.endDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Guests:</span>
              <span>{booking.guests}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payment Method
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="credit_card"
                checked={paymentMethod === 'credit_card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">💳 Credit Card</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="debit_card"
                checked={paymentMethod === 'debit_card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">💳 Debit Card</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="paypal"
                checked={paymentMethod === 'paypal'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">PayPal</span>
            </label>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </>
          ) : (
            `Pay $${totalAmount.toFixed(2)}`
          )}
        </button>

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          💳 Payment will automatically approve your booking upon completion
        </div>
      </div>
    </div>
  );
};

const PaymentModal = ({ booking, selectedListing, onSuccess, onCancel, paymentType = 'new' }) => {
  return (
    <PaymentForm 
      booking={booking} 
      selectedListing={selectedListing}
      onSuccess={onSuccess} 
      onCancel={onCancel}
      paymentType={paymentType}
    />
  );
};

export default PaymentModal; 