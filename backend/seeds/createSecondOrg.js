require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Organization = require('../models/Organization');
const User = require('../models/User');
const connectDB = require('../config/db');

/**
 * Seed Script: Create Second Organization for Multi-Tenant Testing
 * 
 * This script creates:
 * 1. A second organization "Company A"
 * 2. An admin user for Company A
 * 
 * Run with: node backend/seeds/createSecondOrg.js
 */

const createSecondOrganization = async () => {
    try {
        // Connect to database
        await connectDB();
        console.log('📦 Connected to database');

        // Check if Company A already exists
        const existingOrg = await Organization.findOne({ subdomain: 'companya' });
        if (existingOrg) {
            console.log('⚠️  Company A already exists!');
            console.log(`   Organization: ${existingOrg.name}`);
            console.log(`   Subdomain: ${existingOrg.subdomain}`);

            // Check if admin exists
            const existingAdmin = await User.findOne({
                organization: existingOrg._id,
                email: 'admin@companya.com'
            });

            if (existingAdmin) {
                console.log(`   Admin: ${existingAdmin.email}`);
                console.log('\n💡 You can use these credentials to test data isolation:');
                console.log('   Email: admin@companya.com');
                console.log('   Password: Admin@123');
            }

            process.exit(0);
        }

        // Create Company A organization
        console.log('🏢 Creating Company A organization...');
        const companyA = await Organization.create({
            name: 'Company A',
            subdomain: 'companya',
            contactEmail: 'admin@companya.com',
            contactPhone: '+91 9876543210',
            address: {
                street: '456 Business Avenue',
                city: 'Bangalore',
                state: 'Karnataka',
                zipCode: '560001',
                country: 'India',
            },
            brandColor: '#ff6b6b', // Red theme
            plan: 'Basic',
            maxEmployees: 50,
            isActive: true,
        });
        console.log('✅ Company A created');

        // Create admin user for Company A
        console.log('👤 Creating admin user for Company A...');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@123', salt);

        const adminUser = await User.create({
            organization: companyA._id,
            employeeId: 'ADMIN001',
            email: 'admin@companya.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'Admin',
            isEmailVerified: true,
            department: 'Management',
            designation: 'Administrator',
            employmentType: 'Full-Time',
            joiningDate: new Date(),
            phone: '+91 9876543210',
            salary: {
                basicSalary: 0,
                allowances: 0,
                deductions: 0,
                netSalary: 0,
            },
        });

        console.log('\n🎉 Company A setup complete!');
        console.log('═══════════════════════════════════════');
        console.log('🏢 Organization: Company A');
        console.log('🌐 Subdomain: companya');
        console.log('🎨 Brand Color: #ff6b6b (Red)');
        console.log('📦 Plan: Basic (50 employees max)');
        console.log('───────────────────────────────────────');
        console.log('👤 Admin Credentials:');
        console.log('   📧 Email: admin@companya.com');
        console.log('   🔑 Password: Admin@123');
        console.log('   👔 Role: Admin');
        console.log('═══════════════════════════════════════');
        console.log('\n💡 Test Data Isolation:');
        console.log('   1. Login as admin@companya.com');
        console.log('   2. Create employees in Company A');
        console.log('   3. Login as superadmin@dayflow.com');
        console.log('   4. Verify you see employees from both organizations');
        console.log('   5. Login as admin@companya.com again');
        console.log('   6. Verify you only see Company A employees\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating organization:', error.message);
        process.exit(1);
    }
};

// Run the seed function
createSecondOrganization();
