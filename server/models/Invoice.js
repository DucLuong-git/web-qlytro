const mongoose = require('mongoose');

/**
 * Invoice — Hóa đơn tháng cho từng phòng
 */
const invoiceSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Phòng là bắt buộc'],
    },
    // Chu kỳ: format "YYYY-MM", ví dụ "2026-04"
    period: {
      type: String,
      required: [true, 'Chu kỳ hóa đơn là bắt buộc'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Period phải có format YYYY-MM'],
    },

    // Chỉ số điện
    electric: {
      oldIndex: { type: Number, default: 0 },
      newIndex: { type: Number, default: 0 },
      usage:    { type: Number, default: 0 },   // newIndex - oldIndex
      price:    { type: Number, default: 0 },   // đơn giá tại thời điểm lập HĐ
      total:    { type: Number, default: 0 },   // usage * price
    },

    // Chỉ số nước
    water: {
      oldIndex: { type: Number, default: 0 },
      newIndex: { type: Number, default: 0 },
      usage:    { type: Number, default: 0 },
      price:    { type: Number, default: 0 },
      total:    { type: Number, default: 0 },
    },

    // Tiền phòng
    roomFee: {
      type: Number,
      default: 0,
    },

    // Các dịch vụ cố định (rác, internet, gửi xe,...)
    services: [
      {
        name:     { type: String, required: true },
        amount:   { type: Number, required: true, min: 0 },
        note:     { type: String, default: '' },
      },
    ],

    // Tổng tiền cuối cùng
    totalAmount: {
      type: Number,
      default: 0,
    },

    // Ảnh minh chứng đồng hồ — URL trên Cloudinary (có watermark)
    evidenceImages: {
      type: [String],
      default: [],
    },

    // Trạng thái thanh toán
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Overdue'],
      default: 'Pending',
    },

    // Ghi chú từ admin
    note: {
      type: String,
      default: '',
      trim: true,
    },

    // Ngày thanh toán thực tế
    paidAt: {
      type: Date,
      default: null,
    },

    // Snapshot config giá tại thời điểm lập hóa đơn
    configSnapshot: {
      electricPrice: { type: Number, default: 0 },
      waterPrice:    { type: Number, default: 0 },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Ràng buộc: mỗi phòng chỉ có 1 hóa đơn / kỳ
invoiceSchema.index({ roomId: 1, period: 1 }, { unique: true });
invoiceSchema.index({ status: 1, period: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
