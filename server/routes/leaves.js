const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');

// GET all leave requests
router.get('/', async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('employeeId')
      .populate('approvedBy');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET leave by ID
router.get('/:id', async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employeeId')
      .populate('approvedBy');
    
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    res.json(leave);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET leaves by employee ID
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.params.employeeId })
      .sort({ startDate: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create leave request
router.post('/', async (req, res) => {
  try {
    const leave = new Leave(req.body);
    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update leave request
router.put('/:id', async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('employeeId').populate('approvedBy');
    
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    res.json(leave);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE leave request
router.delete('/:id', async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    res.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
