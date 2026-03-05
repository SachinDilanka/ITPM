import express from 'express';
import {
    createRating,
    getAllRatings,
    getRatingsByPdfId,
    getTopRatedPdfs,
    getRatingById,
    updateRating,
    deleteRating
} from '../controllers/ratingController.js';
import {
    validateRatingCreate,
    validateRatingUpdate,
    validateMongoId
} from '../middleware/ValidatorMiddleware.js';

const router = express.Router();

// Create or update a rating
router.post('/', validateRatingCreate, createRating);

// Get all ratings
router.get('/', getAllRatings);

// Get top rated PDFs for dashboard
router.get('/top', getTopRatedPdfs);

// Get ratings by PDF ID
router.get('/pdf/:pdfId', getRatingsByPdfId);

// Get a single rating by ID
router.get('/:id', validateMongoId, getRatingById);

// Update a rating
router.put('/:id', validateMongoId, validateRatingUpdate, updateRating);

// Delete a rating
router.delete('/:id', validateMongoId, deleteRating);

export default router;
