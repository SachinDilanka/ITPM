import express from 'express';
import {
    createComment,
    getAllComments,
    getCommentsByPdfId,
    getCommentById,
    updateComment,
    deleteComment,
    getCommentsByUserId
} from '../controllers/commentControllers.js';
import {
    validateCommentCreate,
    validateCommentUpdate,
    validateMongoId
} from '../middleware/ValidatorMiddleware.js';

const router = express.Router();

// Create a new comment
router.post('/', validateCommentCreate, createComment);

// Get all comments
router.get('/', getAllComments);

// Get comments by PDF ID
router.get('/pdf/:pdfId', getCommentsByPdfId);

// Get comments by User ID
router.get('/user/:userId', getCommentsByUserId);

// Get a single comment by ID
router.get('/:id', validateMongoId, getCommentById);

// Update a comment by ID
router.put('/:id', validateMongoId, validateCommentUpdate, updateComment);

// Delete a comment by ID
router.delete('/:id', validateMongoId, deleteComment);

export default router;
