const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  tokenNumber: {
    type: Number,
    required: true
  },
  displayNumber: {
    type: String,
    required: true // e.g., "A-001", "B-015"
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'serving', 'completed', 'cancelled', 'no_show'],
    default: 'waiting'
  },
  estimatedWaitTime: {
    type: Number, // in minutes
    default: 0
  },
  calledAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  },
  date: {
    type: String, // YYYY-MM-DD format for daily queue management
    required: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
tokenSchema.index({ service: 1, date: 1, tokenNumber: 1 });
tokenSchema.index({ user: 1, date: 1 });
tokenSchema.index({ status: 1, date: 1 });

module.exports = mongoose.model('Token', tokenSchema);
