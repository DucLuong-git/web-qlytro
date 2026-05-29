const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Tenant = require('./models/Tenant');
const ChatRoom = require('./models/ChatRoom');
const ChatParticipant = require('./models/ChatParticipant');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const user = await User.findOne({ email: 'nga@test.com' });
    console.log('User:', user.name, user.role);

    if (user.role === 'TENANT') {
      const tenantRecord = await Tenant.findOne({ email: user.email });
      console.log('TenantRecord:', tenantRecord ? tenantRecord.name : 'Not found');
      
      if (tenantRecord) {
         let newRoom = await ChatRoom.findOne({ tenantId: tenantRecord._id });
         if (!newRoom) {
           console.log('Creating room...');
           newRoom = await ChatRoom.create({ 
             tenantId: tenantRecord._id, 
             name: `Phòng hỗ trợ - ${user.name}` 
           });
           console.log('Room created:', newRoom._id);
         } else {
           console.log('Room already exists:', newRoom._id);
         }
         
         const admins = await User.find({ role: { $in: ['ADMIN', 'OWNER'] } });
         console.log('Admins found:', admins.map(a => a.email + ' ' + a.role));
         
         const participantsToInsert = [
           { roomId: newRoom._id, userId: user._id, role: 'TENANT' },
           ...admins.map(admin => ({ roomId: newRoom._id, userId: admin._id, role: admin.role }))
         ];
         
         console.log('Deleting old participants...');
         await ChatParticipant.deleteMany({ roomId: newRoom._id });
         
         console.log('Inserting participants...');
         await ChatParticipant.insertMany(participantsToInsert);
         
         console.log('Success!');
      }
    }
    
    process.exit(0);
  } catch(e) {
    console.error('ERROR OCCURRED:', e);
    process.exit(1);
  }
};
run();
