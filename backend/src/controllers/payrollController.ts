import { Response } from 'express';
import Payroll from '../models/Payroll';
import { AuthRequest } from '../middleware/auth';

export const getMyPayroll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payroll = await Payroll.findOne({ employeeId: req.user?.employeeId }).sort({
      effectiveFrom: -1,
    });

    if (!payroll) {
      res.status(404).json({ message: 'Payroll information not found' });
      return;
    }

    res.json(payroll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getEmployeePayroll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;

    const payroll = await Payroll.findOne({ employeeId })
      .populate('userId', 'employeeId email')
      .sort({ effectiveFrom: -1 });

    if (!payroll) {
      res.status(404).json({ message: 'Payroll information not found' });
      return;
    }

    res.json(payroll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllPayrolls = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payrolls = await Payroll.find()
      .populate('userId', 'employeeId email')
      .sort({ effectiveFrom: -1 });

    res.json(payrolls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createOrUpdatePayroll = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { employeeId, basicSalary, allowances, deductions, effectiveFrom } = req.body;

    // Check if payroll exists for this employee
    let payroll = await Payroll.findOne({ employeeId });

    if (payroll) {
      // Update existing payroll
      payroll.basicSalary = basicSalary;
      payroll.allowances = allowances || payroll.allowances;
      payroll.deductions = deductions || payroll.deductions;
      payroll.effectiveFrom = effectiveFrom || payroll.effectiveFrom;
      await payroll.save();

      res.json({
        message: 'Payroll updated successfully',
        payroll,
      });
    } else {
      // Create new payroll
      const newPayroll = await Payroll.create({
        employeeId,
        userId: req.body.userId,
        basicSalary,
        allowances: allowances || {},
        deductions: deductions || {},
        effectiveFrom: effectiveFrom || new Date(),
      });

      res.status(201).json({
        message: 'Payroll created successfully',
        payroll: newPayroll,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
