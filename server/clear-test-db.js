const mongoose = require('mongoose');
require('dotenv').config();

async function clearTestDatabase() {
  const testDatabaseURI = 'mongodb+srv://pfemil94_db_user:Bt3RcnXTA4w68Lcj@dayflow.jeuxcl6.mongodb.net/test?appName=Dayflow';
  
  try {
    console.log('🔄 Connecting to TEST database...');
    await mongoose.connect(testDatabaseURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to TEST database');

    // Drop all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('\n📋 No collections found in TEST database - already empty!');
    } else {
      console.log(`\n📋 Found ${collections.length} collections in TEST database:`);
      
      for (const collection of collections) {
        console.log(`  - Dropping "${collection.name}"...`);
        await mongoose.connection.db.dropCollection(collection.name);
      }
      
      console.log('\n✅ All collections in TEST database cleared successfully!');
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    console.log('\n🎯 Next: Restart your servers to use the DAYFLOW database');
  } catch (error) {
    console.error('❌ Error clearing test database:', error.message);
    process.exit(1);
  }
}

clearTestDatabase();
