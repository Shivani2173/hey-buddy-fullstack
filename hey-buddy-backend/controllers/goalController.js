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

  // 1. Create My Goal
  const myGoal = await Goal.create({
    userId: req.user.id,
    title,
    category,
    description,
    status: 'SEARCHING'
  });

  // Update user with this goal
  await User.findByIdAndUpdate(req.user.id, { currentGoalId: myGoal._id });

  console.log(`🔎 SEARCH START: User ${req.user.name} is looking for ${category}`);

  // 2. Try to Find a Partner
  const partnerGoal = await Goal.findOne({
    category: category,
    status: 'SEARCHING',
    userId: { $ne: req.user.id } // Not myself
  });

  // 3. If Partner Found
  if (partnerGoal) {
    console.log(`✅ MATCH FOUND! Linking ${req.user.name} with User ID: ${partnerGoal.userId}`);

    // Update My Goal
    myGoal.status = 'MATCHED';
    myGoal.partnerId = partnerGoal.userId;
    await myGoal.save();

    // Update Partner Goal
    partnerGoal.status = 'MATCHED';
    partnerGoal.partnerId = req.user.id;
    await partnerGoal.save();

    // 4. Notify Both Users (Real-time!)
    const io = req.app.get('socketio');
    
    if(io) {
        // Notify Me
        io.to(req.user.id).emit('match_found', { 
            partnerName: "Your New Buddy", 
            goalTitle: partnerGoal.title,
            matchId: myGoal._id
        });

        // Notify Partner
        io.to(partnerGoal.userId.toString()).emit('match_found', { 
            partnerName: req.user.name, 
            goalTitle: myGoal.title,
            matchId: myGoal._id
        });
    } else {
        console.error("❌ Socket.io not found in request!");
    }
    
    return res.status(201).json({ message: "Match Found!", goal: myGoal, match: true });
  }

  // 4. No Partner Yet
  console.log("⏳ No match found yet. Waiting...");
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

  // If I had a partner, notify them that I left
  if (myGoal.partnerId) {
    const partnerGoal = await Goal.findOne({ userId: myGoal.partnerId });
    if (partnerGoal) {
      partnerGoal.status = 'SEARCHING';
      partnerGoal.partnerId = null;
      await partnerGoal.save();

      const io = req.app.get('socketio');
      if(io) {
          io.to(partnerGoal.userId.toString()).emit('partner_left');
      }
    }
  }

  await Goal.findByIdAndDelete(myGoal._id);
  await User.findByIdAndUpdate(req.user.id, { currentGoalId: null });

  res.status(200).json({ id: req.user.currentGoalId });
};

module.exports = { createGoal, getGoal, deleteGoal };