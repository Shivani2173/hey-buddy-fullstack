const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendMessage); // Send a text
router.get('/', protect, getMessages);  // Load history

module.exports = router;