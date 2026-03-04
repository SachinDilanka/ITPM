// Validator middleware for comment operations

export const validateCommentCreate = (req, res, next) => {
    const { pdfId, userId, userName, comment } = req.body;
    const errors = [];

    // Validate pdfId
    if (!pdfId || pdfId.trim() === '') {
        errors.push('PDF ID is required');
    }

    // Validate userId
    if (!userId || userId.trim() === '') {
        errors.push('User ID is required');
    }

    // Validate userName
    if (!userName || userName.trim() === '') {
        errors.push('Username is required');
    }

    // Validate comment
    if (!comment || comment.trim() === '') {
        errors.push('Comment text is required');
    } else if (comment.trim().length > 1000) {
        errors.push('Comment cannot exceed 1000 characters');
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    // Proceed to the next middleware/controller
    next();
};

export const validateCommentUpdate = (req, res, next) => {
    const { comment } = req.body;
    const errors = [];

    // Validate comment
    if (!comment || comment.trim() === '') {
        errors.push('Comment text is required');
    } else if (comment.trim().length > 1000) {
        errors.push('Comment cannot exceed 1000 characters');
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    // Proceed to the next middleware/controller
    next();
};

export const validateMongoId = (req, res, next) => {
    const { id } = req.params;

    // Basic MongoDB ObjectId format validation (24 hex characters)
    const mongoIdPattern = /^[0-9a-fA-F]{24}$/;

    if (!mongoIdPattern.test(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }

    // Proceed to the next middleware/controller
    next();
};
