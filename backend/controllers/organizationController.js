const Organization = require('../models/Organization');
const User = require('../models/User');
const path = require('path');
const fs = require('fs').promises;

// @desc    Get current organization
// @route   GET /api/organizations/current
// @access  Private (Admin/HR)
exports.getCurrentOrganization = async (req, res) => {
    try {
        const organization = await Organization.findById(req.user.organization._id);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found',
            });
        }

        res.status(200).json({
            success: true,
            data: organization,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update organization details
// @route   PUT /api/organizations/current
// @access  Private (Admin only)
exports.updateOrganization = async (req, res) => {
    try {
        const { name, contactEmail, contactPhone } = req.body;

        const organization = await Organization.findById(req.user.organization._id);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found',
            });
        }

        // Update fields
        if (name) organization.name = name;
        if (contactEmail) organization.contactEmail = contactEmail;
        if (contactPhone !== undefined) organization.contactPhone = contactPhone;

        await organization.save();

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

// @desc    Upload organization logo
// @route   POST /api/organizations/logo
// @access  Private (Admin only)
exports.uploadLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file',
            });
        }

        const organization = await Organization.findById(req.user.organization._id);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found',
            });
        }

        // Delete old logo if exists
        if (organization.logo) {
            const oldPath = path.join(__dirname, '..', organization.logo);
            try {
                await fs.unlink(oldPath);
            } catch (err) {
                console.error('Error deleting old logo:', err);
            }
        }

        // Update logo path
        organization.logo = `/uploads/logos/${req.file.filename}`;
        await organization.save();

        res.status(200).json({
            success: true,
            message: 'Logo uploaded successfully',
            data: {
                logo: organization.logo,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Remove organization logo
// @route   DELETE /api/organizations/logo
// @access  Private (Admin only)
exports.removeLogo = async (req, res) => {
    try {
        const organization = await Organization.findById(req.user.organization._id);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found',
            });
        }

        // Delete logo file if exists
        if (organization.logo) {
            const logoPath = path.join(__dirname, '..', organization.logo);
            try {
                await fs.unlink(logoPath);
            } catch (err) {
                console.error('Error deleting logo:', err);
            }
        }

        // Remove logo from database
        organization.logo = null;
        await organization.save();

        res.status(200).json({
            success: true,
            message: 'Logo removed successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update brand colors
// @route   PUT /api/organizations/branding
// @access  Private (Admin only)
exports.updateBranding = async (req, res) => {
    try {
        const { brandColor, headerColor } = req.body;

        // Validate hex color format
        const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

        if (brandColor && !hexColorRegex.test(brandColor)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid brand color format. Please use hex format (e.g., #667eea)',
            });
        }

        if (headerColor && !hexColorRegex.test(headerColor)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid header color format. Please use hex format (e.g., #667eea)',
            });
        }

        const organization = await Organization.findById(req.user.organization._id);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found',
            });
        }

        // Update colors
        if (brandColor) organization.brandColor = brandColor;
        if (headerColor) organization.headerColor = headerColor;

        await organization.save();

        res.status(200).json({
            success: true,
            message: 'Branding updated successfully',
            data: {
                brandColor: organization.brandColor,
                headerColor: organization.headerColor,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get organization statistics
// @route   GET /api/organizations/stats
// @access  Private (Admin/HR)
exports.getOrganizationStats = async (req, res) => {
    try {
        const organization = await Organization.findById(req.user.organization._id);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found',
            });
        }

        // Get current employee count
        const currentEmployees = await User.countDocuments({
            organization: organization._id,
            role: { $ne: 'SuperAdmin' },
        });

        // Calculate trial days left
        let trialDaysLeft = 0;
        if (organization.isTrialActive && organization.trialEndsAt) {
            const now = new Date();
            const trialEnd = new Date(organization.trialEndsAt);
            const diffTime = trialEnd - now;
            trialDaysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        }

        res.status(200).json({
            success: true,
            data: {
                currentEmployees,
                maxEmployees: organization.maxEmployees,
                plan: organization.plan,
                isTrialActive: organization.isTrialActive,
                trialDaysLeft,
                trialEndsAt: organization.trialEndsAt,
                isActive: organization.isActive,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
