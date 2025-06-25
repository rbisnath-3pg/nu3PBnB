const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'html', 'markdown', 'json'],
    default: 'html'
  },
  section: {
    type: String,
    required: true,
    enum: ['hero', 'about', 'footer', 'legal', 'help', 'homepage', 'general']
  },
  language: {
    type: String,
    enum: ['en', 'fr', 'es'],
    default: 'en'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    description: String,
    keywords: String,
    author: String,
    lastModified: Date
  },
  version: {
    type: Number,
    default: 1
  },
  history: [{
    content: String,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    version: Number,
    comment: String
  }]
}, {
  timestamps: true
});

// Compound unique index for key + language
contentSchema.index({ key: 1, language: 1 }, { unique: true });

// Index for efficient queries
contentSchema.index({ section: 1, language: 1 });
contentSchema.index({ isActive: 1 });

// Pre-save middleware to update version and history
contentSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.version += 1;
    this.metadata.lastModified = new Date();
  }
  next();
});

// Method to add to history
contentSchema.methods.addToHistory = function(userId, comment = '') {
  this.history.push({
    content: this.content,
    modifiedBy: userId,
    modifiedAt: new Date(),
    version: this.version,
    comment
  });
  
  // Keep only last 10 versions
  if (this.history.length > 10) {
    this.history = this.history.slice(-10);
  }
};

// Static method to get content by key and language
contentSchema.statics.getContent = async function(key, language = 'en') {
  const content = await this.findOne({ key, language, isActive: true });
  return content;
};

// Static method to get all content for a section
contentSchema.statics.getSectionContent = async function(section, language = 'en') {
  const content = await this.find({ section, language, isActive: true });
  return content;
};

module.exports = mongoose.model('Content', contentSchema); 