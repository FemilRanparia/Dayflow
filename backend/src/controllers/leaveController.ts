import { Response } from 'express';
import Leave from '../models/Leave';
import { AuthRequest } from '../middleware/auth';

export const applyLeave = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const leave = await Leave.create({
      employeeId: req.user?.employeeId,
      userId: req.user?.id,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leave,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyLeaves = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const leaves = await Leave.find({ employeeId: req.user?.employeeId })
      .populate('approvedBy', 'employeeId email')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllLeaves = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, employeeId } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (employeeId) query.employeeId = employeeId;

    const leaves = await Leave.find(query)
      .populate('userId', 'employeeId email')
      .populate('approvedBy', 'employeeId email')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateLeaveStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, approverComments } = req.body;

    const leave = await Leave.findById(id);

    if (!leave) {
      res.status(404).json({ message: 'Leave request not found' });
      return;
    }

    leave.status = status;
    leave.approvedBy = req.user?.id as any;
    if (approverComments) leave.approverComments = approverComments;

    await leave.save();

    res.json({
      message: `Leave request ${status}`,
      leave,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
