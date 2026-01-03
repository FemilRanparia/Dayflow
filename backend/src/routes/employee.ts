import express from 'express';
import {
  getProfile,
  updateProfile,
  getAllEmployees,
} from '../controllers/employeeController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/all', protect, authorize('admin', 'hr'), getAllEmployees);
router.get('/:employeeId', protect, getProfile);
router.put('/:employeeId', protect, updateProfile);

export default router;
