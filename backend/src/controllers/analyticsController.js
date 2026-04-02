const User = require('../models/User');
const Note = require('../models/Note');

const getDashboardStats = async (req, res) => {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalNotes = await Note.countDocuments();
    const pendingNotes = await Note.countDocuments({ status: 'pending' });
    const pendingUsers = await User.countDocuments({ role: 'student', isApproved: false });
    const mostReportedNotes = await Note.find({ status: 'approved' })
        .sort({ reportsCount: -1 })
        .limit(5)
        .populate('uploadedBy', 'name email');

    res.json({
        totalUsers,
        totalNotes,
        pendingNotes,
        pendingUsers,
        mostReportedNotes,
    });
};

module.exports = { getDashboardStats };
