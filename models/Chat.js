const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  participants: {
    type: [String], // массив из двух userId
    required: true,
    validate: [arrayLimit, '{PATH} must have exactly 2 participants']
  },
  updatedAt: { type: Date, default: Date.now }
});

function arrayLimit(val) {
  return val.length === 2;
}

module.exports = mongoose.model('Chat', ChatSchema);
