const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['ADMIN', 'STAFF', 'TENANT', 'SYSTEM'],
    default: 'SYSTEM',
  },
  action: {
    type: String,
    required: true,
  },
  module: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Log', logSchema);
