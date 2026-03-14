const User = require('../models/User');
const path = require('path');
const fs = require('fs').promises;
const { sendVerificationEmail } = require('../utils/emailService');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const allowedFields = [
            'firstName',
            'lastName',
            'phone',
            'dateOfBirth',
            'gender',
            'address',
        ];

        const updates = {};
        Object.keys(req.body).forEach((key) => {
            if (allowedFields.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const user = await User.findByIdAndUpdate(req.user.id, updates, {
            new: true,
            runValidators: true,
        });

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

// @desc    Upload profile picture
// @route   POST /api/users/profile-picture
// @access  Private
exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file',
            });
        }

        const user = await User.findById(req.user.id);

        // Delete old profile picture if exists
        if (user.profilePicture) {
            const oldPath = path.join(__dirname, '..', user.profilePicture);
            try {
                await fs.unlink(oldPath);
            } catch (err) {
                console.error('Error deleting old profile picture:', err);
            }
        }

        user.profilePicture = `/uploads/profiles/${req.file.filename}`;
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                profilePicture: user.profilePicture,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Upload document
// @route   POST /api/users/documents
// @access  Private
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file',
            });
        }

        const { name, type } = req.body;

        const user = await User.findById(req.user.id);

        user.documents.push({
            name: name || req.file.originalname,
            type: type || 'Other',
            url: `/uploads/documents/${req.file.filename}`,
        });

        await user.save();

        res.status(200).json({
            success: true,
            data: user.documents,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete document
// @route   DELETE /api/users/documents/:documentId
// @access  Private
exports.deleteDocument = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        const document = user.documents.id(req.params.documentId);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found',
            });
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '..', document.url);
        try {
            await fs.unlink(filePath);
        } catch (err) {
            console.error('Error deleting document file:', err);
        }

        document.remove();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all employees (Admin/HR only)
