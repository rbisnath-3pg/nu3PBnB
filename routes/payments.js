const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const BookingRequest = require('../models/BookingRequest');
const User = require('../models/User');
const Listing = require('../models/Listing');
const { auth, requireRole } = require('../middleware/auth');

// Simplified payments route without Stripe dependency
// Get payment methods for a user
router.get('/methods', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      paymentMethods: [],
      supportedMethods: ['card', 'paypal']
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: 'Failed to get payment methods' });
  }
});

// Create payment intent for booking (simplified)
router.post('/create-intent', auth, async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    const booking = await BookingRequest.findById(bookingId)
      .populate('listing')
      .populate('guest');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.guest._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Calculate total amount (nights * price per night)
    const nights = Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24));
    const amount = nights * booking.listing.price;

    // Create payment record (simplified without Stripe)
    const payment = new Payment({
      booking: bookingId,
      user: req.user.id,
      amount: amount,
      paymentMethod: paymentMethod,
      paymentIntentId: `mock_${Date.now()}`,
      metadata: {
        description: `Booking for ${booking.listing.title} - ${nights} nights`
      }
    });

    await payment.save();

    res.json({
      clientSecret: `mock_secret_${Date.now()}`,
      paymentId: payment._id,
      amount: amount,
      currency: 'usd'
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
});

// Confirm payment (simplified)
router.post('/confirm', auth, async (req, res) => {
  try {
    const { paymentIntentId, paymentId } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: req.t('errors.payment_not_found') });
    }

    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: req.t('errors.forbidden') });
    }

    // Simulate successful payment
    payment.paymentStatus = 'completed';
    payment.paymentDetails = {
      last4: '1234',
      brand: 'visa',
      country: 'US',
      expMonth: 12,
      expYear: 2025
    };
    payment.metadata.receiptUrl = `https://example.com/receipt/${payment._id}`;
    await payment.save();

    // Update booking payment status and status
    const booking = await BookingRequest.findById(payment.booking);
    if (booking) {
      booking.paymentStatus = 'paid';
      booking.status = 'approved'; // Automatically accept booking after payment
      await booking.save();
    }

    res.json({
      success: true,
      payment: payment,
      message: req.t('success.payment_completed')
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: req.t('errors.server') });
  }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
  try {
    const { host, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let payments;
    let total;
    
    if (host) {
      // Find all listings for this host
      const hostListings = await Listing.find({ host }, '_id');
      const hostListingIds = hostListings.map(l => l._id);
      // Find all bookings for these listings
      const bookings = await BookingRequest.find({ listing: { $in: hostListingIds } }, '_id');
      const bookingIds = bookings.map(b => b._id);
      // Find all payments for these bookings
      total = await Payment.countDocuments({ booking: { $in: bookingIds } });
      payments = await Payment.find({ booking: { $in: bookingIds } })
        .populate({
          path: 'booking',
          populate: [
            { path: 'listing', select: 'title location price' },
            { path: 'guest', select: 'name email' }
          ]
        })
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    } else {
      total = await Payment.countDocuments({ user: req.user.id });
      payments = await Payment.find({ user: req.user.id })
        .populate({
          path: 'booking',
          populate: [
            { path: 'listing', select: 'title location price' },
            { path: 'guest', select: 'name email' }
          ]
        })
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }
    
    res.json({ 
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Math.ceil(total / parseInt(limit)),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Failed to get payment history' });
  }
});

// Host: Get payments for their properties
router.get('/host', auth, requireRole('host'), async (req, res) => {
  try {
    // Find all listings for this host
    const hostListings = await Listing.find({ host: req.user.id }, '_id');
    const hostListingIds = hostListings.map(l => l._id);
    // Find all bookings for these listings
    const bookings = await BookingRequest.find({ listing: { $in: hostListingIds } }, '_id');
    const bookingIds = bookings.map(b => b._id);
    // Find all payments for these bookings
    const payments = await Payment.find({ booking: { $in: bookingIds } })
      .populate({
        path: 'booking',
        populate: [
          { path: 'listing', select: 'title location' },
          { path: 'guest', select: 'name email' }
        ]
      })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ payments });
  } catch (error) {
    console.error('Get host payments error:', error);
    res.status(500).json({ message: 'Failed to get payments' });
  }
});

