import Note from '../models/Note.js';

const filterNotes = async (req, res) => {
    const { subject, semester, sortBy, status } = req.query;

    // Default to 'approved' for public browsing; admin passes explicit status
    const query = { status: status || 'approved' };

    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (semester) query.semester = Number(semester);

    let sortOption = {};
    if (sortBy === 'mostDownloaded') sortOption = { downloads: -1 };
    else if (sortBy === 'mostReported') sortOption = { reportsCount: -1 };
    else sortOption = { createdAt: -1 };

    const notes = await Note.find(query).sort(sortOption).populate('uploadedBy', 'name email');
    res.json(notes);
};

export { filterNotes };
