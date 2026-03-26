const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isBestAnswer: {
    type: Boolean,
    default: false
  },
  aiScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

answerSchema.index({ question: 1, createdAt: -1 });
answerSchema.index({ aiScore: -1 });

module.exports = mongoose.model('Answer', answerSchema);
