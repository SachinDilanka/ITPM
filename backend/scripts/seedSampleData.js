/**
 * Optional sample Q&A data. Uses MONGO_URI from .env (never hardcode Atlas URLs here).
 *
 * - Creates a seed admin user only if SEED_ADMIN_PASSWORD is set and the email is free.
 * - Inserts sample questions/polls only when those collections are empty.
 *
 * Run: npm run seed   (from backend/)
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';
import Question from '../src/models/Question.js';
import Poll from '../src/models/Poll.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const SEED_EMAIL = 'admin@knowverse.com';

async function main() {
    await connectDB();

    let author = await User.findOne({ email: SEED_EMAIL });

    if (!author && process.env.SEED_ADMIN_PASSWORD) {
        author = await User.create({
            name: 'Administrator',
            fullName: 'Administrator',
            email: SEED_EMAIL,
            password: process.env.SEED_ADMIN_PASSWORD,
            username: 'admin',
            role: 'admin',
            isApproved: true,
        });
        console.log('Seed admin user created:', SEED_EMAIL);
    }

    if (!author) {
        author = await User.findOne().sort({ createdAt: 1 });
    }

    if (!author) {
        console.log(
            'No users in database. Set SEED_ADMIN_PASSWORD in .env and run again to create an admin, or register via /api/auth first.'
        );
        await mongoose.connection.close();
        process.exit(0);
    }

    const authorId = author._id;

    const qCount = await Question.countDocuments();
    if (qCount === 0) {
        await Question.insertMany([
            {
                title: 'What is React?',
                description: 'Can someone explain what React is and how it works?',
                author: authorId,
                tags: ['react', 'javascript', 'frontend'],
                subject: 'Introduction to Programming',
                semester: 1,
                academicYear: '1st Year',
                module: 'Core',
            },
            {
                title: 'How does MongoDB work?',
                description: 'I need help understanding the basics of MongoDB and NoSQL databases.',
                author: authorId,
                tags: ['mongodb', 'database', 'nosql'],
                subject: 'Database Systems',
                semester: 1,
                academicYear: '2nd Year',
                module: 'Core',
            },
        ]);
        console.log('Sample questions inserted');
    } else {
        console.log('Questions collection already has data; skipped');
    }

    const pCount = await Poll.countDocuments();
    if (pCount === 0) {
        await Poll.insertMany([
            {
                title: 'Favorite Programming Language',
                description: 'What is your favorite programming language for web development?',
                options: [
                    { text: 'JavaScript', votes: [] },
                    { text: 'Python', votes: [] },
                    { text: 'Java', votes: [] },
                    { text: 'TypeScript', votes: [] },
                ],
                author: authorId,
                subject: 'Introduction to Programming',
                year: 1,
                semester: 1,
                isMultipleChoice: false,
                isActive: true,
                isEnded: false,
                isDeleted: false,
            },
            {
                title: 'Database Preference',
                description: 'Which database system do you prefer for applications?',
                options: [
                    { text: 'MongoDB', votes: [] },
                    { text: 'MySQL', votes: [] },
                    { text: 'PostgreSQL', votes: [] },
                    { text: 'SQLite', votes: [] },
                ],
                author: authorId,
                subject: 'Database Systems',
                year: 2,
                semester: 1,
                isMultipleChoice: false,
                isActive: true,
                isEnded: false,
                isDeleted: false,
            },
        ]);
        console.log('Sample polls inserted');
    } else {
        console.log('Polls collection already has data; skipped');
    }

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('\nCollection counts:');
    for (const c of collections) {
        const n = await db.collection(c.name).countDocuments();
        console.log(`  ${c.name}: ${n}`);
    }

    await mongoose.connection.close();
    console.log('Seed finished.');
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
