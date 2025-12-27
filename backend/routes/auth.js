const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Team = require("../models/Team");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, userType, inviteCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Validate userType
    const validUserTypes = ['public', 'private', 'team'];
    const selectedUserType = userType || 'private';

    if (!validUserTypes.includes(selectedUserType)) {
      return res.status(400).json({ error: "Invalid user type. Must be 'public', 'private', or 'team'" });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    let teamId = null;
    let teamRole = 'member';

    // If user type is 'team', validate and find team
    if (selectedUserType === 'team') {
      if (!inviteCode) {
        return res.status(400).json({ error: "Invite code is required for team users" });
      }

      const team = await Team.findOne({ inviteCode });
      if (!team) {
        return res.status(400).json({ error: "Invalid invite code" });
      }

      teamId = team._id;
    }

    const user = new User({
      email: normalizedEmail,
      password,
      userType: selectedUserType,
      teamId,
      teamRole
    });
    await user.save();

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        userType: user.userType,
        teamId: user.teamId ? user.teamId.toString() : null,
        teamRole: user.teamRole
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        teamId: user.teamId,
        teamRole: user.teamRole
      }
    });
  } catch (err) {
    console.error("Signup error:", err);

    // Handle MongoDB duplicate key error
    if (err.code === 11000 || err.code === 11001) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ error: errors });
    }

    res.status(500).json({
      error: "Server error",
      message: process.env.NODE_ENV === 'development' ? err.message : "An unexpected error occurred"
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        userType: user.userType,
        teamId: user.teamId ? user.teamId.toString() : null,
        teamRole: user.teamRole
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        teamId: user.teamId,
        teamRole: user.teamRole
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      error: "Server error",
      message: err.message || "An unexpected error occurred"
    });
  }
});

module.exports = router;

