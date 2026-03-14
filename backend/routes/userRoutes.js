const express = require('express');
const {
    getProfile,
    updateProfile,
    uploadProfilePicture,
    uploadDocument,
    deleteDocument,
    getAllEmployees,
    createEmployee,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Employee routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile-picture', protect, upload.single('profilePicture'), uploadProfilePicture);
router.post('/documents', protect, upload.single('document'), uploadDocument);
router.delete('/documents/:documentId', protect, deleteDocument);

// Admin/HR routes
router.get('/employees', protect, authorize('Admin', 'HR', 'SuperAdmin'), getAllEmployees);
router.post('/employees', protect, authorize('Admin', 'HR', 'SuperAdmin'), createEmployee);
router.get('/employees/:id', protect, authorize('Admin', 'HR', 'SuperAdmin'), getEmployeeById);
router.put('/employees/:id', protect, authorize('Admin', 'HR', 'SuperAdmin'), updateEmployee);
router.delete('/employees/:id', protect, authorize('Admin', 'SuperAdmin'), deleteEmployee);

module.exports = router;
