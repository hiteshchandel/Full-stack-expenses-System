const path = require('path');
const sequelize = require('../config/db'); // your Sequelize instance
const migration = require('../migrations/20250907-add-note-to-expense'); // correct path

async function runMigration() {
    try {
        await migration.up(sequelize.getQueryInterface(), require('sequelize'));
        console.log('✅ Migration ran successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

runMigration();
