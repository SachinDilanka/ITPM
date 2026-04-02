const express = require('express');
const router = express.Router();

// Simple statistics endpoint that doesn't depend on models
router.get('/', async function(req, res) {
  try {
    // Return mock statistics data
    res.json({
      questionsAsked: 1234,
      answersProvided: 2567,
      activeUsers: 892,
      totalUsers: 1000,
      topicsCovered: 156,
      pollsCreated: 45,
      commentsCount: 789,
      recentActivity: {
        questions: 23,
        answers: 45,
        polls: 5
      }
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
