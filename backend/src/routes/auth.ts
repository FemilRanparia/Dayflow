import express from 'express';
import { body } from 'express-validator';
import { signup, signin, getMe } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post(
  '/signup',
  [
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
  ],
  signup
);

router.post(
  '/signin',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  signin
);

router.get('/me', protect, getMe);

export default router;
