const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        // Multi-Tenant: Organization Reference
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: [true, 'Organization is required'],
            index: true, // Index for faster queries
        },

        employeeId: {
            type: String,
            required: [true, 'Employee ID is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },
        role: {
            type: String,
            enum: ['Employee', 'HR', 'Admin', 'SuperAdmin'], // Added SuperAdmin
            default: 'Employee',
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: String,
        emailVerificationExpire: Date,
        resetPasswordToken: String,
        resetPasswordExpire: Date,

        // Personal Information
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
        },
        dateOfBirth: Date,
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
        },
        phone: {
            type: String,
            trim: true,
        },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String,
        },
        profilePicture: {
            type: String,
            default: '',
        },

        // Job Information
        department: {
            type: String,
            trim: true,
        },
        designation: {
            type: String,
            trim: true,
        },
        joiningDate: {
            type: Date,
            default: Date.now,
        },
        employmentType: {
            type: String,
            enum: ['Full-Time', 'Part-Time', 'Contract', 'Intern'],
            default: 'Full-Time',
        },

        // Salary Information
        salary: {
            basicSalary: {
                type: Number,
                default: 0,
            },
            allowances: {
                type: Number,
                default: 0,
            },
            deductions: {
                type: Number,
                default: 0,
            },
            netSalary: {
                type: Number,
                default: 0,
            },
        },

        // Documents
        documents: [
            {
                name: String,
                type: String,
                url: String,
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        // Leave Balance
        leaveBalance: {
            paidLeave: {
                type: Number,
                default: 20,
            },
            sickLeave: {
                type: Number,
                default: 10,
            },
            unpaidLeave: {
                type: Number,
                default: 0,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Hash password and calculate salary before saving
userSchema.pre('save', async function () {
    // Hash password if modified
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    // Calculate net salary if modified
    if (this.isModified('salary')) {
        this.salary.netSalary =
            this.salary.basicSalary + this.salary.allowances - this.salary.deductions;
    }
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
    // Generate token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set to emailVerificationToken field
    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    // Set expire time (24 hours)
    this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;

    return verificationToken;
};

// Compound indexes for multi-tenant uniqueness
// EmployeeId must be unique per organization, not globally
userSchema.index({ organization: 1, employeeId: 1 }, { unique: true });
// Email must be unique per organization, not globally
userSchema.index({ organization: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
