const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Name is required'], trim: true },
        /** Alias for forum / legacy clients (kept in sync with name when empty) */
        fullName: { type: String, trim: true, default: '' },
        /** Short avatar label or URL; also see avatarUrl / profilePicture */
        avatar: { type: String, default: '' },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },
        role: { type: String, enum: ['student', 'admin'], default: 'student' },
        isApproved: { type: Boolean, default: false },
        isSuspended: { type: Boolean, default: false },
        /** Legacy / some clients use this path under /uploads/ */
        avatarUrl: { type: String, default: '' },
        /** Profile image path, e.g. /uploads/avatars/user-....jpg */
        profilePicture: { type: String, default: null },
        /** Public handle (optional, unique when set) */
        username: {
            type: String,
            trim: true,
            lowercase: true,
            sparse: true,
            unique: true,
            maxlength: 32,
        },
        bio: { type: String, trim: true, maxlength: 500, default: '' },
        semester: { type: Number, min: 1, max: 8, default: null },
        branch: { type: String, trim: true, maxlength: 120, default: '' },
        reputation: { type: Number, default: 0 },
        isVerified: { type: Boolean, default: false },
        followersCount: { type: Number, default: 0 },
        followingCount: { type: Number, default: 0 },
        /** Q&A forum: questions shared on profile */
        sharedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.fullName?.trim() && this.name) {
        this.fullName = this.name;
    }
    if (!this.avatar?.trim() && this.avatarUrl) {
        this.avatar = this.avatarUrl;
    }
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
