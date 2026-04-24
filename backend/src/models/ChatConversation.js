const mongoose = require('mongoose');

const chatConversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        participantKey: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        lastMessageText: {
            type: String,
            trim: true,
            default: '',
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('ChatConversation', chatConversationSchema);
