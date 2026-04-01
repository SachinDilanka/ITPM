const User = require('../models/User');
const { createToken } = require('../utils/helpers');

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Normalize data (Handle casing issues like "Admin" vs "admin")
        const normalizedRole = role ? role.toLowerCase() : 'student';
        const normalizedEmail = email.toLowerCase();

        // 2. Check if user already exists
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        // 3. Logic: Admin is auto-approved, Students need manual approval
        const isApproved = normalizedRole === 'admin';

        // 4. Create User
        // Note: Password hashing should be handled in your User Model (pre-save hook)
        const user = await User.create({
            name,
            email: normalizedEmail,
            password,
            role: normalizedRole,
            isApproved
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                token: createToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        // This passes the error to your errorHandler middleware in server.js
        next(error);
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });

        if (user && (await user.matchPassword(password))) {
            // Check for suspension
            if (user.isSuspended) {
                res.status(403);
                throw new Error('Your account is suspended');
            }

            // Check for student approval
            if (user.role === 'student' && !user.isApproved) {
                res.status(403);
                throw new Error('Your account is pending admin approval');
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                token: createToken(user._id),
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { registerUser, loginUser };