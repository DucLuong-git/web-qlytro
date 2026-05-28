const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Liên kết với phòng chat
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true,
  },
  // Liên kết với người gửi (Chỉ những user có trong bảng ChatParticipant mới được gửi)
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  // Đánh dấu tin nhắn bị thu hồi hoặc xóa
  isDeleted: {
    type: Boolean,
    default: false
  },
  // Mảng lưu trữ trạng thái 'Đã xem' của từng người trong nhóm
  // Nếu có người mở khung chat thì đẩy userId của họ vào mảng này kèm thời gian
  readBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true 
});

// Index roomId để tăng tốc độ truy vấn danh sách tin nhắn của 1 phòng cụ thể (sắp xếp theo thời gian)
messageSchema.index({ roomId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
