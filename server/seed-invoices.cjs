/**
 * seed-invoices.cjs
 * Khởi tạo dữ liệu mẫu cho module Hóa Đơn:
 *  - 1 bản ConfigService (đơn giá mặc định)
 *  - 3 Invoice mẫu cho các phòng đầu tiên
 *
 * Chạy: node server/seed-invoices.cjs
 */

require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

// ─── Kết nối MongoDB ──────────────────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('❌ MONGODB_URI chưa được thiết lập trong server/.env');
  process.exit(1);
}

// ─── Inline Schemas (để không phụ thuộc path phức tạp) ───────────
const configServiceSchema = new mongoose.Schema({
  electricPrice: { type: Number, default: 3500 },
  waterPrice:    { type: Number, default: 15000 },
  garbagePrice:  { type: Number, default: 20000 },
  internetPrice: { type: Number, default: 100000 },
  parkingPrice:  { type: Number, default: 100000 },
  bankInfo: {
    bankId:      { type: String, default: 'VCB' },
    accountNo:   { type: String, default: '' },
    accountName: { type: String, default: 'CHU TRO' },
  },
  effectiveDate: { type: Date, default: Date.now },
  note: { type: String, default: '' },
}, { timestamps: true });

const invoiceSchema = new mongoose.Schema({
  roomId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  period:  { type: String, required: true },
  electric: {
    oldIndex: Number, newIndex: Number,
    usage: Number, price: Number, total: Number,
  },
  water: {
    oldIndex: Number, newIndex: Number,
    usage: Number, price: Number, total: Number,
  },
  roomFee:    { type: Number, default: 0 },
  services:   [{ name: String, amount: Number, note: String }],
  totalAmount:{ type: Number, default: 0 },
  evidenceImages: [String],
  status:     { type: String, enum: ['Pending', 'Paid', 'Overdue'], default: 'Pending' },
  note:       { type: String, default: '' },
  paidAt:     { type: Date, default: null },
  configSnapshot: { electricPrice: Number, waterPrice: Number },
}, { timestamps: true });

invoiceSchema.index({ roomId: 1, period: 1 }, { unique: true });

const ConfigService = mongoose.model('ConfigService', configServiceSchema);
const Invoice       = mongoose.model('Invoice', invoiceSchema);

// ─── Seed ─────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱 Bắt đầu seed dữ liệu Hóa Đơn...');
  console.log('📡 Kết nối:', MONGO_URI.replace(/:([^:@]{1,})@/, ':****@'));

  await mongoose.connect(MONGO_URI);
  console.log('✅ Đã kết nối MongoDB\n');

  // 1. Seed ConfigService
  const existingConfig = await ConfigService.findOne();
  if (existingConfig) {
    console.log('ℹ️  ConfigService đã tồn tại — bỏ qua.');
  } else {
    const config = await ConfigService.create({
      electricPrice: 3500,
      waterPrice:    15000,
      garbagePrice:  20000,
      internetPrice: 100000,
      parkingPrice:  100000,
      bankInfo: {
        bankId:      'VCB',
        accountNo:   '03616249999',
        accountName: 'CHU TRO DUC LUONG',
      },
      note: 'Cấu hình giá mặc định — khởi tạo bởi seed script',
      effectiveDate: new Date('2026-01-01'),
    });
    console.log('✅ Đã tạo ConfigService:', config._id);
  }

  // 2. Lấy danh sách phòng để tạo Invoice mẫu
  const Room = mongoose.model('Room', new mongoose.Schema({
    name: String, price: Number, status: String,
  }));

  const rooms = await Room.find({}).limit(3);

  if (rooms.length === 0) {
    console.log('⚠️  Không có phòng nào trong DB — bỏ qua tạo Invoice mẫu.');
    console.log('   (Hãy seed phòng trước hoặc tạo phòng qua Admin UI)\n');
  } else {
    const period = '2026-04'; // Tháng 4/2026
    let created = 0;

    for (const room of rooms) {
      const exists = await Invoice.findOne({ roomId: room._id, period });
      if (exists) {
        console.log(`ℹ️  Invoice đã tồn tại: ${room.name} / ${period}`);
        continue;
      }

      const electricUsage = Math.floor(Math.random() * 80) + 40; // 40-120 kWh
      const waterUsage    = Math.floor(Math.random() * 6)  + 3;  // 3-9 m³
      const elecOld       = Math.floor(Math.random() * 500) + 100;
      const waterOld      = Math.floor(Math.random() * 50)  + 10;
      const elecTotal     = electricUsage * 3500;
      const waterTotal    = waterUsage    * 15000;
      const svTotal       = 20000 + 100000; // rác + internet
      const roomFee       = room.price || 2500000;

      await Invoice.create({
        roomId:  room._id,
        period,
        electric: {
          oldIndex: elecOld,
          newIndex: elecOld + electricUsage,
          usage: electricUsage,
          price: 3500,
          total: elecTotal,
        },
        water: {
          oldIndex: waterOld,
          newIndex: waterOld + waterUsage,
          usage: waterUsage,
          price: 15000,
          total: waterTotal,
        },
        roomFee,
        services: [
          { name: 'Phí rác',     amount: 20000  },
          { name: 'Phí internet', amount: 100000 },
        ],
        totalAmount: roomFee + elecTotal + waterTotal + svTotal,
        status: ['Pending', 'Paid', 'Overdue'][Math.floor(Math.random() * 3)],
        configSnapshot: { electricPrice: 3500, waterPrice: 15000 },
      });

      console.log(`✅ Invoice: ${room.name} | ${period} | ${(roomFee + elecTotal + waterTotal + svTotal).toLocaleString('vi-VN')} ₫`);
      created++;
    }

    if (created > 0) {
      console.log(`\n🎉 Đã tạo ${created} Invoice mẫu cho kỳ ${period}`);
    }
  }

  console.log('\n📊 Kết quả collections trên MongoDB:');
  const collections = await mongoose.connection.db.listCollections().toArray();
  collections.forEach(c => console.log(`   📁 ${c.name}`));

  await mongoose.disconnect();
  console.log('\n✅ Seed hoàn tất! Kiểm tra MongoDB Atlas để xem collections mới.\n');
}

seed().catch(err => {
  console.error('❌ Seed thất bại:', err.message);
  process.exit(1);
});
