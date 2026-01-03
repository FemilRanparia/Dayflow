const express = require('express');
const router = express.Router();
const EmployeeProfile = require('../models/EmployeeProfile');

// GET all employees
router.get('/', async (req, res) => {
  try {
    const employees = await EmployeeProfile.find().populate('userId');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET employee by User ID (for profile loading)
router.get('/:id', async (req, res) => {
  try {
    // First try to find by EmployeeProfile _id
    let employee = await EmployeeProfile.findById(req.params.id).populate('userId');
    
    // If not found, try to find by userId (User _id)
    if (!employee) {
      employee = await EmployeeProfile.findOne({ userId: req.params.id }).populate('userId');
    }
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create employee
router.post('/', async (req, res) => {
  try {
    const employee = new EmployeeProfile(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update employee
router.put('/:id', async (req, res) => {
  try {
    const employee = await EmployeeProfile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId');
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE employee
router.delete('/:id', async (req, res) => {
  try {
    const employee = await EmployeeProfile.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
