import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

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

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

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

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            role: 'student',
        });

        const token = signToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture,
                },
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
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture,
                },
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
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                createdAt: user.createdAt,
            },
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
        const { name, password, currentPassword } = req.body;

        if (name !== undefined) user.name = String(name).trim();

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
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
            },
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
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture,
                },
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
