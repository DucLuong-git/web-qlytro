const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  // Khóa ngoại liên kết 1-1 với bảng Tenant hiện tại
  // UNIQUE đảm bảo mỗi Tenant chỉ có duy nhất 1 nhóm chat riêng.
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    unique: true 
  },
  name: {
    type: String,
    // Ví dụ: "Kênh hỗ trợ phòng 101 - Nguyễn Văn A"
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'archived'],
    default: 'active'
  }
}, { 
  timestamps: true 
});

// Thêm index để truy vấn nhanh phòng chat từ ID của tenant
chatRoomSchema.index({ tenantId: 1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
