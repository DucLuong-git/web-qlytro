const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên phòng không được để trống'],
    trim: true,
    maxlength: [200, 'Tên phòng quá dài'],
  },
  price: {
    type: Number,
    required: [true, 'Giá thuê không được để trống'],
    min: [0, 'Giá không thể âm'],
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Maintenance'],
    default: 'Available',
  },
  type: {
    type: String,
    enum: ['Phòng trọ', 'Chung Cư Mini', 'KTX', 'Nhà nguyên căn'],
    default: 'Phòng trọ',
  },
  district: {
    type: String,
    trim: true,
    default: '',
  },
  address: {
    type: String,
    trim: true,
    default: '',
  },
  area: {
    type: Number,
    default: 0,
    min: 0,
  },
  bedrooms: {
    type: Number,
    default: 1,
    min: 0,
  },
  bathrooms: {
    type: Number,
    default: 1,
    min: 0,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  amenities: {
    type: [String],
    default: [],
  },
  images: {
    type: [String],
    default: [],
  },
  image: {
    type: String,
    default: '',
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  views: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index để tìm kiếm nhanh
roomSchema.index({ name: 'text', address: 'text', district: 'text' });
roomSchema.index({ status: 1, type: 1 });
roomSchema.index({ price: 1 });

module.exports = mongoose.model('Room', roomSchema);
