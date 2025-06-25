const express = require('express');
const BookingRequest = require('../models/BookingRequest');
const Listing = require('../models/Listing');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Guest: Create a booking request
router.post('/', auth, requireRole('guest'), async (req, res) => {
  try {
    const { listingId, startDate, endDate, guests, message } = req.body;
    
    // Validate required fields
    if (!listingId || !startDate || !endDate || !guests) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'listingId, startDate, endDate, and guests are required' 
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

    // Calculate total price based on nights and listing price
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * listing.price;

    // Create the booking
    const booking = new BookingRequest({
      guest: req.user.id,
      host: listing.host,
      listing: listingId,
      startDate: start,
      endDate: end,
      guests: parseInt(guests),
      totalPrice: totalPrice,
      message: message || '',
      status: 'pending',
      paymentStatus: 'pending'
    });

    await booking.save();
    
    // Populate listing details for response
    await booking.populate('listing');
    
    res.status(201).json({
      message: 'Booking request created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

// Guest: View own booking requests
router.get('/', auth, requireRole('guest'), async (req, res) => {
  const bookings = await BookingRequest.find({ guest: req.user.id }).populate('listing');
  res.json({ bookings });
});

// Host: View bookings for their listings
router.get('/host', auth, requireRole('host'), async (req, res) => {
  try {
    const bookings = await BookingRequest.find()
      .populate('guest', 'name email')
      .populate('listing')
      .where('listing.host').equals(req.user.id);
    
    res.json({ bookings });
  } catch (error) {
    console.error('Get host bookings error:', error);
    res.status(500).json({ message: 'Failed to get bookings' });
  }
});

// Get bookings for a specific listing
router.get('/listing/:listingId', async (req, res) => {
  try {
    const bookings = await BookingRequest.find({ listing: req.params.listingId })
      .populate('guest', 'name email')
      .populate('listing');
    
    res.json({ bookings });
  } catch (error) {
    console.error('Get listing bookings error:', error);
    res.status(500).json({ message: 'Failed to get bookings' });
  }
});

// Update booking status (for hosts)
router.put('/:id', auth, requireRole('host'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const booking = await BookingRequest.findById(req.params.id).populate('listing');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is the host of the listing
    if (!booking.listing || booking.listing.host.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    
    // Only allow valid status updates
    const validStatuses = ['pending', 'confirmed', 'approved', 'declined', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    booking.status = status;
    await booking.save();
    
    res.json({ 
      message: 'Booking updated successfully',
      booking 
    });
  } catch (error) {
    console.error('Update booking error:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to update booking', error: error.message, stack: error.stack });
  }
});

// Admin: Get all bookings
router.get('/admin/all', auth, requireRole('admin'), async (req, res) => {
  const bookings = await BookingRequest.find().populate('guest listing');
  res.json(bookings);
});

// Admin: Update any booking
router.put('/admin/:id', auth, requireRole('admin'), async (req, res) => {
  const update = req.body;
  const booking = await BookingRequest.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  res.json(booking);
});

// Admin: Delete any booking
router.delete('/admin/:id', auth, requireRole('admin'), async (req, res) => {
  await BookingRequest.findByIdAndDelete(req.params.id);
  res.json({ message: 'Booking deleted successfully' });
});

// Guest: Cancel own booking
router.delete('/:id', auth, requireRole('guest'), async (req, res) => {
  try {
    const booking = await BookingRequest.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.guest.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    }

    // Only allow cancellation of pending or approved bookings
    if (booking.status === 'cancelled' || booking.status === 'declined') {
      return res.status(400).json({ error: 'Booking cannot be cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

module.exports = router; 