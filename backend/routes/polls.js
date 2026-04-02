const express = require('express');
const router = express.Router();

// Try to require the Poll model, handle if it doesn't exist
let Poll;
try {
  Poll = require('../models/Poll');
} catch (e) {
  console.log('Poll model not found, using fallback mode');
}

// Get all polls
router.get('/', async function(req, res) {
  try {
    if (!Poll) {
      // Return mock data when model is not available
      return res.json({
        polls: [
          {
            _id: 'mock-1',
            title: 'What is your favorite programming language?',
            description: 'Choose your preferred programming language for web development',
            subject: 'Introduction to Programming',
            year: 1,
            semester: 1,
            isMultipleChoice: false,
            isActive: true,
            createdAt: new Date().toISOString(),
            options: [
              { text: 'JavaScript', votes: 5 },
              { text: 'Python', votes: 3 },
              { text: 'Java', votes: 2 }
            ],
            totalVotes: 10,
            author: { name: 'Demo User', avatar: 'D' }
          }
        ]
      });
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const subject = req.query.subject;
    const semester = req.query.semester;
    
    let query = { isDeleted: false };
    
    if (subject) {
      query.subject = subject;
    }
    
    if (semester) {
      query.semester = parseInt(semester);
    }

    const polls = await Poll.find(query)
      .populate('author', 'username avatar reputation')
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Poll.countDocuments(query);

    res.json({
      polls: polls,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single poll
router.get('/:id', async function(req, res) {
  try {
    const poll = await Poll.findById(req.params.id)
      .populate('author', 'username avatar reputation')
      .select('-__v');

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    const totalVotes = poll.options.reduce(function(sum, option) {
      return sum + option.votes.length;
    }, 0);
    
    const pollWithPercentages = {
      ...poll.toObject(),
      options: poll.options.map(function(option) {
        return {
          ...option.toObject(),
          percentage: totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0
        };
      }),
      totalVotes: totalVotes
    };

    res.json(pollWithPercentages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new poll
router.post('/', async function(req, res) {
  try {
    const title = req.body.title;
    const description = req.body.description;
    const options = req.body.options;
    const subject = req.body.subject;
    const year = req.body.year;
    const semester = req.body.semester;
    const author = req.body.author;

    if (!Poll) {
      // Return mock response when model is not available
      const mockPoll = {
        _id: Date.now().toString(),
        title: title,
        description: description,
        subject: subject,
        year: year,
        semester: semester,
        isMultipleChoice: req.body.isMultipleChoice || false,
        isActive: true,
        createdAt: new Date().toISOString(),
        options: options.map(function(option) {
          return {
            text: option,
            votes: []
          };
        }),
        totalVotes: 0,
        author: { name: 'Demo User', avatar: 'D' }
      };
      
      return res.status(201).json(mockPoll);
    }

    const poll = new Poll({
      title: title,
      description: description,
      options: options.map(function(option) {
        return {
          text: option,
          votes: []
        };
      }),
      subject: subject,
      year: year,
      semester: semester,
      author: author
    });

    const savedPoll = await poll.save();
    await savedPoll.populate('author', 'username avatar reputation');

    res.status(201).json(savedPoll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Vote in poll
router.post('/:id/vote', async function(req, res) {
  try {
    const userId = req.body.userId;
    const optionIndex = req.body.optionIndex;
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (!poll.isActive) {
      return res.status(400).json({ message: 'Poll is no longer active' });
    }

    // Find if user has voted before and remove their previous vote
    let previousVoteIndex = -1;
    poll.options.forEach(function(option, index) {
      const voteIndex = option.votes.indexOf(userId);
      if (voteIndex !== -1) {
        previousVoteIndex = index;
        option.votes.splice(voteIndex, 1); // Remove previous vote
      }
    });

    // Add new vote
    poll.options[optionIndex].votes.push(userId);
    await poll.save();

    const totalVotes = poll.options.reduce(function(sum, option) {
      return sum + option.votes.length;
    }, 0);
    
    const updatedPoll = {
      ...poll.toObject(),
      options: poll.options.map(function(option) {
        return {
          ...option.toObject(),
          percentage: totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0
        };
      }),
      totalVotes: totalVotes
    };

    res.json(updatedPoll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Deactivate poll (set isActive to false)
router.patch('/:id/deactivate', async function(req, res) {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Get user ID from request body (for demo purposes)
    // In production, this should come from authentication middleware
    const userId = req.body.userId;
    
    // Check if user is the author of the poll
    if (!userId || poll.author.toString() !== userId) {
      return res.status(403).json({ message: 'You can only deactivate your own polls' });
    }

    poll.isActive = false;
    await poll.save();

    // Return updated poll with percentages
    const totalVotes = poll.options.reduce(function(sum, option) {
      return sum + option.votes.length;
    }, 0);
    
    const updatedPoll = {
      ...poll.toObject(),
      options: poll.options.map(function(option) {
        return {
          ...option.toObject(),
          percentage: totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0
        };
      }),
      totalVotes: totalVotes
    };

    res.json(updatedPoll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// End poll (set isEnded to true)
router.patch('/:id/end', async function(req, res) {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Get user ID from request body (for demo purposes)
    // In production, this should come from authentication middleware
    const userId = req.body.userId;
    
    // Check if user is the author of the poll
    if (!userId || poll.author.toString() !== userId) {
      return res.status(403).json({ message: 'You can only end your own polls' });
    }

    poll.isEnded = true;
    poll.isActive = false; // Also set isActive to false for consistency
    await poll.save();

    // Return updated poll with percentages
    const totalVotes = poll.options.reduce(function(sum, option) {
      return sum + option.votes.length;
    }, 0);
    
    const updatedPoll = {
      ...poll.toObject(),
      options: poll.options.map(function(option) {
        return {
          ...option.toObject(),
          percentage: totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0
        };
      }),
      totalVotes: totalVotes
    };

    res.json(updatedPoll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete poll (soft delete)
router.delete('/:id', async function(req, res) {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Get user ID from request body (for demo purposes)
    // In production, this should come from authentication middleware
    const userId = req.body.userId;
    
    // Check if user is the author of the poll
    if (!userId || poll.author.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own polls' });
    }

    poll.isDeleted = true;
    await poll.save();

    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
