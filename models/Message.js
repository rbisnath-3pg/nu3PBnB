const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  subject: { type: String, default: '' },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'BookingRequest' },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  read: { type: Boolean, default: false },
  messageType: { 
    type: String, 
    enum: ['regular', 'reply', 'forward'], 
    default: 'regular' 
  },
  parentMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  forwardedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
messageSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Message', messageSchema); 