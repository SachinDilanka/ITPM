import Rating from '../models/ratingModel.js';

// @desc    Create or Update a rating
// @route   POST /api/ratings
// @access  Public
export const createRating = async (req, res) => {
    try {
        const { pdfId, userId, userName, rating, pdfTitle } = req.body;

        // Check if user already rated this PDF
        const existingRating = await Rating.findOne({ pdfId, userId });

        if (existingRating) {
            // Update existing rating
            existingRating.rating = rating;
            existingRating.pdfTitle = pdfTitle;
            const updated = await existingRating.save();
            return res.status(200).json({
                success: true,
                message: 'Rating updated successfully',
                data: updated
            });
        }

        // Create new rating
        const newRating = await Rating.create({
            pdfId,
            userId,
            userName,
            rating,
            pdfTitle
        });

        res.status(201).json({
            success: true,
            message: 'Rating created successfully',
            data: newRating
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
        const ratings = await Rating.find().sort({ createdAt: -1 });

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

// @desc    Get ratings by PDF ID with average
// @route   GET /api/ratings/pdf/:pdfId
// @access  Public
export const getRatingsByPdfId = async (req, res) => {
    try {
        const { pdfId } = req.params;

        const ratings = await Rating.find({ pdfId });

        const totalRatings = ratings.length;
        const averageRating =
            totalRatings > 0
                ? (ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(2)
                : 0;

        res.status(200).json({
            success: true,
            pdfId,
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
        const topPdfs = await Rating.aggregate([
            {
                $group: {
                    _id: '$pdfId',
                    pdfTitle: { $first: '$pdfTitle' },
                    averageRating: { $avg: '$rating' },
                    totalRatings: { $sum: 1 }
                }
            },
            {
                $sort: { averageRating: -1 }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    _id: 0,
                    pdfId: '$_id',
                    pdfTitle: 1,
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
// @access  Public
export const updateRating = async (req, res) => {
    try {
        const { rating } = req.body;

        const updatedRating = await Rating.findByIdAndUpdate(
            req.params.id,
            { rating },
            { new: true, runValidators: true }
        );

        if (!updatedRating) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Rating updated successfully',
            data: updatedRating
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
// @access  Public
export const deleteRating = async (req, res) => {
    try {
        const rating = await Rating.findByIdAndDelete(req.params.id);

        if (!rating) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Rating deleted successfully',
            data: rating
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error deleting rating'
        });
    }
};
