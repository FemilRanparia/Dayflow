require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
const connectDB = require('../config/db');

/**
 * Seed Script: Create Super Admin and Default Organization
 * 
 * This script creates:
 * 1. A default "Dayflow Demo" organization for testing
 * 2. A super admin account that can manage all organizations
 * 
 * Run with: node backend/seeds/superAdminSeed.js
 */

const seedSuperAdmin = async () => {
    try {
        // Connect to database
        await connectDB();
        console.log('📦 Connected to database');

        // Check if super admin already exists
        const existingSuperAdmin = await User.findOne({ role: 'SuperAdmin' });
        if (existingSuperAdmin) {
            console.log('⚠️  Super Admin already exists!');
            console.log(`   Email: ${existingSuperAdmin.email}`);
            console.log('   Skipping super admin creation...');
            process.exit(0);
        }

        // Create default organization for demo/testing
        let defaultOrg = await Organization.findOne({ subdomain: 'demo' });

        if (!defaultOrg) {
            console.log('🏢 Creating default demo organization...');
            defaultOrg = await Organization.create({
                name: 'Dayflow Demo Company',
                subdomain: 'demo',
                contactEmail: process.env.SUPER_ADMIN_EMAIL || 'admin@dayflow.com',
                contactPhone: '+91 1234567890',
                address: {
                    street: '123 Tech Street',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    zipCode: '400001',
                    country: 'India',
                },
                plan: 'Premium',
                maxEmployees: 1000,
                isActive: true,
            });
            console.log('✅ Default organization created: demo.dayflow.com');
        } else {
            console.log('ℹ️  Default organization already exists');
        }

        // Create Super Admin account
        console.log('👤 Creating Super Admin account...');

        const superAdmin = await User.create({
            organization: defaultOrg._id,
            employeeId: 'SUPER001',
            email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@dayflow.com',
            password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
            firstName: 'Super',
            lastName: 'Admin',
            role: 'SuperAdmin',
            isEmailVerified: true,
            department: 'Platform Management',
            designation: 'Platform Administrator',
            employmentType: 'Full-Time',
            joiningDate: new Date(),
        });

        console.log('\n🎉 Super Admin created successfully!');
        console.log('═══════════════════════════════════════');
        console.log('📧 Email:', superAdmin.email);
        console.log('🔑 Password:', process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123');
        console.log('🏢 Organization:', defaultOrg.name);
        console.log('🌐 Access URL: admin.dayflow.com (or localhost for dev)');
        console.log('═══════════════════════════════════════');
        console.log('\n⚠️  IMPORTANT: Change the password after first login!');
        console.log('💡 TIP: Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in .env file\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding super admin:', error.message);
        process.exit(1);
    }
};

// Run the seed function
seedSuperAdmin();
