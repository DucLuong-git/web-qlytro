const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// ─── Cloudinary Config ────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Multer — Memory Storage ──────────────────────────────────────
// File được giữ trong RAM, không ghi disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, webp, heic)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ─── Upload to Cloudinary ─────────────────────────────────────────
/**
 * Upload buffer lên Cloudinary với Watermark overlay
 * @param {Buffer} buffer      - File buffer từ multer
 * @param {string} roomName    - Tên phòng (hiển thị trên watermark)
 * @param {string} folder      - Thư mục trên Cloudinary
 * @returns {Promise<string>}  - Secure URL của ảnh đã upload
 */
const uploadToCloudinary = (buffer, roomName = '', folder = 'duc_luong_invoices') => {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const watermarkText = encodeURIComponent(`${roomName} | ${timestamp}`);

    const uploadOptions = {
      folder,
      resource_type: 'image',
      // Cloudinary Text Overlay — Watermark tự động
      transformation: [
        {
          overlay: {
            font_family: 'Arial',
            font_size: 32,
            font_weight: 'bold',
            text: watermarkText,
          },
          gravity: 'south_east',
          x: 20,
          y: 20,
          color: '#ffffff',
          opacity: 80,
        },
        // Đường viền shadow để watermark dễ đọc trên mọi nền
        {
          overlay: {
            font_family: 'Arial',
            font_size: 32,
            font_weight: 'bold',
            text: watermarkText,
          },
          gravity: 'south_east',
          x: 22,
          y: 22,
          color: '#000000',
          opacity: 60,
        },
      ],
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });

    stream.end(buffer);
  });
};

module.exports = { upload, uploadToCloudinary, cloudinary };
