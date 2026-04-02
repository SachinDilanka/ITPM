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

// Debug endpoint to list all users
router.get('/debug/list', async function(req, res) {
  try {
    const users = await User.find().select('_id username fullName email');
    console.log('All users:', users);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user statistics
router.get('/:id/stats', async function(req, res) {
  try {
    const userId = req.params.id;
    
    // Get user's questions count
    const questionsCount = await Question.countDocuments({ author: userId });
    
    // Get user's answers count
    const answersCount = await Answer.countDocuments({ author: userId });
    
    // Get user's polls count
    const pollsCount = await Poll.countDocuments({ author: userId });
    
    // Get total likes on user's questions
    const userQuestions = await Question.find({ author: userId }).select('likes');
    const totalLikes = userQuestions.reduce((sum, question) => {
      return sum + (Array.isArray(question.likes) ? question.likes.length : 0);
    }, 0);
    
    // Get total shares on user's questions
    const totalShares = userQuestions.reduce((sum, question) => {
      return sum + (question.shares || 0);
    }, 0);
    
    // Get total views on user's questions
    const totalViews = userQuestions.reduce((sum, question) => {
      return sum + (question.views || 0);
    }, 0);
    
    // Get best answers count (answers marked as best)
    const bestAnswersCount = await Answer.countDocuments({ 
      author: userId, 
      isBestAnswer: true 
    });
    
    // Get user's recent activity (last 5 items)
    const recentQuestions = await Question.find({ author: userId })
      .select('title createdAt likes comments shares tags subject')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const recentAnswers = await Answer.find({ author: userId })
      .populate('question', 'title')
      .select('content createdAt likes isBestAnswer question')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const recentPolls = await Poll.find({ author: userId })
      .select('title description options createdAt subject year semester')
      .sort({ createdAt: -1 })
      .limit(3);
    
    // Combine and format recent activity
    const recentActivity = [
      ...recentQuestions.map(q => ({
        id: q._id,
        type: 'question',
        title: q.title,
        timestamp: formatTimeAgo(q.createdAt),
        points: `+${Math.max(5, Math.floor(q.likes.length * 0.5))}`,
        likes: q.likes.length,
        comments: q.comments?.length || 0,
        shares: q.shares || 0,
        tags: q.tags || []
      })),
      ...recentAnswers.map(a => ({
        id: a._id,
        type: 'answer',
        title: `Answered: ${a.question?.title || 'Unknown question'}`,
        timestamp: formatTimeAgo(a.createdAt),
        points: `+${Math.max(10, Math.floor(a.likes.length * 0.8))}`,
        likes: a.likes.length,
        comments: 0,
        bestAnswer: a.isBestAnswer
      })),
      ...recentPolls.map(p => ({
        id: p._id,
        type: 'poll',
        title: p.title,
        timestamp: formatTimeAgo(p.createdAt),
        points: `+${Math.max(3, Math.floor(p.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0) * 0.3))}`,
        votes: p.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0)
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
    
    // Get user details for followers/following counts
    const user = await User.findById(userId).select('followers following reputation');
    
    const result = {
      stats: {
        questionsAsked: questionsCount,
        bestAnswers: bestAnswersCount,
        pollsCreated: pollsCount,
        totalLikes: totalLikes,
        totalShares: totalShares,
        totalViews: totalViews
      },
      recentActivity: recentActivity,
      followers: user?.followers?.length || 0,
      following: user?.following?.length || 0,
      reputation: user?.reputation || 0
    };
    
    res.json(result);
  } catch (error) {
    console.error('User statistics error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
}

module.exports = router;
