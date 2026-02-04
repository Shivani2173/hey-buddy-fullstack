const express = require('express');
const router = express.Router();
const { createGoal, getGoal, deleteGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createGoal);
router.get('/', protect, getGoal);
router.delete('/', protect, deleteGoal); 

module.exports = router;