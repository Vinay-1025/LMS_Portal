const express = require('express');
const router = express.Router();
const { 
    createCourse, getAllCourses, getCourseById, 
    addModule, enrollCourse, getTutorCourseReport,
    updateCourse, deleteCourse, removeModule
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('tutor', 'admin'), createCourse);
router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.put('/:id', protect, authorize('tutor', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('tutor', 'admin'), deleteCourse);
router.post('/:id/modules', protect, authorize('tutor', 'admin'), addModule);
router.delete('/:id/modules/:moduleId', protect, authorize('tutor', 'admin'), removeModule);
router.post('/:id/enroll', protect, enrollCourse);

// Tutor reporting
router.get('/:id/report', protect, authorize('tutor', 'admin'), getTutorCourseReport);

module.exports = router;
