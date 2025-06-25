const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, required: true },
  photos: [{ type: String }],
  availability: [{
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  }],
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  averageRating: { type: Number, default: 0 },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  amenities: [{ type: String }],
  maxGuests: { type: Number, default: 2 },
  bedrooms: { type: Number, default: 1 },
  bathrooms: { type: Number, default: 1 },
  available: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  language: { type: String, enum: ['en', 'fr', 'es'], default: 'en' }
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema); 