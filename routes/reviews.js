const express = require('express');
const Review = require('../models/Review');
const Listing = require('../models/Listing');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Submit a review for a listing
router.post('/:listingId', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const listingId = req.params.listingId;
    
    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: req.t('errors.validation') });
    }
    
    if (!review || review.trim().length < 10) {
      return res.status(400).json({ message: req.t('errors.validation') });
    }
    
    // Check if user has already reviewed this listing
    const existingReview = await Review.findOne({
      guest: req.user.id,
      listing: listingId
    });
    
    if (existingReview) {
      return res.status(400).json({ message: req.t('errors.review_exists') });
    }
    
    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: req.t('errors.listing_not_found') });
    }
    
    const newReview = new Review({
      guest: req.user.id,
      listing: listingId,
      rating,
      review: review.trim()
    });
    
    await newReview.save();
    
    // Add review to listing and recalculate average rating
    listing.reviews.push(newReview._id);
    const allReviews = await Review.find({ listing: listingId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    listing.averageRating = Math.round(avgRating * 10) / 10; // Round to 1 decimal
    await listing.save();
    
    // Populate guest details
    await newReview.populate('guest', 'name');
    
    res.status(201).json({
      message: req.t('success.review_submitted'),
      data: newReview
    });
  } catch (err) {
    console.error('Submit review error:', err);
    res.status(500).json({ message: req.t('errors.server') });
  }
});

// Get all reviews for a listing
router.get('/:listingId', async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate('guest', 'name')
      .sort('-createdAt');
    
    res.json({
      message: 'Reviews retrieved successfully',
      data: reviews
    });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ message: 'Failed to retrieve reviews' });
  }
});

// Get reviews by current user
router.get('/user/me', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ guest: req.user.id })
      .populate('listing', 'title images location')
      .sort('-createdAt');
    
    res.json({
      message: 'User reviews retrieved successfully',
      data: reviews
    });
  } catch (err) {
    console.error('Get user reviews error:', err);
    res.status(500).json({ message: 'Failed to retrieve user reviews' });
  }
});

// Update a review
router.put('/:reviewId', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const reviewId = req.params.reviewId;
    
    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: req.t('errors.validation') });
    }
    
    if (!review || review.trim().length < 10) {
      return res.status(400).json({ message: req.t('errors.validation') });
    }
    
    const existingReview = await Review.findById(reviewId);
    if (!existingReview) {
      return res.status(404).json({ message: req.t('errors.review_not_found') });
    }
    
    // Check if user owns this review
    if (existingReview.guest.toString() !== req.user.id) {
      return res.status(403).json({ message: req.t('errors.forbidden') });
    }
    
    existingReview.rating = rating;
    existingReview.review = review.trim();
    await existingReview.save();
    
    // Recalculate listing average rating
    const listing = await Listing.findById(existingReview.listing);
    if (listing) {
      const allReviews = await Review.find({ listing: listing._id });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      listing.averageRating = Math.round(avgRating * 10) / 10;
      await listing.save();
    }
    
    await existingReview.populate('guest', 'name');
    
    res.json({
      message: req.t('success.review_updated'),
      data: existingReview
    });
  } catch (err) {
    console.error('Update review error:', err);
    res.status(500).json({ message: req.t('errors.server') });
  }
});

// Delete a review
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user owns this review
    if (review.guest.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }
    
    const listingId = review.listing;
    await Review.findByIdAndDelete(reviewId);
    
    // Remove review from listing and recalculate average rating
    const listing = await Listing.findById(listingId);
    if (listing) {
      listing.reviews = listing.reviews.filter(r => r.toString() !== reviewId);
      const allReviews = await Review.find({ listing: listingId });
      if (allReviews.length > 0) {
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        listing.averageRating = Math.round(avgRating * 10) / 10;
      } else {
        listing.averageRating = 0;
      }
      await listing.save();
    }
    
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

module.exports = router; 