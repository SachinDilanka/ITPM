import express from 'express';
import mongoose from 'mongoose';
import ForumComment from '../models/ForumComment.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { content, author, question: questionId, answer: answerId } = req.body;

        if (!content || !author) {
            return res.status(400).json({ message: 'content and author are required' });
        }
        if (!questionId && !answerId) {
            return res.status(400).json({ message: 'Either question or answer id is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(author)) {
            return res.status(400).json({ message: 'Invalid author id' });
        }
        if (questionId && !mongoose.Types.ObjectId.isValid(questionId)) {
            return res.status(400).json({ message: 'Invalid question id' });
        }
        if (answerId && !mongoose.Types.ObjectId.isValid(answerId)) {
            return res.status(400).json({ message: 'Invalid answer id' });
        }

        const user = await User.findById(author);
        if (!user) {
            return res.status(400).json({ message: 'Author user not found' });
        }

        let qid = questionId || null;
        if (qid) {
            const q = await Question.findById(qid);
            if (!q) {
                return res.status(404).json({ message: 'Question not found' });
            }
        }

        let aid = answerId || null;
        if (aid) {
            const a = await Answer.findById(aid);
            if (!a) {
                return res.status(404).json({ message: 'Answer not found' });
            }
            if (!qid) {
                qid = a.question;
            }
        }

        const comment = new ForumComment({
            content,
            author,
            question: qid,
            answer: aid,
            parent: req.body.parent && mongoose.Types.ObjectId.isValid(req.body.parent) ? req.body.parent : null,
        });

        const saved = await comment.save();
        await saved.populate('author', 'name username profilePicture avatarUrl');

        res.status(201).json(saved);
    } catch (error) {
        console.error('Error creating forum comment:', error);
        res.status(400).json({ message: error.message });
    }
});

router.post('/:id/like', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Valid userId is required' });
        }

        const comment = await ForumComment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const uid = new mongoose.Types.ObjectId(userId);
        const idx = comment.likes.findIndex((id) => id.equals(uid));
        if (idx > -1) {
            comment.likes.splice(idx, 1);
        } else {
            comment.likes.push(uid);
        }

        await comment.save();
        res.json({ likes: comment.likes.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/question/:questionId', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.questionId)) {
            return res.status(400).json({ message: 'Invalid question id' });
        }

        const comments = await ForumComment.find({ question: req.params.questionId })
            .populate('author', 'name username profilePicture avatarUrl')
            .sort({ createdAt: 1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/answer/:answerId', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.answerId)) {
            return res.status(400).json({ message: 'Invalid answer id' });
        }

        const comments = await ForumComment.find({ answer: req.params.answerId })
            .populate('author', 'name username profilePicture avatarUrl')
            .sort({ createdAt: 1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Valid userId is required' });
        }

        const comment = await ForumComment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        let questionDoc = null;
        if (comment.question) {
            questionDoc = await Question.findById(comment.question);
        }

        const isCommentAuthor = comment.author.toString() === userId;
        const isQuestionOwner =
            questionDoc && questionDoc.author && questionDoc.author.toString() === userId;

        if (!isCommentAuthor && !isQuestionOwner) {
            return res.status(403).json({
                message: 'You can only delete your own comments or comments on your own questions',
            });
        }

        await ForumComment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