// Get payment statistics for host
router.get('/host/stats', auth, requireRole('host'), async (req, res) => {
  try {
    // Find all listings for this host
    const hostListings = await Listing.find({ host: req.user.id }, '_id');
    const hostListingIds = hostListings.map(l => l._id);
    // Find all bookings for these listings
    const bookings = await BookingRequest.find({ listing: { $in: hostListingIds } }, '_id');
    const bookingIds = bookings.map(b => b._id);
    const totalPayments = await Payment.countDocuments({ booking: { $in: bookingIds } });
    const totalAmount = await Payment.aggregate([
      { $match: { 
        booking: { $in: bookingIds },
        paymentStatus: 'completed' 
      }},
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthlyStats = await Payment.aggregate([
      { $match: { 
        booking: { $in: bookingIds },
        paymentStatus: 'completed' 
      }},
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    res.json({
      totalPayments,
      totalAmount: totalAmount[0]?.total || 0,
      monthlyStats
    });
  } catch (error) {
    console.error('Get host payment stats error:', error);
    res.status(500).json({ message: 'Failed to get payment statistics' });
  }
});

// Get payment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Handle both populated and unpopulated user fields
    const paymentUserId = payment.user._id || payment.user;
    if (paymentUserId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Failed to get payment' });
  }
});

// Provide placeholder endpoints for payment routes
// Example: Payment intent creation (placeholder)
router.post('/intent', (req, res) => {
  res.status(200).json({ message: 'Stripe integration removed. Payments are currently disabled.' });
});

// Example: Payment webhook (placeholder)
router.post('/webhook', (req, res) => {
  res.status(200).json({ message: 'Stripe integration removed. Webhooks are currently disabled.' });
});

// Admin: Get all payments
router.get('/admin/all', auth, requireRole('admin'), async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'booking',
        populate: [
          { path: 'listing', select: 'title location host' },
          { path: 'guest', select: 'name email' }
        ]
      })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ payments });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ message: 'Failed to get payments' });
  }
});

