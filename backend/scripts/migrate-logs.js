require("dotenv").config();
const mongoose = require("mongoose");
const ErrorLog = require("../models/ErrorLog");
const User = require("../models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/safe-log-ai";

async function migrateLogs(dryRun = true) {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB\n");

        if (dryRun) {
            console.log("🔍 DRY RUN MODE - No changes will be made\n");
        } else {
            console.log("⚠️  LIVE MODE - Changes will be applied!\n");
        }

        // Find logs without userType field
        const logsToMigrate = await ErrorLog.find({
            $or: [
                { userType: { $exists: false } },
                { teamId: { $exists: false } }
            ]
        }).limit(1000); // Process in batches

        console.log(`📊 Found ${logsToMigrate.length} logs to migrate (batch limit: 1000)\n`);

        if (logsToMigrate.length === 0) {
            console.log("✅ No logs need migration. All logs are up to date!");
            return;
        }

        let migrated = 0;
        let errors = 0;

        for (const log of logsToMigrate) {
            try {
                // Find the user who created this log
                const user = await User.findById(log.userId);

                if (!user) {
                    console.log(`⚠️  Log ${log._id}: User ${log.userId} not found, defaulting to private`);
                    if (!dryRun) {
                        log.userType = 'private';
                        log.teamId = null;
                        await log.save();
                    }
                    migrated++;
                    continue;
                }

                const userType = user.userType || 'private';
                const teamId = user.teamId || null;

                if (!dryRun) {
                    log.userType = userType;
                    log.teamId = teamId;
                    await log.save();
                }

                if (migrated % 100 === 0) {
                    console.log(`  Processed ${migrated} logs...`);
                }

                migrated++;
            } catch (err) {
                console.error(`❌ Error migrating log ${log._id}:`, err.message);
                errors++;
            }
        }

        if (!dryRun) {
            console.log(`\n✅ Migration complete! Migrated ${migrated} logs.`);
            if (errors > 0) {
                console.log(`⚠️  ${errors} errors occurred during migration.`);
            }
        } else {
            console.log(`\n📋 Dry run complete. ${logsToMigrate.length} logs would be migrated.`);
            console.log("\n💡 To apply changes, run: node scripts/migrate-logs.js --live");
        }

        // Check if there are more logs to migrate
        const remainingLogs = await ErrorLog.countDocuments({
            $or: [
                { userType: { $exists: false } },
                { teamId: { $exists: false } }
            ]
        });

        if (remainingLogs > 0) {
            console.log(`\n⚠️  ${remainingLogs} more logs need migration. Run this script again.`);
        }

    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("\n🔌 Disconnected from MongoDB");
    }
}

// Check command line arguments
const args = process.argv.slice(2);
const isLive = args.includes('--live');

console.log("═══════════════════════════════════════");
console.log("  ErrorLog Migration Script");
console.log("═══════════════════════════════════════\n");

if (!isLive) {
    console.log("⚠️  IMPORTANT: Make sure you have a backup of your database before running in live mode!\n");
    console.log("⚠️  Run user migration (migrate-users.js) first before migrating logs!\n");
}

migrateLogs(!isLive).then(() => {
    process.exit(0);
});
