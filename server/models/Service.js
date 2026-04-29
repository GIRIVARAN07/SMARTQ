const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['hospital', 'bank', 'college', 'service_center', 'government', 'other'],
    default: 'other'
  },
  icon: {
    type: String,
    default: '🏢'
  },
  estimatedTimePerToken: {
    type: Number, // in minutes
    default: 10
  },
  maxTokensPerDay: {
    type: Number,
    default: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  operatingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' }
  },
  location: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
