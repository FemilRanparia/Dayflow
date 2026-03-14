const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { employeeId, email, password, role, firstName, lastName, department, designation } = req.body;
        console.log('📝 Registration attempt:', { employeeId, email, role });

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { employeeId }] });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or employee ID already exists',
            });
        }

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

        console.log('✅ Creating user...');

        // Create user
        let user;
        try {
            user = await User.create({
                employeeId,
                email,
                password,
                role: role || 'Employee',
                firstName,
                lastName,
                department,
                designation,
                emailVerificationToken: hashedToken,
                emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            });
            console.log('✅ User created successfully');
        } catch (createError) {
            console.error('❌ User creation failed:', createError);
            throw createError;
        }

        // Send verification email
        try {
            await sendVerificationEmail(email, verificationToken, `${firstName} ${lastName}`);
            console.log('✅ Verification email sent');
        } catch (error) {
            console.error('⚠️ Email sending failed:', error.message);
            // Don't fail registration if email fails
        }
        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
            data: {
                employeeId: user.employeeId,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
    try {
        console.log('📧 Email Verification Request');
        console.log('📧 Incoming Token:', req.params.token);

        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        console.log('🔒 Hashed Token:', hashedToken);

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpire: { $gt: Date.now() },
        }).populate('organization');

        console.log('👤 User Found:', user ? `YES - ${user.email}` : 'NO');
        if (!user) {
            console.log('❌ No user found with token or token expired');
            console.log('⏰ Current Time:', new Date());
        }

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token',
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save();

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully!',
            token,
            user: {
                id: user._id,
                employeeId: user.employeeId,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                organization: user.organization ? {
                    id: user.organization._id,
                    name: user.organization.name,
                    subdomain: user.organization.subdomain,
                    logo: user.organization.logo,
                    brandColor: user.organization.brandColor,
                    headerColor: user.organization.headerColor,
                } : null,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password, organizationId } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        // Build query - if organizationId provided, filter by it
        const query = { email };
        if (organizationId) {
            query.organization = organizationId;
        }

        // Check for user and populate organization
        const user = await User.findOne(query)
            .select('+password')
            .populate('organization');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(401).json({
                success: false,
                message: 'Please verify your email before logging in',
            });
        }

        // Check if organization is active (except SuperAdmin)
        if (user.role !== 'SuperAdmin' && user.organization && !user.organization.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your organization account has been suspended. Please contact support.',
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                employeeId: user.employeeId,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                profilePicture: user.profilePicture,
                organization: user.organization ? {
                    id: user.organization._id,
                    name: user.organization.name,
                    subdomain: user.organization.subdomain,
                    logo: user.organization.logo,
                    brandColor: user.organization.brandColor,
                    headerColor: user.organization.headerColor,
                } : null,
                leaveBalance: user.leaveBalance,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with that email',
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        // Send email
        try {
            await sendPasswordResetEmail(user.email, resetToken, `${user.firstName} ${user.lastName}`);

            res.status(200).json({
                success: true,
                message: 'Password reset email sent',
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            return res.status(500).json({
                success: false,
                message: 'Email could not be sent',
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
            });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Password reset successful',
            token,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get organizations for user by email
// @route   POST /api/auth/organizations-by-email
// @access  Public
exports.getOrganizationsByEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email',
            });
        }

        // Find all users with this email across organizations
        const users = await User.find({ email })
            .populate('organization', 'name subdomain logo brandColor isActive')
            .select('organization role');

        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email',
            });
        }

        // Filter out inactive organizations and format response
        const organizations = users
            .filter(u => u.organization && u.organization.isActive)
            .map(u => ({
                id: u.organization._id,
                name: u.organization.name,
                subdomain: u.organization.subdomain,
                logo: u.organization.logo,
                brandColor: u.organization.brandColor,
                headerColor: u.organization.headerColor,
                userRole: u.role,
            }));

        if (organizations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No active organizations found for this email',
            });
        }

        res.status(200).json({
            success: true,
            count: organizations.length,
            data: organizations,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Register organization with admin user
// @route   POST /api/auth/register-organization
// @access  Public
exports.registerOrganization = async (req, res) => {
    try {
        const { organization, admin } = req.body;
        const Organization = require('../models/Organization');

        // Validate input
        if (!organization || !admin) {
            return res.status(400).json({
                success: false,
                message: 'Organization and admin details are required',
            });
        }

        // Check if subdomain already exists
        const existingOrg = await Organization.findOne({ subdomain: organization.subdomain });
        if (existingOrg) {
            return res.status(400).json({
                success: false,
                message: 'Subdomain already taken. Please choose another.',
            });
        }

        // Check if admin email already exists
        const existingUser = await User.findOne({ email: admin.email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered. Please use a different email.',
            });
        }

        // Create organization
        const newOrganization = await Organization.create({
            name: organization.name,
            subdomain: organization.subdomain,
            contactEmail: organization.contactEmail,
            contactPhone: organization.contactPhone || '',
            plan: organization.plan || 'Free',
            maxEmployees: organization.plan === 'Free' ? 10 : organization.plan === 'Basic' ? 50 : 1000,
            isActive: true,
            isTrialActive: true,
            trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        });

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

        // Create admin user
        const adminUser = await User.create({
            organization: newOrganization._id,
            employeeId: 'ADMIN001',
            email: admin.email,
            password: admin.password,
            firstName: admin.firstName,
            lastName: admin.lastName,
            role: 'Admin',
            isEmailVerified: false, // Require email verification
            emailVerificationToken: hashedToken,
            emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            department: 'Management',
            designation: 'Administrator',
            employmentType: 'Full-Time',
            joiningDate: new Date(),
        });

        // Send verification email
        try {
            await sendVerificationEmail(
                adminUser.email,
                verificationToken,
                `${adminUser.firstName} ${adminUser.lastName}`
            );
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Don't fail the registration if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Organization created successfully. Verification email sent to admin.',
            data: {
                organization: {
                    id: newOrganization._id,
                    name: newOrganization.name,
                    subdomain: newOrganization.subdomain,
                    plan: newOrganization.plan,
                },
                admin: {
                    id: adminUser._id,
                    email: adminUser.email,
                    firstName: adminUser.firstName,
                    lastName: adminUser.lastName,
                    emailVerificationRequired: true,
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
