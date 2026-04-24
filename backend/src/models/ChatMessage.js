const mongoose = require('mongoose');

const chatAttachmentSchema = new mongoose.Schema(
    {
        kind: {
            type: String,
            enum: ['image', 'document', 'voice'],
            required: true,
        },
        url: { type: String, required: true, trim: true },
        mimeType: { type: String, default: '', trim: true },
        originalName: { type: String, default: '', trim: true },
        size: { type: Number, default: 0, min: 0 },
        durationSec: { type: Number, default: null },
    },
    { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ChatConversation',
            required: true,
            index: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        text: {
            type: String,
            default: '',
            trim: true,
            maxlength: 1000,
        },
        attachment: {
            type: chatAttachmentSchema,
            default: null,
        },
        readAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

chatMessageSchema.pre('validate', function ensureHasBody(next) {
    const hasText = typeof this.text === 'string' && this.text.trim().length > 0;
    const hasAttachment = Boolean(this.attachment && this.attachment.url);
    if (!hasText && !hasAttachment) {
        this.invalidate('text', 'Message must contain text or an attachment');
    }
    next();
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