// Admin: Get payment statistics
router.get('/admin/stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const totalPayments = await Payment.countDocuments();
    const totalAmountAgg = await Payment.aggregate([
      { $match: { paymentStatus: 'completed' }},
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalAmount = totalAmountAgg[0]?.total || 0;
    const appProfit = +(totalAmount * 0.02).toFixed(2);
    
    const monthlyStats = await Payment.aggregate([
      { $match: { paymentStatus: 'completed' }},
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const statusStats = await Payment.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalPayments,
      totalAmount,
      appProfit,
      monthlyStats,
      statusStats: statusStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get admin payment stats error:', error);
    res.status(500).json({ message: 'Failed to get payment statistics' });
  }
});

// Process payment (simplified)
router.post('/process', auth, async (req, res) => {
  try {
    const { bookingId, paymentMethod, amount, paymentType, bookingData } = req.body;

    if (!paymentMethod || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'paymentMethod and amount are required' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount',
        message: 'Payment amount must be greater than 0' 
      });
    }

    // Validate payment method - match the Payment model enum
    const validMethods = ['apple_pay', 'google_pay', 'paypal', 'credit_card', 'system_generated'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        error: 'Invalid payment method',
        message: 'Supported methods: apple_pay, google_pay, paypal, credit_card, system_generated'
      });
    }

    let booking = null;
    let actualBookingId = bookingId;

    // Handle new booking creation
    if (paymentType === 'new' && bookingData && !bookingId) {
      try {
        // Validate booking data
        const { listingId, startDate, endDate, guests, totalPrice, message } = bookingData;
        
        if (!listingId || !startDate || !endDate || !guests) {
          return res.status(400).json({ 
            error: 'Missing booking data',
            message: 'listingId, startDate, endDate, and guests are required for new bookings' 
          });
        }

        // Check if listing exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
          return res.status(404).json({ message: 'Listing not found' });
        }

        // Check if listing is available
        if (!listing.available) {
          return res.status(400).json({ message: 'This property is not available for booking' });
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start < today) {
          return res.status(400).json({ message: 'Start date cannot be in the past' });
        }

        if (end <= start) {
          return res.status(400).json({ message: 'End date must be after start date' });
        }

        // Check for conflicting bookings
        const conflictingBookings = await BookingRequest.find({
          listing: listingId,
          status: { $ne: 'declined' },
          $or: [
            // New booking starts during existing booking
            {
              startDate: { $lte: start },
              endDate: { $gt: start }
            },
            // New booking ends during existing booking
            {
              startDate: { $lt: end },
              endDate: { $gte: end }
            },
            // New booking completely contains existing booking
            {
              startDate: { $gte: start },
              endDate: { $lte: end }
            }
          ]
        });

        if (conflictingBookings.length > 0) {
          return res.status(409).json({ 
            message: 'Selected dates are not available. Please choose different dates.',
            conflictingBookings: conflictingBookings.map(booking => ({
              startDate: booking.startDate,
              endDate: booking.endDate,
              status: booking.status
            }))
          });
        }

        // Create the booking
        booking = new BookingRequest({
          guest: req.user.id,
          host: listing.host,
          listing: listingId,
          startDate: start,
          endDate: end,
          guests: parseInt(guests),
          totalPrice: totalPrice || amount,
          message: message || '',
          status: 'pending',
          paymentStatus: 'pending'
        });

        await booking.save();
        actualBookingId = booking._id;
        
        console.log(`Created new booking ${actualBookingId} during payment processing`);
      } catch (error) {
        console.error('Error creating booking during payment:', error);
        return res.status(500).json({ message: 'Failed to create booking during payment' });
      }
    } else if (bookingId) {
      // Find existing booking
      try {
        booking = await BookingRequest.findById(bookingId)
          .populate('listing')
          .populate('guest');
      } catch (error) {
        console.log('Booking not found, creating mock payment for testing');
      }
    }

    // Create payment record (simplified without Stripe)
    const payment = new Payment({
      booking: actualBookingId,
      user: req.user.id,
      amount: amount,
      paymentMethod: paymentMethod,
      paymentIntentId: `mock_${Date.now()}`,
      paymentStatus: 'completed',
      metadata: {
        description: booking ? `Booking for ${booking.listing?.title || 'Unknown Property'}` : `Payment for booking ${actualBookingId}`
      }
    });

    await payment.save();

    // Update booking payment status and automatically approve if booking exists
    if (booking) {
      booking.paymentStatus = 'paid';
      booking.status = 'approved'; // Automatically accept booking after payment
      await booking.save();
      
      console.log(`Booking ${actualBookingId} automatically approved after payment completion`);
    }

    res.json({
      message: 'Payment processed successfully and booking approved',
      payment: payment,
      bookingApproved: booking ? true : false,
      bookingId: actualBookingId
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ message: 'Failed to process payment' });
  }
});

// Process refund
router.post('/refund', auth, async (req, res) => {
  try {
    const { paymentId, amount } = req.body;

    if (!paymentId || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'paymentId and amount are required' 
      });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (amount > payment.amount) {
      return res.status(400).json({ 
        error: 'Invalid refund amount',
        message: 'Refund amount cannot exceed original payment amount' 
      });
    }

    // Create refund record
    const refund = new Payment({
      booking: payment.booking,
      user: req.user.id,
      amount: -amount, // Negative amount for refund
      paymentMethod: payment.paymentMethod,
      paymentStatus: 'completed',
      metadata: {
        description: `Refund for payment ${paymentId}`,
        originalPayment: paymentId
      }
    });

    await refund.save();

    res.json({
      message: 'Refund processed successfully',
      refund: refund
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ message: 'Failed to process refund' });
  }
});

module.exports = router; 