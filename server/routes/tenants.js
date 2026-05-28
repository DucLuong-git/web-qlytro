const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');
const Room = require('../models/Room');
const Log = require('../models/Log');
const ChatRoom = require('../models/ChatRoom');
const ChatParticipant = require('../models/ChatParticipant');
const User = require('../models/User');

// Get all tenants
router.get('/', async (req, res) => {
  try {
    const tenants = await Tenant.find().sort({ createdAt: -1 });
    const transformed = tenants.map(t => {
      const obj = t.toJSON();
      obj.id = obj._id.toString();
      // Handle legacy roomId 
      obj.roomId = obj.roomIdRef || (obj.roomId ? obj.roomId.toString() : '');
      return obj;
    });
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create tenant
router.post('/', async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.roomId && typeof payload.roomId === 'string') {
      try {
        const mongoose = require('mongoose');
        if (mongoose.Types.ObjectId.isValid(payload.roomId)) {
           // isValid handles old db.json numeric ids wrongly in some cases, so if it's purely a 1-2 digit string, save it in ref
           if (payload.roomId.length < 12) {
              payload.roomIdRef = payload.roomId;
              delete payload.roomId;
           }
        } else {
           payload.roomIdRef = payload.roomId;
           delete payload.roomId;
        }
      } catch (e) {
         // ignore
      }
    }

    const tenant = await Tenant.create(payload);
    
    // --- Hook: Tự động tạo phòng Chat Nhóm Cá Nhân ---
    try {
      // Cố gắng tìm User account của Tenant này thông qua email
      const tenantUser = await User.findOne({ email: tenant.email, role: 'TENANT' });
      // Tìm các tài khoản Admin (hoặc Owner nếu có)
      const admins = await User.find({ role: { $in: ['ADMIN', 'OWNER'] } });

      if (tenantUser) {
        // 1. Tạo 1 bản ghi mới trong chat_rooms liên kết với tenant
        const chatRoom = await ChatRoom.create({
          tenantId: tenant._id,
          name: `Nhóm hỗ trợ - ${tenant.name}`
        });

        // 2. Chuẩn bị danh sách thành viên tham gia
        const participants = [
          { roomId: chatRoom._id, userId: tenantUser._id, role: 'TENANT' }
        ];

        // Thêm tất cả Admin vào nhóm mặc định
        admins.forEach(admin => {
          participants.push({
            roomId: chatRoom._id,
            userId: admin._id,
            role: admin.role // 'ADMIN' hoặc 'OWNER'
          });
        });

        // Bulk insert vào chat_participants
        await ChatParticipant.insertMany(participants);
      }
    } catch (chatErr) {
      console.error('[Auto Chat Room] Lỗi khi tạo phòng chat:', chatErr);
      // Không return lỗi ở đây để tránh làm gián đoạn việc tạo Tenant chính
    }
    
    // Auto update room status if assigned
    if (req.body.roomId) {
      // Find room by real ObjectId or let frontend rely on it
      try {
         await Room.findByIdAndUpdate(req.body.roomId, { status: 'Occupied' });
      } catch(e) {}
    }

    await Log.create({
      user: 'Admin Master',
      role: 'ADMIN',
      action: 'CREATE',
      module: 'Tenant Management',
      details: `Added new tenant "${tenant.name}"`
    });

    const obj = tenant.toJSON();
    obj.id = obj._id.toString();
    res.status(201).json(obj);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update tenant
router.put('/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    await Log.create({
      user: 'Admin Master',
      role: 'ADMIN',
      action: 'UPDATE',
      module: 'Tenant Management',
      details: `Updated tenant ID: ${tenant._id}`
    });

    const obj = tenant.toJSON();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete tenant
router.delete('/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndDelete(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    
    await Log.create({
      user: 'Admin Master',
      role: 'ADMIN',
      action: 'DELETE',
      module: 'Tenant Management',
      details: `Deleted tenant ID: ${req.params.id}`
    });

    res.json({ message: 'Tenant deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
