import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { protect } from '../middleware/authMiddleware.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js';
import User from '../models/User.js';
import ChatConversation from '../models/ChatConversation.js';
import ChatMessage from '../models/ChatMessage.js';

const { uploadChat, chatKindForMime } = uploadMiddleware;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const chatUploadDir = path.join(__dirname, '..', '..', 'uploads', 'chat');

const CHAT_SIZE_LIMITS = {
    image: 10 * 1024 * 1024,
    document: 20 * 1024 * 1024,
    voice: 10 * 1024 * 1024,
};

const CHAT_PLACEHOLDER = {
    image: '📷 Photo',
    document: '📎 Document',
    voice: '🎤 Voice note',
};

const safelyRemoveUpload = (filename) => {
    if (!filename) return;
    const target = path.join(chatUploadDir, path.basename(filename));
    fs.promises.unlink(target).catch(() => {});
};

const handleChatUpload = (req, res, next) => {
    uploadChat.single('file')(req, res, (err) => {
        if (!err) return next();
        const tooBig = err?.code === 'LIMIT_FILE_SIZE';
        return res.status(tooBig ? 413 : 400).json({
            success: false,
            message: tooBig
                ? 'Attachment is too large (20 MB max).'
                : err?.message || 'Could not process attachment.',
        });
    });
};

const router = express.Router();

const escapeRegex = (value = '') =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const makeParticipantKey = (a, b) =>
    [String(a), String(b)].sort().join(':');

const isStudentAllowed = (user) =>
    Boolean(user) &&
    user.role === 'student' &&
    user.isApproved === true &&
    user.isSuspended !== true;

const publicStudentFields =
    'name username profilePicture avatarUrl branch semester reputation createdAt';

router.use(protect);

router.use((req, res, next) => {
    if (!isStudentAllowed(req.user)) {
        return res.status(403).json({
            success: false,
            message: 'Chat is available only for approved student accounts',
        });
    }
    next();
});

