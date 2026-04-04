import Rating from '../models/ratingModel.js';
import Note from '../models/Note.js';
import mongoose from 'mongoose';

const buildNoteSummary = async (noteId, userId) => {
    const [summaryRows, currentUserRow] = await Promise.all([
        Rating.aggregate([
            { $match: { noteId } },
            {
                $group: {
                    _id: '$noteId',
                    averageRating: { $avg: '$rating' },
                    totalRatings: { $sum: 1 }
                }
            }
        ]),
        Rating.findOne({ noteId, userId }).select('_id rating').lean()
    ]);

    const summary = summaryRows[0] || { averageRating: 0, totalRatings: 0 };

    return {
        noteId,
        ratingId: currentUserRow?._id || null,
        averageRating: Number((summary.averageRating || 0).toFixed(2)),
        totalRatings: summary.totalRatings || 0,
        userRating: currentUserRow?.rating || null
    };
};

// @desc    Create or Update a rating
// @route   POST /api/ratings
// @access  Private
export const createRating = async (req, res) => {
    try {
        const incomingNoteId = req.body.noteId || req.body.pdfId;
        const ratingValue = Number(req.body.rating);
        const userId = req.user._id;

        const note = await Note.findById(incomingNoteId).select('_id title uploadedBy status').lean();
        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        const existingRating = await Rating.findOne({ noteId: incomingNoteId, userId });

        if (existingRating) {
            existingRating.rating = ratingValue;
            existingRating.userNameSnapshot = req.user.name;
            existingRating.noteTitleSnapshot = note.title;
            const updated = await existingRating.save();

            const summary = await buildNoteSummary(note._id, userId);

            return res.status(200).json({
                success: true,
                message: 'Rating updated successfully',
                data: updated,
                summary
            });
        }

        const newRating = await Rating.create({
            noteId: incomingNoteId,
            userId,
            userNameSnapshot: req.user.name,
            rating: ratingValue,
            noteTitleSnapshot: note.title
        });

        const summary = await buildNoteSummary(note._id, userId);

        res.status(201).json({
            success: true,
            message: 'Rating created successfully',
            data: newRating,
            summary
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error creating rating'
        });
    }
};

// @desc    Get all ratings
// @route   GET /api/ratings
// @access  Public
export const getAllRatings = async (req, res) => {
    try {
        const ratings = await Rating.find()
            .sort({ createdAt: -1 })
            .populate('noteId', 'title status uploadedBy')
            .populate('userId', 'name email role');

        res.status(200).json({
            success: true,
            count: ratings.length,
            data: ratings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching ratings'
        });
    }
};

