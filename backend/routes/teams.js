const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Team = require("../models/Team");
const User = require("../models/User");
const authenticateToken = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Create a new team
router.post("/create", authenticateToken, async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.userId;

        console.log('\n🎯 === TEAM CREATION START ===');
        console.log('User ID:', userId);
        console.log('Team Name:', name);

        if (!name) {
            return res.status(400).json({ error: "Team name is required" });
        }

        // Check if team name already exists
        const existingTeam = await Team.findOne({ name: name.trim() });
        if (existingTeam) {
            return res.status(400).json({ error: "Team name already exists" });
        }

        const team = new Team({
            name: name.trim(),
            description: description || "",
            createdBy: userId
        });

        await team.save();
        console.log('✅ Team created in DB:', {
            id: team._id,
            name: team.name,
            inviteCode: team.inviteCode
        });

        // Update user to be part of this team as admin
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                userType: 'team',
                teamId: team._id,
                teamRole: 'admin'
            },
            { new: true }
        );

        console.log('✅ User updated in DB:', {
            id: updatedUser._id,
            email: updatedUser.email,
            userType: updatedUser.userType,
            teamId: updatedUser.teamId,
            teamRole: updatedUser.teamRole
        });

        // Generate new JWT token with updated user info
        const tokenPayload = {
            userId: updatedUser._id.toString(),
            email: updatedUser.email,
            userType: updatedUser.userType,
            teamId: updatedUser.teamId ? updatedUser.teamId.toString() : null,
            teamRole: updatedUser.teamRole
        };

        console.log('🔐 JWT Payload:', tokenPayload);

        const newToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });

        console.log('✅ JWT Token generated');
        console.log('Token (first 50 chars):', newToken.substring(0, 50) + '...');

        const responseData = {
            token: newToken,
            team: {
                id: team._id,
                name: team.name,
                description: team.description,
                inviteCode: team.inviteCode,
                createdAt: team.createdAt
            },
            user: {
                id: updatedUser._id,
                email: updatedUser.email,
                userType: updatedUser.userType,
                teamId: updatedUser.teamId,
                teamRole: updatedUser.teamRole
            }
        };

        console.log('📤 Sending response with teamId:', responseData.user.teamId);
        console.log('🎯 === TEAM CREATION END ===\n');

        res.status(201).json(responseData);
    } catch (err) {
        console.error("❌ Team creation error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Join a team via invite code
router.post("/join", authenticateToken, async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const userId = req.userId;

        if (!inviteCode) {
            return res.status(400).json({ error: "Invite code is required" });
        }

        const team = await Team.findOne({ inviteCode: inviteCode.trim() });
        if (!team) {
            return res.status(404).json({ error: "Invalid invite code" });
        }

        // Update user to join this team
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                userType: 'team',
                teamId: team._id,
                teamRole: 'member'
            },
            { new: true }
        );

        // Generate new JWT token with updated user info
        const newToken = jwt.sign(
            {
                userId: updatedUser._id.toString(),
                email: updatedUser.email,
                userType: updatedUser.userType,
                teamId: updatedUser.teamId ? updatedUser.teamId.toString() : null,
                teamRole: updatedUser.teamRole
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token: newToken,
            message: "Successfully joined team",
            team: {
                id: team._id,
                name: team.name,
                description: team.description
            },
            user: {
                id: updatedUser._id,
                email: updatedUser.email,
                userType: updatedUser.userType,
                teamId: updatedUser.teamId,
                teamRole: updatedUser.teamRole
            }
        });
    } catch (err) {
        console.error("Team join error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Get current user's team information
router.get("/my-team", authenticateToken, async (req, res) => {
    try {
        const teamId = req.teamId;

        if (!teamId) {
            return res.status(404).json({ message: "You are not part of any team" });
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        // Get team members
        const members = await User.find({ teamId })
            .select('_id email teamRole createdAt')
            .lean();

        res.json({
            team: {
                id: team._id,
                name: team.name,
                description: team.description,
                inviteCode: team.inviteCode,
                createdBy: team.createdBy,
                createdAt: team.createdAt
            },
            members,
            yourRole: req.teamRole
        });
    } catch (err) {
        console.error("Get team error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Get team members (team members only)
router.get("/:id/members", authenticateToken, async (req, res) => {
    try {
        const teamId = req.params.id;
        const userTeamId = req.teamId;

        // Verify user is part of this team
        if (!userTeamId || userTeamId !== teamId) {
            return res.status(403).json({ error: "Access denied. You are not a member of this team." });
        }

        const members = await User.find({ teamId })
            .select('_id email teamRole createdAt')
            .lean();

        res.json({ members });
    } catch (err) {
        console.error("Get members error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Leave current team
router.delete("/leave", authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const teamId = req.teamId;

        if (!teamId) {
            return res.status(400).json({ error: "You are not part of any team" });
        }

        // Update user to remove team association
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                userType: 'private',
                teamId: null,
                teamRole: null
            },
            { new: true }
        );

        // Generate new JWT token with updated user info
        const newToken = jwt.sign(
            {
                userId: updatedUser._id.toString(),
                email: updatedUser.email,
                userType: updatedUser.userType,
                teamId: null,
                teamRole: null
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token: newToken,
            message: "Successfully left the team",
            user: {
                id: updatedUser._id,
                email: updatedUser.email,
                userType: updatedUser.userType,
                teamId: null,
                teamRole: null
            }
        });
    } catch (err) {
        console.error("Leave team error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Remove a member from team (admin only)
router.delete("/:id/remove/:userId", authenticateToken, async (req, res) => {
    try {
        const teamId = req.params.id;
        const targetUserId = req.params.userId;
        const adminTeamId = req.teamId;
        const adminRole = req.teamRole;

        // Verify admin is part of this team and has admin role
        if (!adminTeamId || adminTeamId !== teamId) {
            return res.status(403).json({ error: "Access denied. You are not a member of this team." });
        }

        if (adminRole !== 'admin') {
            return res.status(403).json({ error: "Access denied. Only team admins can remove members." });
        }

        // Prevent admin from removing themselves
        if (req.userId === targetUserId) {
            return res.status(400).json({ error: "You cannot remove yourself. Use the leave endpoint instead." });
        }

        // Verify target user is part of this team
        const targetUser = await User.findById(targetUserId);
        if (!targetUser || !targetUser.teamId || targetUser.teamId.toString() !== teamId) {
            return res.status(404).json({ error: "User not found in this team" });
        }

        // Remove user from team
        await User.findByIdAndUpdate(targetUserId, {
            userType: 'private',
            teamId: null,
            teamRole: null
        });

        res.json({ message: "Member removed successfully" });
    } catch (err) {
        console.error("Remove member error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Update team settings (admin only)
router.put("/:id", authenticateToken, async (req, res) => {
    try {
        const teamId = req.params.id;
        const { name, description, settings } = req.body;
        const adminTeamId = req.teamId;
        const adminRole = req.teamRole;

        // Verify admin is part of this team and has admin role
        if (!adminTeamId || adminTeamId !== teamId) {
            return res.status(403).json({ error: "Access denied. You are not a member of this team." });
        }

        if (adminRole !== 'admin') {
            return res.status(403).json({ error: "Access denied. Only team admins can update team settings." });
        }

        const updateData = {};
        if (name) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description;
        if (settings) updateData.settings = settings;

        const team = await Team.findByIdAndUpdate(teamId, updateData, { new: true });

        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }

        res.json({
            message: "Team updated successfully",
            team: {
                id: team._id,
                name: team.name,
                description: team.description,
                settings: team.settings
            }
        });
    } catch (err) {
        console.error("Update team error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
