const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
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
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  academicYear: {
    type: String,
    required: false,
    trim: true,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
    default: '2nd Year'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  module: {
    type: String,
    required: true,
    trim: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  isAnswered: {
    type: Boolean,
    default: false
  },
  aiHighlighted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

questionSchema.index({ title: 'text', description: 'text' });
questionSchema.index({ tags: 1 });
questionSchema.index({ subject: 1 });
questionSchema.index({ semester: 1 });
questionSchema.index({ academicYear: 1 });

module.exports = mongoose.model('Question', questionSchema);
