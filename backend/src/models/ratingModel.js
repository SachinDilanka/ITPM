import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
    {
        pdfId: {
            type: String,
            required: [true, 'PDF ID is required'],
            trim: true
        },
        userId: {
            type: String,
            required: [true, 'User ID is required'],
            trim: true
        },
        userName: {
            type: String,
            required: [true, 'Username is required'],
            trim: true
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5']
        },
        pdfTitle: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// One user can only rate a PDF once
ratingSchema.index({ pdfId: 1, userId: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;
