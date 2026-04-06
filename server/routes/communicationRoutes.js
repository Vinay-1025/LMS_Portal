const express = require('express');
const router = express.Router();
const { getUserChannels, getMessages, createChannel, getOrCreateDM } = require('../controllers/communicationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All communication routes require authentication

router.get('/channels', getUserChannels);
router.get('/messages', getMessages);
router.post('/channels', createChannel);
router.post('/dm', getOrCreateDM);

module.exports = router;

