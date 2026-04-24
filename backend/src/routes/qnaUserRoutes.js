import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Poll from '../models/Poll.js';

const router = express.Router();

function formatTimeAgo(date) {
    const now = new Date();
    const diffInMs = now - new Date(date);
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
}

function publicUser(userDoc) {
    if (!userDoc) return null;
    const u = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
    delete u.password;
    u.fullName = u.name;
    return u;
}

router.get('/search/:query', async (req, res) => {
    try {
        const query = req.params.query;
        if (!query || query.length > 64) {
            return res.status(400).json({ message: 'Invalid search query' });
        }

        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } },
            ],
        })
            .select('username name profilePicture avatarUrl reputation')
            .limit(10);

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id/stats', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }

        const userId = req.params.id;

        const [
            questionsCount,
            answersCount,
            pollsCount,
            userQuestions,
            bestAnswersCount,
            recentQuestions,
            recentAnswers,
            recentPolls,
            user,
        ] = await Promise.all([
            Question.countDocuments({ author: userId }),
            Answer.countDocuments({ author: userId }),
            Poll.countDocuments({ author: userId }),
            Question.find({ author: userId }).select('likes shares views'),
            Answer.countDocuments({ author: userId, isBestAnswer: true }),
            Question.find({ author: userId })
                .select('title createdAt likes tags subject')
                .sort({ createdAt: -1 })
                .limit(5),
            Answer.find({ author: userId })
                .populate('question', 'title')
                .select('content createdAt likes isBestAnswer question')
                .sort({ createdAt: -1 })
                .limit(5),
            Poll.find({ author: userId })
                .select('title description options createdAt subject year semester')
                .sort({ createdAt: -1 })
                .limit(3),
            User.findById(userId).select('followers following reputation'),
        ]);

        const totalLikes = userQuestions.reduce(
            (sum, q) => sum + (Array.isArray(q.likes) ? q.likes.length : 0),
            0
        );
        const totalShares = userQuestions.reduce((sum, q) => sum + (q.shares || 0), 0);
        const totalViews = userQuestions.reduce((sum, q) => sum + (q.views || 0), 0);

        const recentActivity = [
            ...recentQuestions.map((q) => ({
                id: q._id,
                type: 'question',
                title: q.title,
                createdAt: q.createdAt,
                timestamp: formatTimeAgo(q.createdAt),
                likes: q.likes?.length || 0,
                tags: q.tags || [],
            })),
            ...recentAnswers.map((a) => ({
                id: a._id,
                type: 'answer',
                title: `Answered: ${a.question?.title || 'Unknown question'}`,
                createdAt: a.createdAt,
                timestamp: formatTimeAgo(a.createdAt),
                likes: a.likes?.length || 0,
                bestAnswer: a.isBestAnswer,
            })),
            ...recentPolls.map((p) => ({
                id: p._id,
                type: 'poll',
                title: p.title,
                createdAt: p.createdAt,
                timestamp: formatTimeAgo(p.createdAt),
                votes: (p.options || []).reduce((sum, opt) => sum + (opt.votes?.length || 0), 0),
            })),
        ]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);

        res.json({
            stats: {
                questionsAsked: questionsCount,
                bestAnswers: bestAnswersCount,
                pollsCreated: pollsCount,
                totalLikes,
                totalShares,
                totalViews,
            },
            recentActivity,
            followers: user?.followers?.length || 0,
            following: user?.following?.length || 0,
            reputation: user?.reputation || 0,
        });
    } catch (error) {
        console.error('User statistics error:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id/shared', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }

        const user = await User.findById(req.params.id).populate({
            path: 'sharedQuestions',
            populate: {
                path: 'author',
                select: 'username name profilePicture avatarUrl reputation',
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.sharedQuestions || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }

        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const [questions, answers, polls] = await Promise.all([
            Question.find({ author: req.params.id })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('author', 'name username profilePicture avatarUrl reputation'),
            Answer.find({ author: req.params.id })
                .populate('question', 'title')
                .sort({ createdAt: -1 })
                .limit(10),
            Poll.find({ author: req.params.id }).sort({ createdAt: -1 }).limit(10),
        ]);

        res.json({
            user: publicUser(user),
            questions,
            answers,
            polls,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
