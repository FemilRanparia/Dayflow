const express = require('express');
const router = express.Router();
const Payroll = require('../models/Payroll');

// GET all payroll records
router.get('/', async (req, res) => {
  try {
    const payroll = await Payroll.find()
      .populate('employeeId')
      .populate('generatedBy');
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET payroll by employee ID
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const payroll = await Payroll.find({ employeeId: req.params.employeeId })
      .populate('employeeId')
      .populate('generatedBy')
      .sort({ year: -1, month: -1 });
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET payroll by ID
router.get('/:id', async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employeeId')
      .populate('generatedBy');
    
    if (!payroll) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create payroll record
router.post('/', async (req, res) => {
  try {
    const { employeeId, basicSalary, allowances, deductions, month, year, generatedBy } = req.body;

    // Validate required fields
    if (!employeeId || !basicSalary || !month || !year) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate net salary
    const netSalary = basicSalary + (allowances || 0) - (deductions || 0);

    const payroll = new Payroll({
      employeeId,
      basicSalary,
      allowances: allowances || 0,
      deductions: deductions || 0,
      netSalary,
      month,
      year,
      generatedBy,
    });

    await payroll.save();
    res.status(201).json(payroll);
  } catch (error) {
    console.error('Payroll POST error:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Payroll already exists for this employee in this month' });
    }
    res.status(400).json({ error: error.message });
  }
});

// PUT update payroll
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Recalculate net salary if any amount changes
    if (updateData.basicSalary || updateData.allowances || updateData.deductions) {
      const basic = updateData.basicSalary || req.body.basicSalary;
      const allow = updateData.allowances || req.body.allowances || 0;
      const deduct = updateData.deductions || req.body.deductions || 0;
      updateData.netSalary = basic + allow - deduct;
    }

    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('employeeId').populate('generatedBy');
    
    if (!payroll) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }
    res.json(payroll);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE payroll
router.delete('/:id', async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!payroll) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }
    res.json({ message: 'Payroll record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
