const mongoose = require('mongoose');
require('dotenv').config();

async function checkDayflowDatabase() {
  try {
    console.log('🔄 Connecting to DAYFLOW database...');
    console.log(`📍 Connection String: ${process.env.MONGODB_URI}`);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to DAYFLOW database');

    // Get database name
    const dbName = mongoose.connection.name;
    console.log(`\n📊 Database: ${dbName}`);

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📋 Collections (${collections.length}):`);
    
    if (collections.length === 0) {
      console.log('   ❌ No collections found - database is empty!');
    } else {
      for (const collection of collections) {
        const count = await mongoose.connection.collection(collection.name).countDocuments();
        console.log(`   ✅ ${collection.name} (${count} documents)`);
      }
    }

    // Check users specifically
    const usersCollection = mongoose.connection.collection('users');
    const userCount = await usersCollection.countDocuments();
    
    console.log(`\n👥 Users in Database:`);
    if (userCount === 0) {
      console.log('   ❌ NO USERS FOUND - You need to register first!');
      console.log('\n🎯 Next Steps:');
      console.log('   1. Go to http://localhost:3002');
      console.log('   2. Click "Create Account"');
      console.log('   3. Register with a new user');
      console.log('   4. Then try to login');
    } else {
      console.log(`   ✅ ${userCount} user(s) found`);
      
      // List users
      const users = await usersCollection.find({}).toArray();
      users.forEach(user => {
        console.log(`      - ${user.email} (ID: ${user.employeeId})`);
      });
    }

    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    process.exit(1);
  }
}

checkDayflowDatabase();
