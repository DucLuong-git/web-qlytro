const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/ChatRoom');
const ChatParticipant = require('../models/ChatParticipant');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// ============================================================================
// API 1: Lấy thông tin phòng chat theo Tenant ID
// Bắt buộc xác thực: Chỉ Admin/Owner hoặc Tenant là thành viên mới được xem.
// ============================================================================
router.get('/room/:tenantId', protect, async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Tìm phòng chat liên kết với tenant
    const room = await ChatRoom.findOne({ tenantId });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng chat cho tenant này.' });
    }

    // --- KIỂM TRA QUYỀN TRUY CẬP (AUTHORIZATION STRICT CHECK) ---
    const isSystemAdmin = ['ADMIN', 'OWNER'].includes(req.user.role);
    
    // Kiểm tra xem User gọi API có nằm trong danh sách ChatParticipant của phòng này không
    const participant = await ChatParticipant.findOne({ 
      roomId: room._id, 
      userId: req.user._id 
    });

    // Nếu không phải Admin/Owner VÀ cũng không phải thành viên phòng -> Chặn (Guest bị chặn ở đây)
    if (!isSystemAdmin && !participant) {
      return res.status(403).json({ 
        success: false, 
        message: '403 Forbidden: Bạn không có quyền truy cập phòng chat này.' 
      });
    }

    // Trả về thông tin phòng kèm danh sách thành viên (ẩn password của user)
    const participants = await ChatParticipant.find({ roomId: room._id })
      .populate('userId', 'name email avatar role');

    res.json({ success: true, room, participants });
  } catch (error) {
    console.error('[GET /chat/room/:tenantId]', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
});

// ============================================================================
// API 1.5: Lấy phòng chat của MÌNH (Dành cho Tenant hoặc Admin đã được gán)
// Frontend gọi API này để không cần biết tenantId
// ============================================================================
router.get('/my-room', protect, async (req, res) => {
  try {
    // Tìm participant của user này (Lấy phòng chat đầu tiên mà họ tham gia)
    const participant = await ChatParticipant.findOne({ userId: req.user._id }).populate('roomId');
    
    if (!participant || !participant.roomId) {
      return res.status(404).json({ success: false, message: 'Bạn chưa có phòng chat nào.' });
    }

    const room = participant.roomId;
    const participants = await ChatParticipant.find({ roomId: room._id })
      .populate('userId', 'name email avatar role');

    res.json({ success: true, room, participants });
  } catch (error) {
    console.error('[GET /chat/my-room]', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
});

// ============================================================================
// API 2: Lấy lịch sử tin nhắn của phòng (Có phân trang)
// ============================================================================
router.get('/messages/:roomId', protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // --- KIỂM TRA QUYỀN TRUY CẬP (AUTHORIZATION STRICT CHECK) ---
    const isSystemAdmin = ['ADMIN', 'OWNER'].includes(req.user.role);
    const participant = await ChatParticipant.findOne({ roomId, userId: req.user._id });

    if (!isSystemAdmin && !participant) {
      return res.status(403).json({ 
        success: false, 
        message: '403 Forbidden: Bạn không có quyền đọc tin nhắn phòng này.' 
      });
    }

    // Truy vấn tin nhắn: Lấy từ mới nhất đến cũ nhất (createdAt: -1) để skip dễ dàng
    const messages = await Message.find({ roomId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'name avatar role');

    // Đếm tổng số tin nhắn
    const total = await Message.countDocuments({ roomId, isDeleted: false });

    res.json({
      success: true,
      // Đảo ngược mảng để trả về thứ tự hiển thị tự nhiên trên UI (từ trên xuống dưới: cũ -> mới)
      data: messages.reverse(), 
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[GET /chat/messages/:roomId]', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
});

// ============================================================================
// API 3: Đổi tên phòng chat
// ============================================================================
router.put('/room/:roomId', protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { name } = req.body;
    
    // Kiểm tra quyền
    const isSystemAdmin = ['ADMIN', 'OWNER'].includes(req.user.role);
    const participant = await ChatParticipant.findOne({ roomId, userId: req.user._id });

    if (!isSystemAdmin && !participant) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền đổi tên phòng này.' });
    }

    const updatedRoom = await ChatRoom.findByIdAndUpdate(
      roomId, 
      { name: name || 'Trung tâm Hỗ trợ' }, 
      { new: true }
    );
    
    res.json({ success: true, room: updatedRoom });
  } catch (error) {
    console.error('[PUT /chat/room/:roomId]', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
});

module.exports = router;
