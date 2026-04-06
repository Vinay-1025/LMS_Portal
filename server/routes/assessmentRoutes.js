const express = require('express');
const router = express.Router();
const { 
    createAssessment, 
    getAssessments, 
    getAssessmentById, 
    submitAssessment,
    deleteAssessment,
    getAssessmentStats,
    updateAssessment,
    getAssessmentSubmissions,
    getUserResults,
    getAcademicAnalytics,
    getAssessmentInsights
} = require('../controllers/assessmentController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Dashboard view (list assessments)
router.get('/', protect, getAssessments);

// Stats (Tutor/Admin)
router.get('/stats', protect, authorize('tutor', 'admin'), getAssessmentStats);

// My Performance (Student)
router.get('/my-results', protect, authorize('student'), getUserResults);
router.get('/my-analytics', protect, authorize('student'), getAcademicAnalytics);

// Get assessment details (Player/Result view)
router.get('/:id', protect, getAssessmentById);

// Get assessment submissions (Tutor/Admin)
router.get('/:id/submissions', protect, authorize('tutor', 'admin'), getAssessmentSubmissions);
router.get('/:id/insights', protect, authorize('tutor', 'admin'), getAssessmentInsights);

// Submit assessment
router.post('/:id/submit', protect, authorize('student', 'admin'), submitAssessment);

// Management routes
router.post('/', protect, authorize('tutor', 'admin'), createAssessment);
router.put('/:id', protect, authorize('tutor', 'admin'), updateAssessment);
router.delete('/:id', protect, authorize('tutor', 'admin'), deleteAssessment);

module.exports = router;
