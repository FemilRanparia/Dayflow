const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Check in
// @route   POST /api/attendance/check-in
// @access  Private
exports.checkIn = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already checked in today
        const existingAttendance = await Attendance.findOne({
            user: req.user.id,
            date: today,
        });

        if (existingAttendance && existingAttendance.checkIn) {
            return res.status(400).json({
                success: false,
                message: 'Already checked in today',
            });
        }

        let attendance;
        if (existingAttendance) {
            existingAttendance.checkIn = new Date();
            attendance = await existingAttendance.save();
        } else {
            attendance = await Attendance.create({
                organization: req.user.organization._id, // Multi-tenant
                user: req.user.id,
                date: today,
                checkIn: new Date(),
                status: 'Present',
            });
        }

        res.status(200).json({
            success: true,
            data: attendance,
        });
    } catch (error) {
        console.error('❌ Check-in error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Check out
// @route   POST /api/attendance/check-out
// @access  Private
exports.checkOut = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            user: req.user.id,
            date: today,
        });

        if (!attendance || !attendance.checkIn) {
            return res.status(400).json({
                success: false,
                message: 'Please check in first',
            });
        }

        if (attendance.checkOut) {
            return res.status(400).json({
                success: false,
                message: 'Already checked out today',
            });
        }

        attendance.checkOut = new Date();
        await attendance.save();

        res.status(200).json({
            success: true,
            data: attendance,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get my attendance
// @route   GET /api/attendance/my-attendance
// @access  Private
exports.getMyAttendance = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const query = { user: req.user.id };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const attendance = await Attendance.find(query).sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: attendance.length,
            data: attendance,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get today's attendance status
// @route   GET /api/attendance/today
// @access  Private
exports.getTodayAttendance = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            user: req.user.id,
            date: today,
        });

        res.status(200).json({
            success: true,
            data: attendance,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all attendance (Admin/HR only)
// @route   GET /api/attendance/all
// @access  Private (Admin/HR)
exports.getAllAttendance = async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;

        // Build attendance query
        const attendanceQuery = {};

        // Multi-tenant: Filter by organization (except SuperAdmin)
        if (req.user.role !== 'SuperAdmin') {
            attendanceQuery.organization = req.user.organization._id;
        }

        if (userId) {
            attendanceQuery.user = userId;
        }

        if (startDate && endDate) {
            attendanceQuery.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        // Fetch attendance records
        const attendance = await Attendance.find(attendanceQuery)
            .populate('user', 'employeeId firstName lastName department')
            .sort({ date: -1 });

        // If date range is specified, also fetch all employees and show absent ones
        if (startDate && endDate) {
            // Build employee query
            const employeeQuery = {
                role: { $ne: 'SuperAdmin' }
            };

            if (req.user.role !== 'SuperAdmin') {
                employeeQuery.organization = req.user.organization._id;
            }

            if (userId) {
                employeeQuery._id = userId;
            }

            // Fetch all employees
            const allEmployees = await User.find(employeeQuery).select('employeeId firstName lastName department');

            // Create a map of attendance records by user and date
            const attendanceMap = new Map();
            attendance.forEach(record => {
                if (record.user) {
                    const key = `${record.user._id}_${record.date.toISOString().split('T')[0]}`;
                    attendanceMap.set(key, record);
                }
            });

            // Generate all dates in range
            const start = new Date(startDate);
            const end = new Date(endDate);
            const dates = [];
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                dates.push(new Date(d));
            }

            // Build complete attendance data including absent employees
            const completeAttendance = [];

            dates.forEach(date => {
                allEmployees.forEach(employee => {
                    const dateStr = date.toISOString().split('T')[0];
                    const key = `${employee._id}_${dateStr}`;

                    if (attendanceMap.has(key)) {
                        // Employee has attendance record
                        completeAttendance.push(attendanceMap.get(key));
                    } else {
                        // Employee is absent - create virtual record
                        completeAttendance.push({
                            _id: null,
                            organization: req.user.organization?._id,
                            user: {
                                _id: employee._id,
                                employeeId: employee.employeeId,
                                firstName: employee.firstName,
                                lastName: employee.lastName,
                                department: employee.department
                            },
                            date: date,
                            checkIn: null,
                            checkOut: null,
                            status: 'Absent',
                            workHours: 0,
                            remarks: null
                        });
                    }
                });
            });

            // Sort by date descending, then by employee name
            completeAttendance.sort((a, b) => {
                const dateCompare = new Date(b.date) - new Date(a.date);
                if (dateCompare !== 0) return dateCompare;

                const aName = a.user ? `${a.user.firstName} ${a.user.lastName}` : '';
                const bName = b.user ? `${b.user.firstName} ${b.user.lastName}` : '';
                return aName.localeCompare(bName);
            });

            res.status(200).json({
                success: true,
                count: completeAttendance.length,
                data: completeAttendance,
            });
        } else {
            // No date range - return only existing attendance records
            res.status(200).json({
                success: true,
                count: attendance.length,
                data: attendance,
            });
        }
    } catch (error) {
        console.error('❌ Get all attendance error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update attendance (Admin/HR only)
// @route   PUT /api/attendance/:id
// @access  Private (Admin/HR)
exports.updateAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found',
            });
        }

        res.status(200).json({
            success: true,
            data: attendance,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private
exports.getAttendanceStats = async (req, res) => {
    try {
        const userId = req.user.role === 'Employee' ? req.user.id : req.query.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required',
            });
        }

        const stats = await Attendance.aggregate([
            {
                $match: { user: mongoose.Types.ObjectId(userId) },
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const totalWorkHours = await Attendance.aggregate([
            {
                $match: { user: mongoose.Types.ObjectId(userId) },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$workHours' },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: {
                statusBreakdown: stats,
                totalWorkHours: totalWorkHours[0]?.total || 0,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
