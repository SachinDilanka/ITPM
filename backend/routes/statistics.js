const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');
const Poll = require('../models/Poll');
const Comment = require('../models/Comment');

// Get platform statistics
router.get('/', async function(req, res) {
  try {
    // Get counts for each collection
    const questionsCount = await Question.countDocuments();
    const answersCount = await Answer.countDocuments();
    const usersCount = await User.countDocuments();
    const pollsCount = await Poll.countDocuments();
    const commentsCount = await Comment.countDocuments();

    // Get unique topics (subjects + tags)
    const questions = await Question.find().select('subject tags');
    const uniqueSubjects = [...new Set(questions.map(q => q.subject).filter(Boolean))];
    const uniqueTags = [...new Set(questions.flatMap(q => q.tags || []))];
    const totalTopics = uniqueSubjects.length + uniqueTags.length;

    // Get active users (users who have posted in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeQuestions = await Question.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const activeAnswers = await Answer.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const activePolls = await Poll.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    
    // Get users who've been active (posted questions, answers, or polls)
    const activeUsers = await User.countDocuments({
      $or: [
        { _id: { $in: await Question.distinct('author', { createdAt: { $gte: thirtyDaysAgo } }) } },
        { _id: { $in: await Answer.distinct('author', { createdAt: { $gte: thirtyDaysAgo } }) } },
        { _id: { $in: await Poll.distinct('author', { createdAt: { $gte: thirtyDaysAgo } }) } }
      ]
    });

    res.json({
      questionsAsked: questionsCount,
      answersProvided: answersCount,
      activeUsers: activeUsers,
      totalUsers: usersCount,
      topicsCovered: totalTopics,
      pollsCreated: pollsCount,
      commentsCount: commentsCount,
      recentActivity: {
        questions: activeQuestions,
        answers: activeAnswers,
        polls: activePolls
      }
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
