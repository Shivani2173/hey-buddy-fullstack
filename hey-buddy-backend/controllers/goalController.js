const Goal = require('../models/Goal');
const User = require('../models/User');

// @desc    Create a new goal AND find a match
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  const { title, category, description } = req.body;

  if (!title || !category) {
    return res.status(400).json({ message: 'Please add title and category' });
  }

  if (req.user.currentGoalId) {
    return res.status(400).json({ message: 'You already have an active goal.' });
  }

  // Create Goal
  const myGoal = await Goal.create({
    userId: req.user.id,
    title,
    category,
    description,
    status: 'SEARCHING'
  });

  await User.findByIdAndUpdate(req.user.id, { currentGoalId: myGoal._id });

  // Match Logic
  const partnerGoal = await Goal.findOne({
    category: category,
    status: 'SEARCHING',
    userId: { $ne: req.user.id }
  });

  if (partnerGoal) {
    myGoal.status = 'MATCHED';
    myGoal.partnerId = partnerGoal.userId;
    await myGoal.save();

    partnerGoal.status = 'MATCHED';
    partnerGoal.partnerId = req.user.id;
    await partnerGoal.save();

    const io = req.app.get('socketio');
    io.to(req.user.id).emit('match_found', { partnerName: "Your New Buddy", goalTitle: partnerGoal.title });
    io.to(partnerGoal.userId.toString()).emit('match_found', { partnerName: req.user.name, goalTitle: myGoal.title });
    
    return res.status(201).json({ message: "Match Found!", goal: myGoal, match: true });
  }

  res.status(201).json({ message: "Waiting for partner...", goal: myGoal, match: false });
};

// @desc    Get my current goal
// @route   GET /api/goals
// @access  Private
const getGoal = async (req, res) => {
  if (!req.user.currentGoalId) {
    return res.status(200).json(null);
  }
  const goal = await Goal.findById(req.user.currentGoalId);
  res.status(200).json(goal);
};

// @desc    End the chat (Delete goal)
// @route   DELETE /api/goals
// @access  Private
const deleteGoal = async (req, res) => {
  const myGoal = await Goal.findOne({ userId: req.user.id });

  if (!myGoal) {
    return res.status(400).json({ message: 'Goal not found' });
  }

  if (myGoal.partnerId) {
    const partnerGoal = await Goal.findOne({ userId: myGoal.partnerId });
    if (partnerGoal) {
      partnerGoal.status = 'SEARCHING';
      partnerGoal.partnerId = null;
      await partnerGoal.save();

      const io = req.app.get('socketio');
      io.to(partnerGoal.userId.toString()).emit('partner_left');
    }
  }

  await Goal.findByIdAndDelete(myGoal._id);
  await User.findByIdAndUpdate(req.user.id, { currentGoalId: null });

  res.status(200).json({ id: req.user.currentGoalId });
};

// Export
module.exports = { createGoal, getGoal, deleteGoal };