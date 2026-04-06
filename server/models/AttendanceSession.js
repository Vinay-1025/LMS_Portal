const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema({
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
    code: { 
        type: String, 
        required: true,
        uppercase: true
    },
    expiresAt: { 
        type: Date, 
        required: true 
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Auto-expire sessions in the background would be ideal but for now we'll check logic-side
const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);
module.exports = AttendanceSession;
