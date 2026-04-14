const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên không được để trống'],
    trim: true,
    minlength: [2, 'Tên phải có ít nhất 2 ký tự'],
    maxlength: [80, 'Tên không được quá 80 ký tự'],
  },
  email: {
    type: String,
    required: [true, 'Email không được để trống'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu không được để trống'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false, // Không trả về password trong queries mặc định
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  role: {
    type: String,
    enum: ['ADMIN', 'STAFF', 'TENANT'],
    default: 'TENANT',
  },
  avatar: {
    type: String,
    default: function() {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(this.name || 'user')}`;
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true, // createdAt, updatedAt tự động
});

// Hash password trước khi save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method kiểm tra password
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Support both legacy plaintext passwords and new bcrypt hashes
  if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
    return candidatePassword === this.password;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Loại bỏ password khi chuyển sang JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
