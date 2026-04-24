import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Rating from '../models/ratingModel.js';
import Comment from '../models/commentModel.js';

const require = createRequire(import.meta.url);
const NoteCjs = () => require('../models/Note.js');

function publicPathForFile(filename) {
    return `/uploads/avatars/${filename}`;
}

function absoluteUploadPath(relativeFromRoot) {
    return path.join(process.cwd(), relativeFromRoot.replace(/^\//, ''));
}

function removeOldAvatarFile(profilePicturePath) {
    if (!profilePicturePath || !profilePicturePath.startsWith('/uploads/')) return;
    const full = absoluteUploadPath(profilePicturePath);
    try {
        if (fs.existsSync(full)) fs.unlinkSync(full);
    } catch {
        /* ignore */
    }
}

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    });

const serializeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isApproved: user.isApproved,
    isSuspended: user.isSuspended,
    profilePicture: user.profilePicture,
    avatarUrl: user.profilePicture || user.avatarUrl || '',
    createdAt: user.createdAt,
    username: user.username || '',
    bio: user.bio || '',
    semester: user.semester ?? null,
    branch: user.branch || '',
    reputation: user.reputation ?? 0,
    isVerified: Boolean(user.isVerified),
    followersCount: user.followersCount ?? 0,
    followingCount: user.followingCount ?? 0,
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, username, bio, semester, branch, role: roleIn } = req.body;

        if (!name?.trim() || !email?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password',
            });
        }

        const exists = await User.findOne({ email: email.toLowerCase().trim() });
        if (exists) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists',
            });
        }

        const role = roleIn === 'admin' ? 'admin' : 'student';

        const userPayload = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            role,
        };

        if (username != null && String(username).trim()) {
            const u = String(username).trim().toLowerCase();
            if (u.length < 3) {
                return res.status(400).json({ success: false, message: 'Username must be at least 3 characters' });
            }
            const taken = await User.findOne({ username: u });
            if (taken) {
                return res.status(400).json({ success: false, message: 'Username is already taken' });
            }
            userPayload.username = u;
        }

        if (bio != null && String(bio).trim()) {
            userPayload.bio = String(bio).trim().slice(0, 500);
        }

        if (semester !== undefined && semester !== null && semester !== '') {
            const s = Number(semester);
            if (s >= 1 && s <= 8) userPayload.semester = s;
        }

        if (branch != null && String(branch).trim()) {
            userPayload.branch = String(branch).trim().slice(0, 120);
        }

        const user = await User.create(userPayload);

        const token = signToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                token,
                user: serializeUser(user),
            },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Registration failed',
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        const token = signToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: serializeUser(user),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Login failed',
        });
    }
};

// @desc    Current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({
            success: true,
            data: serializeUser(user),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching profile',
        });
    }
};

// @desc    Update profile (name, optional new password)
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('+password');
        const { name, password, currentPassword, bio, username, semester, branch } = req.body;

        if (name !== undefined) user.name = String(name).trim();

        if (bio !== undefined) user.bio = String(bio).slice(0, 500);

        if (branch !== undefined) user.branch = String(branch).trim().slice(0, 120);

        if (semester !== undefined) {
            if (semester === null || semester === '') {
                user.semester = null;
            } else {
                const s = Number(semester);
                if (s >= 1 && s <= 8) user.semester = s;
            }
        }

        if (username !== undefined) {
            const u = String(username).trim().toLowerCase();
            if (!u) {
                user.username = undefined;
            } else if (u.length < 3) {
                return res.status(400).json({ success: false, message: 'Username must be at least 3 characters' });
            } else {
                const taken = await User.findOne({ username: u, _id: { $ne: user._id } });
                if (taken) {
                    return res.status(400).json({ success: false, message: 'Username is already taken' });
                }
                user.username = u;
            }
        }

        if (password) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is required to set a new password',
                });
            }
            if (!(await user.matchPassword(currentPassword))) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect',
                });
            }
            user.password = password;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated',
            data: serializeUser(user),
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Update failed',
        });
    }
};

// @desc    Upload profile picture
// @route   POST /api/auth/avatar
// @access  Private
export const uploadProfileAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please choose an image file',
            });
        }

        const user = await User.findById(req.user._id);
        if (user.profilePicture) {
            removeOldAvatarFile(user.profilePicture);
        }

        const relativePath = publicPathForFile(req.file.filename);
        user.profilePicture = relativePath;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile picture updated',
            data: {
                profilePicture: user.profilePicture,
                avatarUrl: user.profilePicture || user.avatarUrl || '',
                user: serializeUser(user),
            },
        });
    } catch (error) {
        if (req.file?.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch {
                /* ignore */
            }
        }
        res.status(400).json({
            success: false,
            message: error.message || 'Upload failed',
        });
    }
};

// @desc    Dashboard stats for profile (notes, ratings, comments)
// @route   GET /api/auth/profile/summary
// @access  Private
export const getProfileSummary = async (req, res) => {
    try {
        const Note = NoteCjs();
        const uid = req.user._id;
        const notesCount = await Note.countDocuments({ uploadedBy: uid });
        const approvedNotes = await Note.countDocuments({ uploadedBy: uid, status: 'approved' });
        const noteIds = (await Note.find({ uploadedBy: uid }).select('_id').lean()).map((n) => n._id);
        let totalRatings = 0;
        let sumStars = 0;
        if (noteIds.length) {
            const agg = await Rating.aggregate([
                { $match: { noteId: { $in: noteIds } } },
                { $group: { _id: null, c: { $sum: 1 }, s: { $sum: '$rating' } } },
            ]);
            if (agg[0]) {
                totalRatings = agg[0].c;
                sumStars = agg[0].s;
            }
        }
        const commentsPosted = await Comment.countDocuments({ userId: String(uid) });
        const recentNotes = await Note.find({ uploadedBy: uid }).sort({ createdAt: -1 }).limit(12).lean();
        const recentActivity = recentNotes.map((n) => ({
            id: n._id,
            type: 'note',
            title: n.title,
            timestamp: n.createdAt,
            meta: n.status,
        }));

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    notesUploaded: notesCount,
                    approvedNotes,
                    questionsAsked: 0,
                    pollsCreated: 0,
                    totalLikes: totalRatings,
                    totalRatingStars: sumStars,
                    commentsPosted,
                },
                recentActivity,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Could not load profile summary',
        });
    }
};

// @desc    Permanently delete account and owned data
// @route   DELETE /api/auth/account
// @access  Private
export const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ success: false, message: 'Password is required' });
        }

        const user = await User.findById(req.user._id).select('+password');
        if (!(await user.matchPassword(password))) {
            return res.status(400).json({ success: false, message: 'Incorrect password' });
        }

        const Note = NoteCjs();
        const uid = user._id;
        const noteList = await Note.find({ uploadedBy: uid }).select('_id').lean();
        const ids = noteList.map((n) => n._id);

        await Rating.deleteMany({ noteId: { $in: ids } });
        await Rating.deleteMany({ userId: uid });
        await Note.deleteMany({ uploadedBy: uid });
        await Comment.deleteMany({ userId: String(uid) });

        removeOldAvatarFile(user.profilePicture);
        await User.deleteOne({ _id: uid });

        res.status(200).json({ success: true, message: 'Account deleted' });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Could not delete account',
        });
    }
};

// @desc    Example admin-only endpoint
// @route   GET /api/auth/admin/ping
// @access  Private / Admin
export const adminPing = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Admin authorization OK',
        data: { role: req.user.role },
    });
};
