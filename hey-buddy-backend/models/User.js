const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // No duplicate emails allowed
  },
  password: {
    type: String,
    required: true,
  },
  currentGoalId: {
    type: mongoose.Schema.Types.ObjectId, // Connects to the 'Goal' collection
    ref: 'Goal',
    default: null
  }
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

module.exports = mongoose.model('User', userSchema);