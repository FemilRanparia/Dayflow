const Organization = require('../models/Organization');
const User = require('../models/User');

// @desc    Get all organizations
// @route   GET /api/super-admin/organizations
// @access  Private (SuperAdmin)
exports.getAllOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.find().sort({ createdAt: -1 });

        // Get employee count and admin details for each organization
        const orgsWithDetails = await Promise.all(
            organizations.map(async (org) => {
                const employeeCount = await User.countDocuments({ organization: org._id });

                // Find the admin user
                const admin = await User.findOne({
                    organization: org._id,
                    role: 'Admin'
                }).select('firstName lastName email');

                return {
                    ...org.toObject(),
                    employeeCount,
                    adminName: admin ? `${admin.firstName} ${admin.lastName}` : null,
                    adminEmail: admin ? admin.email : null,
                };
            })
        );

        res.status(200).json({
            success: true,
            count: orgsWithDetails.length,
            data: orgsWithDetails,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get organization by ID
// @route   GET /api/super-admin/organizations/:id
// @access  Private (SuperAdmin)
exports.getOrganizationById = async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found',
            });
        }

        // Get admin user
        const admin = await User.findOne({
            organization: organization._id,
            role: 'Admin'
        }).select('firstName lastName email employeeId phone');

        // Get employee stats by role
        const totalEmployees = await User.countDocuments({ organization: organization._id });
        const admins = await User.countDocuments({ organization: organization._id, role: 'Admin' });
        const hr = await User.countDocuments({ organization: organization._id, role: 'HR' });
        const employees = await User.countDocuments({ organization: organization._id, role: 'Employee' });

        res.status(200).json({
            success: true,
            data: {
                ...organization.toObject(),
                admin,
                stats: {
                    totalEmployees,
                    admins,
                    hr,
                    employees,
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create organization
// @route   POST /api/super-admin/organizations
// @access  Private (SuperAdmin)
exports.createOrganization = async (req, res) => {
    try {
        console.log('📨 Creating organization with data:', req.body);

        const {
            name,
            subdomain,
            contactEmail,
            contactPhone,
            plan,
            adminFirstName,
            adminLastName,
            adminEmail,
            adminPassword,
        } = req.body;

        // Set maxEmployees based on plan
        let maxEmployees = 10; // Free
        if (plan === 'Basic') maxEmployees = 50;
        else if (plan === 'Premium') maxEmployees = 1000;
        else if (plan === 'Enterprise') maxEmployees = 10000;

        // Create organization
        const organization = await Organization.create({
            name,
            subdomain,
            contactEmail,
            contactPhone,
            plan,
            maxEmployees,
            createdBy: req.user._id,
        });
        console.log('✅ Organization created:', organization.name);

        // Create admin user
        const bcrypt = require('bcryptjs');
        const crypto = require('crypto');
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Generate verification token (plain token for email)
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Hash the token for storage in database
        const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const admin = await User.create({
            firstName: adminFirstName,
            lastName: adminLastName,
            email: adminEmail,
            password: hashedPassword,
            role: 'Admin',
            organization: organization._id,
            employeeId: 'ADMIN001',
            isEmailVerified: false,
            emailVerificationToken: hashedToken, // Store hashed token
            emailVerificationExpire: verificationTokenExpiry, // Note: 'Expire' not 'Expires'
        });
        console.log('✅ Admin user created:', adminEmail);

        // Send verification email (optional - only if sendEmail utility exists)
        console.log('📧 Attempting to send verification email to:', adminEmail);
        try {
            const sendEmail = require('../utils/sendEmail');
            const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;

            const emailMessage = `
                <h1>Welcome to ${organization.name}!</h1>
                <p>Hello ${adminFirstName},</p>
                <p>Your organization has been created on Dayflow. You have been assigned as the Admin.</p>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
                <p>Or copy and paste this link in your browser:</p>
                <p>${verificationUrl}</p>
                <p><strong>Your login credentials:</strong></p>
                <ul>
                    <li>Email: ${adminEmail}</li>
                    <li>Password: (the one you set)</li>
                    <li>Organization: ${organization.subdomain}.dayflow.com</li>
                </ul>
                <p>This verification link will expire in 24 hours.</p>
                <p>Best regards,<br>Dayflow Team</p>
            `;

            await sendEmail({
                to: adminEmail,
                subject: `Welcome to ${organization.name} - Verify Your Email`,
                html: emailMessage,
            });

            console.log(`✅ Verification email sent successfully to ${adminEmail}`);
        } catch (emailError) {
            console.error('❌ Email sending failed:', emailError.message);
            console.error('Full error:', emailError);
            // Don't fail the organization creation if email utility doesn't exist or fails
        }

        res.status(201).json({
            success: true,
            message: 'Organization and admin user created successfully. Verification email sent.',
            data: {
                organization,
                admin: {
                    _id: admin._id,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    email: admin.email,
                    role: admin.role,
                },
            },
        });
    } catch (error) {
        console.error('Create organization error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update organization
// @route   PUT /api/super-admin/organizations/:id
// @access  Private (SuperAdmin)
exports.updateOrganization = async (req, res) => {
    try {
        const organization = await Organization.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Organization updated successfully',
            data: organization,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Toggle organization status
// @route   PATCH /api/super-admin/organizations/:id/toggle-status
// @access  Private (SuperAdmin)
exports.toggleOrganizationStatus = async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found',
            });
        }

        organization.isActive = !organization.isActive;
        await organization.save();

        res.status(200).json({
            success: true,
            message: `Organization ${organization.isActive ? 'activated' : 'deactivated'} successfully`,
            data: organization,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete organization
// @route   DELETE /api/super-admin/organizations/:id
// @access  Private (SuperAdmin)
exports.deleteOrganization = async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found',
            });
        }

        // Get count of users for confirmation message
        const userCount = await User.countDocuments({ organization: organization._id });

        // Delete all associated data
        const Attendance = require('../models/Attendance');
        const Leave = require('../models/Leave');

        // Delete all attendance records
        const attendanceResult = await Attendance.deleteMany({ organization: organization._id });

        // Delete all leave records
        const leaveResult = await Leave.deleteMany({ organization: organization._id });

        // Delete all users
        await User.deleteMany({ organization: organization._id });

        // Finally, delete the organization
        await organization.deleteOne();

        res.status(200).json({
            success: true,
            message: `Organization deleted successfully. Removed: ${userCount} users, ${attendanceResult.deletedCount} attendance records, ${leaveResult.deletedCount} leave records`,
        });
    } catch (error) {
        console.error('Delete organization error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get organization stats
// @route   GET /api/super-admin/stats
// @access  Private (SuperAdmin)
exports.getOrganizationStats = async (req, res) => {
    try {
        const totalOrganizations = await Organization.countDocuments();
        const activeOrganizations = await Organization.countDocuments({ isActive: true });
        const totalUsers = await User.countDocuments();
        const trialOrganizations = await Organization.countDocuments({
            isTrialActive: true,
            subscriptionEndDate: null,
        });

        // Get organizations by plan
        const planDistribution = await Organization.aggregate([
            {
                $group: {
                    _id: '$plan',
                    count: { $sum: 1 },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalOrganizations,
                activeOrganizations,
                totalUsers,
                trialOrganizations,
                planDistribution,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
