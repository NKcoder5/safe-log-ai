// Migration script to add originalLog field to existing error logs
// Run with: node scripts/migrate-add-originalLog.js

const mongoose = require('mongoose');
require('dotenv').config();

const ErrorLog = require('../models/ErrorLog');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/safe-ai';

async function migrateErrorLogs() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all error logs without originalLog field
        const logsWithoutOriginal = await ErrorLog.find({ originalLog: { $exists: false } });

        console.log(`Found ${logsWithoutOriginal.length} error logs without originalLog field\n`);

        if (logsWithoutOriginal.length === 0) {
            console.log('✅ All error logs already have originalLog field!');
            return;
        }

        console.log('⚠️  Migrating error logs...');
        console.log('   Strategy: Copy maskedLog to originalLog for existing records');
        console.log('   (This is a fallback - ideally we\'d have the original, but it wasn\'t stored)\n');

        let updated = 0;
        for (const log of logsWithoutOriginal) {
            // Copy maskedLog to originalLog as fallback
            // This means old logs will show masked version to users
            // But new logs will show the real error
            log.originalLog = log.maskedLog;
            await log.save();
            updated++;

            if (updated % 10 === 0) {
                console.log(`   Migrated ${updated}/${logsWithoutOriginal.length} logs...`);
            }
        }

        console.log(`\n✅ Successfully migrated ${updated} error logs`);
        console.log('\n📝 Note: Existing logs will show masked version to users');
        console.log('   New logs submitted after this migration will show original errors\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('✅ Disconnected from MongoDB');
    }
}

migrateErrorLogs();
