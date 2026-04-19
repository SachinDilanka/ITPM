import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
    {
        noteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Note',
            required: [true, 'Note ID is required']
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required']
        },
        userNameSnapshot: {
            type: String,
            trim: true
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5']
        },
        noteTitleSnapshot: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// One user can only rate a note once.
ratingSchema.index({ noteId: 1, userId: 1 }, { unique: true });
ratingSchema.index({ noteId: 1 });

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;
