import mongoose from 'mongoose';

const forumCommentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', default: null },
        answer: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer', default: null },
        parent: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumComment', default: null },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

forumCommentSchema.index({ question: 1, createdAt: -1 });
forumCommentSchema.index({ answer: 1, createdAt: -1 });
forumCommentSchema.index({ parent: 1, createdAt: 1 });

forumCommentSchema.pre('validate', function (next) {
    if (!this.question && !this.answer) {
        this.invalidate('question', 'Either question or answer must be set');
    }
    next();
});

export default mongoose.model('ForumComment', forumCommentSchema);
