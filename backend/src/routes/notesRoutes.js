const express = require('express');
const router = express.Router();
const {
    createNote,
    getMyNotes,
    getMyNoteById,
    getPublicApprovedNoteById,
    updateMyNote,
    postAiStudyGuideForApprovedNote,
} = require('../controllers/notesController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public route: allow anyone to view approved notes
router.get('/public/:id', getPublicApprovedNoteById);

// All other routes require authentication
router.use(protect);

router.post('/', upload.single('file'), createNote);
router.get('/my', getMyNotes);

router.post('/ai/study-guide/:id', postAiStudyGuideForApprovedNote);

router.get('/:id', getMyNoteById);
router.put('/:id', upload.single('file'), updateMyNote);

module.exports = router;
