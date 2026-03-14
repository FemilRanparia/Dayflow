const Organization = require('../models/Organization');

/**
 * Middleware to identify and attach the organization (tenant) to the request
 * This enables multi-tenant data isolation
 */
exports.setTenant = async (req, res, next) => {
    try {
        let organization;

        // Strategy 1: Subdomain-based tenant identification
        // Example: companya.dayflow.com -> subdomain = "companya"
        const host = req.headers.host || req.hostname;
        const subdomain = host.split('.')[0];

        // Skip tenant detection for localhost or super admin routes
        if (
            host.includes('localhost') ||
            host.includes('127.0.0.1') ||
            subdomain === 'admin' ||
            req.path.startsWith('/api/super-admin')
        ) {
            // For local development, check if organizationId is in headers or query
            const orgId = req.headers['x-organization-id'] || req.query.organizationId;

            if (orgId) {
                organization = await Organization.findById(orgId);
            } else {
                // For localhost, allow requests without organization (for super admin operations)
                return next();
            }
        } else {
            // Production: Find organization by subdomain
            organization = await Organization.findOne({ subdomain });
        }

        // Check if organization exists
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found. Please check your URL.',
            });
        }

        // Check if organization is active
        if (!organization.isActive) {
            return res.status(403).json({
                success: false,
                message: 'This organization account has been suspended. Please contact support.',
            });
        }

        // Check if subscription is active (except for free plan)
        if (!organization.isSubscriptionActive && !organization.isTrialActive) {
            return res.status(403).json({
                success: false,
                message: 'Your subscription has expired. Please renew to continue using the service.',
            });
        }

        // Attach organization to request object
        req.organization = organization;

        next();
    } catch (error) {
        console.error('Tenant middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Error identifying organization',
        });
    }
};

/**
 * Middleware to ensure user belongs to the current organization
 * Use this after protect middleware
 */
exports.verifyTenantAccess = (req, res, next) => {
    // If no organization is set, skip (for super admin routes)
    if (!req.organization) {
        return next();
    }

    // Check if user's organization matches the request organization
    if (req.user && req.user.organization && req.user.organization.toString() !== req.organization._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. You do not belong to this organization.',
        });
    }

    next();
};

/**
 * Middleware to check if organization can add more employees
 */
exports.checkEmployeeLimit = async (req, res, next) => {
    try {
        if (!req.organization) {
            return next();
        }

        const canAdd = await req.organization.canAddEmployee();

        if (!canAdd) {
            return res.status(403).json({
                success: false,
                message: `Employee limit reached for ${req.organization.plan} plan. Please upgrade your plan.`,
            });
        }

        next();
    } catch (error) {
        console.error('Employee limit check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking employee limit',
        });
    }
};
