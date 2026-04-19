const express = require('express');
const router = express.Router();
const {
    getPendingUsers,
    getAllStudents,
    getSuspendedStudents,
    approveUser,
    suspendUser,
    reactivateUser,
    approveNote,
    rejectNote,
    updateNotePriority,
    getReportedNotes,
    getAdminNoteById,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.use(protect, adminOnly);

router.get('/users/pending', getPendingUsers);
router.get('/users/all', getAllStudents);
router.get('/users/suspended', getSuspendedStudents);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/reactivate', reactivateUser);
router.get('/notes/:id', getAdminNoteById);
router.put('/notes/:id/approve', approveNote);
router.put('/notes/:id/reject', rejectNote);
router.put('/notes/:id/priority', updateNotePriority);
router.get('/reports', getReportedNotes);

module.exports = router;
