import express from 'express';
import {
    createNote,
    getAllNotes,
    getMyNotes,
    getNoteById,
    updateNote,
    deleteNote,
} from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateMongoId } from '../middleware/ValidatorMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createNote);
router.get('/', getMyNotes);
router.get('/all', getAllNotes);

router.get('/:id', validateMongoId, getNoteById);
router.put('/:id', validateMongoId, updateNote);
router.delete('/:id', validateMongoId, deleteNote);

export default router;
