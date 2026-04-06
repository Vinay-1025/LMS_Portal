const express = require('express');
const router = express.Router();
const { 
    startSession, 
    checkIn, 
    getHistory, 
    getActiveSession, 
    getStats, 
    submitLeave, 
    getLeaveRequests, 
    updateLeaveStatus,
    getInstitutionalStats,
    getSubjectWiseStats,
    getAtRiskStudents,
    bulkMarkAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Student check-in
router.post('/checkin', protect, authorize('student', 'admin'), checkIn);

// Tutor start session
router.post('/session', protect, authorize('tutor', 'admin'), startSession);

// Get active session for tutor
router.get('/active', protect, authorize('tutor', 'admin'), getActiveSession);

// Get attendance history (Role-based results)
router.get('/history', protect, getHistory);

// Get stats (Role-based)
router.get('/stats', protect, getStats);
router.get('/subject-stats', protect, authorize('student', 'admin'), getSubjectWiseStats);
router.get('/at-risk', protect, authorize('tutor', 'admin'), getAtRiskStudents);

// Leave management
router.post('/leave', protect, authorize('student', 'admin'), submitLeave);
router.get('/leave', protect, getLeaveRequests);
router.patch('/leave/:id', protect, authorize('tutor', 'management', 'admin'), updateLeaveStatus);

// Management / Institutional stats / Bulk actions
router.get('/institutional-stats', protect, authorize('management', 'admin'), getInstitutionalStats);
router.post('/bulk-mark', protect, authorize('tutor', 'admin'), bulkMarkAttendance);

module.exports = router;
