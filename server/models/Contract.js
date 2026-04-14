const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  deposit: {
    type: Number,
    required: true,
    min: 0,
  },
  monthlyRent: {
    type: Number,
    default: 0,
  },
  durationMonths: {
    type: Number,
    default: 12,
    min: 1,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Terminated'],
    default: 'Active',
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Contract', contractSchema);
