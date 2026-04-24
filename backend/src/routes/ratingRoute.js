import express from 'express';
import {
    createRating,
    getAllRatings,
    getRatingsByPdfId,
    getRatingsSummaryByNoteIds,
    getTopRatedPdfs,
    getTopRatedUsers,
    getMyNotesRatingStats,
    getRatingById,
    updateRating,
    deleteRating
} from '../controllers/ratingController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
    validateRatingCreate,
    validateRatingUpdate,
    validateMongoId
} from '../middleware/ValidatorMiddleware.js';

const router = express.Router();

// Create or update a rating
router.post('/', protect, validateRatingCreate, createRating);

// Get all ratings
router.get('/', getAllRatings);

// Get current user's notes rating stats
router.get('/my-notes-stats', protect, getMyNotesRatingStats);

// Get rating summaries for a batch of notes
router.get('/summary', protect, getRatingsSummaryByNoteIds);

// Get top rated PDFs for dashboard
router.get('/top', getTopRatedPdfs);

// Get top-rated users in descending order
router.get('/top-users', getTopRatedUsers);

// Get ratings by PDF ID
router.get('/pdf/:pdfId', getRatingsByPdfId);
router.get('/note/:noteId', getRatingsByPdfId);

// Get a single rating by ID
router.get('/:id', validateMongoId, getRatingById);

// Update a rating
router.put('/:id', protect, validateMongoId, validateRatingUpdate, updateRating);

// Delete a rating
router.delete('/:id', protect, validateMongoId, deleteRating);

export default router;
