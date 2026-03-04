import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
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
        comment: {
            type: String,
            required: [true, 'Comment text is required'],
            trim: true,
            minlength: [1, 'Comment must be at least 1 character'],
            maxlength: [1000, 'Comment cannot exceed 1000 characters']
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

// Add index for faster queries
commentSchema.index({ pdfId: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
