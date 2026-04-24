const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');
const avatarDir = path.join(uploadsRoot, 'avatars');

if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });

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

module.exports = upload;
module.exports.uploadAvatar = uploadAvatar;
