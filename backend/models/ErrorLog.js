const mongoose = require("mongoose");

const ErrorLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['public', 'private', 'team'],
    required: true
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  fingerprint: {
    type: String,
    required: true
  },
  originalLog: {
    type: String,
    required: false,  // CHANGED: Make optional
    default: function () {
      return this.maskedLog;  // Default to maskedLog if not provided
    }
  },
  maskedLog: {
    type: String,
    required: true
  },
  aiSolution: {
    type: String,
    default: null
  },
  hitCount: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

// Compound index for efficient cache lookups by user type
ErrorLogSchema.index({ userType: 1, teamId: 1, fingerprint: 1 });
// Keep index on userId for private user queries
ErrorLogSchema.index({ userId: 1, fingerprint: 1 });

module.exports = mongoose.model("ErrorLog", ErrorLogSchema);
