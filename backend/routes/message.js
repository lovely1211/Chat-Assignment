const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message');

// Fetch messages between two users
router.get('/:senderId/:receiverId', messageController.getMessages);

// Mark a message as read
router.put('/read/:id', messageController.markAsRead);

// Send a message
router.post('/send', messageController.sendMessage);

// Get all users' online statuses
router.get('/online-status', messageController.getOnlineStatus);

// Get a specific user's online status
router.get('/online-status/:id', messageController.getUserOnlineStatus);

module.exports = router;
