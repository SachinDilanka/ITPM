import express from 'express';
import { createNote, getMyNotes } from '../controllers/notesController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/', upload.single('file'), createNote);
router.get('/my', getMyNotes);

export default router;
