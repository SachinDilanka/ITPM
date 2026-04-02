import User from '../models/User.js';
import Note from '../models/Note.js';
import Rating from '../models/ratingModel.js';

const getDashboardStats = async (req, res) => {
    const [
        totalUsers,
        totalNotes,
        pendingNotes,
        pendingUsers,
        mostReportedNotes,
        topRatedUsers,
    ] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        Note.countDocuments(),
        Note.countDocuments({ status: 'pending' }),
        User.countDocuments({ role: 'student', isApproved: false }),
        Note.find({ status: 'approved' })
            .sort({ reportsCount: -1 })
            .limit(5)
            .populate('uploadedBy', 'name email'),
        Rating.aggregate([
            {
                $lookup: {
                    from: 'notes',
                    localField: 'noteId',
                    foreignField: '_id',
                    as: 'note'
                }
            },
            { $unwind: '$note' },
            { $match: { 'note.status': 'approved' } },
            {
                $group: {
                    _id: '$note.uploadedBy',
                    averageRating: { $avg: '$rating' },
                    totalRatingsReceived: { $sum: 1 },
                    ratedNotes: { $addToSet: '$note._id' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            { $match: { 'user.role': 'student' } },
            {
                $project: {
                    _id: 0,
                    userId: '$user._id',
                    userName: '$user.name',
                    userEmail: '$user.email',
                    averageRating: { $round: ['$averageRating', 2] },
                    totalRatingsReceived: 1,
                    ratedNotesCount: { $size: '$ratedNotes' }
                }
            },
            { $sort: { averageRating: -1, totalRatingsReceived: -1, userName: 1 } },
            { $limit: 10 }
        ])
    ]);

    res.json({
        totalUsers,
        totalNotes,
        pendingNotes,
        pendingUsers,
        mostReportedNotes,
        topRatedUsers,
    });
};

export { getDashboardStats };
