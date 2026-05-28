const mongoose = require('mongoose');

// Schema quản lý danh sách thành viên tham gia phòng chat.
// Thiết kế tách biệt để dễ dàng kiểm tra phân quyền và mở rộng.
const chatParticipantSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Lưu role trực tiếp ở đây để chặn "GUEST" hoặc các role không hợp lệ
  // Tuyệt đối chỉ cho phép TENANT, OWNER, và ADMIN theo nghiệp vụ.
  role: {
    type: String,
    enum: ['TENANT', 'OWNER', 'ADMIN'],
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

// Composite Index: Một user chỉ được tham gia vào 1 phòng chat đúng 1 lần.
// Tránh trùng lặp dữ liệu participants.
chatParticipantSchema.index({ roomId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ChatParticipant', chatParticipantSchema);
