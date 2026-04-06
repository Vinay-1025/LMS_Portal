const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getUsers, adminCreateUser, searchUsers, updateUser, deleteUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Admin / Management routes
router.get('/', protect, authorize('admin', 'management'), getUsers);
router.post('/admin/create', protect, authorize('admin', 'management'), adminCreateUser);
router.put('/:id', protect, authorize('admin', 'management'), updateUser);
router.delete('/:id', protect, authorize('admin', 'management'), deleteUser);

// General User routes
router.get('/search', protect, searchUsers);

module.exports = router;


