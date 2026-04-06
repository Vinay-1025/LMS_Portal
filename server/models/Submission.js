const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assessmentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Assessment', 
        required: true 
    },
    studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    answers: [{ 
        type: Number, 
        required: true 
    }], // Array of selected option indices (0-indexed)
    score: { 
        type: Number, 
        required: true 
    },
    totalPoints: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Completed', 'Late'], 
        default: 'Completed' 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

// Ensure a student can only have one submission per assessment
submissionSchema.index({ assessmentId: 1, studentId: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;
