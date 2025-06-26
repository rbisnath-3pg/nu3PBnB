const mongoose = require('mongoose');

const DiagnosticsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., 'bookingTest'
  lastRun: { type: Date },
  success: { type: Boolean },
  errors: { type: [String], default: [] },
  logs: { type: [String], default: [] }
});

module.exports = mongoose.model('Diagnostics', DiagnosticsSchema); 