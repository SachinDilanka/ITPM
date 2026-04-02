import Note from '../models/Note.js';
import { sortByPriority } from '../services/priorityService.js';

const getPendingQueue = async (req, res) => {
    const pendingNotes = await Note.find({ status: 'pending' }).populate('uploadedBy', 'name email');
    const prioritized = sortByPriority(pendingNotes);
    res.json(prioritized);
};

export { getPendingQueue };
