const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');
const avatarDir = path.join(uploadsRoot, 'avatars');
const chatDir = path.join(uploadsRoot, 'chat');

if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });
if (!fs.existsSync(chatDir)) fs.mkdirSync(chatDir, { recursive: true });

// --- Note attachments (PDF, Office, images) → backend/uploads ---
const noteStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsRoot);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname) || '';
        cb(null, `${file.fieldname}-${Date.now()}${ext}`);
    },
});

const noteFileFilter = (_req, file, cb) => {
    const allowed = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'image/jpg',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF, DOC/DOCX, PNG, or JPEG files are allowed'), false);
};

const upload = multer({
    storage: noteStorage,
    fileFilter: noteFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});

// --- Profile avatars → backend/uploads/avatars ---
const avatarStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, avatarDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        const safe = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext) ? ext : '.jpg';
        cb(null, `user-${req.user._id}-${Date.now()}${safe}`);
    },
});

const avatarFileFilter = (_req, file, cb) => {
    const allowed = /^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype);
    if (allowed) return cb(null, true);
    cb(new Error('Only JPEG, PNG, GIF, or WebP images are allowed'));
};

const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: avatarFileFilter,
});

// --- Chat attachments (images, common docs, voice notes) → backend/uploads/chat ---
const CHAT_IMAGE_MIMES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
]);
const CHAT_DOCUMENT_MIMES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
]);

const chatKindForMime = (mime) => {
    if (!mime || typeof mime !== 'string') return null;
    const normalized = mime.toLowerCase();
    if (CHAT_IMAGE_MIMES.has(normalized)) return 'image';
    if (CHAT_DOCUMENT_MIMES.has(normalized)) return 'document';
    if (normalized.startsWith('audio/')) return 'voice';
    return null;
};

const chatStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, chatDir);
    },
    filename: (req, file, cb) => {
        const extRaw = path.extname(file.originalname).toLowerCase();
        const ext = extRaw.length > 0 && extRaw.length <= 8 ? extRaw : '';
        const userId = req.user?._id ? String(req.user._id) : 'anon';
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `chat-${userId}-${unique}${ext}`);
    },
});

const chatFileFilter = (_req, file, cb) => {
    const kind = chatKindForMime(file.mimetype);
    if (!kind) {
        return cb(new Error('Only images, common documents, and voice notes are allowed in chat'));
    }
    cb(null, true);
};

const uploadChat = multer({
    storage: chatStorage,
    fileFilter: chatFileFilter,
    // Hard cap at 20 MB; per-kind limits are enforced in the route handler.
    limits: { fileSize: 20 * 1024 * 1024 },
});

module.exports = upload;
module.exports.uploadAvatar = uploadAvatar;
module.exports.uploadChat = uploadChat;
module.exports.chatKindForMime = chatKindForMime;
