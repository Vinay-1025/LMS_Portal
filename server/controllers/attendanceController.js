const AttendanceSession = require('../models/AttendanceSession');
const AttendanceRecord = require('../models/AttendanceRecord');
const Course = require('../models/Course');
const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

// Start a new attendance session (Tutor only)
exports.startSession = async (req, res) => {
    const { courseId, duration = 10 } = req.body; // duration in minutes
    try {
        // Deactivate any existing active sessions for this course/tutor first
        await AttendanceSession.updateMany(
            { courseId, tutorId: req.user._id, isActive: true },
            { isActive: false }
        );

        // Generate a 6-digit random number
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + duration * 60000);

        const session = await AttendanceSession.create({
            courseId,
            tutorId: req.user._id,
            code,
            expiresAt
        });

        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Check-in (Student only)
exports.checkIn = async (req, res) => {
    const { code } = req.body;
    try {
        const session = await AttendanceSession.findOne({ 
            code: code.toUpperCase(), 
            isActive: true,
            expiresAt: { $gt: new Date() }
        });

        if (!session) {
            return res.status(400).json({ message: 'Invalid or expired attendance code' });
        }

        // Check if already checked in
        const existingRecord = await AttendanceRecord.findOne({ 
            sessionId: session._id, 
            studentId: req.user._id 
        });

        if (existingRecord) {
            return res.status(400).json({ message: 'You have already checked in for this session' });
        }

        const record = await AttendanceRecord.create({
            sessionId: session._id,
            studentId: req.user._id,
            courseId: session.courseId,
            status: 'Present'
        });

        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get attendance history (Role-based)
exports.getHistory = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'student') {
            query.studentId = req.user._id;
        } else if (req.user.role === 'tutor') {
            // Tutors see records for their sessions
            const sessions = await AttendanceSession.find({ tutorId: req.user._id }).select('_id');
            const sessionIds = sessions.map(s => s._id);
            query.sessionId = { $in: sessionIds };
        }

        const history = await AttendanceRecord.find(query)
            .populate('courseId', 'title')
            .populate('studentId', 'name email')
            .sort({ timestamp: -1 });

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get current active session for tutor
exports.getActiveSession = async (req, res) => {
    try {
        const session = await AttendanceSession.findOne({ 
            tutorId: req.user._id, 
            isActive: true,
            expiresAt: { $gt: new Date() }
        }).populate('courseId', 'title');

        res.json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get stats for student or tutor
exports.getStats = async (req, res) => {
    try {
        if (req.user.role === 'student') {
            const records = await AttendanceRecord.find({ studentId: req.user._id });
            const leaves = await LeaveRequest.find({ studentId: req.user._id, status: 'Approved' });
            
            // For students, we'll calculate a simple summary
            // In a real system, we'd compare against total sessions
            res.json({
                present: records.length,
                absent: 0, // Logic would go here
                late: records.filter(r => r.status === 'Late').length,
                leavesCount: leaves.length
            });
        } else if (req.user.role === 'tutor') {
            const sessions = await AttendanceSession.find({ tutorId: req.user._id });
            const sessionIds = sessions.map(s => s._id);
            const totalRecords = await AttendanceRecord.countDocuments({ sessionId: { $in: sessionIds } });
            
            res.json({
                totalSessions: sessions.length,
                totalCheckIns: totalRecords,
                activeSessions: sessions.filter(s => s.isActive && s.expiresAt > new Date()).length
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Submit leave request
exports.submitLeave = async (req, res) => {
    const { reason, startDate, endDate } = req.body;
    try {
        const leave = await LeaveRequest.create({
            studentId: req.user._id,
            reason,
            startDate,
            endDate
        });
        res.status(201).json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get leave requests
exports.getLeaveRequests = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'student') {
            query.studentId = req.user._id;
        } else if (req.user.role === 'tutor' || req.user.role === 'management' || req.user.role === 'admin') {
            // Tutors might see all for their department, but here we show all for simplicity
        }

        const leaves = await LeaveRequest.find(query)
            .populate('studentId', 'name email')
            .sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update leave status
exports.updateLeaveStatus = async (req, res) => {
    const { id } = req.params;
    const { status, tutorNote } = req.body;
    try {
        const leave = await LeaveRequest.findByIdAndUpdate(id, {
            status,
            tutorNote,
            processedBy: req.user._id
        }, { new: true });
        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Institutional Stats (Management / Admin)
exports.getInstitutionalStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalCourses = await Course.countDocuments();
        const totalRecords = await AttendanceRecord.countDocuments();
        
        // Breakdown by department (category)
        const deptStats = await Course.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        const trends = [
            { name: 'Mon', attendance: 85 },
            { name: 'Tue', attendance: 92 },
            { name: 'Wed', attendance: 88 },
            { name: 'Thu', attendance: 95 },
            { name: 'Fri', attendance: 78 },
        ];

        res.json({
            totalStudents,
            totalCourses,
            totalRecords,
            averageAttendance: "88%",
            trends,
            deptStats: deptStats.map(d => ({ name: d._id || 'General', value: d.count }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Subject-wise Stats (Student)
exports.getSubjectWiseStats = async (req, res) => {
    try {
        const stats = await AttendanceRecord.aggregate([
            { $match: { studentId: req.user._id } },
            { $group: { 
                _id: "$courseId", 
                presentCount: { $sum: 1 },
                lateCount: { $sum: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] } }
            } }
        ]);

        const populatedStats = await Course.populate(stats, { path: "_id", select: "title" });
        
        const result = await Promise.all(populatedStats.map(async (s) => {
            const totalSessions = await AttendanceSession.countDocuments({ courseId: s._id?._id });
            return {
                course: s._id?.title || "Deleted Course",
                present: s.presentCount,
                late: s.lateCount,
                percentage: totalSessions > 0 ? Math.round((s.presentCount / totalSessions) * 100) : 0
            };
        }));
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get At-Risk Students (Tutor)
exports.getAtRiskStudents = async (req, res) => {
    try {
        const tutorCourses = await Course.find({ tutor: req.user._id });
        const atRisk = [];

        for (const course of tutorCourses) {
            const totalSessions = await AttendanceSession.countDocuments({ courseId: course._id });
            if (totalSessions === 0) continue;

            const students = await User.find({ _id: { $in: course.enrolledStudents } });
            
            for (const student of students) {
                const attendedSessions = await AttendanceRecord.countDocuments({ 
                    courseId: course._id, 
                    studentId: student._id,
                    status: { $in: ['Present', 'Late'] }
                });

                const percentage = Math.round((attendedSessions / totalSessions) * 100);
                
                if (percentage < 75) {
                    atRisk.push({
                        name: student.name,
                        email: student.email,
                        attendance: `${percentage}%`,
                        course: course.title,
                        lastSeen: "Recent" // Simplifying last seen for now
                    });
                }
            }
        }
        res.json(atRisk);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Bulk Mark Attendance
exports.bulkMarkAttendance = async (req, res) => {
    const { sessionId, studentIds, status = 'Present' } = req.body;
    try {
        const session = await AttendanceSession.findById(sessionId);
        if (!session) return res.status(404).json({ message: "Session not found" });

        const records = studentIds.map(id => ({
            sessionId: session._id,
            studentId: id,
            courseId: session.courseId,
            status
        }));

        await AttendanceRecord.insertMany(records, { ordered: false }).catch(e => {
            // Ignore duplicates
        });

        res.status(201).json({ message: `Marked ${studentIds.length} students as ${status}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
