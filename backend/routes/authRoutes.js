const express = require('express');
const {
    register,
    login,
    verifyEmail,
    getMe,
    forgotPassword,
    resetPassword,
    getOrganizationsByEmail,
    registerOrganization,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/organizations-by-email', getOrganizationsByEmail);
router.post('/register-organization', registerOrganization);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
