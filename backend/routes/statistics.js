const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Get platform statistics
router.get('/', async function(req, res) {
  try {
    const db = mongoose.connection.db;
    
    // Get real counts from MongoDB collections
    let questionsCount = 0, answersCount = 0, usersCount = 0, pollsCount = 0, commentsCount = 0;
    let uniqueTopics = new Set();
    
    try {
      // Get questions count and extract unique topics
      const questionsCollection = db.collection('questions');
      questionsCount = await questionsCollection.countDocuments();
      
      // Get unique topics from questions
      const questions = await questionsCollection.find({}, { tags: 1, subject: 1 }).toArray();
      questions.forEach(q => {
        if (q.subject) uniqueTopics.add(q.subject);
        if (q.tags && Array.isArray(q.tags)) {
          q.tags.forEach(tag => uniqueTopics.add(tag));
        }
      });
    } catch (e) {
      console.log('Questions collection not accessible');
    }
    
    try {
      // Get answers count
      const answersCollection = db.collection('answers');
      answersCount = await answersCollection.countDocuments();
    } catch (e) {
      console.log('Answers collection not accessible');
    }
    
    try {
      // Get users count (active users)
      const usersCollection = db.collection('users');
      usersCount = await usersCollection.countDocuments();
    } catch (e) {
      console.log('Users collection not accessible');
    }
    
    try {
      // Get polls count
      const pollsCollection = db.collection('polls');
      pollsCount = await pollsCollection.countDocuments();
    } catch (e) {
      console.log('Polls collection not accessible');
    }
    
    try {
      // Get comments count
      const commentsCollection = db.collection('comments');
      commentsCount = await commentsCollection.countDocuments();
    } catch (e) {
      console.log('Comments collection not accessible');
    }
    
    const topicsCount = uniqueTopics.size;
    
    res.json({
      questionsAsked: questionsCount,
      answersProvided: answersCount,
      activeUsers: usersCount,
      topicsCovered: topicsCount,
      pollsCreated: pollsCount,
      commentsCount: commentsCount,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

module.exports = router;
