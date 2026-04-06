const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String }, // Can be HTML or Markdown
    type: { type: String, enum: ['video', 'pdf', 'quiz', 'code'], default: 'video' },
    url: { type: String }, // For video/pdf links
    isFree: { type: Boolean, default: false }
});

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, default: 0 },
    category: { type: String },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    modules: [moduleSchema],
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    maxStudents: { type: Number, default: 0 }, // 0 means unlimited
    status: { type: String, enum: ['Draft', 'Published', 'Archived'], default: 'Draft' }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
