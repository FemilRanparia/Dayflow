const mongoose = require('mongoose');
require('dotenv').config();

async function clearDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Drop all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📋 Found ${collections.length} collections:`);
    
    for (const collection of collections) {
      console.log(`  - Dropping "${collection.name}"...`);
      await mongoose.connection.db.dropCollection(collection.name);
    }
    
    console.log('\n✅ All collections cleared successfully!');
    console.log('🚀 You can now register new users without duplicate key errors.');
    
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    process.exit(1);
  }
}

clearDatabase();
