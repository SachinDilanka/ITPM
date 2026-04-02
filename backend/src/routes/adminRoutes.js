import express from 'express';
import {
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
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/users/pending', getPendingUsers);
router.get('/users/all', getAllStudents);
router.get('/users/suspended', getSuspendedStudents);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/reactivate', reactivateUser);
router.put('/notes/:id/approve', approveNote);
router.put('/notes/:id/reject', rejectNote);
router.put('/notes/:id/priority', updateNotePriority);
router.get('/reports', getReportedNotes);

export default router;
