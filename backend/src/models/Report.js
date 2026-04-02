import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
    {
        noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        reason: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

export default mongoose.model('Report', reportSchema);
