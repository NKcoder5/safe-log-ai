// Clean up old teams with UUID codes and test new format
// Run with: node scripts/cleanup-old-teams.js

const mongoose = require('mongoose');
require('dotenv').config();

const Team = require('../models/Team');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/safe-ai';

async function cleanupOldTeams() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all teams with UUID format codes (longer than 9 characters)
        const oldTeams = await Team.find({
            inviteCode: { $regex: /.{10,}/ }  // More than 9 chars (XXXX-XXXX is 9)
        });

        console.log(`Found ${oldTeams.length} teams with old UUID format codes\n`);

        if (oldTeams.length > 0) {
            console.log('Old teams:');
            oldTeams.forEach(team => {
                console.log(`  - ${team.name}: ${team.inviteCode}`);
            });

            console.log('\n⚠️  These teams will be deleted.');
            console.log('Users in these teams will be reset to private type.\n');

            // Reset users in these teams
            const teamIds = oldTeams.map(t => t._id);
            const result = await User.updateMany(
                { teamId: { $in: teamIds } },
                {
                    $set: {
                        userType: 'private',
                        teamRole: null
                    },
                    $unset: { teamId: '' }
                }
            );

            console.log(`✅ Reset ${result.modifiedCount} users to private type`);

            // Delete old teams
            const deleteResult = await Team.deleteMany({
                _id: { $in: teamIds }
            });

            console.log(`✅ Deleted ${deleteResult.deletedCount} old teams\n`);
        } else {
            console.log('✅ No old teams found. All teams use new format!\n');
        }

        // Show current teams
        const currentTeams = await Team.find({});
        console.log(`Current teams in database: ${currentTeams.length}`);
        if (currentTeams.length > 0) {
            currentTeams.forEach(team => {
                console.log(`  - ${team.name}: ${team.inviteCode} (${team.inviteCode.length} chars)`);
            });
        }

        console.log('\n✅ Cleanup complete!');
        console.log('Now create a new team to test the new format.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

cleanupOldTeams();
