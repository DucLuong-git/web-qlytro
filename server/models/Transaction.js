const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sepay_id: {
    type: Number,
    required: true,
    unique: true, // Cơ chế chống trùng lặp (chống webhook gọi 2 lần cho 1 giao dịch)
  },
  gateway: {
    type: String,
    default: 'SePay',
  },
  transaction_date: {
    type: Date,
  },
  account_number: {
    type: String,
  },
  sub_account: {
    type: String,
  },
  code: {
    type: String,
  },
  amount_in: {
    type: Number,
    default: 0,
  },
  amount_out: {
    type: Number,
    default: 0,
  },
  accumulated: {
    type: Number,
    default: 0,
  },
  content: {
    type: String,
  },
  reference_code: {
    type: String,
  },
  body: {
    type: Object, // Lưu trữ toàn bộ payload gốc dạng JSON
  },
  created_at: {
    type: Date,
    default: Date.now,
  }
});

// Thêm các Index để truy vấn nhanh
transactionSchema.index({ code: 1 });
transactionSchema.index({ account_number: 1, transaction_date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
