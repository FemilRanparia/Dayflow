require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const reportRoutes = require('./routes/reportRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const organizationRoutes = require('./routes/organizationRoutes');

// Import models to register them with Mongoose
require('./models/Organization');
require('./models/User');
require('./models/Attendance');
require('./models/Leave');

// Initialize app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/organizations', organizationRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Dayflow HRMS API is running',
        timestamp: new Date().toISOString(),
    });
});

// Test email route
app.get('/api/test-email', async (req, res) => {
    try {
        const { sendVerificationEmail } = require('./utils/emailService');
        await sendVerificationEmail('pfemil94@gmail.com', 'test-token-123', 'Test User');
        res.status(200).json({
            success: true,
            message: 'Test email sent! Check pfemil94@gmail.com',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Email failed: ' + error.message,
        });
    }
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 API URL: http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`❌ Error: ${err.message}`);
    process.exit(1);
});
