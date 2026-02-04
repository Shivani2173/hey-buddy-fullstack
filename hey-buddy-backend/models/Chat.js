const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  users: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
  ],
  messages: [
    {
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);