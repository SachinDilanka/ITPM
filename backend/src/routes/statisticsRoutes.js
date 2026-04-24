import express from 'express';
import { createRequire } from 'module';
import mongoose from 'mongoose';

const require = createRequire(import.meta.url);
const Note = require('../models/Note.js');
const User = require('../models/User.js');

const router = express.Router();

/** Demo numbers for `/mock` or when `?mock=1` — no DB required */
const MOCK_STATISTICS = {
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
        polls: 5,
    },
};

async function safeCount(collectionName) {
    try {
        const db = mongoose.connection.db;
        if (!db) return 0;
        return await db.collection(collectionName).countDocuments();
    } catch {
        return 0;
    }
}

/**
 * GET /api/statistics/mock
 * Static demo payload (matches legacy mock router).
 */
router.get('/mock', (req, res) => {
    res.json({
        ...MOCK_STATISTICS,
        lastUpdated: new Date().toISOString(),
        source: 'mock',
    });
});

/**
 * GET /api/statistics
 * Raw MongoDB collection counts (questions, answers, users, polls, comments) + unique topics;
 * KnowVerse fallbacks (notes, ratings, approved students) when forum collections are empty/missing.
 * Query: ?mock=1 — same body as /mock (for quick frontend testing).
 */
router.get('/', async (req, res) => {
    if (req.query.mock === '1' || req.query.mock === 'true') {
        return res.json({
            ...MOCK_STATISTICS,
            lastUpdated: new Date().toISOString(),
            source: 'mock',
        });
    }

    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json({
                ...MOCK_STATISTICS,
                lastUpdated: new Date().toISOString(),
                source: 'mock',
                reason: 'database_unavailable',
            });
        }

        const db = mongoose.connection.db;
        let questionsCount = 0;
        let answersCount = 0;
        let usersCount = 0;
        let pollsCount = 0;
        let commentsCount = 0;
        const uniqueTopics = new Set();

        if (db) {
            try {
                const questionsCollection = db.collection('questions');
                questionsCount = await questionsCollection.countDocuments();
                const questions = await questionsCollection
                    .find({}, { projection: { tags: 1, subject: 1 } })
                    .toArray();
                questions.forEach((q) => {
                    if (q.subject) uniqueTopics.add(String(q.subject));
                    if (q.tags && Array.isArray(q.tags)) {
                        q.tags.forEach((tag) => uniqueTopics.add(String(tag)));
                    }
                });
            } catch {
                /* collection may not exist */
            }

            try {
                answersCount = await db.collection('answers').countDocuments();
            } catch {
                /* */
            }

            try {
                usersCount = await db.collection('users').countDocuments();
            } catch {
                /* */
            }

            try {
                pollsCount = await db.collection('polls').countDocuments();
            } catch {
                /* */
            }

            try {
                commentsCount = await db.collection('comments').countDocuments();
            } catch {
                /* */
            }
        }

        const [approvedNotes, noteSubjects, activeStudents, totalUsers, legacyComments, legacyRatings] =
            await Promise.all([
                Note.countDocuments({ status: 'approved' }).catch(() => 0),
                Note.distinct('subject', { status: 'approved' }).catch(() => []),
                User.countDocuments({ role: 'student', isApproved: true }).catch(() => 0),
                User.countDocuments().catch(() => 0),
                safeCount('comments'),
                safeCount('ratings'),
            ]);

        (noteSubjects || []).filter(Boolean).forEach((s) => uniqueTopics.add(String(s)));

        const questionsAsked = questionsCount > 0 ? questionsCount : approvedNotes;
        const rawComments = commentsCount > 0 ? commentsCount : legacyComments;
        const fallbackEngagement = commentsCount > 0 ? commentsCount : legacyComments + legacyRatings;
        const answersProvided = answersCount > 0 ? answersCount : fallbackEngagement;
        const activeUsers = usersCount > 0 ? usersCount : activeStudents;
        const topicsCovered = uniqueTopics.size;

        res.json({
            questionsAsked,
            answersProvided,
            activeUsers,
            totalUsers: totalUsers || usersCount || activeUsers,
            topicsCovered,
            pollsCreated: pollsCount,
            commentsCount: rawComments,
            recentActivity: {
                questions: questionsCount || approvedNotes,
                answers: answersCount || fallbackEngagement,
                polls: pollsCount,
            },
            lastUpdated: new Date().toISOString(),
            source: 'database',
        });
    } catch (err) {
        console.error('GET /api/statistics', err);
        res.status(500).json({ message: err.message || 'Failed to fetch statistics' });
    }
});

export default router;
