const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Mark onboarding as completed
router.post('/complete', auth, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { onboardingCompleted: true });
  res.json({ message: 'Onboarding completed' });
});

// Set theme preference
router.post('/theme', auth, async (req, res) => {
  const { theme } = req.body;
  if (!['light', 'dark'].includes(theme)) return res.status(400).json({ message: 'Invalid theme' });
  await User.findByIdAndUpdate(req.user.id, { themePreference: theme });
  res.json({ message: 'Theme updated' });
});

module.exports = router; 