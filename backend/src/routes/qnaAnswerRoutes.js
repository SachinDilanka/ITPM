import express from 'express';
import mongoose from 'mongoose';
import Answer from '../models/Answer.js';
import Question from '../models/Question.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { question: questionId, author, content } = req.body;
        if (!questionId || !author || !content) {
            return res.status(400).json({ message: 'question, author, and content are required' });
        }
        if (!mongoose.Types.ObjectId.isValid(questionId) || !mongoose.Types.ObjectId.isValid(author)) {
            return res.status(400).json({ message: 'Invalid question or author id' });
        }

        const [q, u] = await Promise.all([Question.findById(questionId), User.findById(author)]);
        if (!q) return res.status(404).json({ message: 'Question not found' });
        if (!u) return res.status(400).json({ message: 'Author user not found' });

        const answer = new Answer({
            question: questionId,
            author,
            content,
        });
        const saved = await answer.save();
        await saved.populate('author', 'name username profilePicture avatarUrl reputation');
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/:id/like', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Valid userId is required' });
        }

        const answer = await Answer.findById(req.params.id);
        if (!answer) return res.status(404).json({ message: 'Answer not found' });

        const uid = new mongoose.Types.ObjectId(userId);
        const idx = answer.likes.findIndex((id) => id.equals(uid));
        if (idx > -1) answer.likes.splice(idx, 1);
        else answer.likes.push(uid);

        await answer.save();
        res.json({ likes: answer.likes.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
