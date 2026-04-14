const express = require('express');
const router = express.Router();
const Log = require('../models/Log');

// Get all logs
router.get('/', async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 });
    const transformed = logs.map(l => {
      const obj = l.toJSON();
      obj.id = obj._id.toString();
      return obj;
    });
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
