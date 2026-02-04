const Chat = require('../models/Chat');
const Goal = require('../models/Goal');

// @desc    Send a message
// @route   POST /api/chat
const sendMessage = async (req, res) => {
  const { text } = req.body;
  const userId = req.user.id;

  // 1. Get my Partner ID
  const myGoal = await Goal.findById(req.user.currentGoalId);
  if (!myGoal || !myGoal.partnerId) {
    return res.status(400).json({ message: 'No partner found' });
  }
  const partnerId = myGoal.partnerId;

  // 2. Find the Chat Room (Check both orders of IDs)
  let chat = await Chat.findOne({
    users: { $all: [userId, partnerId] }
  });

  // 3. Create if doesn't exist
  if (!chat) {
    chat = await Chat.create({
      users: [userId, partnerId],
      messages: []
    });
  }

  // 4. Save Message
  const newMessage = { senderId: userId, text };
  chat.messages.push(newMessage);
  await chat.save();

  // 5. Socket: Send to both
  const io = req.app.get('socketio');
  io.to(userId).emit('receive_message', newMessage);
  io.to(partnerId.toString()).emit('receive_message', newMessage);

  res.json(newMessage);
};

// @desc    Get history
// @route   GET /api/chat
const getMessages = async (req, res) => {
  const myGoal = await Goal.findById(req.user.currentGoalId);
  if (!myGoal || !myGoal.partnerId) return res.json([]);

  const chat = await Chat.findOne({
    users: { $all: [req.user.id, myGoal.partnerId] }
  });

  res.json(chat ? chat.messages : []);
};

module.exports = { sendMessage, getMessages };