const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');

// Get all contracts
router.get('/', async (req, res) => {
  try {
    const contracts = await Contract.find().sort({ createdAt: -1 });
    const transformed = contracts.map(c => {
      const obj = c.toJSON();
      obj.id = obj._id.toString();
      return obj;
    });
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update contract
router.put('/:id', async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    const obj = contract.toJSON();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
