const express = require('express');
const router = express.Router();
const User = require('../models/User');
const EmployeeProfile = require('../models/EmployeeProfile');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
  try {
    const { employeeId, email, password, fullName, role } = req.body;
    
    // Validate input
    if (!employeeId || !email || !password || !fullName) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Check if employeeId already exists
    const existingEmployeeId = await User.findOne({ employeeId });
    if (existingEmployeeId) {
      return res.status(400).json({ error: 'Employee ID already exists' });
    }
    
    const user = new User({
      employeeId,
      email,
      password,
      role: role || 'employee'
    });
    
    await user.save();
    
    // Create corresponding EmployeeProfile
    const profile = new EmployeeProfile({
      userId: user._id,
      fullName: fullName,
      // Other fields will be filled in by the employee later
    });
    
    await profile.save();
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        employeeId: user.employeeId,
        email: user.email,
        fullName: fullName,
        role: user.role
      },
      token
    });
  } catch (error) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Get employee profile for fullName
    const profile = await EmployeeProfile.findOne({ userId: user._id });
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        employeeId: user.employeeId,
        email: user.email,
        fullName: profile?.fullName || '',
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user (requires token)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user._id,
      employeeId: user.employeeId,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
