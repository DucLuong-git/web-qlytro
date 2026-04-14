const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');
const Room = require('../models/Room');
const Log = require('../models/Log');

// Get all tenants
router.get('/', async (req, res) => {
  try {
    const tenants = await Tenant.find().sort({ createdAt: -1 });
    const transformed = tenants.map(t => {
      const obj = t.toJSON();
      obj.id = obj._id.toString();
      // Handle legacy roomId 
      obj.roomId = obj.roomIdRef || (obj.roomId ? obj.roomId.toString() : '');
      return obj;
    });
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create tenant
router.post('/', async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.roomId && typeof payload.roomId === 'string') {
      try {
        const mongoose = require('mongoose');
        if (mongoose.Types.ObjectId.isValid(payload.roomId)) {
           // isValid handles old db.json numeric ids wrongly in some cases, so if it's purely a 1-2 digit string, save it in ref
           if (payload.roomId.length < 12) {
              payload.roomIdRef = payload.roomId;
              delete payload.roomId;
           }
        } else {
           payload.roomIdRef = payload.roomId;
           delete payload.roomId;
        }
      } catch (e) {
         // ignore
      }
    }

    const tenant = await Tenant.create(payload);
    
    // Auto update room status if assigned
    if (req.body.roomId) {
      // Find room by real ObjectId or let frontend rely on it
      try {
         await Room.findByIdAndUpdate(req.body.roomId, { status: 'Occupied' });
      } catch(e) {}
    }

    await Log.create({
      user: 'Admin Master',
      role: 'ADMIN',
      action: 'CREATE',
      module: 'Tenant Management',
      details: `Added new tenant "${tenant.name}"`
    });

    const obj = tenant.toJSON();
    obj.id = obj._id.toString();
    res.status(201).json(obj);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update tenant
router.put('/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    await Log.create({
      user: 'Admin Master',
      role: 'ADMIN',
      action: 'UPDATE',
      module: 'Tenant Management',
      details: `Updated tenant ID: ${tenant._id}`
    });

    const obj = tenant.toJSON();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete tenant
router.delete('/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndDelete(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    
    await Log.create({
      user: 'Admin Master',
      role: 'ADMIN',
      action: 'DELETE',
      module: 'Tenant Management',
      details: `Deleted tenant ID: ${req.params.id}`
    });

    res.json({ message: 'Tenant deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
