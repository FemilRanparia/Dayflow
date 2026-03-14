const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
    let token;

    console.log(`🔒 Protect middleware - Path: ${req.path}`);

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log(`✅ Token found in Authorization header`);
    }

    if (!token) {
        console.log(`❌ No token provided`);
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route',
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(`✅ Token verified, User ID: ${decoded.id}`);

        // Populate organization field for multi-tenant support
        req.user = await User.findById(decoded.id).populate('organization');

        if (!req.user) {
            console.log(`❌ User not found in database`);
            return res.status(401).json({
                success: false,
                message: 'User not found',
            });
        }

        console.log(`✅ User found: ${req.user.email}, Role: ${req.user.role}`);
        console.log(`🏢 Organization: ${req.user.organization?.name || 'None'}`);

        // Verify organization is active (except for SuperAdmin)
        if (req.user.role !== 'SuperAdmin') {
            if (!req.user.organization) {
                console.log(`❌ User has no organization`);
                return res.status(403).json({
                    success: false,
                    message: 'User is not associated with any organization',
                });
            }

            if (!req.user.organization.isActive) {
                console.log(`❌ Organization is inactive`);
                return res.status(403).json({
                    success: false,
                    message: 'Your organization account has been suspended',
                });
            }

            // Verify tenant access if organization is set in request
            if (req.organization && req.user.organization._id.toString() !== req.organization._id.toString()) {
                console.log(`❌ User organization mismatch`);
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You do not belong to this organization.',
                });
            }
        }

        if (!req.user.isEmailVerified) {
            console.log(`❌ Email not verified for user: ${req.user.email}`);
            return res.status(401).json({
                success: false,
                message: 'Please verify your email to access this resource',
            });
        }

        console.log(`✅ Email verified, proceeding to next middleware`);
        next();
    } catch (error) {
        console.log(`❌ JWT verification error:`, error.message);
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route',
        });
    }
};

// Authorize specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        console.log(`🔐 Authorization check - User role: "${req.user.role}" (type: ${typeof req.user.role}), Allowed roles: [${roles.map(r => `"${r}"`).join(', ')}]`);
        console.log(`🔐 Role comparison result: roles.includes(req.user.role) = ${roles.includes(req.user.role)}`);
        console.log(`🔐 Individual checks:`, roles.map(r => `"${r}" === "${req.user.role}" ? ${r === req.user.role}`).join(', '));

        if (!roles.includes(req.user.role)) {
            console.log(`❌ AUTHORIZATION FAILED - User role "${req.user.role}" not in allowed roles`);
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`,
            });
        }

        console.log(`✅ AUTHORIZATION PASSED - User has required role`);
        next();
    };
};
