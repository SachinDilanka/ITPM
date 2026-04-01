const express = require('express');
const router = express.Router();
const { getPendingQueue } = require('../controllers/queueController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/pending', protect, adminOnly, getPendingQueue);

module.exports = router;
