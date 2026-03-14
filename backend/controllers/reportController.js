const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const User = require('../models/User');

// @desc    Export attendance report
// @route   GET /api/reports/attendance
// @access  Private (Admin/HR)
exports.exportAttendanceReport = async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;

        const query = {
            organization: req.user.organization
        };

        if (userId) {
            query.user = userId;
        }

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const attendance = await Attendance.find(query)
            .populate('user', 'employeeId firstName lastName department designation')
            .sort({ date: -1 });

        // Generate CSV
        let csv = 'Employee ID,Name,Department,Designation,Date,Check In,Check Out,Work Hours,Status,Remarks\n';

        attendance.forEach((record) => {
            // Check if user exists (in case user was deleted)
            if (!record.user) return;

            const checkIn = record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-';
            const checkOut = record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-';

            csv += `${record.user.employeeId},`;
            csv += `"${record.user.firstName} ${record.user.lastName}",`;
            csv += `${record.user.department || '-'},`;
            csv += `${record.user.designation || '-'},`;
            csv += `${new Date(record.date).toLocaleDateString()},`;
            csv += `${checkIn},`;
            csv += `${checkOut},`;
            csv += `${record.workHours || 0},`;
            csv += `${record.status},`;
            csv += `"${record.remarks || '-'}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=attendance-report-${Date.now()}.csv`);
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Export leave report
// @route   GET /api/reports/leaves
// @access  Private (Admin/HR)
exports.exportLeaveReport = async (req, res) => {
    try {
        const { status, userId } = req.query;

        const query = {
            organization: req.user.organization
        };

        if (status) {
            query.status = status;
        }

        if (userId) {
            query.user = userId;
        }

        const leaves = await Leave.find(query)
            .populate('user', 'employeeId firstName lastName department')
            .populate('approvedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        // Generate CSV
        let csv = 'Employee ID,Name,Department,Leave Type,Start Date,End Date,Days,Reason,Status,Approved By,HR Comments\n';

        leaves.forEach((leave) => {
            // Check if user exists
            if (!leave.user) return;

            const approvedBy = leave.approvedBy
                ? `${leave.approvedBy.firstName} ${leave.approvedBy.lastName}`
                : '-';

            csv += `${leave.user.employeeId},`;
            csv += `"${leave.user.firstName} ${leave.user.lastName}",`;
            csv += `${leave.user.department || '-'},`;
            csv += `${leave.leaveType},`;
            csv += `${new Date(leave.startDate).toLocaleDateString()},`;
            csv += `${new Date(leave.endDate).toLocaleDateString()},`;
            csv += `${leave.numberOfDays},`;
            csv += `"${leave.reason}",`;
            csv += `${leave.status},`;
            csv += `"${approvedBy}",`;
            csv += `"${leave.hrComments || '-'}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=leave-report-${Date.now()}.csv`);
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Export payroll report
// @route   GET /api/reports/payroll
// @access  Private (Admin/HR)
exports.exportPayrollReport = async (req, res) => {
    try {
        const { department } = req.query;

        const query = {
            organization: req.user.organization,
            role: { $ne: 'SuperAdmin' } // Don't export SuperAdmin salary
        };

        if (department) {
            query.department = department;
        }

        const employees = await User.find(query).select(
            'employeeId firstName lastName department designation salary'
        );

        // Generate CSV
        let csv = 'Employee ID,Name,Department,Designation,Basic Salary,Allowances,Deductions,Net Salary\n';

        employees.forEach((emp) => {
            csv += `${emp.employeeId},`;
            csv += `"${emp.firstName} ${emp.lastName}",`;
            csv += `${emp.department || '-'},`;
            csv += `${emp.designation || '-'},`;
            csv += `${emp.salary?.basicSalary || 0},`;
            csv += `${emp.salary?.allowances || 0},`;
            csv += `${emp.salary?.deductions || 0},`;
            csv += `${emp.salary?.netSalary || 0}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=payroll-report-${Date.now()}.csv`);
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/reports/dashboard-stats
// @access  Private (Admin/HR)
exports.getDashboardStats = async (req, res) => {
    try {
        // Filter by organization and exclude SuperAdmin
        const query = {
            organization: req.user.organization,
            role: { $ne: 'SuperAdmin' }
        };

        const totalEmployees = await User.countDocuments(query);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayAttendance = await Attendance.countDocuments({
            organization: req.user.organization,
            date: today,
            status: 'Present',
        });

        const pendingLeaves = await Leave.countDocuments({
            organization: req.user.organization,
            status: 'Pending'
        });

        const departments = await User.aggregate([
            {
                $match: query
            },
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalEmployees,
                presentToday: todayAttendance,
                pendingLeaves,
                departments,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
