const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  semester: {
    type: Number,
    min: 1,
    max: 8
  },
  branch: {
    type: String,
    trim: true
  },
  reputation: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  sharedQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }]
}, {
  timestamps: true
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  bcrypt.hash(this.password, 12, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, callback);
};

module.exports = mongoose.model('User', userSchema);
