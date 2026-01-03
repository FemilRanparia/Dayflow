import { Response } from 'express';
import Employee from '../models/Employee';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;

    // Check if user is accessing their own profile or is admin/hr
    if (
      req.user?.employeeId !== employeeId &&
      req.user?.role !== 'admin' &&
      req.user?.role !== 'hr'
    ) {
      res.status(403).json({ message: 'Not authorized to view this profile' });
      return;
    }

    const employee = await Employee.findOne({ employeeId }).populate('userId', '-password');

    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    res.json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const updates = req.body;

    // Check permissions
    const isOwnProfile = req.user?.employeeId === employeeId;
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'hr';

    if (!isOwnProfile && !isAdmin) {
      res.status(403).json({ message: 'Not authorized to update this profile' });
      return;
    }

    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    // If employee, only allow updating specific fields
    if (isOwnProfile && !isAdmin) {
      const allowedUpdates = ['phone', 'address', 'profilePicture'];
      Object.keys(updates.personalDetails || {}).forEach((key) => {
        if (!allowedUpdates.includes(key)) {
          delete updates.personalDetails[key];
        }
      });
      // Employees can't update job details
      delete updates.jobDetails;
    }

    // Update employee
    if (updates.personalDetails) {
      employee.personalDetails = { ...employee.personalDetails, ...updates.personalDetails };
    }
    if (updates.jobDetails && isAdmin) {
      employee.jobDetails = { ...employee.jobDetails, ...updates.jobDetails };
    }

    await employee.save();

    res.json({
      message: 'Profile updated successfully',
      employee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employees = await Employee.find().populate('userId', '-password');
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
