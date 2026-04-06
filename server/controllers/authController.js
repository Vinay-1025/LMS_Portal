const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register user
exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await User.create({ name, email, password, role });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get me
exports.getMe = async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
};

// Get all active users (Admin/Management only)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ isActive: { $ne: false } }).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user details & permissions (Admin/Management only)
exports.updateUser = async (req, res) => {
    const { name, email, role, permissions, password } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check for duplicate email if email is being changed
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email is already in use by another account' });
            }
            user.email = email;
        }

        user.name = name || user.name;
        user.role = role || user.role;
        user.permissions = permissions || user.permissions;

        // Update password if provided
        if (password && password.trim() !== '') {
            user.password = password;
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            permissions: updatedUser.permissions
        });
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(400).json({ message: error.message });
    }
};

// Soft delete user (Admin/Management only)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = false;
        await user.save();
        res.json({ message: 'User removed successfully (soft delete)' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const { sendWelcomeEmail } = require('../utils/emailUtils');

// Admin create user
exports.adminCreateUser = async (req, res) => {
    const { name, email, password, role, permissions } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Create user with provided permissions and force password reset
        const user = await User.create({ 
            name, 
            email, 
            password, 
            role, 
            permissions: permissions || [],
            mustResetPassword: true 
        });

        // Send welcome email asynchronously
        sendWelcomeEmail(user, password);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            message: 'User created successfully and welcome email sent!'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Course = require('../models/Course');

// Search users in shared courses (Communication Hub)
exports.searchUsers = async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    try {
        const userId = req.user._id;

        // 1. Find all courses the requester is part of
        const myCourses = await Course.find({
            $or: [
                { enrolledStudents: userId },
                { tutor: userId }
            ]
        });

        if (!myCourses || myCourses.length === 0) {
            return res.json([]);
        }

        // 2. Extract all unique reachable user IDs (students and tutors)
        const reachableUsers = new Set();
        myCourses.forEach(course => {
            reachableUsers.add(course.tutor.toString());
            course.enrolledStudents.forEach(studentId => {
                reachableUsers.add(studentId.toString());
            });
        });

        // 3. Search for users matching the query within the reachable set
        const matchingUsers = await User.find({
            _id: { $in: Array.from(reachableUsers) },
            _id: { $ne: userId }, // Exclude self
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ]
        })
        .select('name email role')
        .limit(10);

        res.json(matchingUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



