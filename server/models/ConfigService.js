const mongoose = require('mongoose');

/**
 * ConfigService — Lưu đơn giá Điện, Nước, Rác, Internet,...
 * Hỗ trợ lịch sử giá (có hiệu lực theo ngày áp dụng)
 */
const configServiceSchema = new mongoose.Schema(
  {
    electricPrice: {
      type: Number,
      required: [true, 'Đơn giá điện là bắt buộc'],
      min: [0, 'Đơn giá không thể âm'],
      default: 3500, // VNĐ / kWh
    },
    waterPrice: {
      type: Number,
      required: [true, 'Đơn giá nước là bắt buộc'],
      min: [0, 'Đơn giá không thể âm'],
      default: 15000, // VNĐ / m³
    },
    garbagePrice: {
      type: Number,
      default: 20000, // VNĐ / tháng / phòng
    },
    internetPrice: {
      type: Number,
      default: 100000, // VNĐ / tháng / phòng
    },
    parkingPrice: {
      type: Number,
      default: 100000, // VNĐ / tháng / xe
    },
    // Thông tin ngân hàng để sinh VietQR
    bankInfo: {
      bankId:       { type: String, default: 'VCB' },             // Mã ngân hàng VietQR
      accountNo:    { type: String, default: '03616249999' },     // Số tài khoản
      accountName:  { type: String, default: 'CHU TRO DUC LUONG' }, // Tên chủ TK (KHÔNG DẤU)
    },
    // Ngày hiệu lực (để so sánh lịch sử giá)
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
    // Ghi chú / phiên bản
    note: {
      type: String,
      default: '',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Index để lấy config mới nhất nhanh
configServiceSchema.index({ effectiveDate: -1 });

module.exports = mongoose.model('ConfigService', configServiceSchema);
