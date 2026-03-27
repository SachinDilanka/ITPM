const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    votes: [String]
  }],
  subject: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 2
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEnded: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

pollSchema.index({ subject: 1 });
pollSchema.index({ year: 1 });
pollSchema.index({ semester: 1 });
pollSchema.index({ createdAt: -1 });
pollSchema.index({ isEnded: 1 });

module.exports = mongoose.model('Poll', pollSchema);
