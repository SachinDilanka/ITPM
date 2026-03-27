const express = require('express');
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
    const { title, description, tags, semester, subject, module } = req.body;
    
    if (title) question.title = title;
    if (description) question.description = description;
    if (tags) question.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    if (semester !== undefined) question.semester = semester;
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
    const userId = req.body.userId;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const likeIndex = question.likes.indexOf(userId);
    
    if (likeIndex > -1) {
      question.likes.splice(likeIndex, 1);
    } else {
      question.likes.push(userId);
    }

    await question.save();
    res.json({ likes: question.likes.length });
  } catch (error) {
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
