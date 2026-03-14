const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
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
        leaveType: {
            type: String,
            enum: ['Paid', 'Sick', 'Unpaid'],
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        numberOfDays: {
            type: Number,
            default: 0,
        },
        reason: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        approvedAt: Date,
        hrComments: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Calculate number of days before validation
leaveSchema.pre('validate', function () {
    if (this.startDate && this.endDate) {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        this.numberOfDays = diffDays;
    }
});

// Index for faster organization-based queries
leaveSchema.index({ organization: 1, status: 1 });
leaveSchema.index({ organization: 1, user: 1 });

module.exports = mongoose.model('Leave', leaveSchema);
