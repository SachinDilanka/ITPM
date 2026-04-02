import User from '../models/User.js';
import Note from '../models/Note.js';
import Report from '../models/Report.js';

const getPendingUsers = async (req, res) => {
    const users = await User.find({ role: 'student', isApproved: false, isSuspended: false }).select('-password');
    res.json(users);
};

const getAllStudents = async (req, res) => {
    const users = await User.find({ role: 'student' }).select('-password');
    res.json(users);
};

const getSuspendedStudents = async (req, res) => {
    const users = await User.find({ role: 'student', isSuspended: true }).select('-password');
    res.json(users);
};

const approveUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    user.isApproved = true;
    await user.save();
    res.json({ message: 'User approved', user });
};

const suspendUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    user.isSuspended = true;
    await user.save();
    res.json({ message: 'User suspended' });
};

const reactivateUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    user.isSuspended = false;
    await user.save();
    res.json({ message: 'User reactivated' });
};

const approveNote = async (req, res) => {
    const note = await Note.findById(req.params.id);
    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }
    note.status = 'approved';
    await note.save();
    res.json({ message: 'Note approved', note });
};

const rejectNote = async (req, res) => {
    const note = await Note.findById(req.params.id);
    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }
    note.status = 'rejected';
    await note.save();
    res.json({ message: 'Note rejected', note });
};

const updateNotePriority = async (req, res) => {
    const { priorityLevel } = req.body;
    const note = await Note.findById(req.params.id);
    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }
    note.priorityLevel = priorityLevel;
    await note.save();
    res.json({ message: 'Priority updated', note });
};

const getReportedNotes = async (req, res) => {
    const reports = await Report.find()
        .populate('noteId', 'title subject reportsCount')
        .populate('reportedBy', 'name email');
    res.json(reports);
};

export {
    getPendingUsers,
    getAllStudents,
    getSuspendedStudents,
    approveUser,
    suspendUser,
    reactivateUser,
    approveNote,
    rejectNote,
    updateNotePriority,
    getReportedNotes,
};
