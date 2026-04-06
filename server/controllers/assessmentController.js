const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');

// Create a new assessment (Tutor only)
exports.createAssessment = async (req, res) => {
    try {
        const { title, description, courseId, questions, timeLimit } = req.body;
        
        // Validate course ownership
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Target course not found' });
        
        if (req.user.role !== 'admin' && course.tutor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Authorized access to this course only' });
        }

        const assessment = await Assessment.create({
            title,
            description,
            courseId,
            questions,
            timeLimit,
            tutorId: req.user._id
        });
        res.status(201).json(assessment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all assessments (Dashboard view)
exports.getAssessments = async (req, res) => {
    try {
        const assessments = await Assessment.find()
            .populate('courseId', 'title')
            .populate('tutorId', 'name')
            .sort({ createdAt: -1 });
        
        // If student, attach submission status
        if (req.user.role === 'student') {
            const submissions = await Submission.find({ studentId: req.user._id });
            const submissionMap = new Map(submissions.map(s => [s.assessmentId.toString(), s]));
            
            const results = assessments.map(a => {
                const sub = submissionMap.get(a._id.toString());
                return {
                    ...a.toObject(),
                    isCompleted: !!sub,
                    score: sub ? sub.score : null
                };
            });
            return res.json(results);
        }

        res.json(assessments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get assessment details (Player view)
exports.getAssessmentById = async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id)
            .populate('courseId', 'title');
        
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

        // If student is taking the test, we MUST NOT send the correctIndex
        const obj = assessment.toObject();
        if (req.user.role === 'student') {
            const alreadySubmitted = await Submission.findOne({ 
                assessmentId: obj._id, 
                studentId: req.user._id 
            });

            if (alreadySubmitted) {
                // Return full info including correct answers for result view
                return res.json({ ...obj, submission: alreadySubmitted });
            }

            // Scrub correctIndex for active test
            obj.questions = obj.questions.map(q => {
                const { correctIndex, ...rest } = q;
                return rest;
            });
        }

        res.json(obj);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Submit assessment (Student only)
exports.submitAssessment = async (req, res) => {
    const { answers } = req.body; // Array of option indices
    try {
        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

        // Prevent multiple submissions
        const alreadySubmitted = await Submission.findOne({ 
            assessmentId: assessment._id, 
            studentId: req.user._id 
        });
        if (alreadySubmitted) {
            return res.status(400).json({ message: 'You have already submitted this assessment' });
        }

        // Calculate score
        let score = 0;
        let totalPoints = 0;
        assessment.questions.forEach((q, i) => {
            if (answers[i] === q.correctIndex) {
                score += q.points;
            }
            totalPoints += q.points;
        });

        const submission = await Submission.create({
            assessmentId: assessment._id,
            studentId: req.user._id,
            answers,
            score,
            totalPoints
        });

        res.status(201).json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Update Assessment
exports.updateAssessment = async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
        
        if (req.user.role !== 'admin' && assessment.tutorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized modification' });
        }

        const updatedAssessment = await Assessment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.json(updatedAssessment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Assessment
exports.deleteAssessment = async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
        
        if (req.user.role !== 'admin' && assessment.tutorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized removal' });
        }

        await Assessment.findByIdAndDelete(req.params.id);
        await Submission.deleteMany({ assessmentId: req.params.id }); // Clean up submissions
        res.json({ message: 'Assessment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Submissions for specific assessment
exports.getAssessmentSubmissions = async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

        if (req.user.role !== 'admin' && assessment.tutorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized access to reporting' });
        }

        const submissions = await Submission.find({ assessmentId: req.params.id })
            .populate('studentId', 'name email');
        
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Detailed Question-wise Insights (Tutor only)
exports.getAssessmentInsights = async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

        if (req.user.role !== 'admin' && assessment.tutorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized access to insights' });
        }

        const submissions = await Submission.find({ assessmentId: req.params.id });
        if (!submissions.length) return res.json({ message: 'No submissions yet', insights: [] });

        const insights = assessment.questions.map((q, idx) => {
            const correctCount = submissions.filter(s => s.answers[idx] === q.correctIndex).length;
            const accuracy = (correctCount / submissions.length) * 100;
            return {
                questionIndex: idx,
                questionText: q.questionText,
                accuracy: Math.round(accuracy)
            };
        });

        // Identify toughest and easiest
        const sortedInsights = [...insights].sort((a, b) => a.accuracy - b.accuracy);
        
        res.json({
            insights,
            summary: {
                toughest: sortedInsights[0],
                easiest: sortedInsights[sortedInsights.length - 1],
                totalSubmissions: submissions.length
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get Academic Analytics (Student Performance)
exports.getAcademicAnalytics = async (req, res) => {
    try {
        const studentId = req.user._id;

        // Fetch all student average scores to determine rank
        const allStudentsStats = await Submission.aggregate([
            {
                $group: {
                    _id: '$studentId',
                    avgScore: { $avg: { $divide: ['$score', '$totalPoints'] } }
                }
            },
            { $sort: { avgScore: -1 } }
        ]);

        const totalStudents = allStudentsStats.length;
        const studentIndex = allStudentsStats.findIndex(s => s._id.toString() === studentId.toString());
        const rank = studentIndex !== -1 ? studentIndex + 1 : totalStudents;
        
        // Calculate student's specific metrics
        const studentSubmissions = await Submission.find({ studentId });
        const totalCompleted = studentSubmissions.length;
        const avgPerformance = totalCompleted > 0 
            ? (studentSubmissions.reduce((acc, curr) => acc + (curr.score / curr.totalPoints), 0) / totalCompleted) * 100
            : 0;

        // Estimate GPA (Simple 4.0 scale)
        const gpa = (avgPerformance / 100) * 4;

        // Calculate Achievements
        const achievements = [];
        if (studentSubmissions.some(s => (s.score / s.totalPoints) >= 1)) achievements.push('perfect_score');
        if (totalCompleted >= 5) achievements.push('consistent_performer');
        
        // Streak detection (Last 3 submissions > 80%)
        const lastThree = studentSubmissions.sort((a,b) => b.createdAt - a.createdAt).slice(0, 3);
        if (lastThree.length === 3 && lastThree.every(s => (s.score / s.totalPoints) >= 0.8)) {
            achievements.push('hot_streak');
        }

        const percentile = totalStudents > 0 
            ? Math.round(((totalStudents - rank) / totalStudents) * 100)
            : 0;

        res.json({
            rank: `#${rank}/${totalStudents}`,
            percentile: `${percentile}%`,
            gpa: gpa.toFixed(1),
            average: Math.round(avgPerformance),
            completed: totalCompleted,
            achievements
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get User Results (Transcript)
exports.getUserResults = async (req, res) => {
    try {
        const submissions = await Submission.find({ studentId: req.user._id })
            .populate({
                path: 'assessmentId',
                populate: { path: 'courseId', select: 'title' }
            })
            .sort({ timestamp: -1 });

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Analytics (Tutor)
exports.getAssessmentStats = async (req, res) => {
    try {
        const totalAssessments = await Assessment.countDocuments({ tutorId: req.user._id });
        const submissions = await Submission.find().populate({
            path: 'assessmentId',
            match: { tutorId: req.user._id }
        });
        
        const filteredSubmissions = submissions.filter(s => s.assessmentId !== null);
        const avgScore = filteredSubmissions.length > 0 
            ? (filteredSubmissions.reduce((acc, curr) => acc + (curr.score / curr.totalPoints), 0) / filteredSubmissions.length) * 100
            : 0;

        res.json({
            count: totalAssessments,
            attempts: filteredSubmissions.length,
            averagePerformance: Math.round(avgScore)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
