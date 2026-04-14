const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập, vui lòng đăng nhập để truy cập' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser) {
      return res.status(401).json({ success: false, message: 'Người dùng không còn tồn tại' });
    }
    
    if (!currentUser.isActive) {
      return res.status(401).json({ success: false, message: 'Tài khoản đã bị khóa' });
    }
    
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại' });
    }
    return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này' });
    }
    next();
  };
};

module.exports = { protect, authorize };
