const express = require('express');
const {
    getAllOrganizations,
    getOrganizationById,
    createOrganization,
    updateOrganization,
    toggleOrganizationStatus,
    deleteOrganization,
    getOrganizationStats,
} = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require SuperAdmin role
router.use(protect);
router.use(authorize('SuperAdmin'));

// Organization management
router.get('/organizations', getAllOrganizations);
router.get('/organizations/:id', getOrganizationById);
router.post('/organizations', createOrganization);
router.put('/organizations/:id', updateOrganization);
router.patch('/organizations/:id/toggle-status', toggleOrganizationStatus);
router.delete('/organizations/:id', deleteOrganization);

// Stats
router.get('/stats', getOrganizationStats);

module.exports = router;
