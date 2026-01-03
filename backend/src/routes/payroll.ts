import express from 'express';
import {
  getMyPayroll,
  getEmployeePayroll,
  getAllPayrolls,
  createOrUpdatePayroll,
} from '../controllers/payrollController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/my-payroll', protect, getMyPayroll);
router.get('/all', protect, authorize('admin', 'hr'), getAllPayrolls);
router.get('/:employeeId', protect, authorize('admin', 'hr'), getEmployeePayroll);
router.post('/', protect, authorize('admin', 'hr'), createOrUpdatePayroll);

export default router;
