const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true }, // Markdown support
    category: { type: String, default: 'General' },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    languages: [{ type: String, required: true }], // e.g. ['javascript', 'python', 'java']
    initialCode: {
        type: Map,
        of: String
    }, // Map of language -> starter code
    testCases: [{
        input: { type: String },
        expected: { type: String },
        isHidden: { type: Boolean, default: false }
    }],
    isProctored: {
        type: Boolean,
        default: false
    },
    instructorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const Lab = mongoose.model('Lab', labSchema);
module.exports = Lab;
