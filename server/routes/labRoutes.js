const express = require('express');
const router = express.Router();
const { 
    getLabs, 
    getLabById, 
    getWorkspace, 
    saveWorkspace, 
    createLab,
    logIncident,
    submitLab,
    getLabSubmissions
} = require('../controllers/labController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get all labs
router.get('/', protect, getLabs);

// Get a single lab by ID
router.get('/:id', protect, getLabById);

// Get student's workspace (saved progress)
router.get('/workspace', protect, getWorkspace);

// Save progress (auto-save from frontend)
router.post('/save', protect, saveWorkspace);

// Proctoring & Submission
router.post('/log-incident', protect, logIncident);
router.post('/submit', protect, submitLab);

// Get all submissions for a lab (Tutor only)
router.get('/:id/submissions', protect, authorize('tutor', 'admin'), getLabSubmissions);

// Create lab (Tutor only)
router.post('/', protect, authorize('tutor', 'admin'), createLab);

module.exports = router;
