/**
 * update-bank-config.cjs
 * Cập nhật thông tin ngân hàng trong ConfigService
 */
require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

const configServiceSchema = new mongoose.Schema({
  electricPrice: Number,
  waterPrice:    Number,
  garbagePrice:  Number,
  internetPrice: Number,
  parkingPrice:  Number,
  bankInfo: {
    bankId:      String,
    accountNo:   String,
    accountName: String,
  },
  effectiveDate: Date,
  note: String,
}, { timestamps: true });

const ConfigService = mongoose.model('ConfigService', configServiceSchema);

async function update() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Đã kết nối MongoDB');

  const result = await ConfigService.findOneAndUpdate(
    {},
    {
      $set: {
        'bankInfo.accountNo':   '03616249999',
        'bankInfo.accountName': 'CHU TRO DUC LUONG',
        'bankInfo.bankId':      'VCB',
      }
    },
    { sort: { effectiveDate: -1 }, new: true }
  );

  if (result) {
    console.log('\n✅ Đã cập nhật thông tin ngân hàng:');
    console.log('   Ngân hàng :', result.bankInfo.bankId);
    console.log('   Số TK     :', result.bankInfo.accountNo);
    console.log('   Chủ TK    :', result.bankInfo.accountName);
  } else {
    console.log('⚠️  Không tìm thấy ConfigService — tạo mới...');
    await ConfigService.create({
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
      effectiveDate: new Date(),
    });
    console.log('✅ Đã tạo ConfigService mới với số TK: 03616249999');
  }

  await mongoose.disconnect();
  console.log('\n🎉 Xong!\n');
}

update().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
