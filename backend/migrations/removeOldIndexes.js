require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

/**
 * Migration Script: Remove Old Unique Indexes
 * 
 * This script removes the old global unique indexes on employeeId and email
 * that were created before multi-tenancy was implemented.
 * 
 * Run with: node backend/migrations/removeOldIndexes.js
 */

const removeOldIndexes = async () => {
    try {
        // Connect to database
        await connectDB();
        console.log('📦 Connected to database');

        const db = mongoose.connection.db;

        // Drop old indexes from users collection
        console.log('🔧 Removing old indexes from users collection...');

        try {
            await db.collection('users').dropIndex('employeeId_1');
            console.log('✅ Dropped employeeId_1 index');
        } catch (error) {
            if (error.code === 27) {
                console.log('ℹ️  employeeId_1 index does not exist (already removed)');
            } else {
                console.log('⚠️  Error dropping employeeId_1:', error.message);
            }
        }

        try {
            await db.collection('users').dropIndex('email_1');
            console.log('✅ Dropped email_1 index');
        } catch (error) {
            if (error.code === 27) {
                console.log('ℹ️  email_1 index does not exist (already removed)');
            } else {
                console.log('⚠️  Error dropping email_1:', error.message);
            }
        }

        // List current indexes
        console.log('\n📋 Current indexes on users collection:');
        const indexes = await db.collection('users').indexes();
        indexes.forEach(index => {
            console.log(`   - ${index.name}:`, Object.keys(index.key).join(', '));
        });

        console.log('\n✅ Migration complete!');
        console.log('💡 New compound indexes (organization + employeeId/email) are managed by Mongoose schema');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
};

// Run the migration
removeOldIndexes();
