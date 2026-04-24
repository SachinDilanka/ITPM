import mongoose from 'mongoose';

const pollOptionSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        votes: [{ type: String, trim: true }],
    },
    { _id: true }
);

const pollSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: '',
        },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        options: [pollOptionSchema],
        subject: { type: String, required: true, trim: true },
        year: { type: Number, required: true, min: 1, max: 4 },
        semester: { type: Number, required: true, min: 1, max: 2 },
        isMultipleChoice: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        isEnded: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

pollSchema.index({ subject: 1 });
pollSchema.index({ year: 1 });
pollSchema.index({ semester: 1 });
pollSchema.index({ createdAt: -1 });
pollSchema.index({ isEnded: 1 });
pollSchema.index({ isDeleted: 1, createdAt: -1 });

export default mongoose.model('Poll', pollSchema);
