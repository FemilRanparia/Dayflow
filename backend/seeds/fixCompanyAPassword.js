require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
const connectDB = require('../config/db');

/**
 * Fix Script: Reset Company A Admin Password
 * 
 * This script resets the password for admin@companya.com
 * 
 * Run with: node backend/seeds/fixCompanyAPassword.js
 */

const fixPassword = async () => {
    try {
        // Connect to database
        await connectDB();
        console.log('📦 Connected to database');

        // Find Company A
        const companyA = await Organization.findOne({ subdomain: 'companya' });
        if (!companyA) {
            console.log('❌ Company A not found. Run npm run seed:companya first.');
            process.exit(1);
        }

        // Find admin user
        const admin = await User.findOne({
            organization: companyA._id,
            email: 'admin@companya.com'
        });

        if (!admin) {
            console.log('❌ Admin user not found.');
            process.exit(1);
        }

        console.log('🔧 Resetting password for admin@companya.com...');

        // Update password (the pre-save hook will hash it)
        admin.password = 'Admin@123';
        await admin.save();

        console.log('✅ Password reset successfully!');
        console.log('\n═══════════════════════════════════════');
        console.log('👤 Updated Credentials:');
        console.log('   📧 Email: admin@companya.com');
        console.log('   🔑 Password: Admin@123');
        console.log('═══════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

// Run the fix
fixPassword();
