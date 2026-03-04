import Comment from '../models/commentModel.js';

// @desc    Create a new comment
// @route   POST /api/comments
// @access  Public
export const createComment = async (req, res) => {
    try {
        const { pdfId, userId, userName, comment, pdfTitle } = req.body;

        const newComment = await Comment.create({
            pdfId,
            userId,
            userName,
            comment,
            pdfTitle
        });

        res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            data: newComment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error creating comment'
        });
    }
};

// @desc    Get all comments
// @route   GET /api/comments
// @access  Public
export const getAllComments = async (req, res) => {
    try {
        const comments = await Comment.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching comments'
        });
    }
};

// @desc    Get comments by PDF ID
// @route   GET /api/comments/pdf/:pdfId
// @access  Public
export const getCommentsByPdfId = async (req, res) => {
    try {
        const { pdfId } = req.params;

        const comments = await Comment.find({ pdfId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching comments'
        });
    }
};

// @desc    Get a single comment by ID
// @route   GET /api/comments/:id
// @access  Public
export const getCommentById = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        res.status(200).json({
            success: true,
            data: comment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching comment'
        });
    }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Public
export const updateComment = async (req, res) => {
    try {
        const { comment } = req.body;

        const updatedComment = await Comment.findByIdAndUpdate(
            req.params.id,
            { comment },
            { new: true, runValidators: true }
        );

        if (!updatedComment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Comment updated successfully',
            data: updatedComment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error updating comment'
        });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Public
export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully',
            data: comment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error deleting comment'
        });
    }
};

// @desc    Get comments by User ID
// @route   GET /api/comments/user/:userId
// @access  Public
export const getCommentsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const comments = await Comment.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching comments'
        });
    }
};
