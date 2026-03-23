import Note from '../models/noteModel.js';

const toNoteDto = (note) => ({
    noteId: note._id,
    title: note.title,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
});

// @desc    Create a note (unique noteId = MongoDB _id, for AI / summarization APIs)
// @route   POST /api/notes
// @access  Private
export const createNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title?.trim() || content === undefined || content === null || !String(content).trim()) {
            return res.status(400).json({
                success: false,
                message: 'Title and note text are required',
            });
        }

        const note = await Note.create({
            user: req.user._id,
            title: title.trim(),
            content: String(content),
        });

        res.status(201).json({
            success: true,
            message: 'Note saved to your profile',
            data: toNoteDto(note),
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Could not create note',
        });
    }
};

// @desc    List current user's notes
// @route   GET /api/notes
// @access  Private
export const getMyNotes = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();

        res.status(200).json({
            success: true,
            count: notes.length,
            data: notes.map((n) => ({
                noteId: n._id,
                title: n.title,
                content: n.content,
                createdAt: n.createdAt,
                updatedAt: n.updatedAt,
            })),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Could not load notes',
        });
    }
};

// @desc    Get one note (owner only)
// @route   GET /api/notes/:id
// @access  Private
export const getNoteById = async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found',
            });
        }

        res.status(200).json({
            success: true,
            data: toNoteDto(note),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Could not load note',
        });
    }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found',
            });
        }

        const { title, content } = req.body;
        if (title !== undefined) note.title = String(title).trim();
        if (content !== undefined) note.content = String(content);

        if (!note.title || !String(note.content).trim()) {
            return res.status(400).json({
                success: false,
                message: 'Title and note text cannot be empty',
            });
        }

        await note.save();

        res.status(200).json({
            success: true,
            message: 'Note updated',
            data: toNoteDto(note),
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Could not update note',
        });
    }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Note deleted',
            data: { noteId: note._id },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Could not delete note',
        });
    }
};