// @route   GET /api/users/employees
// @access  Private (Admin/HR)
exports.getAllEmployees = async (req, res) => {
    try {
        // Multi-tenant: Filter by organization (except SuperAdmin)
        const query = req.user.role === 'SuperAdmin' ? {} : { organization: req.user.organization._id };

        const employees = await User.find(query)
            .select('-password')
            .populate('organization', 'name subdomain');

        res.status(200).json({
            success: true,
            count: employees.length,
            data: employees,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get employee by ID (Admin/HR only)
// @route   GET /api/users/employees/:id
// @access  Private (Admin/HR)
exports.getEmployeeById = async (req, res) => {
    try {
        // Multi-tenant: Build query with organization filter
        const query = { _id: req.params.id };
        if (req.user.role !== 'SuperAdmin') {
            query.organization = req.user.organization._id;
        }

        const employee = await User.findOne(query).populate('organization', 'name subdomain');

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        res.status(200).json({
            success: true,
            data: employee,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update employee (Admin/HR only)
// @route   PUT /api/users/employees/:id
// @access  Private (Admin/HR)
exports.updateEmployee = async (req, res) => {
    try {
        console.log('📝 Updating employee:', req.params.id);
        console.log('📝 Update data:', req.body);

        // Multi-tenant: Build query with organization filter
        const query = { _id: req.params.id };
        if (req.user.role !== 'SuperAdmin') {
            query.organization = req.user.organization._id;
        }

        const employee = await User.findOne(query);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        // Update fields
        Object.keys(req.body).forEach(key => {
            if (key === 'salary') {
                // Update salary fields
                employee.salary = {
                    ...employee.salary,
                    ...req.body.salary
                };
            } else {
                employee[key] = req.body[key];
            }
        });

        await employee.save();

        console.log('✅ Employee updated successfully');

        res.status(200).json({
            success: true,
            data: employee,
        });
    } catch (error) {
        console.error('❌ Update employee error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete employee (Admin only)
// @route   DELETE /api/users/employees/:id
// @access  Private (Admin)
exports.deleteEmployee = async (req, res) => {
    try {
        // Multi-tenant: Build query with organization filter
        const query = { _id: req.params.id };
        if (req.user.role !== 'SuperAdmin') {
            query.organization = req.user.organization._id;
        }

        const employee = await User.findOneAndDelete(query);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Employee deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create employee (Admin/HR only)
// @route   POST /api/users/employees
// @access  Private (Admin/HR)
exports.createEmployee = async (req, res) => {
    try {
        const {
            employeeId,
            email,
            password,
            role,
            firstName,
            lastName,
            department,
            designation,
            phone,
            dateOfBirth,
            gender,
            employmentType,
            joiningDate,
            basicSalary,
            allowances,
            deductions,
        } = req.body;

        // Multi-tenant: Assign to user's organization (or specified org for SuperAdmin)
        const organizationId = req.user.role === 'SuperAdmin' && req.body.organizationId
            ? req.body.organizationId
            : req.user.organization._id;

        // Auto-generate employeeId if not provided or to follow standard format
        let finalEmployeeId = employeeId;
        if (!finalEmployeeId) {
            // Get organization details
            const Organization = require('../models/Organization');
            const org = await Organization.findById(organizationId);

            // Extract organization initials (first letter of each word, max 2 letters)
            const orgWords = org.name.split(' ').filter(word => word.length > 0);
            const orgInitials = orgWords
                .map(word => word[0].toUpperCase())
                .join('')
                .substring(0, 2);

            // Extract employee initials (first 2 letters of first name + first 2 letters of last name)
            const firstNameInitials = firstName.substring(0, 2).toUpperCase();
            const lastNameInitials = lastName.substring(0, 2).toUpperCase();
            const employeeInitials = firstNameInitials + lastNameInitials;

            // Get year of joining
            const date = joiningDate ? new Date(joiningDate) : new Date();
            const year = date.getFullYear();

            // Get count of employees who joined in this year for this organization
            const startOfYear = new Date(year, 0, 1);
            const endOfYear = new Date(year, 11, 31, 23, 59, 59);
            const countThisYear = await User.countDocuments({
                organization: organizationId,
                joiningDate: {
                    $gte: startOfYear,
                    $lte: endOfYear
                }
            });
            const sequence = String(countThisYear + 1).padStart(4, '0');

            // Format: OI-JODO-2022-0001
            finalEmployeeId = `${orgInitials}-${employeeInitials}-${year}-${sequence}`;
        }

        // Check if organization can add more employees
        if (req.user.role !== 'SuperAdmin') {
            const Organization = require('../models/Organization');
            const org = await Organization.findById(organizationId);
            const canAdd = await org.canAddEmployee();

            if (!canAdd) {
                return res.status(403).json({
                    success: false,
                    message: `Employee limit reached for ${org.plan} plan. Please upgrade.`,
                });
            }
        }

        // Check if user with same email or employeeId exists in this organization
        const existingUser = await User.findOne({
            organization: organizationId,
            $or: [{ email }, { employeeId: finalEmployeeId }],
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: `User with this email or employee ID (${finalEmployeeId}) already exists in this organization`,
            });
        }

        // Create employee
        const employee = await User.create({
            organization: organizationId,
            employeeId: finalEmployeeId,
            email,
            password,
            role: role || 'Employee',
            firstName,
            lastName,
            department,
            designation,
            phone,
            dateOfBirth,
            gender,
            employmentType: employmentType || 'Full-Time',
            joiningDate: joiningDate || Date.now(),
            salary: {
                basicSalary: basicSalary || 0,
                allowances: allowances || 0,
                deductions: deductions || 0,
            },
            isEmailVerified: false, // Require email verification
        });

        // Generate email verification token
        const verificationToken = employee.generateEmailVerificationToken();
        console.log('🔑 Generated Verification Token:', verificationToken);
        console.log('🔒 Hashed Token (saved to DB):', employee.emailVerificationToken);
        console.log('⏰ Token Expires:', new Date(employee.emailVerificationExpire));

        await employee.save();
        console.log('💾 Employee saved with verification token');

        // Construct verification URL
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        console.log('🔗 Verification URL:', verificationUrl);
        console.log('📋 COPY THIS LINK TO VERIFY:', verificationUrl);

        // Send verification email
        try {
            console.log('📧 Sending verification email to:', employee.email);
            await sendVerificationEmail(
                employee.email,
                verificationToken,
                `${employee.firstName} ${employee.lastName}`
            );
            console.log('✅ Verification email sent successfully');
        } catch (emailError) {
            console.error('❌ Error sending verification email:', emailError);
            console.error('📧 Email error details:', emailError.message);
            // Don't fail the employee creation if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Employee created successfully. Verification email sent to ' + employee.email,
            verificationUrl: process.env.NODE_ENV === 'development' ? verificationUrl : undefined,
            data: {
                id: employee._id,
                employeeId: employee.employeeId,
                email: employee.email,
                firstName: employee.firstName,
                lastName: employee.lastName,
                role: employee.role,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
