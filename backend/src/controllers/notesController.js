const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');
const Note = require('../models/Note');

const uploadsAbsoluteDir = path.join(__dirname, '..', '..', 'uploads');

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

// @desc  Get a single note belonging to the current student
// @route GET /api/notes/:id
// @access Private (student)
const getMyNoteById = asyncHandler(async (req, res) => {
    const note = await Note.findOne({ _id: req.params.id, uploadedBy: req.user._id });
    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }
    res.json({ note });
});

// @desc  Get a single approved note (public)
// @route GET /api/notes/public/:id
// @access Public (student)
const getPublicApprovedNoteById = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!note || note.status !== 'approved') {
        res.status(404);
        throw new Error('Note not found');
    }
    res.json({ note });
});

// @desc  Update (edit) a note belonging to the current student (pending OR approved)
// @route PUT /api/notes/:id
// @access Private (student)
const updateMyNote = asyncHandler(async (req, res) => {
    const note = await Note.findOne({ _id: req.params.id, uploadedBy: req.user._id });
    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    // Allow editing for pending and approved notes.
    // When an approved note is edited, it becomes pending again so the admin must approve it again.
    if (!['pending', 'approved'].includes(note.status)) {
        res.status(403);
        throw new Error('Only pending or approved notes can be edited');
    }

    const { title, subject, semester, year, description, priorityLevel } = req.body;

    if (!title || !subject || !semester) {
        res.status(400);
        throw new Error('Title, subject, and semester are required');
    }

    note.title = title;
    note.subject = subject;
    note.semester = Number(semester);
    note.year = year ? Number(year) : undefined;
    note.description = description;
    note.priorityLevel = priorityLevel || note.priorityLevel || 'Medium';
    note.status = 'pending';
    note.lastEditedAt = new Date();

    if (req.file) {
        // Remove old file (if any) to avoid accumulating files on disk
        if (note.fileUrl) {
            const oldFile = path.join(uploadsAbsoluteDir, path.basename(note.fileUrl));
            if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
        }

        note.fileUrl = `/uploads/${req.file.filename}`;
        note.fileType = req.file.mimetype;
    }

    await note.save();
    res.json({ message: 'Note updated', note });
});

module.exports = {
    createNote,
    getMyNotes,
    getMyNoteById,
    getPublicApprovedNoteById,
    updateMyNote,
};
