const express = require('express');
const Feedback = require('../models/Feedback');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Submit feedback
router.post('/', auth, async (req, res) => {
  const { message, topic, rating } = req.body;
  const feedback = new Feedback({
    user: req.user.id,
    message,
    topic,
    rating
  });
  await feedback.save();
  res.status(201).json({ message: req.t('success.feedback_submitted'), feedback });
});

// Placeholder route
router.get('/', (req, res) => {
  res.json({ message: 'Feedback route is working.' });
});

module.exports = router;