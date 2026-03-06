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

export const validateRatingCreate = (req, res, next) => {
    const { pdfId, userId, userName, rating } = req.body;
    const errors = [];

    if (!pdfId || pdfId.trim() === '') {
        errors.push('PDF ID is required');
    }

    if (!userId || userId.trim() === '') {
        errors.push('User ID is required');
    }

    if (!userName || userName.trim() === '') {
        errors.push('Username is required');
    }

    if (!rating) {
        errors.push('Rating is required');
    } else if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
        errors.push('Rating must be a whole number between 1 and 5');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
};

export const validateRatingUpdate = (req, res, next) => {
    const { rating } = req.body;
    const errors = [];

    if (!rating) {
        errors.push('Rating is required');
    } else if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
        errors.push('Rating must be a whole number between 1 and 5');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

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
