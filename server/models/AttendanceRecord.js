const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
    sessionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'AttendanceSession', 
        required: true 
    },
    studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    courseId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course', 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Present', 'Absent', 'Late'], 
        default: 'Present' 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

// Ensure a student can only have one record per session
attendanceRecordSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });

const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);
module.exports = AttendanceRecord;
