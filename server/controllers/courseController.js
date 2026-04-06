const Course = require('../models/Course');
const User = require('../models/User');
const AttendanceRecord = require('../models/AttendanceRecord');
const Submission = require('../models/Submission');
const Workspace = require('../models/Workspace');

// Create a new course (Tutor/Admin only)
exports.createCourse = async (req, res) => {
    try {
        const { title, description, category, level, price, maxStudents } = req.body;
        const course = await Course.create({
            title,
            description,
            category,
            level,
            price,
            maxStudents: maxStudents || 0,
            tutor: req.user.id,
            status: 'Draft'
        });
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all published courses
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({ status: 'Published' }).populate('tutor', 'name email');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('tutor', 'name email enrolledStudents', 'name email');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Course Details (Tutor/Admin)
exports.updateCourse = async (req, res) => {
    try {
        const { title, description, category, level, price, maxStudents, status, thumbnail } = req.body;
        const course = await Course.findById(req.params.id);
        
        if (!course) return res.status(404).json({ message: 'Course not found' });
        
        if (course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        course.title = title || course.title;
        course.description = description || course.description;
        course.category = category || course.category;
        course.level = level || course.level;
        course.price = price !== undefined ? price : course.price;
        course.maxStudents = maxStudents !== undefined ? maxStudents : course.maxStudents;
        course.status = status || course.status;
        course.thumbnail = thumbnail || course.thumbnail;

        await course.save();
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Archive Course (Soft Delete)
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        course.status = 'Archived';
        await course.save();
        res.json({ message: 'Course archived successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove module from course
exports.removeModule = async (req, res) => {
    try {
        const { id, moduleId } = req.params;
        const course = await Course.findById(id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        course.modules = course.modules.filter(m => m._id.toString() !== moduleId);
        await course.save();
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add module to course
exports.addModule = async (req, res) => {
    try {
        const { title, content, type, url } = req.body;
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        
        // Only tutor of this course or admin can add modules
        if (course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        course.modules.push({ title, content, type, url });
        await course.save();
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Enroll in a course (Student only)
exports.enrollCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Check capacity
        if (course.maxStudents > 0 && course.enrolledStudents.length >= course.maxStudents) {
            return res.status(400).json({ message: 'Course is full. No more slots available.' });
        }

        if (course.enrolledStudents.some(id => id.toString() === req.user.id)) {
            return res.status(400).json({ message: 'Already enrolled in this course.' });
        }

        course.enrolledStudents.push(req.user.id);
        await course.save();

        // Check if now full to potentially notify (here we just return success)
        const isNowFull = course.maxStudents > 0 && course.enrolledStudents.length === course.maxStudents;

        res.json({ 
            message: 'Enrolled successfully',
            isFull: isNowFull 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Tutor's Student Performance Report
exports.getTutorCourseReport = async (req, res) => {
    try {
        const { id } = req.params; // courseId
        const course = await Course.findById(id).populate('enrolledStudents', 'name email');
        
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Only owner or admin
        if (course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Access denied' });
        }

        const report = await Promise.all(course.enrolledStudents.map(async (student) => {
            // 1. Attendance stats
            const attendance = await AttendanceRecord.find({ studentId: student._id, courseId: id });
            const totalSessions = attendance.length;
            const present = attendance.filter(a => a.status === 'Present').length;

            // 2. Assessment stats
            const submissions = await Submission.find({ studentId: student._id });
            const avgScore = submissions.length > 0 
                ? (submissions.reduce((acc, s) => acc + (s.score / s.totalPoints), 0) / submissions.length) * 100 
                : 0;
            const hasLates = submissions.some(s => s.status === 'Late');

            // 3. Coding Lab stats
            const workspace = await Workspace.findOne({ userId: student._id });

            return {
                studentId: student._id,
                name: student.name,
                email: student.email,
                attendance: {
                    percentage: totalSessions > 0 ? (present / totalSessions) * 100 : 0,
                    total: totalSessions,
                    present: present
                },
                performance: {
                    avgScore: Math.round(avgScore),
                    totalSubmissions: submissions.length,
                    lateSubmissions: hasLates
                },
                coding: {
                    active: !!workspace,
                    lastAccessed: workspace ? workspace.updatedAt : null
                }
            };
        }));

        res.json({
            courseTitle: course.title,
            maxStudents: course.maxStudents,
            enrolledCount: course.enrolledStudents.length,
            students: report
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

