const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Poll = require('../models/Poll');

// Register user
router.post('/register', async function(req, res) {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const fullName = req.body.fullName;
    const semester = req.body.semester;
    const branch = req.body.branch;

    const existingUser = await User.findOne({
      $or: [{ email: email }, { username: username }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      username: username,
      email: email,
      password: password,
      fullName: fullName,
      semester: semester,
      branch: branch
    });

    const savedUser = await user.save();
    
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login user
router.post('/login', async function(req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.comparePassword(password, function(err, isMatch) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const userResponse = user.toObject();
      delete userResponse.password;

      res.json(userResponse);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get('/:id', async function(req, res) {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const questions = await Question.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10);

    const answers = await Answer.find({ author: req.params.id })
      .populate('question', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    const polls = await Poll.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      user: user,
      questions: questions,
      answers: answers,
      polls: polls
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's shared questions
router.get('/:id/shared', async function(req, res) {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'sharedQuestions',
        populate: {
          path: 'author',
          select: 'username avatar reputation fullName'
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.sharedQuestions || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search users
router.get('/search/:query', async function(req, res) {
  try {
    const query = req.params.query;
    
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } }
      ]
    })
    .select('username fullName avatar reputation')
    .limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
