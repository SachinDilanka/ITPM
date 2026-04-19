import express from 'express';
import mongoose from 'mongoose';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import ForumComment from '../models/ForumComment.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/test', (req, res) => {
    res.json({ message: 'Q&A questions route is working' });
});

router.get('/', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
        const { search, tags, subject, semester, academicYear } = req.query;

        const query = {};

        if (search) {
            const rx = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            query.$or = [{ title: rx }, { description: rx }];
        }

        if (tags) {
            const tagArray = String(tags)
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);
            if (tagArray.length) query.tags = { $in: tagArray };
        }

        if (subject) query.subject = subject;
        if (semester !== undefined && semester !== '') query.semester = parseInt(semester, 10);
        if (academicYear) query.academicYear = academicYear;

        const questions = await Question.find(query)
            .populate('author', 'name username profilePicture avatarUrl reputation')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        const total = await Question.countDocuments(query);

        res.json({
            questions,
            totalPages: Math.ceil(total / limit) || 1,
            currentPage: page,
            total,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid question id' });
        }

        const question = await Question.findById(req.params.id).populate(
            'author',
            'name username profilePicture avatarUrl reputation'
        );

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        question.views += 1;
        await question.save();

        const answers = await Answer.find({ question: req.params.id })
            .populate('author', 'name username profilePicture avatarUrl reputation')
            .populate('likes', 'username name')
            .sort({ isBestAnswer: -1, createdAt: -1 });

        const comments = await ForumComment.find({ question: req.params.id })
            .populate('author', 'name username profilePicture avatarUrl')
            .sort({ createdAt: 1 });

        res.json({
            question,
            answers,
            comments,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, description, tags, semester, academicYear, subject, module, author } = req.body;

        if (!title || !description || semester == null || !subject || !module || !author) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        if (!mongoose.Types.ObjectId.isValid(author)) {
            return res.status(400).json({ message: 'Invalid author id' });
        }

        let tagsArray = [];
        if (tags) {
            if (typeof tags === 'string') {
                tagsArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
            } else if (Array.isArray(tags)) {
                tagsArray = tags;
            }
        }

        const allowedYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
        const yearVal =
            academicYear && allowedYears.includes(String(academicYear).trim())
                ? String(academicYear).trim()
                : '2nd Year';

        const question = new Question({
            title,
            description,
            tags: tagsArray,
            semester,
            academicYear: yearVal,
            subject,
            module,
            author,
        });

        const saved = await question.save();
        await saved.populate('author', 'name username profilePicture avatarUrl reputation');
        res.status(201).json(saved);
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(400).json({ message: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const userId = req.body.author;
        if (!userId) {
            return res.status(400).json({ message: 'author (user id) is required' });
        }

        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        if (question.author.toString() !== userId) {
            return res.status(403).json({ message: 'Only authors can update their questions' });
        }

        const { title, description, tags, semester, academicYear, subject, module } = req.body;
        if (title) question.title = title;
        if (description) question.description = description;
        if (tags) {
            question.tags = Array.isArray(tags) ? tags : String(tags).split(',').map((t) => t.trim()).filter(Boolean);
        }
        if (semester !== undefined) question.semester = semester;
        if (academicYear !== undefined) {
            const allowedYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
            if (allowedYears.includes(String(academicYear).trim())) {
                question.academicYear = String(academicYear).trim();
            }
        }
        if (subject) question.subject = subject;
        if (module) question.module = module;

        await question.save();
        await question.populate('author', 'name username profilePicture avatarUrl reputation');
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/:id/share', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const qid = question._id;
        const already = (user.sharedQuestions || []).some((id) => id.toString() === qid.toString());
        if (!already) {
            await User.findByIdAndUpdate(userId, { $push: { sharedQuestions: qid } });
        }

        question.shares = (question.shares || 0) + 1;
        await question.save();

        res.json({ shares: question.shares });
    } catch (error) {
        console.error('Error sharing question:', error);
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id/unshare', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const user = await User.findOneAndUpdate(
            { _id: userId },
            { $pull: { sharedQuestions: req.params.id } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Question removed from profile' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});

router.post('/:id/like', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid question id' });
        }

        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const uid = new mongoose.Types.ObjectId(userId);
        const isLiked = question.likes.some((id) => id.equals(uid));
        if (isLiked) {
            question.likes.pull(uid);
        } else {
            question.likes.push(uid);
        }
        await question.save();

        const updated = await Question.findById(req.params.id).populate(
            'author',
            'name username profilePicture avatarUrl reputation'
        );

        res.json({
            question: updated,
            likes: updated.likes.length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        if (question.author.toString() !== userId) {
            return res.status(403).json({ message: 'Only the author can delete this question' });
        }

        await Answer.deleteMany({ question: req.params.id });
        await ForumComment.deleteMany({ question: req.params.id });
        await User.updateMany({}, { $pull: { sharedQuestions: req.params.id } });
        await Question.findByIdAndDelete(req.params.id);

        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
