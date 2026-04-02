import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: 200,
        },
        content: {
            type: String,
            required: [true, 'Note content is required'],
            maxlength: 50000,
        },
    },
    { timestamps: true }
);

noteSchema.index({ user: 1, createdAt: -1 });

const Note = mongoose.model('Note', noteSchema);

export default Note;
