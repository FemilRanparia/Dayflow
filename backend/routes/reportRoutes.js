const express = require('express');
const {
    exportAttendanceReport,
    exportLeaveReport,
    exportPayrollReport,
    getDashboardStats,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are Admin/HR only
router.get('/attendance', protect, authorize('Admin', 'HR', 'SuperAdmin'), exportAttendanceReport);
router.get('/leaves', protect, authorize('Admin', 'HR', 'SuperAdmin'), exportLeaveReport);
router.get('/payroll', protect, authorize('Admin', 'HR', 'SuperAdmin'), exportPayrollReport);
router.get('/dashboard-stats', protect, authorize('Admin', 'HR', 'SuperAdmin'), getDashboardStats);

module.exports = router;
