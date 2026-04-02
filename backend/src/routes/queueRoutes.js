import express from 'express';
import { getPendingQueue } from '../controllers/queueController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/pending', protect, adminOnly, getPendingQueue);

export default router;