// @desc    Get ratings by Note ID with average
// @route   GET /api/ratings/note/:noteId
// @access  Public
export const getRatingsByNoteId = async (req, res) => {
    try {
        const noteId = req.params.noteId;

        const ratings = await Rating.find({ noteId }).sort({ createdAt: -1 });

        const totalRatings = ratings.length;
        const averageRating =
            totalRatings > 0
                ? (ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(2)
                : 0;

        res.status(200).json({
            success: true,
            noteId,
            averageRating: parseFloat(averageRating),
            totalRatings,
            data: ratings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching ratings'
        });
    }
};

// @desc    Get top rated PDFs for dashboard
// @route   GET /api/ratings/top
// @access  Public
export const getTopRatedPdfs = async (req, res) => {
    try {
        const limit = Math.max(1, Math.min(Number(req.query.limit) || 10, 50));

        const topPdfs = await Rating.aggregate([
            {
                $group: {
                    _id: '$noteId',
                    averageRating: { $avg: '$rating' },
                    totalRatings: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'notes',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'note'
                }
            },
            { $unwind: '$note' },
            { $match: { 'note.status': 'approved' } },
            {
                $sort: { averageRating: -1, totalRatings: -1 }
            },
            {
                $limit: limit
            },
            {
                $project: {
                    _id: 0,
                    noteId: '$_id',
                    noteTitle: '$note.title',
                    averageRating: { $round: ['$averageRating', 2] },
                    totalRatings: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            count: topPdfs.length,
            data: topPdfs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching top rated PDFs'
        });
    }
};

// @desc    Get bulk rating summaries for a set of notes
// @route   GET /api/ratings/summary?noteIds=<id1,id2,id3>
// @access  Private
export const getRatingsSummaryByNoteIds = async (req, res) => {
    try {
        const rawIds = (req.query.noteIds || '')
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean);

        if (rawIds.length === 0) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        const objectIds = rawIds.map((id) => new mongoose.Types.ObjectId(id));

        const [summaries, myRatings] = await Promise.all([
            Rating.aggregate([
                { $match: { noteId: { $in: objectIds } } },
                {
                    $group: {
                        _id: '$noteId',
                        averageRating: { $avg: '$rating' },
                        totalRatings: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        noteId: '$_id',
                        averageRating: { $round: ['$averageRating', 2] },
                        totalRatings: 1
                    }
                }
            ]),
            Rating.find({ noteId: { $in: objectIds }, userId: req.user._id })
                .select('noteId _id rating')
                .lean()
        ]);

        const summaryMap = new Map(
            summaries.map((row) => [String(row.noteId), {
                noteId: row.noteId,
                ratingId: null,
                averageRating: row.averageRating,
                totalRatings: row.totalRatings,
                userRating: null
            }])
        );

        for (const noteId of objectIds) {
            const key = String(noteId);
            if (!summaryMap.has(key)) {
                summaryMap.set(key, {
                    noteId,
                    ratingId: null,
                    averageRating: 0,
                    totalRatings: 0,
                    userRating: null
                });
            }
        }

        for (const row of myRatings) {
            const key = String(row.noteId);
            const target = summaryMap.get(key);
            if (target) {
                target.userRating = row.rating;
                target.ratingId = row._id;
            }
        }

        res.status(200).json({
            success: true,
            data: Array.from(summaryMap.values())
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error fetching rating summaries'
        });
    }
};

// @desc    Top-rated users based on ratings received for their notes
// @route   GET /api/ratings/top-users
// @access  Public
export const getTopRatedUsers = async (req, res) => {
    try {
        const limit = Math.max(1, Math.min(Number(req.query.limit) || 10, 50));

        const topUsers = await Rating.aggregate([
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
            { $limit: limit }
        ]);

        res.status(200).json({
            success: true,
            count: topUsers.length,
            data: topUsers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching top rated users'
        });
    }
};

// @desc    Get rating stats for current user's notes
// @route   GET /api/ratings/my-notes-stats
// @access  Private
export const getMyNotesRatingStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const stats = await Rating.aggregate([
            {
                $lookup: {
                    from: 'notes',
                    localField: 'noteId',
                    foreignField: '_id',
                    as: 'note'
                }
            },
            { $unwind: '$note' },
            { $match: { 'note.uploadedBy': userId } },
            {
                $group: {
                    _id: null,
                    totalRatingsReceived: { $sum: 1 },
                    averageRating: { $avg: '$rating' },
                    ratedNotesCount: { $sum: 1 }
                }
            }
        ]);

        const result = stats[0] || {
            totalRatingsReceived: 0,
            averageRating: 0,
            ratedNotesCount: 0
        };

        res.status(200).json({
            success: true,
            data: {
                totalRatingsReceived: result.totalRatingsReceived || 0,
                averageRating: Number((result.averageRating || 0).toFixed(2)),
                ratedNotesCount: result.ratedNotesCount || 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching rating stats'
        });
    }
};

// @desc    Get a single rating by ID
// @route   GET /api/ratings/:id
// @access  Public
export const getRatingById = async (req, res) => {
    try {
        const rating = await Rating.findById(req.params.id);

        if (!rating) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found'
            });
        }

        res.status(200).json({
            success: true,
            data: rating
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching rating'
        });
    }
};

// @desc    Update a rating
// @route   PUT /api/ratings/:id
// @access  Private
export const updateRating = async (req, res) => {
    try {
        const { rating } = req.body;

        const existing = await Rating.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found'
            });
        }

        if (String(existing.userId) !== String(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own rating'
            });
        }

        existing.rating = Number(rating);
        const updatedRating = await existing.save();
        const summary = await buildNoteSummary(updatedRating.noteId, req.user._id);


        res.status(200).json({
            success: true,
            message: 'Rating updated successfully',
            data: updatedRating,
            summary
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error updating rating'
        });
    }
};

// @desc    Delete a rating
// @route   DELETE /api/ratings/:id
// @access  Private
export const deleteRating = async (req, res) => {
    try {
        const rating = await Rating.findById(req.params.id);

        if (!rating) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found'
            });
        }

        const canDelete = String(rating.userId) === String(req.user._id) || req.user.role === 'admin';
        if (!canDelete) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own rating'
            });
        }

        const noteId = rating.noteId;
        await rating.deleteOne();
        const summary = await buildNoteSummary(noteId, req.user._id);

        res.status(200).json({
            success: true,
            message: 'Rating deleted successfully',
            data: rating,
            summary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error deleting rating'
        });
    }
};
