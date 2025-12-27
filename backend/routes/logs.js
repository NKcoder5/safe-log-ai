const express = require("express");
const router = express.Router();
const axios = require("axios");
const ErrorLog = require("../models/ErrorLog");
const generateFingerprint = require("../utils/fingerprint");
const { maskLog } = require("../services/presidioService");
const authenticateToken = require("../middleware/auth");

const NIM_CHAT_COMPLETIONS_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NIM_MODEL = "meta/llama-4-maverick-17b-128e-instruct";

async function generateAiSolution(maskedLog) {
  const apiKey = process.env.NVIDIA_NIM_API_KEY || process.env.NIM_API_KEY || process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NVIDIA NIM API key");
  }

  const response = await axios.post(
    NIM_CHAT_COMPLETIONS_URL,
    {
      model: NIM_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a backend debugging assistant. You will be given a masked error log. Only use evidence present in the log. Do not invent stack traces, line numbers, files, services, or runtime context. Output plain text only (no markdown). Provide: (1) Root cause, (2) Why it occurred, (3) Step-by-step solution, (4) Preventive measures."
        },
        { role: "user", content: `Masked error log:\n${maskedLog}` }
      ],
      max_tokens: 512,
      stream: false
    },
    {
      timeout: 12000,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    }
  );

  const content =
    response?.data?.choices?.[0]?.message?.content ??
    response?.data?.choices?.[0]?.text ??
    null;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Empty AI response");
  }

  return content.trim();
}

// Submit error log
router.post("/submit", authenticateToken, async (req, res) => {
  const { rawLog } = req.body;
  const userId = req.userId;
  const userType = req.userType;
  const teamId = req.teamId;

  try {
    const maskedLog = await maskLog(rawLog);
    const fingerprint = generateFingerprint(maskedLog);
    const legacyFingerprint = generateFingerprint(rawLog);

    let cacheQuery;

    // Build cache query based on user type
    if (userType === 'public') {
      // Public users: search across all public users' logs
      cacheQuery = {
        userType: 'public',
        fingerprint: { $in: [fingerprint, legacyFingerprint] }
      };
    } else if (userType === 'private') {
      // Private users: search only their own logs
      cacheQuery = {
        userId,
        fingerprint: { $in: [fingerprint, legacyFingerprint] }
      };
    } else if (userType === 'team') {
      // Team users: search within team logs
      if (!teamId) {
        return res.status(400).json({ error: "Team user must have a valid teamId" });
      }
      cacheQuery = {
        userType: 'team',
        teamId,
        fingerprint: { $in: [fingerprint, legacyFingerprint] }
      };
    } else {
      return res.status(400).json({ error: "Invalid user type" });
    }

    let existingLog = await ErrorLog.findOne(cacheQuery);

    if (existingLog) {
      existingLog.hitCount += 1;
      await existingLog.save();

      // Return current user's log, not the cached team member's log
      // Only the AI solution is shared across team members
      // Don't return maskedLog for cache hits - it wasn't sent to AI
      return res.json({
        fromCache: true,
        solution: existingLog.aiSolution,    // ✅ Shared AI solution (correct)
        originalLog: rawLog,                 // ✅ Current user's log (privacy preserved)
        // maskedLog: NOT included - only shown for first submission
        hitCount: existingLog.hitCount,
        _id: existingLog._id
      });
    }

    const aiSolution = await generateAiSolution(maskedLog);

    const newLog = new ErrorLog({
      userId,
      userType,
      teamId: userType === 'team' ? teamId : null,
      fingerprint,
      originalLog: rawLog,      // ADDED: Store original for user
      maskedLog,                // Store masked for AI
      aiSolution
    });

    await newLog.save();

    res.json({
      fromCache: false,
      message: aiSolution,
      solution: aiSolution,
      originalLog: newLog.originalLog,  // ADDED: Return original to user
      maskedLog: newLog.maskedLog,
      hitCount: newLog.hitCount,
      _id: newLog._id
    });

  } catch (err) {
    console.error("Log submission error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get error log by ID
router.get('/get/:id', authenticateToken, async (req, res) => {
  try {
    const log = await ErrorLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });

    const userId = req.userId;
    const userType = req.userType;
    const teamId = req.teamId;

    // Access control based on user type
    if (userType === 'private') {
      // Private users can only access their own logs
      if (log.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (userType === 'team') {
      // Team users can access logs from their team
      if (!log.teamId || log.teamId.toString() !== teamId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (userType === 'public') {
      // Public users can access any public log
      if (log.userType !== 'public') {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's log history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const userType = req.userType;
    const teamId = req.teamId;

    let query;

    // Build query based on user type
    if (userType === 'public') {
      // Public users see all public logs
      query = { userType: 'public' };
    } else if (userType === 'private') {
      // Private users see only their own logs
      query = { userId };
    } else if (userType === 'team') {
      // Team users see their team's logs
      query = { userType: 'team', teamId };
    }

    const logs = await ErrorLog.find(query)
      .sort({ createdAt: -1 })
      .select('_id maskedLog aiSolution hitCount createdAt updatedAt userId');

    res.json(logs);
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
