const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
    {
        noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, trim: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Rating', ratingSchema);
