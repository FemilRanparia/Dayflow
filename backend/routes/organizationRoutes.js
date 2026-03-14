const express = require('express');
const {
    getCurrentOrganization,
    updateOrganization,
    uploadLogo,
    removeLogo,
    updateBranding,
    getOrganizationStats,
} = require('../controllers/organizationController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get current organization (Admin/HR/SuperAdmin can view)
router.get('/current', protect, authorize('Admin', 'HR', 'SuperAdmin'), getCurrentOrganization);

// Update organization details (Admin/SuperAdmin)
router.put('/current', protect, authorize('Admin', 'SuperAdmin'), updateOrganization);

// Upload organization logo (Admin/SuperAdmin)
router.post('/logo', protect, authorize('Admin', 'SuperAdmin'), upload.single('logo'), uploadLogo);

// Remove organization logo (Admin/SuperAdmin)
router.delete('/logo', protect, authorize('Admin', 'SuperAdmin'), removeLogo);

// Update brand colors (Admin/SuperAdmin)
router.put('/branding', protect, authorize('Admin', 'SuperAdmin'), updateBranding);

// Get organization statistics (Admin/HR/SuperAdmin can view)
router.get('/stats', protect, authorize('Admin', 'HR', 'SuperAdmin'), getOrganizationStats);

module.exports = router;
