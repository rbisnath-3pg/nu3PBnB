import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReceiptModal = ({ isOpen, onClose, payment, booking, listing, user }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !payment) {
    return null;
  }

  // Extract data from the payment structure
  const actualBooking = booking || payment.booking;
  const actualListing = listing || actualBooking?.listing;
  const actualUser = user || payment.user;

  // Provide fallback data if booking/listing is missing
  const fallbackListing = {
    title: 'Property Details Unavailable',
    location: 'Location information not available',
    price: payment.amount
  };

  const fallbackBooking = {
    startDate: new Date(payment.createdAt),
    endDate: new Date(new Date(payment.createdAt).getTime() + 24 * 60 * 60 * 1000) // 1 day later
  };

  const finalListing = actualListing || fallbackListing;
  const finalBooking = actualBooking || fallbackBooking;

  const formatDate = (date) => {
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date in formatDate:', date);
        return 'N/A';
      }
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const formatCurrency = (amount) => {
    try {
      const numAmount = parseFloat(amount) || 0;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: payment.currency || 'USD'
      }).format(numAmount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `$${(parseFloat(amount) || 0).toFixed(2)}`;
    }
  };

  const calculateNights = () => {
    try {
      const start = new Date(finalBooking.startDate);
      const end = new Date(finalBooking.endDate);
      
      // Validate dates
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn('Invalid dates in calculateNights:', { startDate: finalBooking.startDate, endDate: finalBooking.endDate });
        return 1; // Default to 1 night if dates are invalid
      }
      
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays || 1; // Ensure at least 1 night
    } catch (error) {
      console.error('Error calculating nights:', error);
      return 1; // Default to 1 night on error
    }
  };

  const generatePDF = async () => {
    setErrorMessage('');
    setIsGeneratingPDF(true);
    
    try {
      const doc = new jsPDF();
      
      // Validate required data
      if (!payment || !finalListing || !finalBooking) {
        throw new Error('Missing required data for PDF generation');
      }
      
      // Add company logo/header
      doc.setFontSize(20);
      doc.text('nu3PBnB', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text('Receipt', 105, 35, { align: 'center' });
      
      // Receipt details
      doc.setFontSize(10);
      doc.text(`Receipt #: ${payment.transactionId || payment._id || 'N/A'}`, 20, 50);
      doc.text(`Date: ${formatDate(payment.createdAt)}`, 20, 60);
      doc.text(`Status: ${payment.paymentStatus || 'N/A'}`, 20, 70);
      
      // Customer info
      doc.text('Customer Information:', 20, 90);
      doc.text(`Name: ${actualUser?.name || 'Guest'}`, 20, 100);
      doc.text(`Email: ${actualUser?.email || 'N/A'}`, 20, 110);
      
      // Property info
      doc.text('Property Details:', 20, 130);
      doc.text(`Property: ${finalListing.title || 'Unknown Property'}`, 20, 140);
      doc.text(`Location: ${finalListing.location || 'N/A'}`, 20, 150);
      doc.text(`Check-in: ${formatDate(finalBooking.startDate)}`, 20, 160);
      doc.text(`Check-out: ${formatDate(finalBooking.endDate)}`, 20, 170);
      doc.text(`Nights: ${calculateNights()}`, 20, 180);
      
      // Calculate accommodation cost safely
      const nights = calculateNights();
      const pricePerNight = finalListing.price || 0;
      const accommodationCost = nights * pricePerNight;
      
      // Payment details table
      const tableData = [
        ['Description', 'Amount'],
        ['Accommodation', formatCurrency(accommodationCost)],
        ['Service Fee', formatCurrency(0)], // Add service fee if applicable
        ['Total', formatCurrency(payment.amount || 0)]
      ];
      
      autoTable(doc, {
        startY: 200,
        head: [['Description', 'Amount']],
        body: tableData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] }
      });
      
      // Payment method
      doc.text(`Payment Method: ${payment.paymentMethod || 'Credit Card'}`, 20, doc.lastAutoTable.finalY + 20);
      
      // Footer
      doc.setFontSize(8);
      doc.text('Thank you for choosing nu3PBnB!', 105, doc.internal.pageSize.height - 20, { align: 'center' });
      
      // Save the PDF
      const filename = `receipt-${payment.transactionId || payment._id || 'unknown'}.pdf`;
      doc.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Payment data:', payment);
      console.error('Final listing:', finalListing);
      console.error('Final booking:', finalBooking);
      setErrorMessage(`Error generating PDF: ${error.message}. Please try again.`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
      onClick={onClose}
      style={{ zIndex: 9999 }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 10000 }}
      >
        {/* Error Modal */}
        {errorMessage && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 border border-red-400 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-red-600 mb-4">PDF Generation Error</h2>
              <p className="text-gray-800 dark:text-gray-200 mb-4">{errorMessage}</p>
              <button
                onClick={() => setErrorMessage('')}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Receipt</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Receipt Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-blue-600">nu3PBnB</h1>
              <p className="text-gray-600 dark:text-gray-400">Receipt</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">Receipt #</p>
                <p className="text-gray-600 dark:text-gray-400">{payment.transactionId || payment._id}</p>
              </div>
              <div>
                <p className="font-semibold">Date</p>
                <p className="text-gray-600 dark:text-gray-400">{formatDate(payment.createdAt)}</p>
              </div>
              <div>
                <p className="font-semibold">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  payment.paymentStatus === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {payment.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p><span className="font-medium">Name:</span> {actualUser?.name || 'Guest'}</p>
              <p><span className="font-medium">Email:</span> {actualUser?.email || 'N/A'}</p>
            </div>
          </div>

          {/* Property Details */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Property Details</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p><span className="font-medium">Property:</span> {finalListing.title}</p>
              <p><span className="font-medium">Location:</span> {finalListing.location}</p>
              <p><span className="font-medium">Check-in:</span> {formatDate(finalBooking.startDate)}</p>
              <p><span className="font-medium">Check-out:</span> {formatDate(finalBooking.endDate)}</p>
              <p><span className="font-medium">Nights:</span> {calculateNights()}</p>
            </div>
          </div>

          {/* Payment Details */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Payment Details</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Accommodation ({calculateNights()} nights)</span>
                <span>{formatCurrency(finalListing.price * calculateNights())}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Service Fee</span>
                <span>{formatCurrency(0)}</span>
              </div>
              <div className="border-t border-gray-300 dark:border-gray-600 pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(payment.amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Payment Method</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="capitalize">{payment.paymentMethod?.replace('_', ' ') || 'Credit Card'}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              type="button"
            >
              Close
            </button>
            <button
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              type="button"
            >
              {isGeneratingPDF ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal; 