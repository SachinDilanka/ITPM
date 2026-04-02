import asyncHandler from 'express-async-handler';
import Note from '../models/Note.js';

// @desc  Create / upload a new note
// @route POST /api/notes
// @access Private (student)
const createNote = asyncHandler(async (req, res) => {
    const { title, subject, semester, year, description, priorityLevel } = req.body;

    if (!title || !subject || !semester) {
        res.status(400);
        throw new Error('Title, subject, and semester are required');
    }

    const noteData = {
        title,
        subject,
        semester: Number(semester),
        year: year ? Number(year) : undefined,
        description,
        priorityLevel: priorityLevel || 'Medium',
        uploadedBy: req.user._id,
    };

    if (req.file) {
        // Build a public URL for the file: /uploads/<filename>
        noteData.fileUrl = `/uploads/${req.file.filename}`;
        noteData.fileType = req.file.mimetype;
    }

    const note = await Note.create(noteData);
    res.status(201).json({ message: 'Note submitted for review', note });
});

// @desc  Get notes uploaded by the current student
// @route GET /api/notes/my
// @access Private (student)
const getMyNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ notes });
});

export { createNote, getMyNotes };
