const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
    {
        // Basic Information
        name: {
            type: String,
            required: [true, 'Organization name is required'],
            trim: true,
        },
        subdomain: {
            type: String,
            required: [true, 'Subdomain is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'],
        },

        // Branding
        logo: {
            type: String,
            default: '',
        },
        brandColor: {
            type: String,
            default: '#667eea', // Default Dayflow purple
        },
        headerColor: {
            type: String,
            default: '#667eea', // Default header gradient color
        },

        // Contact Information
        contactEmail: {
            type: String,
            required: [true, 'Contact email is required'],
            lowercase: true,
            trim: true,
        },
        contactPhone: {
            type: String,
            trim: true,
        },

        // Address
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String,
        },

        // Subscription & Status
        isActive: {
            type: Boolean,
            default: true,
        },
        plan: {
            type: String,
            enum: ['Free', 'Basic', 'Premium', 'Enterprise'],
            default: 'Free',
        },
        maxEmployees: {
            type: Number,
            default: 10, // Free plan limit
        },

        // Subscription Dates
        trialEndsAt: {
            type: Date,
            default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        },
        subscriptionStartDate: Date,
        subscriptionEndDate: Date,

        // Settings
        settings: {
            workingHoursStart: {
                type: String,
                default: '09:00',
            },
            workingHoursEnd: {
                type: String,
                default: '18:00',
            },
            weekendDays: {
                type: [String],
                default: ['Saturday', 'Sunday'],
            },
            defaultPaidLeave: {
                type: Number,
                default: 20,
            },
            defaultSickLeave: {
                type: Number,
                default: 10,
            },
            currency: {
                type: String,
                default: 'INR',
            },
            timezone: {
                type: String,
                default: 'Asia/Kolkata',
            },
        },

        // Metadata
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster subdomain lookups
organizationSchema.index({ subdomain: 1 });
organizationSchema.index({ isActive: 1 });

// Virtual for checking if trial is active
organizationSchema.virtual('isTrialActive').get(function () {
    return this.trialEndsAt && new Date() < this.trialEndsAt;
});

// Virtual for checking if subscription is active
organizationSchema.virtual('isSubscriptionActive').get(function () {
    if (this.plan === 'Free') return true;
    return this.subscriptionEndDate && new Date() < this.subscriptionEndDate;
});

// Method to check if organization can add more employees
organizationSchema.methods.canAddEmployee = async function () {
    const User = mongoose.model('User');
    const employeeCount = await User.countDocuments({ organization: this._id });
    return employeeCount < this.maxEmployees;
};

module.exports = mongoose.model('Organization', organizationSchema);
