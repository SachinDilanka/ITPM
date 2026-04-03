const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');
const Note = require('../models/Note');

const uploadsAbsoluteDir = path.join(__dirname, '..', '..', 'uploads');

const stripHtml = (html) => {
    if (!html || typeof html !== 'string') return '';
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const defaultOpenAiUrl = 'https://api.openai.com/v1/chat/completions';

const callOpenAiChat = async (messages) => {
    const apiKey = (process.env.OPENAI_API_KEY || '').trim();
    if (!apiKey) {
        const err = new Error('AI is not configured (set OPENAI_API_KEY in backend/.env).');
        err.statusCode = 501;
        throw err;
    }

    const url = (process.env.OPENAI_API_URL || defaultOpenAiUrl).trim();
    const model = (process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini').trim();

    let res;
    try {
        res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.4,
                max_tokens: 4096,
                response_format: { type: 'json_object' },
            }),
            signal: AbortSignal.timeout(120000),
        });
    } catch (e) {
        const err = new Error(e.message || 'Network error calling OpenAI API');
        err.statusCode = 502;
        throw err;
    }

    const rawText = await res.text();
    let data;
    try {
        data = JSON.parse(rawText);
    } catch {
        const err = new Error(`OpenAI returned non-JSON (${res.status}): ${rawText.slice(0, 240)}`);
        err.statusCode = res.status >= 400 ? res.status : 502;
        throw err;
    }

    if (!res.ok) {
        const msg = data?.error?.message || rawText || res.statusText || 'OpenAI request failed';
        const err = new Error(typeof msg === 'string' ? msg : 'OpenAI request failed');
        err.statusCode = res.status;
        throw err;
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
        const err = new Error('OpenAI returned an empty response.');
        err.statusCode = 502;
        throw err;
    }
    return content.trim();
};

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

// @desc  OpenAI study guide: bullet summary + 10 Q&A (admin-approved notes only)
// @route POST /api/notes/ai/study-guide/:id
// @access Private (student)
const postAiStudyGuideForApprovedNote = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!note || note.status !== 'approved') {
        res.status(404);
        throw new Error('Note not found');
    }

    const descriptionText = stripHtml(note.description);

    const schemaHint = `Return a single JSON object with exactly these keys:
- "summaryBullets": array of 5 to 10 short strings (bullet-point style summaries)
- "qa": array of exactly 10 objects, each with "question" and "answer" strings

Ground everything in the note. If the note is short, still provide 10 simple questions tied to what is stated.`;

    const userContent = `${schemaHint}

Note title: ${note.title}
Subject: ${note.subject}
Semester: ${note.semester}
Year: ${note.year ?? ''}

Note body:
${descriptionText || '(no description — use title and metadata only)'}`;

    const messages = [
        {
            role: 'system',
            content:
                'You are a helpful study assistant for students. Reply with valid JSON only, no markdown fences, matching the schema the user describes.',
        },
        { role: 'user', content: userContent },
    ];

    const text = await callOpenAiChat(messages);

    try {
        const parsed = JSON.parse(text);
        const summaryBullets = Array.isArray(parsed.summaryBullets) ? parsed.summaryBullets : [];
        const qa = Array.isArray(parsed.qa) ? parsed.qa : [];
        return res.json({ summaryBullets, qa });
    } catch {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                const summaryBullets = Array.isArray(parsed.summaryBullets) ? parsed.summaryBullets : [];
                const qa = Array.isArray(parsed.qa) ? parsed.qa : [];
                return res.json({ summaryBullets, qa });
            } catch {
                /* fall through */
            }
        }
        return res.json({ raw: text, summaryBullets: [], qa: [] });
    }
});

module.exports = {
    createNote,
    getMyNotes,
    getMyNoteById,
    getPublicApprovedNoteById,
    updateMyNote,
    postAiStudyGuideForApprovedNote,
};
