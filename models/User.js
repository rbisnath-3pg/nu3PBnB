const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'host', 'guest'], default: 'guest' },
  onboardingCompleted: { type: Boolean, default: false },
  themePreference: { type: String, enum: ['light', 'dark'], default: 'light' },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
  language: { type: String, enum: ['en', 'fr', 'es'], default: 'en' },
  onboarded: { type: Boolean, default: false },
  profilePicture: { type: String, default: '' },
  profilePictureData: { type: Buffer },
  profilePictureType: { type: String },
  bio: { type: String, default: '' },
  location: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 