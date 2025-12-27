const axios = require("axios");

const API_URL = "http://localhost:3000";

let adminToken, memberToken, teamId, inviteCode, memberId;

async function signup(email, password, userType, inviteCode = null) {
    const payload = { email, password, userType };
    if (inviteCode) payload.inviteCode = inviteCode;
    const response = await axios.post(`${API_URL}/api/auth/signup`, payload);
    return response.data;
}

async function createTeam(token, name, description) {
    const response = await axios.post(
        `${API_URL}/api/teams/create`,
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
}

async function getMyTeam(token) {
    const response = await axios.get(`${API_URL}/api/teams/my-team`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

async function joinTeam(token, inviteCode) {
    const response = await axios.post(
        `${API_URL}/api/teams/join`,
        { inviteCode },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
}

async function removeMember(token, teamId, userId) {
    const response = await axios.delete(
        `${API_URL}/api/teams/${teamId}/remove/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
}

async function leaveTeam(token) {
    const response = await axios.delete(`${API_URL}/api/teams/leave`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

async function runTests() {
    console.log("═══════════════════════════════════════");
    console.log("  Team Management Tests");
    console.log("═══════════════════════════════════════\n");

    try {
        // 1. Create team admin
        console.log("📝 Test 1: Creating Team Admin");
        console.log("─────────────────────────────────────");
        const admin = await signup("admin@team.com", "password123", "private");
        adminToken = admin.token;
        console.log(`✅ Created admin user: ${admin.user.email}`);

        // 2. Create team
        console.log("\n📝 Test 2: Creating Team");
        console.log("─────────────────────────────────────");
        const team = await createTeam(adminToken, "Engineering Team", "Software engineering team");
        teamId = team.team.id;
        inviteCode = team.team.inviteCode;
        console.log(`✅ Team created: ${team.team.name}`);
        console.log(`   Team ID: ${teamId}`);
        console.log(`   Invite Code: ${inviteCode}`);

        // 3. Join team as member
        console.log("\n📝 Test 3: Joining Team via Invite Code");
        console.log("─────────────────────────────────────");
        const member = await signup("member@team.com", "password123", "team", inviteCode);
        memberToken = member.token;
        memberId = member.user.id;
        console.log(`✅ Member joined: ${member.user.email}`);
        console.log(`   User Type: ${member.user.userType}`);
        console.log(`   Team Role: ${member.user.teamRole}`);

        // 4. Get team info
        console.log("\n📝 Test 4: Getting Team Information");
        console.log("─────────────────────────────────────");
        const teamInfo = await getMyTeam(adminToken);
        console.log(`✅ Team: ${teamInfo.team.name}`);
        console.log(`   Members: ${teamInfo.members.length}`);
        console.log(`   Your Role: ${teamInfo.yourRole}`);

        teamInfo.members.forEach((m, i) => {
            console.log(`   ${i + 1}. ${m.email} (${m.teamRole})`);
        });

        // 5. Test member permissions (should fail)
        console.log("\n📝 Test 5: Testing Member Permissions");
        console.log("─────────────────────────────────────");
        try {
            await removeMember(memberToken, teamId, adminToken);
            console.log("❌ FAIL: Member should not be able to remove others!");
        } catch (error) {
            if (error.response?.status === 403) {
                console.log("✅ PASS: Member correctly denied admin permissions");
            } else {
                throw error;
            }
        }

        // 6. Test admin removing member
        console.log("\n📝 Test 6: Admin Removing Member");
        console.log("─────────────────────────────────────");
        const removeResult = await removeMember(adminToken, teamId, memberId);
        console.log(`✅ ${removeResult.message}`);

        // 7. Verify member was removed
        console.log("\n📝 Test 7: Verifying Member Removal");
        console.log("─────────────────────────────────────");
        const updatedTeamInfo = await getMyTeam(adminToken);
        console.log(`✅ Team members after removal: ${updatedTeamInfo.members.length}`);

        if (updatedTeamInfo.members.length === 1) {
            console.log("✅ PASS: Member successfully removed!");
        } else {
            console.log("❌ FAIL: Member count should be 1!");
        }

        // 8. Re-join and test leave
        console.log("\n📝 Test 8: Re-joining and Leaving Team");
        console.log("─────────────────────────────────────");
        const newMember = await signup("newmember@team.com", "password123", "team", inviteCode);
        console.log(`✅ New member joined: ${newMember.user.email}`);

        const leaveResult = await leaveTeam(newMember.token);
        console.log(`✅ ${leaveResult.message}`);

        console.log("\n═══════════════════════════════════════");
        console.log("  ✅ All Team Tests Complete!");
        console.log("═══════════════════════════════════════\n");

    } catch (error) {
        console.error("\n❌ Test failed:", error.response?.data || error.message);
        process.exit(1);
    }
}

console.log("\n⚠️  Make sure the backend server is running on http://localhost:3000\n");
runTests().then(() => {
    console.log("✅ Team management tests completed successfully!");
    process.exit(0);
}).catch((error) => {
    console.error("❌ Tests failed:", error);
    process.exit(1);
});
