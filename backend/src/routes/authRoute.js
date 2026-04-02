import express from 'express';
import {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    uploadProfileAvatar,
    adminPing,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadAvatar } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, uploadAvatar.single('avatar'), uploadProfileAvatar);

router.get('/admin/ping', protect, authorize('admin'), adminPing);

export default router;
