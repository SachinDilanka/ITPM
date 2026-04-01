const express = require('express');
const router = express.Router();
const { createNote, getMyNotes } = require('../controllers/notesController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All routes require authentication
router.use(protect);

router.post('/', upload.single('file'), createNote);
router.get('/my', getMyNotes);

module.exports = router;
