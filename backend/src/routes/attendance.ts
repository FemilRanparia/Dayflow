import express from 'express';
import {
  checkIn,
  checkOut,
  getAttendance,
  getAllAttendance,
  updateAttendance,
} from '../controllers/attendanceController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/all', protect, authorize('admin', 'hr'), getAllAttendance);
router.get('/:employeeId', protect, getAttendance);
router.put('/:id', protect, authorize('admin', 'hr'), updateAttendance);

export default router;
