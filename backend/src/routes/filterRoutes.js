import express from 'express';
import { filterNotes } from '../controllers/filterController.js';

const router = express.Router();

router.get('/notes', filterNotes);

export default router;
