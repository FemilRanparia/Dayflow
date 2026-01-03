import { Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import Employee from '../models/Employee';
import { generateToken } from '../utils/generateToken';
import { AuthRequest } from '../middleware/auth';

export const signup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { employeeId, email, password, role, firstName, lastName } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Create user
    const user = await User.create({
      employeeId,
      email,
      password,
      role: role || 'employee',
    });

    // Create employee profile
    await Employee.create({
      userId: user._id,
      employeeId: user.employeeId,
      personalDetails: {
        firstName,
        lastName,
      },
    });

    res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
      user: {
        id: user._id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const signin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const employee = await Employee.findOne({ userId: user._id });

    res.json({
      user: {
        id: user._id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      employee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
