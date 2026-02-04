const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true // Must have a title
  },
  description: {
    type: String // Optional details
  },
  category: {
    type: String,
    enum: ['Coding', 'Fitness', 'Productivity', 'Other'], // Strict choices only
    required: true
  },
  status: {
    type: String,
    enum: ['SEARCHING', 'MATCHED', 'COMPLETED', 'CANCELLED'],
    default: 'SEARCHING' // Starts here automatically
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links to the MATCHED user
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);