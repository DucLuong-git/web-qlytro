const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const User = require('./models/User');
const Room = require('./models/Room');
const Tenant = require('./models/Tenant');
const Contract = require('./models/Contract');
const Log = require('./models/Log');

const dbData = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf-8'));

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB. Clearing old data...');

    // Clear db
    await User.deleteMany();
    await Room.deleteMany();
    await Tenant.deleteMany();
    await Contract.deleteMany();
    await Log.deleteMany();

    console.log('Old data cleared. Seeding users...');

    // Map to store old IDs to new MongoDB ObjectIds
    const roomMap = {};
    const tenantMap = {};

    // Seed Users
    for (const u of dbData.users) {
      const user = await User.create({
        name: u.name,
        email: u.email,
        password: u.password,
        phone: u.phone,
        role: u.role,
        avatar: u.avatar
      });
      console.log(`- Created user: ${user.email}`);
    }

    console.log('Seeding rooms...');
    // Seed Rooms
    for (const r of dbData.rooms) {
      if (r.name.includes('<script>')) continue; // skip malicious

      const room = await Room.create({
        name: r.name,
        price: r.price,
        status: r.status,
        type: r.type || 'Phòng trọ',
        district: r.district,
        address: r.address,
        area: r.area,
        bedrooms: r.bedrooms,
        bathrooms: r.bathrooms,
        description: r.description,
        amenities: r.amenities || [],
        images: r.images || [],
        image: r.image || ''
      });
      roomMap[r.id] = room._id;
      console.log(`- Created room: ${room.name}`);
    }

    console.log('Seeding tenants...');
    // Seed Tenants
    if (dbData.tenants) {
      for (const t of dbData.tenants) {
        const tenant = await Tenant.create({
          name: t.name,
          email: t.email || `${t.name.toLowerCase().replace(/ /g, '')}@example.com`,
          phone: t.phone,
          roomId: roomMap[t.roomId] || null, // map old roomId to new _id
          roomIdRef: t.roomId,
          startDate: t.startDate ? new Date(t.startDate) : new Date()
        });
        tenantMap[t.id] = tenant._id;
        console.log(`- Created tenant: ${tenant.name}`);
      }
    }

    console.log('Seeding contracts...');
    // Seed Contracts
    if (dbData.contracts) {
      for (const c of dbData.contracts) {
        if (!tenantMap[c.tenantId] || !roomMap[c.roomId]) continue;
        
        await Contract.create({
          tenantId: tenantMap[c.tenantId],
          roomId: roomMap[c.roomId],
          deposit: c.deposit || 0,
          durationMonths: c.durationMonths || 12,
          startDate: c.createdDate ? new Date(c.createdDate) : new Date(),
          status: c.status === 'Active' ? 'Active' : 'Expired'
        });
      }
    }

    console.log('Seeding logs...');
    // Seed Logs
    if (dbData.logs) {
      for (const l of dbData.logs) {
        await Log.create({
          user: l.user || 'System',
          role: l.role || 'SYSTEM',
          action: l.action || 'SYSTEM',
          module: l.module || 'System',
          details: l.details || 'Log entry',
          timestamp: l.timestamp ? new Date(l.timestamp) : new Date()
        });
      }
    }

    console.log('✅ Seeding completed successfully!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedData();
