import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cors from 'cors';
import connectDB from './src/config/db.js';
import commentRoutes from './src/routes/commentRoute.js';
import ratingRoutes from './src/routes/ratingRoute.js';
import authRoutes from './src/routes/authRoute.js';
import noteRoutes from './src/routes/noteRoute.js';
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';

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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ratings', ratingRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'API is running', status: 'ok' });
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
