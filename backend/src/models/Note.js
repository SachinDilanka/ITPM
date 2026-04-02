const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subject: { type: String, required: true, trim: true },
        semester: { type: Number, required: true },
        year: { type: Number },
        description: { type: String, trim: true },
        fileUrl: { type: String },
        fileType: { type: String },
        downloads: { type: Number, default: 0 },
        reportsCount: { type: Number, default: 0 },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        priorityLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        lastEditedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);