router.get('/students', async (req, res) => {
    try {
        const q = String(req.query.q || '').trim();
        const query = {
            _id: { $ne: req.user._id },
            role: 'student',
            isApproved: true,
            isSuspended: { $ne: true },
        };

        if (q) {
            const rx = new RegExp(escapeRegex(q), 'i');
            query.$or = [{ name: rx }, { username: rx }, { branch: rx }];
        }

        const students = await User.find(query)
            .select(publicStudentFields)
            .sort({ name: 1 })
            .limit(25);

        res.json({ students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/conversations', async (req, res) => {
    try {
        const conversations = await ChatConversation.find({
            participants: req.user._id,
        })
            .populate('participants', publicStudentFields)
            .sort({ lastMessageAt: -1 });

        const unreadAgg = await ChatMessage.aggregate([
            {
                $match: {
                    recipient: new mongoose.Types.ObjectId(String(req.user._id)),
                    readAt: null,
                },
            },
            {
                $group: {
                    _id: '$conversation',
                    count: { $sum: 1 },
                },
            },
        ]);

        const unreadMap = new Map(
            unreadAgg.map((item) => [String(item._id), item.count])
        );

        res.json({
            conversations: conversations.map((conversation) => {
                const otherUser =
                    conversation.participants.find(
                        (participant) =>
                            String(participant._id) !== String(req.user._id)
                    ) || null;

                return {
                    _id: conversation._id,
                    otherUser,
                    lastMessageText: conversation.lastMessageText,
                    lastMessageAt: conversation.lastMessageAt,
                    unreadCount: unreadMap.get(String(conversation._id)) || 0,
                };
            }),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/unread-count', async (req, res) => {
    try {
        const unreadCount = await ChatMessage.countDocuments({
            recipient: req.user._id,
            readAt: null,
        });

        res.json({ unreadCount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/conversation/:otherUserId', async (req, res) => {
    try {
        const { otherUserId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid student id' });
        }

        const otherUser = await User.findById(otherUserId).select(
            publicStudentFields + ' role isApproved isSuspended'
        );

        if (!isStudentAllowed(otherUser)) {
            return res
                .status(404)
                .json({ success: false, message: 'Student not found' });
        }

        const participantKey = makeParticipantKey(req.user._id, otherUserId);
        const conversation = await ChatConversation.findOne({ participantKey });

        if (!conversation) {
            return res.json({
                conversation: null,
                otherUser,
                messages: [],
            });
        }

        await ChatMessage.updateMany(
            {
                conversation: conversation._id,
                recipient: req.user._id,
                readAt: null,
            },
            { $set: { readAt: new Date() } }
        );

        const messages = await ChatMessage.find({
            conversation: conversation._id,
        })
            .sort({ createdAt: 1 })
            .limit(200);

        res.json({
            conversation: {
                _id: conversation._id,
                lastMessageText: conversation.lastMessageText,
                lastMessageAt: conversation.lastMessageAt,
            },
            otherUser,
            messages,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/conversation/:otherUserId', handleChatUpload, async (req, res) => {
    const uploadedFile = req.file || null;
    try {
        const { otherUserId } = req.params;
        const text = String(req.body?.text || '').trim();

        if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
            if (uploadedFile) safelyRemoveUpload(uploadedFile.filename);
            return res
                .status(400)
                .json({ success: false, message: 'Invalid student id' });
        }
        if (String(otherUserId) === String(req.user._id)) {
            if (uploadedFile) safelyRemoveUpload(uploadedFile.filename);
            return res
                .status(400)
                .json({ success: false, message: 'You cannot message yourself' });
        }
        if (!text && !uploadedFile) {
            return res
                .status(400)
                .json({ success: false, message: 'Message text or attachment is required' });
        }

        let attachment = null;
        if (uploadedFile) {
            const kind = chatKindForMime(uploadedFile.mimetype);
            if (!kind) {
                safelyRemoveUpload(uploadedFile.filename);
                return res
                    .status(400)
                    .json({ success: false, message: 'Unsupported attachment type' });
            }
            const perKindLimit = CHAT_SIZE_LIMITS[kind];
            if (uploadedFile.size > perKindLimit) {
                safelyRemoveUpload(uploadedFile.filename);
                const mb = Math.round(perKindLimit / (1024 * 1024));
                return res
                    .status(413)
                    .json({ success: false, message: `${kind} attachment exceeds the ${mb} MB limit.` });
            }

            const rawDuration = Number(req.body?.durationSec);
            const durationSec =
                Number.isFinite(rawDuration) && rawDuration > 0
                    ? Math.min(Math.round(rawDuration), 60 * 10)
                    : null;

            attachment = {
                kind,
                url: `/uploads/chat/${uploadedFile.filename}`,
                mimeType: uploadedFile.mimetype,
                originalName: uploadedFile.originalname || '',
                size: uploadedFile.size,
                durationSec,
            };
        }

        const otherUser = await User.findById(otherUserId).select(
            publicStudentFields + ' role isApproved isSuspended'
        );

        if (!isStudentAllowed(otherUser)) {
            if (uploadedFile) safelyRemoveUpload(uploadedFile.filename);
            return res
                .status(404)
                .json({ success: false, message: 'Student not found' });
        }

        const lastMessageText =
            text || (attachment ? CHAT_PLACEHOLDER[attachment.kind] || 'Attachment' : '');

        const participantKey = makeParticipantKey(req.user._id, otherUserId);
        let conversation = await ChatConversation.findOne({ participantKey });

        if (!conversation) {
            conversation = await ChatConversation.create({
                participants: [req.user._id, otherUser._id],
                participantKey,
                lastMessageText,
                lastMessageAt: new Date(),
            });
        } else {
            conversation.lastMessageText = lastMessageText;
            conversation.lastMessageAt = new Date();
            await conversation.save();
        }

        const message = await ChatMessage.create({
            conversation: conversation._id,
            sender: req.user._id,
            recipient: otherUser._id,
            text,
            attachment,
        });

        res.status(201).json({
            success: true,
            conversation: {
                _id: conversation._id,
                lastMessageText: conversation.lastMessageText,
                lastMessageAt: conversation.lastMessageAt,
            },
            message,
        });
    } catch (error) {
        if (uploadedFile) safelyRemoveUpload(uploadedFile.filename);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
