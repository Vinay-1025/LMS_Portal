const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctIndex: { type: Number, required: true }, // Index of the correct option (0-indexed)
    points: { type: Number, default: 1 }
});

const assessmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    courseId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course', 
        required: true 
    },
    tutorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    questions: [questionSchema],
    timeLimit: { type: Number, default: 30 }, // Duration in minutes
    status: { type: String, enum: ['Published', 'Draft'], default: 'Published' }
}, { timestamps: true });

const Assessment = mongoose.model('Assessment', assessmentSchema);
module.exports = Assessment;
