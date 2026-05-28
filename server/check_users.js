const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Tenant = require('./models/Tenant');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const users = await User.find({ role: 'TENANT' });
    console.log('Users:', users.map(u => ({ email: u.email, name: u.name })));
    
    const tenants = await Tenant.find({});
    console.log('Tenants:', tenants.map(t => ({ id: t._id, email: t.email, name: t.name })));
    
    const ChatRoom = require('./models/ChatRoom');
    const rooms = await ChatRoom.find({});
    console.log('ChatRooms:', rooms.map(r => ({ id: r._id, tenantId: r.tenantId })));
    
    const ChatParticipant = require('./models/ChatParticipant');
    const parts = await ChatParticipant.find({});
    console.log('Participants:', parts.map(p => ({ userId: p.userId, roomId: p.roomId })));
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
};
run();
