const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
    labId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lab',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    language: { type: String, required: true },
    code: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Draft', 'Submitted'], 
        default: 'Draft' 
    },
    incidents: [{
        type: { type: String }, // e.g., 'TAB_SWITCH', 'CLIPBOARD_PASTE'
        timestamp: { type: Date, default: Date.now },
        details: { type: String }
    }],
    lastSaved: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure a student has only one workspace per lab
workspaceSchema.index({ labId: 1, studentId: 1, language: 1 }, { unique: true });

const Workspace = mongoose.model('Workspace', workspaceSchema);
module.exports = Workspace;
