const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ChatRoom = require('../models/ChatRoom');
const ChatParticipant = require('../models/ChatParticipant');
const Message = require('../models/Message');

module.exports = (io) => {
  // Tạo Namespace riêng cho Chat để không ảnh hưởng tới socket của hệ thống Webhook
  const chatNamespace = io.of('/chat');

  // ==========================================
  // MIDDLEWARE: Xác thực kết nối Socket (Verify Token)
  // ==========================================
  chatNamespace.use(async (socket, next) => {
    try {
      // Lấy token từ handshake auth hoặc headers
      const token = socket.handshake.auth?.token || socket.handshake.headers?.token;
      if (!token) {
        return next(new Error('Authentication error: Missing token'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user || !user.isActive) {
        return next(new Error('Authentication error: Invalid or inactive user'));
      }
      
      // Gắn thông tin user vào socket object để truy xuất ở các event
      socket.user = user;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // ==========================================
  // XỬ LÝ SỰ KIỆN KHI CLIENT KẾT NỐI
  // ==========================================
  chatNamespace.on('connection', (socket) => {
    console.log(`🔌 [Chat] Client connected: ${socket.user.name} (${socket.id})`);

    // ------------------------------------------
    // 1. EVENT: join_room - Tham gia phòng chat
    // ------------------------------------------
    socket.on('join_room', async (roomId, callback) => {
      try {
        const user = socket.user;
        const isSystemAdmin = ['ADMIN', 'OWNER'].includes(user.role);
        
        // KIỂM TRA QUYỀN TRUY CẬP PHÒNG CHAT
        const participant = await ChatParticipant.findOne({ roomId, userId: user._id });
        
        if (!isSystemAdmin && !participant) {
          console.warn(`[Chat Security] Cảnh báo: User ${user.name} cố gắng join phòng ${roomId} trái phép.`);
          socket.emit('error', { message: 'Bạn không có quyền tham gia phòng này.' });
          socket.disconnect(true); // Đá client văng ra ngoài ngay lập tức
          return;
        }

        // Bỏ user vào phòng
        socket.join(roomId);
        console.log(`[Chat] ${user.name} đã join phòng ${roomId}`);
        
        if (callback) callback({ success: true, message: 'Joined room successfully' });
      } catch (err) {
        console.error('[Chat join_room error]', err);
        if (callback) callback({ success: false, error: 'Internal Server Error' });
      }
    });

    // ------------------------------------------
    // 2. EVENT: send_message - Gửi tin nhắn
    // ------------------------------------------
    socket.on('send_message', async (data, callback) => {
      try {
        const { roomId, content } = data;
        const user = socket.user;

        // Lưu tin nhắn vào Database
        const newMessage = await Message.create({
          roomId,
          senderId: user._id,
          content,
          readBy: [{ userId: user._id, readAt: new Date() }] // Đánh dấu chính người gửi đã xem
        });

        // Populate thông tin người gửi để map avatar, tên trên UI
        await newMessage.populate('senderId', 'name avatar role');

        // BROADCAST TIN NHẮN TỚI NHỮNG NGƯỜI ĐANG TRONG ĐÚNG PHÒNG NÀY
        chatNamespace.to(roomId).emit('receive_message', newMessage);

        // --- Logic Thông báo Offline ---
        // Fetch danh sách những kết nối đang active trong room
        const socketsInRoom = await chatNamespace.in(roomId).fetchSockets();
        
        // Trừ chính người gửi ra, nếu <= 1 người tức là người kia đang offline
        if (socketsInRoom.length <= 1) {
          console.log(`[Chat Notification] Đối tác đang offline! Hệ thống chuẩn bị gửi thông báo đẩy...`);
          
          // TO-DO: Tích hợp logic Push Notification hoặc tạo bản ghi Notifications trong MongoDB tại đây
          // Ví dụ: await Notification.create({ userId: receiverId, type: 'NEW_MESSAGE', ... });
        }

        // Gửi ACK (Callback) báo cho client biết gửi thành công
        if (callback) callback({ success: true, message: newMessage });
        
      } catch (err) {
        console.error('[Chat send_message error]', err);
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // ------------------------------------------
    // 3. EVENT: disconnect - Khi ngắt kết nối
    // ------------------------------------------
    socket.on('disconnect', () => {
      console.log(`🔌 [Chat] Client disconnected: ${socket.user?.name} (${socket.id})`);
    });
  });
};
