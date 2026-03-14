require('dotenv').config();
const mongoose = require('mongoose');

const cleanupOldData = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get collections
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');
        const attendanceCollection = db.collection('attendances');
        const leavesCollection = db.collection('leaves');

        // Find users without organization
        const usersWithoutOrg = await usersCollection.find({
            organization: { $exists: false }
        }).toArray();

        console.log(`📊 Found ${usersWithoutOrg.length} users without organization\n`);

        if (usersWithoutOrg.length === 0) {
            console.log('✅ No old data to clean up!');
            await mongoose.connection.close();
            process.exit(0);
        }

        // Display users that will be deleted
        console.log('👥 Users to be deleted:');
        usersWithoutOrg.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
        });
        console.log('');

        // Get user IDs
        const userIds = usersWithoutOrg.map(u => u._id);

        // Find related attendance records
        const attendanceCount = await attendanceCollection.countDocuments({
            user: { $in: userIds }
        });
        console.log(`📅 Found ${attendanceCount} attendance records to delete`);

        // Find related leave records
        const leaveCount = await leavesCollection.countDocuments({
            user: { $in: userIds }
        });
        console.log(`🏖️  Found ${leaveCount} leave records to delete\n`);

        // Confirm deletion
        console.log('⚠️  WARNING: This will permanently delete:');
        console.log(`   - ${usersWithoutOrg.length} users`);
        console.log(`   - ${attendanceCount} attendance records`);
        console.log(`   - ${leaveCount} leave records\n`);
        console.log('🔄 Proceeding with deletion...\n');

        // Delete attendance records
        if (attendanceCount > 0) {
            const attendanceResult = await attendanceCollection.deleteMany({
                user: { $in: userIds }
            });
            console.log(`✅ Deleted ${attendanceResult.deletedCount} attendance records`);
        }

        // Delete leave records
        if (leaveCount > 0) {
            const leaveResult = await leavesCollection.deleteMany({
                user: { $in: userIds }
            });
            console.log(`✅ Deleted ${leaveResult.deletedCount} leave records`);
        }

        // Delete users
        const userResult = await usersCollection.deleteMany({
            organization: { $exists: false }
        });
        console.log(`✅ Deleted ${userResult.deletedCount} users without organization\n`);

        // Summary
        console.log('🎉 Cleanup completed successfully!');
        console.log('\n📊 Current database state:');

        const remainingUsers = await usersCollection.countDocuments();
        const usersWithOrg = await usersCollection.countDocuments({
            organization: { $exists: true }
        });

        console.log(`   Total users: ${remainingUsers}`);
        console.log(`   Users with organization: ${usersWithOrg}`);
        console.log(`   Users without organization: ${remainingUsers - usersWithOrg}\n`);

        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

// Run cleanup
cleanupOldData();
