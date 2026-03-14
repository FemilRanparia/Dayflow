const Leave = require('../models/Leave');
const User = require('../models/User');
const { sendLeaveNotification } = require('../utils/emailService');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
exports.applyLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;

        // Check leave balance
        const user = await User.findById(req.user.id);
        const leave = await Leave.create({
            organization: req.user.organization._id, // Multi-tenant
            user: req.user.id,
            leaveType,
            startDate,
            endDate,
            reason,
        });

        // Calculate days and check balance
        const leaveTypeKey = leaveType.toLowerCase() + 'Leave';
        if (user.leaveBalance[leaveTypeKey] < leave.numberOfDays && leaveType !== 'Unpaid') {
            await Leave.findByIdAndDelete(leave._id);
            return res.status(400).json({
                success: false,
                message: `Insufficient ${leaveType} leave balance. Available: ${user.leaveBalance[leaveTypeKey]} days`,
            });
        }

        res.status(201).json({
            success: true,
            data: leave,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get my leaves
// @route   GET /api/leaves/my-leaves
// @access  Private
exports.getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ user: req.user.id })
            .populate('approvedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: leaves.length,
            data: leaves,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all leaves (Admin/HR only)
// @route   GET /api/leaves
// @access  Private (Admin/HR)
exports.getAllLeaves = async (req, res) => {
    try {
        const { status, userId } = req.query;

        const query = {};

        // Multi-tenant: Filter by organization (except SuperAdmin)
        if (req.user.role !== 'SuperAdmin') {
            query.organization = req.user.organization._id;
        }

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

        res.status(200).json({
            success: true,
            count: leaves.length,
            data: leaves,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get leave by ID
// @route   GET /api/leaves/:id
// @access  Private
exports.getLeaveById = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id)
            .populate('user', 'employeeId firstName lastName email')
            .populate('approvedBy', 'firstName lastName');

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave not found',
            });
        }

        // Check if user is authorized to view this leave
        if (
            req.user.role === 'Employee' &&
            leave.user._id.toString() !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this leave',
            });
        }

        res.status(200).json({
            success: true,
            data: leave,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Approve/Reject leave (Admin/HR only)
// @route   PUT /api/leaves/:id/status
// @access  Private (Admin/HR)
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { status, hrComments } = req.body;

        const leave = await Leave.findById(req.params.id).populate(
            'user',
            'firstName lastName email leaveBalance'
        );

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave not found',
            });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'Leave has already been processed',
            });
        }

        leave.status = status;
        leave.approvedBy = req.user.id;
        leave.approvedAt = Date.now();
        leave.hrComments = hrComments;

        await leave.save();

        // Update leave balance if approved
        if (status === 'Approved') {
            const user = await User.findById(leave.user._id);
            const leaveTypeKey = leave.leaveType.toLowerCase() + 'Leave';

            if (leave.leaveType !== 'Unpaid') {
                user.leaveBalance[leaveTypeKey] -= leave.numberOfDays;
                await user.save();
            }
        }

        // Send email notification
        try {
            await sendLeaveNotification(
                leave.user.email,
                `${leave.user.firstName} ${leave.user.lastName}`,
                leave.leaveType,
                status,
                leave.startDate,
                leave.endDate,
                hrComments
            );
        } catch (error) {
            console.error('Email sending failed:', error);
        }

        res.status(200).json({
            success: true,
            data: leave,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Cancel leave
// @route   DELETE /api/leaves/:id
// @access  Private
exports.cancelLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave not found',
            });
        }

        // Check if user owns this leave
        if (leave.user.toString() !== req.user.id && req.user.role === 'Employee') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this leave',
            });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'Can only cancel pending leave requests',
            });
        }

        await leave.remove();

        res.status(200).json({
            success: true,
            message: 'Leave cancelled successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get leave statistics
// @route   GET /api/leaves/stats
// @access  Private
exports.getLeaveStats = async (req, res) => {
    try {
        const userId = req.user.role === 'Employee' ? req.user.id : req.query.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required',
            });
        }

        const user = await User.findById(userId);

        const leaveHistory = await Leave.find({ user: userId });

        const stats = {
            leaveBalance: user.leaveBalance,
            totalLeavesTaken: leaveHistory.filter((l) => l.status === 'Approved').length,
            pendingRequests: leaveHistory.filter((l) => l.status === 'Pending').length,
            rejectedRequests: leaveHistory.filter((l) => l.status === 'Rejected').length,
        };

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
