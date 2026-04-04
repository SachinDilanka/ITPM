import express from 'express';
import { chatWithAI } from '../controllers/chatbotController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/chatbot — send message to AI
router.post('/', protect, chatWithAI);

export default router;
