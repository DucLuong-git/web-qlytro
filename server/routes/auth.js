const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Đăng nhập an toàn
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp cả email và mật khẩu.' });
    }

    // Lấy user bao gồm trường password (do bị select: false mặc định)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email này không tồn tại trong hệ thống. Vui lòng kiểm tra lại.' });
    }

    // So khớp mật khẩu
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Mật khẩu không chính xác. Vui lòng thử lại.' });
    }

    // Thành công -> Trả về JSON trừu tượng hoá password
    res.json({ success: true, user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server nội bộ' });
  }
});

router.post('/register', async (req, res) => {
  res.json({ message: 'Đây chỉ là endpoint stub. FPL frontend gọi POST /users để đăng ký.'});
});

module.exports = router;
