const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage (to store as blob)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// Get user's profile picture
router.get('/me/profile-picture', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('profilePictureData profilePictureType profilePicture');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user has uploaded image data, serve it
    if (user.profilePictureData && user.profilePictureType) {
      res.set('Content-Type', user.profilePictureType);
      res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      return res.send(user.profilePictureData);
    }
    
    // If user has external URL, redirect to it
    if (user.profilePicture) {
      return res.redirect(user.profilePicture);
    }
    
    // Default avatar
    res.redirect(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&size=200`);
  } catch (error) {
    console.error('Error serving profile picture:', error);
    res.status(500).json({ message: 'Error serving profile picture' });
  }
});

// Upload profile picture
router.post('/me/profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store the image data as blob
    user.profilePictureData = req.file.buffer;
    user.profilePictureType = req.file.mimetype;
    // Clear the external URL since we now have uploaded data
    user.profilePicture = '';
    
    await user.save();
    
    res.json({ 
      message: 'Profile picture uploaded successfully',
      profilePictureType: user.profilePictureType
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Error uploading profile picture' });
  }
});

// Update current user profile
router.put('/me', auth, async (req, res) => {
  const { name, themePreference, profilePicture, bio, location } = req.body;
  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (themePreference !== undefined) updateFields.themePreference = themePreference;
  if (profilePicture !== undefined) {
    updateFields.profilePicture = profilePicture;
    // Clear uploaded data if user switches to external URL
    if (profilePicture) {
      updateFields.profilePictureData = null;
      updateFields.profilePictureType = null;
    }
  }
  if (bio !== undefined) updateFields.bio = bio;
  if (location !== undefined) updateFields.location = location;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select('-password');
  res.json(user);
});

// Admin: Get all users
router.get('/', auth, requireRole('admin'), async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// Admin: Update any user
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  const { name, email, role, themePreference } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { name, email, role, themePreference } },
    { new: true, runValidators: true }
  ).select('-password');
  res.json(user);
});

// Admin: Delete any user
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

// Get current user's wishlist
router.get('/me/wishlist', auth, async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist', '-__v');
  res.json(user.wishlist || []);
});

// Add a listing to current user's wishlist
router.post('/me/wishlist', auth, async (req, res) => {
  console.log('[WISHLIST] POST /me/wishlist body:', req.body);
  try {
    const { listingId } = req.body;
    if (!listingId) {
      console.log('[WISHLIST] Missing listingId');
      return res.status(400).json({ message: 'listingId is required' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('[WISHLIST] User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.wishlist.includes(listingId)) {
      user.wishlist.push(listingId);
      await user.save();
      console.log('[WISHLIST] Added listingId to wishlist:', listingId);
    } else {
      console.log('[WISHLIST] Listing already in wishlist:', listingId);
    }
    await user.populate('wishlist', '-__v');
    res.json(user.wishlist);
  } catch (err) {
    console.error('[WISHLIST] Error adding to wishlist:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove a listing from current user's wishlist
router.delete('/me/wishlist/:listingId', auth, async (req, res) => {
  const { listingId } = req.params;
  const user = await User.findById(req.user.id);
  user.wishlist = user.wishlist.filter(id => id.toString() !== listingId);
  await user.save();
  await user.populate('wishlist', '-__v');
  res.json(user.wishlist);
});

// Get count of users who have a specific listing in their wishlist
router.get('/wishlist/count/:listingId', auth, async (req, res) => {
  try {
    const { listingId } = req.params;
    const count = await User.countDocuments({ wishlist: listingId });
    res.json({ count });
  } catch (error) {
    console.error('Error getting wishlist count:', error);
    res.status(500).json({ message: 'Error getting wishlist count' });
  }
});

module.exports = router; 