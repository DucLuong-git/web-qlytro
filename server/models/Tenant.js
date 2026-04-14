const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên khách thuê không được để trống'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email không được để trống'],
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Số điện thoại không được để trống'],
    trim: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null,
  },
  // Legacy string roomId support (for backward compat)
  roomIdRef: {
    type: String,
    default: '',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    default: null,
  },
  deposit: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, {
  timestamps: true,
});

tenantSchema.index({ email: 1 });
tenantSchema.index({ roomId: 1 });

module.exports = mongoose.model('Tenant', tenantSchema);
