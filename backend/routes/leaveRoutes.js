const express = require('express');
const {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    getLeaveById,
    updateLeaveStatus,
    cancelLeave,
    getLeaveStats,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Employee routes
router.post('/', protect, applyLeave);
router.get('/my-leaves', protect, getMyLeaves);
router.get('/stats', protect, getLeaveStats);
router.get('/:id', protect, getLeaveById);
router.delete('/:id', protect, cancelLeave);

// Admin/HR routes
router.get('/', protect, authorize('Admin', 'HR', 'SuperAdmin'), getAllLeaves);
router.put('/:id/status', protect, authorize('Admin', 'HR', 'SuperAdmin'), updateLeaveStatus);

module.exports = router;
