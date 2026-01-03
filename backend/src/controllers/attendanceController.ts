import { Response } from 'express';
import Attendance from '../models/Attendance';
import { AuthRequest } from '../middleware/auth';

export const checkIn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employeeId: req.user?.employeeId,
      date: today,
    });

    if (existingAttendance) {
      res.status(400).json({ message: 'Already checked in today' });
      return;
    }

    const attendance = await Attendance.create({
      employeeId: req.user?.employeeId,
      userId: req.user?.id,
      date: today,
      checkIn: new Date(),
      status: 'present',
    });

    res.status(201).json({
      message: 'Checked in successfully',
      attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const checkOut = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId: req.user?.employeeId,
      date: today,
    });

    if (!attendance) {
      res.status(400).json({ message: 'No check-in found for today' });
      return;
    }

    if (attendance.checkOut) {
      res.status(400).json({ message: 'Already checked out today' });
      return;
    }

    attendance.checkOut = new Date();
    await attendance.save();

    res.json({
      message: 'Checked out successfully',
      attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    // Check permissions
    if (
      req.user?.employeeId !== employeeId &&
      req.user?.role !== 'admin' &&
      req.user?.role !== 'hr'
    ) {
      res.status(403).json({ message: 'Not authorized to view this attendance' });
      return;
    }

    const query: any = { employeeId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const query: any = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'employeeId email')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const attendance = await Attendance.findById(id);

    if (!attendance) {
      res.status(404).json({ message: 'Attendance record not found' });
      return;
    }

    if (status) attendance.status = status;
    if (remarks !== undefined) attendance.remarks = remarks;

    await attendance.save();

    res.json({
      message: 'Attendance updated successfully',
      attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
