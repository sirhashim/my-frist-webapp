const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  // Core content
  question: { type: String, required: true },
  answer: { type: String, required: true },
  explanation: { type: String },
  
  // Media support
  imageUrl: { type: String },
  audioUrl: { type: String },
  
  // Categorization
  category: { 
    type: String, 
    required: true, 
    index: true,
    enum: ['medicine', 'engineering', 'languages', 'programming', 'general']
  },
  tags: [{ type: String }],
  
  // User and ownership
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    index: true 
  },
  isPublic: { type: Boolean, default: false },
  
  // SM-2 Spaced Repetition Algorithm
  sm2: {
    interval: { type: Number, default: 1 },
    repetition: { type: Number, default: 0 },
    efactor: { type: Number, default: 2.5 },
    dueDate: { type: Date, default: Date.now, index: true },
    lastReviewed: { type: Date },
    nextReview: { type: Date, index: true },
    difficulty: { 
      type: String, 
      enum: ['easy', 'good', 'hard', 'again'],
      default: 'good' 
    },
    streak: { type: Number, default: 0 }
  },
  
  // 3D Card Properties
  cardStyle: {
    frontBgColor: { type: String, default: '#ffffff' },
    backBgColor: { type: String, default: '#f8f9fa' },
    textColor: { type: String, default: '#333333' },
    fontFamily: { type: String, default: 'Arial, sans-serif' },
    has3DEffect: { type: Boolean, default: true }
  },
  
  // Statistics
  stats: {
    views: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    averageRating: { type: Number, min: 1, max: 5, default: 3 },
    successRate: { type: Number, min: 0, max: 100, default: 0 }
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  // Versioning
  version: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance

flashcardSchema.index({ 'sm2.nextReview': 1 });
flashcardSchema.index({ category: 1, tags: 1 });

// Pre-save hook to update timestamps
flashcardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for card difficulty level
flashcardSchema.virtual('difficultyLevel').get(function() {
  return this.sm2.difficulty;
});

// Static method to get cards due for review
flashcardSchema.statics.findDueCards = function(userId, limit = 20) {
  return this.find({
    userId,
    isActive: true,
    $or: [
      { 'sm2.nextReview': { $lte: new Date() } },
      { 'sm2.nextReview': { $exists: false } }
    ]
  }).limit(limit).sort({ 'sm2.nextReview': 1 });
};

// Method to update card after review
flashcardSchema.methods.updateAfterReview = function(quality) {
  // SM-2 Algorithm implementation
  let { interval, repetition, efactor } = this.sm2;
  
  if (quality >= 3) {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * efactor);
    }
    
    repetition++;
  } else {
    repetition = 0;
    interval = 1;
  }
  
  // Update EF (Ease Factor)
  efactor = Math.max(1.3, efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  
  // Update card
  this.sm2.interval = interval;
  this.sm2.repetition = repetition;
  this.sm2.efactor = efactor;
  this.sm2.lastReviewed = new Date();
  this.sm2.nextReview = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);
  this.sm2.difficulty = ['again', 'hard', 'good', 'easy'][quality - 1] || 'good';
  
  // Update stats
  this.stats.reviews += 1;
  this.stats.successRate = ((this.stats.successRate * (this.stats.reviews - 1)) + 
    (quality >= 3 ? 100 : 0)) / this.stats.reviews;
  
  return this.save();
};

module.exports = mongoose.model('Flashcard', flashcardSchema);