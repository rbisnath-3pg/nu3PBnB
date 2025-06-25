const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    enum: ['page_view', 'click', 'session_start', 'session_end', 'bounce'],
    required: true
  },
  page: {
    type: String,
    required: true
  },
  element: {
    type: String,
    default: null // For click events, what element was clicked
  },
  elementType: {
    type: String,
    default: null // button, link, card, etc.
  },
  elementId: {
    type: String,
    default: null // Specific ID of the element
  },
  elementText: {
    type: String,
    default: null // Text content of the clicked element
  },
  timeSpent: {
    type: Number,
    default: 0 // Time spent on page in seconds
  },
  referrer: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ sessionId: 1, timestamp: -1 });
userActivitySchema.index({ eventType: 1, timestamp: -1 });
userActivitySchema.index({ page: 1, timestamp: -1 });

module.exports = mongoose.model('UserActivity', userActivitySchema); 