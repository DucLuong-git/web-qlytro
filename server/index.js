require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');

// ─── Import Routes ───────────────────────────────────────────────
const authRoutes    = require('./routes/auth');
const roomRoutes    = require('./routes/rooms');
const tenantRoutes  = require('./routes/tenants');
const logRoutes     = require('./routes/logs');
const contractRoutes= require('./routes/contracts');
const userRoutes    = require('./routes/users');
const reportRoutes  = require('./routes/reports');
const vnpayRoutes   = require('./routes/vnpay');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'https://luong.io.vn', 'http://luong.io.vn'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Database Connection ──────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected:', process.env.MONGODB_URI))
  .catch(err => { console.error('❌ MongoDB connection error:', err); process.exit(1); });

// ─── Routes ──────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/rooms',     roomRoutes);
app.use('/api/tenants',   tenantRoutes);
app.use('/api/logs',      logRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/reports',   reportRoutes);
app.use('/api/vnpay',     vnpayRoutes);

// ─── Health Check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    server: 'Đức Lương Home API v2.0',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ─── Serve Frontend (Production) ───────────────────────────────────
// Phục vụ frontend (các file đã build trong thư mục dist) tại đường dẫn gốc
app.use(express.static(path.join(__dirname, '../dist')));

// Các API không tìm thấy -> 404 (Chỉ áp dụng cho request bắt đầu bằng /api)
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} không tồn tại.` });
});

// Các request khác -> Trả về trang index.html của ReactJS để React Router xử lý nội bộ
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// ─── Global Error Handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ.',
  });
});

// ─── Start ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`📦 API Base: http://localhost:${PORT}/api`);
  console.log(`🌿 Môi trường: ${process.env.NODE_ENV}\n`);
});

module.exports = app;
