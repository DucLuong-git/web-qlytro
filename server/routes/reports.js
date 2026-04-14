const express = require('express');
const router = express.Router();
const Log = require('../models/Log');

// Store a report
router.post('/', async (req, res) => {
  try {
    const report = req.body;
    
    // Save report as a log
    await Log.create({
      user: report.email || 'Anonymous Guest',
      role: 'SYSTEM',
      action: 'REPORT',
      module: 'Report System',
      details: `Reported issue: ${report.reason || 'General Report'}`
    });
    
    res.status(201).json({ success: true, message: 'Báo cáo đã được ghi nhận' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
