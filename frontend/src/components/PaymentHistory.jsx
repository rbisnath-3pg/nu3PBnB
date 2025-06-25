import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { FaCreditCard, FaCalendar, FaDollarSign, FaCheck, FaTimes, FaClock } from 'react-icons/fa';
import ReceiptModal from './ReceiptModal';
import getApiBase from '../services/getApiBase';

const API_BASE = getApiBase();

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/payments/history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      } else {
        setError('Failed to load payment history');
      }
    } catch (error) {
      setError('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'apple_pay':
        return '🍎';
      case 'google_pay':
        return '🤖';
      case 'paypal':
        return '💳';
      default:
        return '💳';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'refunded':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setIsReceiptModalOpen(true);
  };

  const closeReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setSelectedPayment(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('admin.payments.title', 'Payment Management')}</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage all payment transactions on the platform.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {payments.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No payment history found
              </div>
            ) : (
              payments.map((payment) => (
                <div key={payment._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {payment.booking?.listing?.title || 'Unknown Property'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {payment.booking?.listing?.location || 'Unknown Location'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {formatDate(payment.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        ${payment.amount.toFixed(2)}
                      </div>
                      <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(payment.paymentStatus)}`}>
                        {payment.paymentStatus.charAt(0).toUpperCase() + payment.paymentStatus.slice(1)}
                      </div>
                      {payment.refundAmount && (
                        <div className="text-xs text-red-600 mt-1">
                          Refunded: ${payment.refundAmount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Transaction ID:</span>
                      <span className="ml-2 text-gray-900 dark:text-white font-mono">
                        {payment.transactionId}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Payment Method:</span>
                      <span className="ml-2 text-gray-900 dark:text-white capitalize">
                        {payment.paymentMethod.replace('_', ' ')}
                      </span>
                    </div>
                    {payment.paymentDetails?.last4 && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Card:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          •••• {payment.paymentDetails.last4}
                        </span>
                      </div>
                    )}
                    <div>
                      <button
                        onClick={() => handleViewReceipt(payment)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        type="button"
                      >
                        View Receipt
                      </button>
                    </div>
                  </div>

                  {/* Refund Information */}
                  {payment.refundReason && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Refund Reason:</strong> {payment.refundReason}
                      </div>
                      {payment.refundedAt && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Refunded on: {formatDate(payment.refundedAt)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Receipt Modal */}
      {selectedPayment && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={closeReceiptModal}
          payment={selectedPayment}
          booking={selectedPayment.booking}
          listing={selectedPayment.booking?.listing}
          user={selectedPayment.user}
        />
      )}
    </div>
  );
};

export default PaymentHistory; 