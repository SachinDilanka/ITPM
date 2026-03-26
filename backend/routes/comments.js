const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Question = require('../models/Question');
const User = require('../models/User');

// Create new comment
router.post('/', async function(req, res) {
  try {
    const content = req.body.content;
    const author = req.body.author;
    const question = req.body.question;

    // Validate required fields
    if (!content || !author || !question) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists, if not create with provided info
    let user = await User.findById(author);
    if (!user) {
      // Get author info from request body
      let authorName = req.body.authorName;
      let avatar = req.body.authorAvatar;
      
      // Only override for Shenali Rodrigo's specific user ID if no authorName provided
      if (author === '69c10289169fd1d0114d657d' && !authorName) {
        authorName = 'Shenali Rodrigo';
        avatar = 'SR';
      }
      
      user = new User({
        _id: author,
        username: authorName ? authorName.replace(/\s+/g, '.').toLowerCase() : `user_${author.slice(-6)}`,
        email: authorName ? `${authorName.replace(/\s+/g, '.').toLowerCase()}@university.edu` : `user_${author.slice(-6)}@university.edu`,
        password: 'temp123', // This should be properly handled in production
        fullName: authorName || 'Unknown User',
        avatar: avatar || (authorName ? authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : author.slice(0, 2).toUpperCase()),
        semester: 1,
        branch: 'General'
      });
      await user.save();
      console.log('Created new user:', { id: author, name: authorName, fullName: user.fullName, username: user.username });
    } else {
      // Update existing user if new author info is provided
      const authorName = req.body.authorName;
      const avatar = req.body.authorAvatar;
      
      if (authorName && user.fullName !== authorName) {
        user.fullName = authorName;
        console.log('Updated existing user fullName:', { id: user._id, oldName: user.fullName, newName: authorName });
      }
      
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
        console.log('Updated existing user avatar:', { id: user._id, oldAvatar: user.avatar, newAvatar: avatar });
      }
      
      // Special handling for Shenali Rodrigo's specific user ID
      if (author === '69c10289169fd1d0114d657d' && !authorName) {
        user.fullName = 'Shenali Rodrigo';
        user.avatar = 'SR';
        console.log('Updated Shenali Rodrigo user info:', { id: user._id, fullName: user.fullName, avatar: user.avatar });
      }
      
      try {
        await user.save();
        console.log('User saved successfully:', { id: user._id, name: user.fullName, username: user.username });
      } catch (saveError) {
        console.error('Error saving user:', saveError);
        // Continue with comment creation even if user update fails
      }
    }

    const comment = new Comment({
      content: content,
      author: author,
      question: question
    });

    const savedComment = await comment.save();
    await savedComment.populate('author', 'username fullName avatar');

    res.status(201).json(savedComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(400).json({ message: error.message });
  }
});

// Like/unlike comment
router.post('/:id/like', async function(req, res) {
  try {
    const userId = req.body.userId;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const likeIndex = comment.likes.indexOf(userId);
    
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    await comment.populate('likes', 'username fullName');
    
    res.json({ likes: comment.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get comments for a question
router.get('/question/:questionId', async function(req, res) {
  try {
    const comments = await Comment.find({ question: req.params.questionId })
      .populate('author', 'username fullName avatar')
      .populate('likes', 'username fullName')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete comment
router.delete('/:id', async function(req, res) {
  try {
    const userId = req.body.userId;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Find the question to check ownership
    const Question = require('../models/Question');
    const question = await Question.findById(comment.question);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user can delete the comment:
    // 1. User is the author of the comment, OR
    // 2. User is the owner of the question
    const isCommentAuthor = comment.author.toString() === userId;
    const isQuestionOwner = question.author.toString() === userId;

    if (!isCommentAuthor && !isQuestionOwner) {
      return res.status(403).json({ message: 'You can only delete your own comments or comments on your own questions' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
