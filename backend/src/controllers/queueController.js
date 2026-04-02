const Note = require('../models/Note');
const { sortByPriority } = require('../services/priorityService');

const getPendingQueue = async (req, res) => {
    const pendingNotes = await Note.find({ status: 'pending' }).populate('uploadedBy', 'name email');
    const prioritized = sortByPriority(pendingNotes);
    res.json(prioritized);
};

module.exports = { getPendingQueue };
