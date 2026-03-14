const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fixIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const collection = mongoose.connection.collection('users');

        // List all indexes
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes.map(i => i.name));

        // Indexes to drop (old global unique indexes)
        const toDrop = ['employeeId_1', 'email_1'];

        for (const indexName of toDrop) {
            if (indexes.find(i => i.name === indexName)) {
                console.log(`Dropping global index: ${indexName}...`);
                await collection.dropIndex(indexName);
                console.log(`Dropped ${indexName}`);
            }
        }

        console.log('Indexes fixed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing indexes:', error);
        process.exit(1);
    }
};

fixIndexes();
