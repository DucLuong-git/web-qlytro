const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/* CẤU TRÚC:
 * GET /users?email=...  => Frontend cũ gọi endpoint này để kiểm tra lúc đăng ký / đăng nhập (json-server pattern).
 * Nhưng ở backend mới, frontend nếu gọi để check tồn tại thì cũng được, nhưng đăng nhập thì dùng POST /users hoặc POST /auth/login tuỳ giao thức.
 * Nhưng trang login của frontend FPL dùng `api.get(/users?email=...)` kiểm tra cả email lẫn password (JSON Serve flow).
 * Vì thế tạm thời ta sẽ mock behaviour này trong route users của REST API chuẩn.
 */

// Lấy danh sách users hoặc check credentials (tương thích JSON-server frontend)
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    if (email) {
      // Dành cho Login (JSON Server mock)
      const users = await User.find({ email }).select('+password');
      return res.json(users);
    }
    
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Đăng ký user tương thích JSON server: Frontend gọi POST /users
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, password, role, avatar } = req.body;
    
    // Check if email exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'TENANT',
      avatar
    });

    // Frontend expecting the newly created user object back
    const userObj = user.toJSON();
    // Simulate json-server token structure or anything needed
    res.status(201).json(userObj);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Khôi phục mật khẩu
router.post('/reset-password', async (req, res) => {
  try {
    const { email, phone, newPassword } = req.body;
    
    // Tìm User khớp cả Email và Phone
    const user = await User.findOne({ email, phone });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Email hoặc Số điện thoại không khớp với hệ thống.' });
    }
    
    // Cập nhật pass mới
    user.password = newPassword; // Trong app thực tế nên gọi bcrypt.hash tại Schema mongoose
    await user.save();
    
    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server, thử lại sau!' });
  }
});

module.exports = router;
