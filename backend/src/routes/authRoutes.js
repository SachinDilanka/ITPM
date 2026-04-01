const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateAvatar } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post(
    '/profile/avatar',
    protect,
    uploadMiddleware.uploadAvatar.single('avatar'),
    updateAvatar
);

module.exports = router;
