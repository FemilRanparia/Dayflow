const express = require('express');
const {
    checkIn,
    checkOut,
    getMyAttendance,
    getTodayAttendance,
    getAllAttendance,
    updateAttendance,
    getAttendanceStats,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Employee routes
router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/my-attendance', protect, getMyAttendance);
router.get('/today', protect, getTodayAttendance);
router.get('/stats', protect, getAttendanceStats);

// Admin/HR routes
router.get('/all', protect, authorize('Admin', 'HR', 'SuperAdmin'), getAllAttendance);
router.put('/:id', protect, authorize('Admin', 'HR', 'SuperAdmin'), updateAttendance);

module.exports = router;
