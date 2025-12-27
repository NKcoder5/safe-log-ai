require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/safe-log-ai";

async function migrateUsers(dryRun = true) {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB\n");

        if (dryRun) {
            console.log("🔍 DRY RUN MODE - No changes will be made\n");
        } else {
            console.log("⚠️  LIVE MODE - Changes will be applied!\n");
        }

        // Find users without userType field
        const usersToMigrate = await User.find({
            $or: [
                { userType: { $exists: false } },
                { teamId: { $exists: false } },
                { teamRole: { $exists: false } }
            ]
        });

        console.log(`📊 Found ${usersToMigrate.length} users to migrate\n`);

        if (usersToMigrate.length === 0) {
            console.log("✅ No users need migration. All users are up to date!");
            return;
        }

        let migrated = 0;
        for (const user of usersToMigrate) {
            console.log(`User: ${user.email}`);
            console.log(`  Current userType: ${user.userType || 'NOT SET'}`);
            console.log(`  Current teamId: ${user.teamId || 'NOT SET'}`);
            console.log(`  Current teamRole: ${user.teamRole || 'NOT SET'}`);

            if (!dryRun) {
                // Set default values for missing fields
                if (!user.userType) user.userType = 'private';
                if (user.teamId === undefined) user.teamId = null;
                if (!user.teamRole) user.teamRole = 'member';

                await user.save();
                console.log(`  ✅ Migrated to: userType='private', teamId=null, teamRole='member'\n`);
                migrated++;
            } else {
                console.log(`  → Would migrate to: userType='private', teamId=null, teamRole='member'\n`);
            }
        }

        if (!dryRun) {
            console.log(`\n✅ Migration complete! Migrated ${migrated} users.`);
        } else {
            console.log(`\n📋 Dry run complete. ${usersToMigrate.length} users would be migrated.`);
            console.log("\n💡 To apply changes, run: node scripts/migrate-users.js --live");
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
console.log("  User Migration Script");
console.log("═══════════════════════════════════════\n");

if (!isLive) {
    console.log("⚠️  IMPORTANT: Make sure you have a backup of your database before running in live mode!\n");
}

migrateUsers(!isLive).then(() => {
    process.exit(0);
});
