const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
    {
        noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        reason: { type: String, required: true, trim: true, maxlength: 2000 },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
