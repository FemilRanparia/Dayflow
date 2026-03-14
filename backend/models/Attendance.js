const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
    {
        // Multi-Tenant: Organization Reference
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
            index: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        checkIn: {
            type: Date,
        },
        checkOut: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Half-day', 'Leave'],
            default: 'Absent',
        },
        workHours: {
            type: Number,
            default: 0,
        },
        remarks: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Calculate work hours
attendanceSchema.pre('save', function () {
    if (this.checkIn && this.checkOut) {
        const hours = (this.checkOut - this.checkIn) / (1000 * 60 * 60);
        this.workHours = Math.round(hours * 100) / 100;

        // Determine status based on work hours
        if (hours >= 8) {
            this.status = 'Present';
        } else if (hours >= 4) {
            this.status = 'Half-day';
        }
    }
});

// Compound index for organization, user and date
// One attendance record per user per date per organization
attendanceSchema.index({ organization: 1, user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
