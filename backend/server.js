import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cors from 'cors';
import connectDB from './src/config/db.js';
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';
import commentRoutes from './src/routes/commentRoute.js';
import ratingRoutes from './src/routes/ratingRoute.js';
import authRoutes from './src/routes/authRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import filterRoutes from './src/routes/filterRoutes.js';
import notesRoutes from './src/routes/notesRoutes.js';
import queueRoutes from './src/routes/queueRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import statisticsRoutes from './src/routes/statisticsRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import qnaQuestionRoutes from './src/routes/qnaQuestionRoutes.js';
import qnaPollRoutes from './src/routes/qnaPollRoutes.js';
import qnaCommentRoutes from './src/routes/qnaCommentRoutes.js';
import qnaAnswerRoutes from './src/routes/qnaAnswerRoutes.js';
import qnaUserRoutes from './src/routes/qnaUserRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

if (!process.env.JWT_SECRET) {
    console.error('Error: JWT_SECRET is not set in .env');
    process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/statistics', statisticsRoutes);
app.use('/api/stats', statisticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/qna/questions', qnaQuestionRoutes);
app.use('/api/qna/polls', qnaPollRoutes);
app.use('/api/qna/comments', qnaCommentRoutes);
app.use('/api/qna/answers', qnaAnswerRoutes);
app.use('/api/qna/users', qnaUserRoutes);
/** Legacy paths (same handlers as /api/qna/*). PDF/note comments stay on /api/comments only. */
app.use('/api/questions', qnaQuestionRoutes);
app.use('/api/polls', qnaPollRoutes);
app.use('/api/users', qnaUserRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/filter', filterRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'KnowVerse API Server is running!', status: 'ok' });
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'Test route is working!' });
});

app.get('/api/health', (req, res) => {
    const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.json({
        status: 'ok',
        db: dbStates[mongoose.connection.readyState] ?? 'unknown',
    });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
};

start();
