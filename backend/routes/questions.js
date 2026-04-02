const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Comment = require('../models/Comment');
const User = require('../models/User');

// Get all questions
router.get('/', async function(req, res) {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const search = req.query.search;
    const tags = req.query.tags;
    const subject = req.query.subject;
    const semester = req.query.semester;
    const academicYear = req.query.academicYear;
    
    let query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }
    
    if (subject) {
      query.subject = subject;
    }
    
    if (semester) {
      query.semester = parseInt(semester);
    }
    
    if (academicYear) {
      query.academicYear = academicYear;
    }

    const questions = await Question.find(query)
      .populate('author', 'username avatar reputation _id')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Question.countDocuments(query);

    res.json({
      questions: questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Test endpoint
router.get('/test', async function(req, res) {
  try {
    console.log('Test endpoint reached');
    res.json({ message: 'Test endpoint working' });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single question with answers
router.get('/:id', async function(req, res) {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username avatar reputation')
      .populate('likes', 'username');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    question.views += 1;
    await question.save();

    const answers = await Answer.find({ question: req.params.id })
      .populate('author', 'username avatar reputation')
      .populate('likes', 'username')
      .sort({ isBestAnswer: -1, createdAt: -1 });

    const comments = await Comment.find({ question: req.params.id })
      .populate('author', 'username avatar')
      .populate('parent')
      .sort({ createdAt: 1 });

    res.json({
      question: question,
      answers: answers,
      comments: comments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new question
router.post('/', async function(req, res) {
  try {
    const title = req.body.title;
    const description = req.body.description;
    const tags = req.body.tags;
    const semester = req.body.semester;
    const academicYear = req.body.academicYear;
    const subject = req.body.subject;
    const module = req.body.module;
    const author = req.body.author;

    // Validate required fields
    if (!title || !description || !semester || !subject || !module || !author) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Handle tags - split if string, use as-is if array
    let tagsArray = [];
    if (tags) {
      if (typeof tags === 'string') {
        tagsArray = tags.split(',').map(function(tag) { return tag.trim(); }).filter(tag => tag);
      } else if (Array.isArray(tags)) {
        tagsArray = tags;
      }
    }

    const question = new Question({
      title: title,
      description: description,
      tags: tagsArray,
      semester: semester,
      academicYear: academicYear,
      subject: subject,
      module: module,
      author: author
    });

    const savedQuestion = await question.save();
    await savedQuestion.populate('author', 'username avatar reputation');

    res.status(201).json(savedQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update question (only for author)
router.put('/:id', async function(req, res) {
  try {
    const userId = req.body.author;
    const questionId = req.params.id;
    
    const question = await Question.findById(questionId);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // Check if user is the author
    if (question.author.toString() !== userId) {
      return res.status(403).json({ message: 'Only authors can update their questions' });
    }
    
    // Update question fields
    const { title, description, tags, semester, academicYear, subject, module } = req.body;
    
    if (title) question.title = title;
    if (description) question.description = description;
    if (tags) question.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    if (semester !== undefined) question.semester = semester;
    if (academicYear) question.academicYear = academicYear;
    if (subject) question.subject = subject;
    if (module) question.module = module;
    
    await question.save();
    await question.populate('author', 'username avatar reputation _id');
    
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Share question to profile
router.post('/:id/share', async function(req, res) {
  try {
    const userId = req.body.userId;
    const questionId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find the question first
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add question to user's sharedQuestions if not already there
    const isAlreadyShared = user.sharedQuestions.some(id => id.toString() === question._id.toString());
    if (!isAlreadyShared) {
      await User.findByIdAndUpdate(userId, {
        $push: { sharedQuestions: question._id }
      });
    }

    // Increment share count
    question.shares = (question.shares || 0) + 1;
    await question.save();

    res.json({ shares: question.shares });
  } catch (error) {
    console.error('Error sharing question:', error);
    res.status(500).json({ message: error.message });
  }
});

// Remove shared question from user profile
router.delete('/:id/unshare', async (req, res) => {
  try {
    const userId = req.body.userId;
    const questionId = req.params.id;

    console.log('=== UNSHARE DEBUG ===');
    console.log('User ID:', userId);
    console.log('Question ID:', questionId);

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Use findOneAndUpdate to avoid triggering the pre-save middleware
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { sharedQuestions: questionId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User updated successfully');
    console.log('Updated sharedQuestions:', user.sharedQuestions);

    res.json({ message: 'Question removed from profile' });

  } catch (error) {
    console.error('=== UNSHARE ROUTE ERROR ===');
    console.error('Error:', error);
    console.error('Error stack:', error.stack);
    console.error('========================');
    
    // Send proper error response
    if (res.headersSent) {
      console.log('Headers already sent, cannot send error response');
    } else {
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }
});

// Like/unlike question
router.post('/:id/like', async function(req, res) {
  try {
    console.log('=== LIKE REQUEST START ===');
    console.log('User ID:', req.body.userId);
    console.log('Question ID:', req.params.id);
    
    const userId = req.body.userId;
    const questionId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    console.log('Step 1: Validating user ID format...');
    // Validate userId format
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(userId);
      console.log('User ID format is valid');
    } catch (error) {
      console.log('User ID format is invalid:', error.message);
      return res.status(400).json({ message: 'Invalid User ID format' });
    }

    console.log('Step 2: Validating question ID format...');
    // Validate questionId format
    let questionObjectId;
    try {
      questionObjectId = new mongoose.Types.ObjectId(questionId);
      console.log('Question ID format is valid');
    } catch (error) {
      console.log('Question ID format is invalid:', error.message);
      return res.status(400).json({ message: 'Invalid Question ID format' });
    }

    console.log('Step 3: Getting MongoDB collections...');
    // Get the raw MongoDB collection
    const db = mongoose.connection.db;
    const questionsCollection = db.collection('questions');
    const usersCollection = db.collection('users');

    console.log('Step 4: Checking if question exists...');
    // Check if question exists
    const question = await questionsCollection.findOne({ _id: questionObjectId });
    if (!question) {
      console.log('Question not found');
      return res.status(404).json({ message: 'Question not found' });
    }
    console.log('Question found:', question._id);

    console.log('Step 5: Checking if user already liked...');
    // Check if user has already liked the question
    const isLiked = question.likes && question.likes.some(likeId => likeId.toString() === userId);
    console.log('Is liked:', isLiked);

    console.log('Step 6: Preparing update operation...');
    // Use $push or $pull based on current state
    const updateOperation = isLiked 
      ? { $pull: { likes: userObjectId } }
      : { $push: { likes: userObjectId } };
    console.log('Update operation:', updateOperation);

    console.log('Step 7: Updating question...');
    // Update using raw MongoDB operation
    await questionsCollection.updateOne(
      { _id: questionObjectId },
      updateOperation
    );
    console.log('Question updated successfully');

    console.log('Step 8: Fetching updated question...');
    // Get the updated question using raw collection
    const updatedQuestionRaw = await questionsCollection.findOne({ _id: questionObjectId });
    console.log('Updated question fetched');
    
    console.log('Step 9: Populating author...');
    // Manually populate author if author field exists
    let author = null;
    if (updatedQuestionRaw.author) {
      author = await usersCollection.findOne(
        { _id: updatedQuestionRaw.author },
        { projection: { username: 1, avatar: 1, reputation: 1 } }
      );
    }
    console.log('Author populated');

    console.log('Step 10: Formatting response...');
    // Format the response
    const updatedQuestion = {
      ...updatedQuestionRaw,
      _id: updatedQuestionRaw._id.toString(),
      author: author ? {
        _id: author._id.toString(),
        username: author.username,
        avatar: author.avatar,
        reputation: author.reputation
      } : null
    };
    
    console.log('Step 11: Sending response...');
    console.log('=== LIKE REQUEST SUCCESS ===');
    res.json({ 
      question: updatedQuestion,
      likes: updatedQuestion.likes ? updatedQuestion.likes.length : 0
    });
  } catch (error) {
    console.error('=== LIKE REQUEST ERROR ===');
    console.error('Error:', error);
    console.error('Error stack:', error.stack);
    console.error('============================');
    res.status(500).json({ message: error.message });
  }
});

// Delete question (only for author)
router.delete('/:id', async function(req, res) {
  try {
    const userId = req.body.userId;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if user is the author
    if (question.author.toString() !== userId) {
      return res.status(403).json({ message: 'Only the author can delete this question' });
    }

    console.log('Deleting question:', req.params.id);
    console.log('Question author:', question.author);
    console.log('Requesting user:', userId);

    // Delete associated answers and comments
    await Answer.deleteMany({ question: req.params.id });
    await Comment.deleteMany({ question: req.params.id });

    // Remove question from ALL users' sharedQuestions arrays (not just those who have it)
    const updateResult = await User.updateMany(
      {}, // Match all users
      { $pull: { sharedQuestions: req.params.id } }
    );

    console.log('Removed question from sharedQuestions for', updateResult.modifiedCount, 'users');

    // Delete the question
    await Question.findByIdAndDelete(req.params.id);

    console.log('Question deleted successfully from database');

    res.json({ 
      message: 'Question deleted successfully',
      removedFromProfiles: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
