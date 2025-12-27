const mongoose = require("mongoose");

// Generate simple 8-character alphanumeric invite code
const generateInviteCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars (0,O,1,I)
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Format as XXXX-XXXX for readability
    return `${code.slice(0, 4)}-${code.slice(4)}`;
};

const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    inviteCode: {
        type: String,
        unique: true,
        default: generateInviteCode
    },
    settings: {
        type: Object,
        default: {}
    }
}, { timestamps: true });

// Index for fast invite code lookups
TeamSchema.index({ inviteCode: 1 });

module.exports = mongoose.model("Team", TeamSchema);
