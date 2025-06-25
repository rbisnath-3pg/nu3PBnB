import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaDollarSign, FaCreditCard, FaChartLine, FaCalendarAlt, FaUser, FaHome } from 'react-icons/fa';
import ReceiptModal from './ReceiptModal';
import getApiBase from '../services/getApiBase';

const API_BASE = getApiBase();

const PaymentDashboard = ({ userRole = 'host' }) => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentsPerPage] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [userRole]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const endpoint = userRole === 'admin' ? `${API_BASE}/payments/admin/all` : `${API_BASE}/payments/host`;
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      
      const data = await response.json();
      setPayments(data.payments || []);
    } catch (err) {
      setError('Failed to load payments: ' + err.message);
      console.error('Fetch payments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const endpoint = userRole === 'admin' ? `${API_BASE}/payments/admin/stats` : `${API_BASE}/payments/host/stats`;
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Pagination
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = payments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(payments.length / paymentsPerPage);

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
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading payments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Payment Dashboard
        </h2>
        
        {/* Payment Statistics */}
        <div className={`grid grid-cols-1 md:grid-cols-${userRole === 'admin' ? '4' : '3'} gap-4 mb-6`}>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Payments</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalPayments || 0}
                </p>
              </div>
              <FaCreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(stats.totalAmount || 0)}
                </p>
              </div>
              <FaDollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Average Payment</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.totalPayments > 0 ? formatCurrency((stats.totalAmount || 0) / stats.totalPayments) : '$0'}
                </p>
              </div>
              <FaChartLine className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          {userRole === 'admin' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">App Profitability (2% Fee)</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {formatCurrency(stats.appProfit || 0)}
                  </p>
                </div>
                <FaDollarSign className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          )}
        </div>

        {/* Monthly Stats Chart */}
        {stats.monthlyStats && stats.monthlyStats.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Monthly Revenue</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-6 gap-2">
                {stats.monthlyStats.slice(0, 6).map((month, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(month.total)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {month.count} payments
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payments List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Payments</h3>
          <button
            onClick={fetchPayments}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-8">
            <FaCreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No payments found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Guest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {payment.transactionId}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {payment.paymentMethod}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {payment.booking?.listing?.title || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {payment.booking?.listing?.location || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {payment.booking?.guest?.name || payment.user?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {payment.booking?.guest?.email || payment.user?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {payment.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.paymentStatus)}`}>
                          {payment.paymentStatus.charAt(0).toUpperCase() + payment.paymentStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewReceipt(payment)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
                          type="button"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`px-3 py-1 rounded border ${currentPage === idx + 1 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Receipt Modal */}
      {selectedPayment && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={closeReceiptModal}
          payment={selectedPayment}
          booking={selectedPayment.booking}
          listing={selectedPayment.booking?.listing}
          user={selectedPayment.user || selectedPayment.booking?.guest}
        />
      )}
    </div>
  );
};

export default PaymentDashboard; 