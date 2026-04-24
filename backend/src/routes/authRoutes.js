import express from 'express';
import {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    uploadProfileAvatar,
    getProfileSummary,
    deleteAccount,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/profile/summary', protect, getProfileSummary);
router.put('/profile', protect, updateProfile);
router.delete('/account', protect, deleteAccount);
router.post(
    '/profile/avatar',
    protect,
    uploadMiddleware.uploadAvatar.single('avatar'),
    uploadProfileAvatar
);

export default router;
