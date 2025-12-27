const axios = require("axios");

const API_URL = "http://localhost:3000";

// Test error log for consistency
const TEST_ERROR = `TypeError: Cannot read property 'name' of undefined
    at getUserName (user.js:42)
    at processUser (app.js:15)`;

let publicUser1Token, publicUser2Token, privateUser1Token, teamUser1Token, teamUser2Token;
let teamId, inviteCode;

async function signup(email, password, userType, inviteCode = null) {
    try {
        const payload = { email, password, userType };
        if (inviteCode) payload.inviteCode = inviteCode;

        const response = await axios.post(`${API_URL}/api/auth/signup`, payload);
        console.log(`✅ Signed up ${email} as ${userType}`);
        return response.data;
    } catch (error) {
        console.error(`❌ Signup failed for ${email}:`, error.response?.data || error.message);
        throw error;
    }
}

async function submitLog(token, rawLog) {
    try {
        const response = await axios.post(
            `${API_URL}/api/logs/submit`,
            { rawLog },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error("❌ Log submission failed:", error.response?.data || error.message);
        throw error;
    }
}

async function createTeam(token, name, description) {
    try {
        const response = await axios.post(
            `${API_URL}/api/teams/create`,
            { name, description },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`✅ Created team: ${name}`);
        return response.data;
    } catch (error) {
        console.error("❌ Team creation failed:", error.response?.data || error.message);
        throw error;
    }
}

async function runTests() {
    console.log("═══════════════════════════════════════");
    console.log("  User Type Isolation Tests");
    console.log("═══════════════════════════════════════\n");

    try {
        // 1. Create public users
        console.log("\n📝 Test 1: Creating Public Users");
        console.log("─────────────────────────────────────");
        const pub1 = await signup("public1@test.com", "password123", "public");
        publicUser1Token = pub1.token;

        const pub2 = await signup("public2@test.com", "password123", "public");
        publicUser2Token = pub2.token;

        // 2. Create private users
        console.log("\n📝 Test 2: Creating Private Users");
        console.log("─────────────────────────────────────");
        const priv1 = await signup("private1@test.com", "password123", "private");
        privateUser1Token = priv1.token;

        // 3. Create team and team users
        console.log("\n📝 Test 3: Creating Team");
        console.log("─────────────────────────────────────");
        const tempUser = await signup("teamcreator@test.com", "password123", "private");
        const team = await createTeam(tempUser.token, "Test Team", "A test team for verification");
        teamId = team.team.id;
        inviteCode = team.team.inviteCode;
        console.log(`   Team ID: ${teamId}`);
        console.log(`   Invite Code: ${inviteCode}`);

        console.log("\n📝 Test 4: Creating Team Users");
        console.log("─────────────────────────────────────");
        const team1 = await signup("team1@test.com", "password123", "team", inviteCode);
        teamUser1Token = team1.token;

        const team2 = await signup("team2@test.com", "password123", "team", inviteCode);
        teamUser2Token = team2.token;

        // 4. Test public user cache sharing
        console.log("\n📝 Test 5: Public User Cache Sharing");
        console.log("─────────────────────────────────────");
        console.log("   Submitting error from public user 1...");
        const pub1Log1 = await submitLog(publicUser1Token, TEST_ERROR);
        console.log(`   ✅ Public User 1 - fromCache: ${pub1Log1.fromCache} (expected: false)`);

        console.log("   Submitting SAME error from public user 2...");
        const pub2Log1 = await submitLog(publicUser2Token, TEST_ERROR);
        console.log(`   ✅ Public User 2 - fromCache: ${pub2Log1.fromCache} (expected: true)`);

        if (pub2Log1.fromCache && pub2Log1._id === pub1Log1._id) {
            console.log("   ✅ PASS: Public users share cache globally!");
        } else {
            console.log("   ❌ FAIL: Public users should share cache!");
        }

        // 5. Test private user isolation
        console.log("\n📝 Test 6: Private User Isolation");
        console.log("─────────────────────────────────────");
        console.log("   Submitting SAME error from private user...");
        const priv1Log1 = await submitLog(privateUser1Token, TEST_ERROR);
        console.log(`   ✅ Private User - fromCache: ${priv1Log1.fromCache} (expected: false)`);

        if (!priv1Log1.fromCache && priv1Log1._id !== pub1Log1._id) {
            console.log("   ✅ PASS: Private user is isolated from public cache!");
        } else {
            console.log("   ❌ FAIL: Private user should be isolated!");
        }

        // 6. Test team user cache sharing
        console.log("\n📝 Test 7: Team User Cache Sharing");
        console.log("─────────────────────────────────────");
        console.log("   Submitting error from team user 1...");
        const team1Log1 = await submitLog(teamUser1Token, TEST_ERROR);
        console.log(`   ✅ Team User 1 - fromCache: ${team1Log1.fromCache} (expected: false)`);

        console.log("   Submitting SAME error from team user 2 (same team)...");
        const team2Log1 = await submitLog(teamUser2Token, TEST_ERROR);
        console.log(`   ✅ Team User 2 - fromCache: ${team2Log1.fromCache} (expected: true)`);

        if (team2Log1.fromCache && team2Log1._id === team1Log1._id) {
            console.log("   ✅ PASS: Team users share cache within team!");
        } else {
            console.log("   ❌ FAIL: Team users should share cache within team!");
        }

        // 7. Test cross-type isolation
        console.log("\n📝 Test 8: Cross-Type Isolation");
        console.log("─────────────────────────────────────");
        console.log("   Verifying all log IDs are different across types...");
        const ids = [pub1Log1._id, priv1Log1._id, team1Log1._id];
        const uniqueIds = new Set(ids);

        if (uniqueIds.size === 3) {
            console.log("   ✅ PASS: Each user type has separate cache!");
            console.log(`      Public log ID: ${pub1Log1._id}`);
            console.log(`      Private log ID: ${priv1Log1._id}`);
            console.log(`      Team log ID: ${team1Log1._id}`);
        } else {
            console.log("   ❌ FAIL: User types should have separate caches!");
        }

        console.log("\n═══════════════════════════════════════");
        console.log("  ✅ All Tests Complete!");
        console.log("═══════════════════════════════════════\n");

    } catch (error) {
        console.error("\n❌ Test suite failed:", error.message);
        process.exit(1);
    }
}

// Run tests
console.log("\n⚠️  Make sure the backend server is running on http://localhost:3000\n");
runTests().then(() => {
    console.log("✅ Test suite completed successfully!");
    process.exit(0);
}).catch((error) => {
    console.error("❌ Test suite failed:", error);
    process.exit(1);
});
