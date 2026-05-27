const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('./models/Room');
const Invoice = require('./models/Invoice');
const ConfigService = require('./models/ConfigService');

dotenv.config();

const updateDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // 1. Update ConfigService
    await ConfigService.updateMany({}, {
      electricPrice: 100, // 100 VND / kWh
      waterPrice: 500,    // 500 VND / m3
      bankInfo: {
        bankId: 'MB', // Guessing MB Bank for 036... phone numbers
        accountNo: '03616249999',
        accountName: 'CHU TRO DUC LUONG'
      }
    });
    console.log('Updated ConfigService (Set to MB Bank and lowered prices)');

    // 2. Update Rooms
    await Room.updateMany({}, { price: 10000 });
    console.log('Updated all Rooms to 10.000 VND');

    // 3. Update Invoices
    const invoices = await Invoice.find({});
    for (let inv of invoices) {
      inv.roomFee = 10000;
      
      if (inv.electric) {
        inv.electric.price = 100;
        inv.electric.total = (inv.electric.usage || 0) * 100;
      }
      
      if (inv.water) {
        inv.water.price = 500;
        inv.water.total = (inv.water.usage || 0) * 500;
      }
      
      inv.services = [{ name: 'Phí dịch vụ chung', amount: 5000 }];
      
      inv.totalAmount = inv.roomFee + (inv.electric?.total || 0) + (inv.water?.total || 0) + 5000;
      
      await inv.save();
    }
    console.log('Updated all Invoices to have total < 100,000 VND');

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

updateDB();
