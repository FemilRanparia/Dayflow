import express from 'express';
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} from '../controllers/leaveController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.post('/apply', protect, applyLeave);
router.get('/my-leaves', protect, getMyLeaves);
router.get('/all', protect, authorize('admin', 'hr'), getAllLeaves);
router.put('/:id', protect, authorize('admin', 'hr'), updateLeaveStatus);

export default router;
