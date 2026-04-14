const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Log = require('../models/Log');

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    // Transform _id to id to match frontend expectation from JSON server
    const transformed = rooms.map(r => {
      const obj = r.toJSON();
      obj.id = obj._id.toString();
      return obj;
    });
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single room
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    const obj = room.toJSON();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create room
router.post('/', async (req, res) => {
  try {
    const room = await Room.create(req.body);
    
    // Create log mock 
    await Log.create({
      user: 'Admin Master',
      role: 'ADMIN',
      action: 'CREATE',
      module: 'Room Management',
      details: `Added new room "${room.name}"`
    });

    const obj = room.toJSON();
    obj.id = obj._id.toString();
    res.status(201).json(obj);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update room
router.put('/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    // Create log mock
    await Log.create({
      user: 'Admin Master',
      role: 'ADMIN',
      action: 'UPDATE',
      module: 'Room Management',
      details: `Updated room ID: ${room._id}`
    });

    const obj = room.toJSON();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete room
router.delete('/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    
    // Create log mock
    await Log.create({
      user: 'Admin Master',
      role: 'ADMIN',
      action: 'DELETE',
      module: 'Room Management',
      details: `Deleted room ID: ${req.params.id}`
    });

    res.json({ message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
