const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// Helper function to normalize date to midnight UTC
const normalizeDate = (dateString) => {
  const date = new Date(dateString);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

// POST create attendance record (must be before GET/:id to avoid route conflicts)
router.post('/', async (req, res) => {
  try {
    const { employeeId, date, checkIn, status } = req.body;

    // Validate required fields
    if (!employeeId || !date) {
      return res.status(400).json({ error: 'Missing required fields: employeeId, date' });
    }

    const attendance = new Attendance({
      employeeId,
      date: normalizeDate(date),
      checkIn: checkIn ? new Date(checkIn) : undefined,
      status: status || 'present',
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    console.error('Attendance POST error:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Already checked in for this date' });
    }
    res.status(400).json({ error: error.message });
  }
});

// GET all attendance records
router.get('/', async (req, res) => {
  try {
    const attendance = await Attendance.find();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET attendance by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const attendance = await Attendance.find({ employeeId: req.params.userId }).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET attendance by ID
router.get('/:id', async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id).populate('employeeId');
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update attendance
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Convert checkOut string to Date if provided
    if (updateData.checkOut && typeof updateData.checkOut === 'string') {
      updateData.checkOut = new Date(updateData.checkOut);
    }

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('employeeId');
    
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.json(attendance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE attendance
router.delete('/:id', async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
