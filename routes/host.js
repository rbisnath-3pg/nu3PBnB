const express = require('express');
const BookingRequest = require('../models/BookingRequest');
const Listing = require('../models/Listing');
const Payment = require('../models/Payment');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Host: Dashboard endpoint
router.get('/dashboard', auth, requireRole('host'), async (req, res) => {
  try {
    // Get host's listings
    const listings = await Listing.find({ host: req.user.id });
    const listingIds = listings.map(l => l._id);
    
    // Get booking requests for host's listings
    const bookings = await BookingRequest.find({ 
      listing: { $in: listingIds } 
    }).populate('guest').populate('listing');
    
    // Get payments for host's bookings
    const payments = await Payment.find({
      booking: { $in: bookings.map(b => b._id) }
    });
    
    // Calculate stats
    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const approvedBookings = bookings.filter(b => b.status === 'approved');
    const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
    
    res.json({
      stats: {
        totalListings: listings.length,
        totalBookings: bookings.length,
        pendingBookings: pendingBookings.length,
        approvedBookings: approvedBookings.length,
        totalEarnings: totalEarnings
      },
      recentActivity: {
        listings: listings.slice(0, 5),
        bookings: bookings.slice(0, 5),
        payments: payments.slice(0, 5)
      }
    });
  } catch (err) {
    console.error('Host dashboard error:', err);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
});

// Host: View booking requests for own listings
router.get('/bookings', auth, requireRole('host'), async (req, res) => {
  const listings = await Listing.find({ host: req.user.id });
  const listingIds = listings.map(l => l._id);
  const bookings = await BookingRequest.find({ listing: { $in: listingIds } }).populate('guest').populate('listing');
  res.json(bookings);
});

// Host: Approve a booking request
router.post('/bookings/:bookingId/approve', auth, requireRole('host'), async (req, res) => {
  try {
    const booking = await BookingRequest.findById(req.params.bookingId).populate('listing');
    if (!booking) return res.status(404).json({ message: req.t('errors.booking_not_found') });
    if (String(booking.listing.host) !== req.user.id) return res.status(403).json({ message: req.t('errors.forbidden') });
    
    booking.status = 'approved';
    await booking.save();

    // Create payment record for the approved booking
    const nights = Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24));
    const amount = nights * booking.listing.price;
    
    const payment = new Payment({
      booking: booking._id,
      user: booking.guest,
      amount: amount,
      currency: 'USD',
      paymentMethod: 'system_generated',
      paymentStatus: 'completed',
      metadata: {
        description: `Payment for ${booking.listing.title} - ${nights} nights`,
        receiptUrl: `/receipts/${booking._id}`
      }
    });

    await payment.save();

    // Update booking payment status
    booking.paymentStatus = 'paid';
    await booking.save();

    res.json({ 
      message: req.t('success.booking_approved'), 
      booking,
      payment: {
        id: payment._id,
        amount: payment.amount,
        transactionId: payment.transactionId
      }
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({ message: 'Failed to approve booking' });
  }
});

// Host: Decline a booking request
router.post('/bookings/:bookingId/decline', auth, requireRole('host'), async (req, res) => {
  const booking = await BookingRequest.findById(req.params.bookingId).populate('listing');
  if (!booking) return res.status(404).json({ message: req.t('errors.booking_not_found') });
  if (String(booking.listing.host) !== req.user.id) return res.status(403).json({ message: req.t('errors.forbidden') });
  booking.status = 'declined';
  await booking.save();
  res.json({ message: req.t('success.booking_declined'), booking });
});

module.exports = router; 