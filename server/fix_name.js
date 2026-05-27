const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ConfigService = require('./models/ConfigService');

dotenv.config();

const updateDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await ConfigService.updateMany({}, {
      'bankInfo.accountName': 'TRAN DUC LUONG'
    });
    console.log('Fixed account name to TRAN DUC LUONG');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

updateDB();
